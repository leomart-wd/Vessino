import { API } from '../../core/api.js';
import { EventEmitter } from '../../utils/eventEmitter.js';
import { ChartManager } from '../visualization/ChartManager.js';

export class AchievementShowcase {
    constructor() {
        this.api = new API();
        this.events = new EventEmitter();
        this.charts = new ChartManager();
        this.currentUser = {
            login: 'leomart-wd',
            lastActive: '2025-08-29 13:09:04'
        };
        
        this.achievementCategories = {
            VOCAL_RANGE: 'Vocal Range',
            PITCH_ACCURACY: 'Pitch Accuracy',
            RHYTHM: 'Rhythm',
            BREATHING: 'Breathing Control',
            PERFORMANCE: 'Performance',
            CONSISTENCY: 'Consistency'
        };
    }

    async initialize() {
        try {
            const [achievements, statistics, milestones] = await Promise.all([
                this.loadAchievements(),
                this.loadStatistics(),
                this.loadMilestones()
            ]);

            this.render(achievements, statistics, milestones);
            this.initializeCharts(statistics);
            this.setupEventListeners();

            return true;
        } catch (error) {
            console.error('Achievement showcase initialization failed:', error);
            throw error;
        }
    }

    async loadAchievements() {
        return await this.api.get(`/users/${this.currentUser.login}/achievements`);
    }

    async loadStatistics() {
        return await this.api.get(`/users/${this.currentUser.login}/statistics`);
    }

    async loadMilestones() {
        return await this.api.get(`/users/${this.currentUser.login}/milestones`);
    }

    render(achievements, statistics, milestones) {
        const container = document.getElementById('achievement-showcase');
        if (!container) return;

        container.innerHTML = `
            <div class="achievement-showcase">
                <div class="showcase-header">
                    <h2>Achievements & Progress</h2>
                    <div class="showcase-filters">
                        ${this.renderCategoryFilters()}
                    </div>
                </div>

                <div class="showcase-grid">
                    <div class="showcase-section statistics">
                        ${this.renderStatistics(statistics)}
                    </div>

                    <div class="showcase-section achievements">
                        ${this.renderAchievements(achievements)}
                    </div>

                    <div class="showcase-section milestones">
                        ${this.renderMilestones(milestones)}
                    </div>
                </div>

                <div class="showcase-charts">
                    ${this.renderProgressCharts()}
                </div>
            </div>
        `;
    }

    renderStatistics(statistics) {
        return `
            <div class="statistics-grid">
                <div class="stat-card">
                    <div class="stat-value">${statistics.totalPracticeHours}</div>
                    <div class="stat-label">Practice Hours</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${statistics.averageAccuracy}%</div>
                    <div class="stat-label">Average Accuracy</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${statistics.completedLessons}</div>
                    <div class="stat-label">Lessons Completed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${statistics.currentStreak}</div>
                    <div class="stat-label">Day Streak</div>
                </div>
            </div>
        `;
    }

    renderAchievements(achievements) {
        return `
            <div class="achievements-grid">
                ${achievements.map(achievement => `
                    <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}"
                         data-category="${achievement.category}">
                        <div class="achievement-icon">
                            ${this.getAchievementIcon(achievement)}
                        </div>
                        <div class="achievement-info">
                            <h3>${achievement.title}</h3>
                            <p>${achievement.description}</p>
                            ${achievement.unlocked ? `
                                <span class="unlock-date">
                                    Unlocked on ${new Date(achievement.unlockedAt).toLocaleDateString()}
                                </span>
                            ` : `
                                <div class="progress-bar">
                                    <div class="progress-fill" 
                                         style="width: ${achievement.progress}%"></div>
                                </div>
                                <span class="progress-text">
                                    ${achievement.progress}% Complete
                                </span>
                            `}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderMilestones(milestones) {
        return `
            <div class="milestones-timeline">
                ${milestones.map((milestone, index) => `
                    <div class="milestone-item ${milestone.achieved ? 'achieved' : ''}"
                         data-milestone-id="${milestone.id}">
                        <div class="milestone-connector">
                            <div class="connector-line"></div>
                            <div class="connector-dot"></div>
                        </div>
                        <div class="milestone-content">
                            <h4>${milestone.title}</h4>
                            <p>${milestone.description}</p>
                            ${milestone.achieved ? `
                                <span class="achievement-date">
                                    Achieved ${this.formatDate(milestone.achievedAt)}
                                </span>
                            ` : `
                                <span class="milestone-progress">
                                    ${milestone.progress}% Complete
                                </span>
                            `}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderProgressCharts() {
        return `
            <div class="charts-grid">
                <div class="chart-container">
                    <h3>Skill Progress</h3>
                    <canvas id="skillRadarChart"></canvas>
                </div>
                <div class="chart-container">
                    <h3>Practice History</h3>
                    <canvas id="practiceLineChart"></canvas>
                </div>
                <div class="chart-container">
                    <h3>Performance Metrics</h3>
                    <canvas id="performanceChart"></canvas>
                </div>
            </div>
        `;
    }

    initializeCharts(statistics) {
        // Skill Radar Chart
        this.charts.createRadarChart('skillRadarChart', {
            labels: Object.values(this.achievementCategories),
            datasets: [{
                label: 'Current Level',
                data: statistics.skillLevels,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                pointBackgroundColor: 'rgba(75, 192, 192, 1)'
            }]
        });

        // Practice History Line Chart
        this.charts.createLineChart('practiceLineChart', {
            labels: statistics.practiceHistory.map(h => h.date),
            datasets: [{
                label: 'Practice Minutes',
                data: statistics.practiceHistory.map(h => h.minutes),
                borderColor: 'rgba(54, 162, 235, 1)',
                tension: 0.4
            }]
        });

        // Performance Metrics Chart
        this.charts.createBarChart('performanceChart', {
            labels: ['Pitch', 'Rhythm', 'Breathing', 'Overall'],
            datasets: [{
                label: 'Performance Score',
                data: [
                    statistics.pitchScore,
                    statistics.rhythmScore,
                    statistics.breathingScore,
                    statistics.overallScore
                ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)'
                ]
            }]
        });
    }

    setupEventListeners() {
        // Filter achievements by category
        document.querySelectorAll('.category-filter').forEach(filter => {
            filter.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.filterAchievements(category);
            });
        });

        // Achievement card hover effects
        document.querySelectorAll('.achievement-card').forEach(card => {
            card.addEventListener('mouseenter', this.showAchievementDetails.bind(this));
            card.addEventListener('mouseleave', this.hideAchievementDetails.bind(this));
        });
    }

    filterAchievements(category) {
        const cards = document.querySelectorAll('.achievement-card');
        cards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    showAchievementDetails(event) {
        const card = event.currentTarget;
        const achievementId = card.dataset.achievementId;
        
        // Show detailed tooltip
        this.showTooltip(card, achievementId);
    }

    hideAchievementDetails(event) {
        const tooltip = document.querySelector('.achievement-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('it-IT', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getAchievementIcon(achievement) {
        const icons = {
            VOCAL_RANGE: '🎵',
            PITCH_ACCURACY: '🎯',
            RHYTHM: '🥁',
            BREATHING: '🌬️',
            PERFORMANCE: '🎭',
            CONSISTENCY: '📅'
        };

        return icons[achievement.category] || '🏆';
    }
}