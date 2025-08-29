import { BaseWidget } from './BaseWidget.js';
import { API } from '../../../core/api.js';
import { ChartManager } from '../../visualization/ChartManager.js';

export class PracticeStatsWidget extends BaseWidget {
    constructor() {
        super('practiceStats');
        this.api = new API();
        this.charts = new ChartManager();
        this.stats = null;
        this.currentUser = {
            login: 'leomart-wd',
            lastActive: '2025-08-29 13:18:13'
        };
    }

    async loadData() {
        try {
            const response = await this.api.get(`/users/${this.currentUser.login}/practice/stats`);
            this.stats = response.data;
            return true;
        } catch (error) {
            console.error('Failed to load practice stats:', error);
            throw error;
        }
    }

    render() {
        if (!this.stats) {
            return this.showError('No practice statistics available');
        }

        return `
            <div class="practice-stats-widget">
                <div class="widget-header">
                    <h2>Practice Statistics</h2>
                    <div class="widget-actions">
                        <select class="time-range" onchange="practiceStatsWidget.changeTimeRange(this.value)">
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                </div>

                <div class="stats-overview">
                    <div class="stat-cards">
                        ${this.renderStatCards()}
                    </div>

                    <div class="practice-chart-container">
                        <canvas id="practiceChart"></canvas>
                    </div>

                    <div class="practice-highlights">
                        ${this.renderHighlights()}
                    </div>
                </div>
            </div>
        `;
    }

    renderStatCards() {
        return `
            <div class="stat-card">
                <div class="stat-value">${this.stats.totalSessions}</div>
                <div class="stat-label">Practice Sessions</div>
                <div class="stat-trend ${this.stats.sessionsTrend > 0 ? 'positive' : 'negative'}">
                    <i class="fas fa-arrow-${this.stats.sessionsTrend > 0 ? 'up' : 'down'}"></i>
                    ${Math.abs(this.stats.sessionsTrend)}%
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${this.stats.totalMinutes}</div>
                <div class="stat-label">Minutes Practiced</div>
                <div class="stat-trend ${this.stats.minutesTrend > 0 ? 'positive' : 'negative'}">
                    <i class="fas fa-arrow-${this.stats.minutesTrend > 0 ? 'up' : 'down'}"></i>
                    ${Math.abs(this.stats.minutesTrend)}%
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${this.stats.averageScore}%</div>
                <div class="stat-label">Average Score</div>
                <div class="stat-trend ${this.stats.scoreTrend > 0 ? 'positive' : 'negative'}">
                    <i class="fas fa-arrow-${this.stats.scoreTrend > 0 ? 'up' : 'down'}"></i>
                    ${Math.abs(this.stats.scoreTrend)}%
                </div>
            </div>
        `;
    }

    renderHighlights() {
        return `
            <div class="highlights-section">
                <h3>Highlights</h3>
                <div class="highlights-list">
                    ${this.stats.highlights.map(highlight => `
                        <div class="highlight-item">
                            <i class="fas ${this.getHighlightIcon(highlight.type)}"></i>
                            <div class="highlight-content">
                                <div class="highlight-title">${highlight.title}</div>
                                <div class="highlight-description">${highlight.description}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    initializeCharts() {
        const ctx = document.getElementById('practiceChart');
        if (!ctx) return;

        this.charts.createBarChart(ctx, {
            labels: this.stats.dailyPractice.map(d => d.date),
            datasets: [{
                label: 'Practice Minutes',
                data: this.stats.dailyPractice.map(d => d.minutes),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 1
            }],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Minutes'
                        }
                    }
                }
            }
        });
    }

    getHighlightIcon(type) {
        const icons = {
            achievement: 'fa-trophy',
            improvement: 'fa-chart-line',
            streak: 'fa-fire',
            milestone: 'fa-flag-checkered'
        };
        return icons[type] || 'fa-star';
    }

    async changeTimeRange(range) {
        try {
            this.setLoading(true);
            await this.loadData(range);
            this.update();
        } finally {
            this.setLoading(false);
        }
    }
}