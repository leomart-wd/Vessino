import { BaseWidget } from './BaseWidget.js';
import { API } from '../../../core/api.js';
import { ChartManager } from '../../visualization/ChartManager.js';

export class ProgressWidget extends BaseWidget {
    constructor() {
        super('progress');
        this.api = new API();
        this.charts = new ChartManager();
        this.data = null;
        this.currentUser = {
            login: 'leomart-wd',
            lastActive: '2025-08-29 13:18:13'
        };
    }

    async loadData() {
        try {
            const response = await this.api.get(`/users/${this.currentUser.login}/progress`);
            this.data = response.data;
            return true;
        } catch (error) {
            console.error('Failed to load progress data:', error);
            throw error;
        }
    }

    render() {
        if (!this.data) {
            return this.showError('No progress data available');
        }

        return `
            <div class="progress-widget">
                <div class="widget-header">
                    <h2>Your Progress</h2>
                    <div class="widget-actions">
                        <button class="btn-icon" onclick="progressWidget.toggleView()">
                            <i class="fas fa-chart-bar"></i>
                        </button>
                    </div>
                </div>

                <div class="progress-overview">
                    <div class="progress-stats">
                        <div class="stat">
                            <span class="stat-value">${this.data.completedLessons}</span>
                            <span class="stat-label">Lessons Completed</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${this.data.totalPracticeHours}h</span>
                            <span class="stat-label">Practice Time</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${this.data.averageScore}%</span>
                            <span class="stat-label">Average Score</span>
                        </div>
                    </div>

                    <div class="progress-chart-container">
                        <canvas id="progressChart"></canvas>
                    </div>

                    <div class="skill-progress">
                        ${this.renderSkillProgress()}
                    </div>
                </div>
            </div>
        `;
    }

    renderSkillProgress() {
        const skills = this.data.skills || {};
        
        return Object.entries(skills).map(([skill, value]) => `
            <div class="skill-item">
                <div class="skill-header">
                    <span class="skill-name">${this.formatSkillName(skill)}</span>
                    <span class="skill-value">${value}%</span>
                </div>
                <div class="skill-bar">
                    <div class="skill-fill" style="width: ${value}%"></div>
                </div>
            </div>
        `).join('');
    }

    initializeCharts() {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;

        this.charts.createLineChart(ctx, {
            labels: this.data.timeline.map(t => t.date),
            datasets: [{
                label: 'Overall Progress',
                data: this.data.timeline.map(t => t.score),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.4,
                fill: true
            }],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    formatSkillName(skill) {
        return skill.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    toggleView() {
        const container = document.querySelector('.progress-widget');
        container.classList.toggle('detailed-view');
    }
}