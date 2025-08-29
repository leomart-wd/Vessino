import { BaseWidget } from './BaseWidget.js';
import { API } from '../../../core/api.js';
import { ChartManager } from '../../visualization/ChartManager.js';
import { format, differenceInDays, isBefore } from 'date-fns';

export class GoalsWidget extends BaseWidget {
    constructor() {
        super('goals');
        this.api = new API();
        this.charts = new ChartManager();
        this.goals = [];
        this.currentUser = {
            login: 'leomart-wd',
            lastActive: '2025-08-29 13:20:18'
        };
        
        this.goalTypes = {
            PRACTICE_TIME: 'Practice Time',
            SKILL_LEVEL: 'Skill Level',
            COMPLETION: 'Course Completion',
            PERFORMANCE: 'Performance',
            CONSISTENCY: 'Practice Consistency'
        };
    }

    async initialize() {
        try {
            await super.initialize();
            this.setupGoalTracking();
            return true;
        } catch (error) {
            console.error('Goals widget initialization failed:', error);
            throw error;
        }
    }

    async loadData() {
        try {
            const [goals, achievements] = await Promise.all([
                this.api.get(`/users/${this.currentUser.login}/goals`),
                this.api.get(`/users/${this.currentUser.login}/achievements`)
            ]);

            this.goals = goals.data.map(goal => ({
                ...goal,
                achievements: achievements.data.filter(a => a.goalId === goal.id)
            }));

            return true;
        } catch (error) {
            console.error('Failed to load goals data:', error);
            throw error;
        }
    }

    render() {
        return `
            <div class="goals-widget">
                <div class="widget-header">
                    <h2>Your Goals</h2>
                    <div class="widget-actions">
                        <button class="btn-primary" onclick="goalsWidget.showGoalCreator()">
                            <i class="fas fa-plus"></i>
                            New Goal
                        </button>
                    </div>
                </div>

                <div class="goals-content">
                    ${this.renderActiveGoals()}
                    ${this.renderCompletedGoals()}
                </div>

                ${this.renderGoalCreator()}
            </div>
        `;
    }

    renderActiveGoals() {
        const activeGoals = this.goals.filter(goal => !goal.completed);
        
        if (!activeGoals.length) {
            return this.renderEmptyState();
        }

        return `
            <div class="active-goals">
                <h3>Active Goals</h3>
                <div class="goals-grid">
                    ${activeGoals.map(goal => this.renderGoalCard(goal)).join('')}
                </div>
            </div>
        `;
    }

    renderGoalCard(goal) {
        const progress = this.calculateGoalProgress(goal);
        const daysLeft = differenceInDays(new Date(goal.deadline), new Date());
        const isOverdue = isBefore(new Date(goal.deadline), new Date());

        return `
            <div class="goal-card ${isOverdue ? 'overdue' : ''}" 
                 data-goal-id="${goal.id}">
                <div class="goal-header">
                    <div class="goal-type">
                        <i class="fas ${this.getGoalIcon(goal.type)}"></i>
                        ${this.goalTypes[goal.type]}
                    </div>
                    <div class="goal-actions">
                        <button class="btn-icon" onclick="goalsWidget.editGoal('${goal.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="goalsWidget.deleteGoal('${goal.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>

                <h4 class="goal-title">${goal.title}</h4>
                <p class="goal-description">${goal.description}</p>

                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="progress-text">${progress}% Complete</span>
                </div>

                <div class="goal-metrics">
                    <div class="metric">
                        <i class="fas fa-clock"></i>
                        ${daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                    </div>
                    <div class="metric">
                        <i class="fas fa-bullseye"></i>
                        Target: ${this.formatGoalTarget(goal)}
                    </div>
                </div>

                ${this.renderGoalMilestones(goal)}
            </div>
        `;
    }

