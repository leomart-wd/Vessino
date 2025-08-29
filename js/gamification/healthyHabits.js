// Gamification system for healthy habits and learning practices
export class HealthyHabitsGame {
    static REWARDS = {
        HYDRATION: 10,
        MINDFULNESS: 25,
        EXERCISE: 30,
        STUDY_STREAK: 50,
        ELABORATION: 15,
        ACTIVE_RECALL: 20
    };

    static async trackHabit(habitType, details) {
        const habit = {
            type: habitType,
            details,
            timestamp: new Date().toISOString(),
            userId: getCurrentUser()
        };

        try {
            const response = await fetch('/api/habits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(habit)
            });
            
            if (response.ok) {
                const points = this.REWARDS[habitType] || 0;
                await this.awardPoints(points);
                this.showRewardAnimation(points);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error tracking habit:', error);
            return null;
        }
    }

    static async awardPoints(points) {
        try {
            await fetch('/api/points', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ points })
            });
        } catch (error) {
            console.error('Error awarding points:', error);
        }
    }

    static showRewardAnimation(points) {
        const animation = document.createElement('div');
        animation.className = 'reward-animation';
        animation.textContent = `+${points} points!`;
        document.body.appendChild(animation);
        
        setTimeout(() => {
            animation.remove();
        }, 2000);
    }
}