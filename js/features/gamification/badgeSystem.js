class BadgeSystem {
    constructor() {
        this.badges = {
            BEGINNER: {
                id: 'BEGINNER',
                name: 'First Steps',
                description: 'Complete your first lesson',
                icon: '🎯'
            },
            CONSISTENT: {
                id: 'CONSISTENT',
                name: 'Consistency Master',
                description: 'Maintain a 7-day streak',
                icon: '🔥'
            },
            PERFECTIONIST: {
                id: 'PERFECTIONIST',
                name: 'Perfect Score',
                description: 'Achieve 100% on any lesson',
                icon: '⭐'
            },
            HELPER: {
                id: 'HELPER',
                name: 'Community Helper',
                description: 'Help 5 other students',
                icon: '🤝'
            }
            // Add more badges as needed
        };
    }

    async checkAndAward(userId, action, context) {
        const userBadges = await this.getUserBadges(userId);
        const newBadges = [];

        switch (action) {
            case 'LESSON_COMPLETE':
                if (!userBadges.includes('BEGINNER')) {
                    newBadges.push('BEGINNER');
                }
                if (context.score === 100 && !userBadges.includes('PERFECTIONIST')) {
                    newBadges.push('PERFECTIONIST');
                }
                break;
            // Add more badge conditions
        }

        if (newBadges.length > 0) {
            await this.awardBadges(userId, newBadges);
        }

        return newBadges;
    }

    async awardBadges(userId, badgeIds) {
        try {
            await Promise.all(badgeIds.map(badgeId => 
                this.api.post('/badges/award', { userId, badgeId })
            ));
            
            badgeIds.forEach(badgeId => {
                this.showBadgeAnimation(this.badges[badgeId]);
            });

            return true;
        } catch (error) {
            console.error('Failed to award badges:', error);
            return false;
        }
    }

    showBadgeAnimation(badge) {
        const animationContainer = document.createElement('div');
        animationContainer.className = 'badge-animation';
        animationContainer.innerHTML = `
            <div class="badge-popup">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-info">
                    <h3>${badge.name}</h3>
                    <p>${badge.description}</p>
                </div>
            </div>
        `;
        document.body.appendChild(animationContainer);
        
        setTimeout(() => {
            animationContainer.remove();
        }, 4000);
    }
}