    renderGoalMilestones(goal) {
        if (!goal.milestones?.length) return '';

        return `
            <div class="goal-milestones">
                <h5>Milestones</h5>
                <div class="milestones-list">
                    ${goal.milestones.map(milestone => `
                        <div class="milestone-item ${milestone.completed ? 'completed' : ''}">
                            <i class="fas ${milestone.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
                            <span>${milestone.title}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderCompletedGoals() {
        const completedGoals = this.goals.filter(goal => goal.completed);
        
        if (!completedGoals.length) return '';

        return `
            <div class="completed-goals">
                <h3>Completed Goals</h3>
                <div class="completion-timeline">
                    ${completedGoals.map(goal => `
                        <div class="timeline-item">
                            <div class="timeline-marker">
                                <i class="fas fa-trophy"></i>
                            </div>
                            <div class="timeline-content">
                                <h4>${goal.title}</h4>
                                <p>Completed on ${format(new Date(goal.completedAt), 'MMM dd, yyyy')}</p>
                                ${goal.achievements.length ? `
                                    <div class="achievements">
                                        ${goal.achievements.map(achievement => `
                                            <span class="achievement-badge">
                                                <i class="fas ${this.getAchievementIcon(achievement.type)}"></i>
                                                ${achievement.title}
                                            </span>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderGoalCreator() {
        return `
            <div class="goal-creator" style="display: none;">
                <div class="goal-creator-content">
                    <h3>Create New Goal</h3>
                    <form id="goalForm" onsubmit="goalsWidget.handleGoalSubmit(event)">
                        <div class="form-group">
                            <label for="goalType">Goal Type</label>
                            <select id="goalType" name="type" required>
                                ${Object.entries(this.goalTypes).map(([value, label]) => `
                                    <option value="${value}">${label}</option>
                                `).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="goalTitle">Title</label>
                            <input type="text" id="goalTitle" name="title" required>
                        </div>

                        <div class="form-group">
                            <label for="goalDescription">Description</label>
                            <textarea id="goalDescription" name="description" required></textarea>
                        </div>

                        <div class="form-group">
                            <label for="goalTarget">Target Value</label>
                            <input type="number" id="goalTarget" name="target" required>
                        </div>

                        <div class="form-group">
                            <label for="goalDeadline">Deadline</label>
                            <input type="date" id="goalDeadline" name="deadline" required>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn-secondary" 
                                    onclick="goalsWidget.hideGoalCreator()">
                                Cancel
                            </button>
                            <button type="submit" class="btn-primary">
                                Create Goal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="empty-state">
                <i class="fas fa-bullseye"></i>
                <p>No active goals yet</p>
                <button class="btn-primary" onclick="goalsWidget.showGoalCreator()">
                    Set Your First Goal
                </button>
            </div>
        `;
    }

    calculateGoalProgress(goal) {
        const current = goal.currentValue;
        const target = goal.targetValue;
        return Math.min(Math.round((current / target) * 100), 100);
    }

    formatGoalTarget(goal) {
        switch (goal.type) {
            case 'PRACTICE_TIME':
                return `${goal.targetValue} hours`;
            case 'SKILL_LEVEL':
                return `Level ${goal.targetValue}`;
            case 'COMPLETION':
                return `${goal.targetValue}%`;
            case 'PERFORMANCE':
                return `${goal.targetValue}% accuracy`;
            default:
                return goal.targetValue;
        }
    }

    getGoalIcon(type) {
        const icons = {
            PRACTICE_TIME: 'fa-clock',
            SKILL_LEVEL: 'fa-star',
            COMPLETION: 'fa-graduation-cap',
            PERFORMANCE: 'fa-chart-line',
            CONSISTENCY: 'fa-calendar-check'
        };
        return icons[type] || 'fa-bullseye';
    }

    getAchievementIcon(type) {
        const icons = {
            MILESTONE: 'fa-flag-checkered',
            MASTERY: 'fa-crown',
            STREAK: 'fa-fire',
            SPECIAL: 'fa-star'
        };
        return icons[type] || 'fa-medal';
    }

    async handleGoalSubmit(event) {
        event.preventDefault();
        
        try {
            const formData = new FormData(event.target);
            const goalData = Object.fromEntries(formData);

            const response = await this.api.post(`/users/${this.currentUser.login}/goals`, goalData);
            
            if (response.data) {
                await this.loadData();
                this.hideGoalCreator();
                this.update();
                
                // Show success notification
                this.events.emit('notification', {
                    type: 'success',
                    message: 'Goal created successfully!'
                });
            }
        } catch (error) {
            console.error('Failed to create goal:', error);
            this.events.emit('notification', {
                type: 'error',
                message: 'Failed to create goal. Please try again.'
            });
        }
    }

    showGoalCreator() {
        const creator = document.querySelector('.goal-creator');
        if (creator) {
            creator.style.display = 'flex';
        }
    }

    hideGoalCreator() {
        const creator = document.querySelector('.goal-creator');
        if (creator) {
            creator.style.display = 'none';
        }
    }

    async deleteGoal(goalId) {
        if (!confirm('Are you sure you want to delete this goal?')) return;

        try {
            await this.api.delete(`/users/${this.currentUser.login}/goals/${goalId}`);
            await this.loadData();
            this.update();
            
            this.events.emit('notification', {
                type: 'success',
                message: 'Goal deleted successfully!'
            });
        } catch (error) {
            console.error('Failed to delete goal:', error);
            this.events.emit('notification', {
                type: 'error',
                message: 'Failed to delete goal. Please try again.'
            });
        }
    }

    setupGoalTracking() {
        // Set up interval to check goal progress
        setInterval(() => {
            this.checkGoalProgress();
        }, 5 * 60 * 1000); // Check every 5 minutes
    }

    async checkGoalProgress() {
        try {
            await this.loadData();
            
            this.goals.forEach(goal => {
                if (!goal.completed && this.calculateGoalProgress(goal) >= 100) {
                    this.handleGoalCompletion(goal);
                }
            });
        } catch (error) {
            console.error('Failed to check goal progress:', error);
        }
    }

    async handleGoalCompletion(goal) {
        try {
            await this.api.post(`/users/${this.currentUser.login}/goals/${goal.id}/complete`);
            
            this.events.emit('notification', {
                type: 'success',
                message: `Congratulations! You've completed your goal: ${goal.title}`
            });

            await this.loadData();
            this.update();
        } catch (error) {
            console.error('Failed to handle goal completion:', error);
        }
    }
}

export const goalsWidget = new GoalsWidget();