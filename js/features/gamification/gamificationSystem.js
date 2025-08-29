import { Store } from '../../core/store.js';
import { API } from '../../core/api.js';
import { EventEmitter } from '../../utils/eventEmitter.js';
import { BadgeSystem } from './badgeSystem.js';
import { StreakSystem } from './streakSystem.js';
import { ChallengeSystem } from './challengeSystem.js';
import { formatDate } from '../../utils/dateFormatter.js';

class GamificationSystem {
    constructor() {
        this.store = new Store();
        this.api = new API();
        this.events = new EventEmitter();
        this.badges = new BadgeSystem();
        this.streaks = new StreakSystem();
        this.challenges = new ChallengeSystem();
        
        // XP levels configuration
        this.levelThresholds = [
            0,      // Level 1
            100,    // Level 2
            300,    // Level 3
            600,    // Level 4
            1000,   // Level 5
            1500,   // Level 6
            2100,   // Level 7
            2800,   // Level 8
            3600,   // Level 9
            4500    // Level 10
        ];

        // Point values for different actions
        this.pointValues = {
            LESSON_COMPLETE: 50,
            QUIZ_CORRECT: 20,
            DAILY_LOGIN: 10,
            STREAK_MILESTONE: 100,
            CHALLENGE_COMPLETE: 150,
            PERFECT_SCORE: 200,
            HELPING_OTHERS: 30,
            PRACTICE_SESSION: 40
        };
    }

    async initialize(userId) {
        try {
            // Load user's gamification data
            const userData = await this.api.get(`/users/${userId}/gamification`);
            this.store.dispatch('SET_GAMIFICATION_DATA', userData);
            
            // Initialize subsystems
            await Promise.all([
                this.badges.initialize(userId),
                this.streaks.initialize(userId),
                this.challenges.initialize(userId)
            ]);

            // Set up event listeners
            this.setupEventListeners();

            return true;
        } catch (error) {
            console.error('Failed to initialize gamification system:', error);
            return false;
        }
    }

    setupEventListeners() {
        // Listen for various achievement events
        this.events.on('lessonComplete', this.handleLessonComplete.bind(this));
        this.events.on('quizComplete', this.handleQuizComplete.bind(this));
        this.events.on('dailyLogin', this.handleDailyLogin.bind(this));
        this.events.on('practiceSession', this.handlePracticeSession.bind(this));
    }

    async awardPoints(userId, action, context = {}) {
        try {
            const points = this.pointValues[action] || 0;
            const currentData = this.store.getState().gamification;
            
            const newTotal = (currentData.points || 0) + points;
            const newLevel = this.calculateLevel(newTotal);
            
            // Record the achievement
            const achievement = {
                userId,
                action,
                points,
                context,
                timestamp: formatDate(new Date()),
                totalPoints: newTotal,
                newLevel
            };

            // Update backend
            await this.api.post('/achievements', achievement);

            // Update local state
            this.store.dispatch('UPDATE_GAMIFICATION', {
                points: newTotal,
                level: newLevel
            });

            // Check for level up
            if (newLevel > currentData.level) {
                this.handleLevelUp(newLevel);
            }

            // Trigger achievement animation
            this.showAchievementAnimation(points, action);

            return achievement;
        } catch (error) {
            console.error('Failed to award points:', error);
            return null;
        }
    }

    calculateLevel(points) {
        return this.levelThresholds.findIndex(threshold => points < threshold) || this.levelThresholds.length;
    }

    async handleLessonComplete(lessonData) {
        const points = await this.awardPoints(lessonData.userId, 'LESSON_COMPLETE', {
            lessonId: lessonData.id,
            score: lessonData.score
        });

        // Check for perfect score
        if (lessonData.score === 100) {
            await this.awardPoints(lessonData.userId, 'PERFECT_SCORE');
        }

        // Update streaks
        await this.streaks.updateStreak(lessonData.userId);

        // Check for relevant badges
        await this.badges.checkAndAward(lessonData.userId, 'LESSON_COMPLETE', lessonData);
    }

    async handleQuizComplete(quizData) {
        await this.awardPoints(quizData.userId, 'QUIZ_CORRECT', {
            quizId: quizData.id,
            score: quizData.score
        });
    }

    async handleLevelUp(newLevel) {
        // Trigger level up celebration
        this.showLevelUpAnimation(newLevel);

        // Award level-up badge if applicable
        await this.badges.checkAndAward(this.store.getState().user.id, 'LEVEL_UP', { level: newLevel });

        // Unlock new content or features
        await this.unlockLevelContent(newLevel);
    }

    showAchievementAnimation(points, action) {
        const animationContainer = document.createElement('div');
        animationContainer.className = 'achievement-animation';
        animationContainer.innerHTML = `
            <div class="achievement-popup">
                <div class="achievement-icon">🌟</div>
                <div class="achievement-text">
                    <h3>+${points} XP</h3>
                    <p>${this.getActionDescription(action)}</p>
                </div>
            </div>
        `;
        document.body.appendChild(animationContainer);
        
        // Remove animation after it completes
        setTimeout(() => {
            animationContainer.remove();
        }, 3000);
    }

    showLevelUpAnimation(level) {
        const animationContainer = document.createElement('div');
        animationContainer.className = 'level-up-animation';
        animationContainer.innerHTML = `
            <div class="level-up-popup">
                <div class="level-up-icon">🎉</div>
                <div class="level-up-text">
                    <h2>Level Up!</h2>
                    <p>You've reached level ${level}</p>
                </div>
            </div>
        `;
        document.body.appendChild(animationContainer);
        
        // Remove animation after it completes
        setTimeout(() => {
            animationContainer.remove();
        }, 5000);
    }

    getActionDescription(action) {
        const descriptions = {
            LESSON_COMPLETE: 'Lesson Completed!',
            QUIZ_CORRECT: 'Quiz Success!',
            DAILY_LOGIN: 'Daily Login Bonus!',
            STREAK_MILESTONE: 'Streak Milestone!',
            CHALLENGE_COMPLETE: 'Challenge Completed!',
            PERFECT_SCORE: 'Perfect Score!',
            HELPING_OTHERS: 'Helping Others!',
            PRACTICE_SESSION: 'Practice Complete!'
        };
        return descriptions[action] || 'Achievement Unlocked!';
    }

    async getLeaderboard(timeframe = 'weekly') {
        try {
            const leaderboard = await this.api.get(`/leaderboard/${timeframe}`);
            return leaderboard;
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
            return [];
        }
    }

    async unlockLevelContent(level) {
        // Implement content unlocking logic
        const unlockedContent = await this.api.get(`/content/unlocks/${level}`);
        this.store.dispatch('UPDATE_UNLOCKED_CONTENT', unlockedContent);
    }
}

export const gamification = new GamificationSystem();