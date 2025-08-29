import { Store } from '../../core/store.js';
import { API } from '../../core/api.js';
import { ChartManager } from './ChartManager.js';
import { DataProcessor } from './DataProcessor.js';
import { ReportGenerator } from './ReportGenerator.js';

export class AnalyticsManager {
    constructor() {
        this.store = new Store();
        this.api = new API();
        this.charts = new ChartManager();
        this.dataProcessor = new DataProcessor();
        this.reportGenerator = new ReportGenerator();
        this.currentUser = {
            login: 'leomart-wd',
            lastActive: '2025-08-29 12:59:44'
        };
    }

    async initialize() {
        try {
            await this.loadAnalyticsData();
            this.setupRealTimeTracking();
            return true;
        } catch (error) {
            console.error('Analytics initialization failed:', error);
            throw error;
        }
    }

    async loadAnalyticsData() {
        const [
            performanceData,
            engagementData,
            progressData,
            assessmentData
        ] = await Promise.all([
            this.api.get(`/analytics/performance/${this.currentUser.login}`),
            this.api.get(`/analytics/engagement/${this.currentUser.login}`),
            this.api.get(`/analytics/progress/${this.currentUser.login}`),
            this.api.get(`/analytics/assessments/${this.currentUser.login}`)
        ]);

        return this.dataProcessor.processData({
            performance: performanceData,
            engagement: engagementData,
            progress: progressData,
            assessments: assessmentData
        });
    }

    async renderDashboard(containerId) {
        const container = document.getElementById(containerId);
        const data = await this.loadAnalyticsData();

        container.innerHTML = `
            <div class="analytics-dashboard">
                <div class="analytics-header">
                    <h2>Learning Analytics Dashboard</h2>
                    <div class="date-range-picker">
                        ${this.renderDateRangePicker()}
                    </div>
                </div>
                
                <div class="analytics-grid">
                    ${this.renderPerformanceMetrics(data.performance)}
                    ${this.renderProgressVisualization(data.progress)}
                    ${this.renderEngagementMetrics(data.engagement)}
                    ${this.renderAssessmentAnalysis(data.assessments)}
                </div>
                
                <div class="detailed-analysis">
                    ${this.renderDetailedAnalysis(data)}
                </div>
            </div>
        `;

        this.initializeCharts(data);
    }

    renderPerformanceMetrics(performance) {
        return `
            <div class="metrics-card performance">
                <h3>Performance Overview</h3>
                <div class="metrics-grid">
                    <div class="metric">
                        <span class="metric-value">${performance.averageScore}%</span>
                        <span class="metric-label">Average Score</span>
                    </div>
                    <div class="metric">
                        <span class="metric-value">${performance.completionRate}%</span>
                        <span class="metric-label">Completion Rate</span>
                    </div>
                    <div class="metric">
                        <span class="metric-value">${performance.masteryLevel}</span>
                        <span class="metric-label">Mastery Level</span>
                    </div>
                </div>
                <div class="chart-container" id="performance-chart"></div>
            </div>
        `;
    }

    renderProgressVisualization(progress) {
        return `
            <div class="metrics-card progress">
                <h3>Learning Progress</h3>
                <div class="skill-progress">
                    ${progress.skills.map(skill => `
                        <div class="skill-item">
                            <div class="skill-header">
                                <span class="skill-name">${skill.name}</span>
                                <span class="skill-level">${skill.level}</span>
                            </div>
                            <div class="progress-bar-container">
                                <div class="progress-bar" 
                                     style="width: ${skill.progress}%">
                                </div>
                                <div class="progress-markers">
                                    ${this.renderProgressMarkers(skill.milestones)}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="chart-container" id="progress-chart"></div>
            </div>
        `;
    }

    renderEngagementMetrics(engagement) {
        return `
            <div class="metrics-card engagement">
                <h3>Engagement Analysis</h3>
                <div class="engagement-stats">
                    <div class="engagement-metric">
                        <span class="metric-value">${engagement.activeMinutes}</span>
                        <span class="metric-label">Active Minutes Today</span>
                    </div>
                    <div class="engagement-metric">
                        <span class="metric-value">${engagement.streak}</span>
                        <span class="metric-label">Day Streak</span>
                    </div>
                    <div class="engagement-metric">
                        <span class="metric-value">${engagement.interactionRate}%</span>
                        <span class="metric-label">Interaction Rate</span>
                    </div>
                </div>
                <div class="chart-container" id="engagement-chart"></div>
                <div class="engagement-heatmap" id="activity-heatmap"></div>
            </div>
        `;
    }

    renderAssessmentAnalysis(assessments) {
        return `
            <div class="metrics-card assessments">
                <h3>Assessment Performance</h3>
                <div class="assessment-overview">
                    <div class="chart-container" id="assessment-chart"></div>
                    <div class="assessment-stats">
                        ${this.renderAssessmentStats(assessments)}
                    </div>
                </div>
                <div class="skill-breakdown">
                    ${this.renderSkillBreakdown(assessments.skillBreakdown)}
                </div>
            </div>
        `;
    }

    renderSkillBreakdown(breakdown) {
        return `
            <div class="skill-breakdown-grid">
                ${Object.entries(breakdown).map(([skill, data]) => `
                    <div class="skill-breakdown-item">
                        <h4>${skill}</h4>
                        <div class="skill-stats">
                            <div class="stat-item">
                                <span class="stat-label">Accuracy</span>
                                <span class="stat-value">${data.accuracy}%</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Improvement</span>
                                <span class="stat-value ${data.improvement > 0 ? 'positive' : 'negative'}">
                                    ${data.improvement > 0 ? '+' : ''}${data.improvement}%
                                </span>
                            </div>
                        </div>
                        <div class="mini-chart" id="skill-chart-${skill}"></div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    initializeCharts(data) {
        // Performance Trend Chart
        this.charts.createLineChart('performance-chart', {
            labels: data.performance.dates,
            datasets: [{
                label: 'Performance Score',
                data: data.performance.scores,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        });

        // Progress Radar Chart
        this.charts.createRadarChart('progress-chart', {
            labels: data.progress.skills.map(s => s.name),
            datasets: [{
                label: 'Current Level',
                data: data.progress.skills.map(s => s.level),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)',
                pointBackgroundColor: 'rgb(54, 162, 235)'
            }]
        });

        // Engagement Heatmap
        this.charts.createHeatmap('activity-heatmap', data.engagement.activityData);

        // Assessment Performance Chart
        this.charts.createBarChart('assessment-chart', {
            labels: data.assessments.categories,
            datasets: [{
                label: 'Score',
                data: data.assessments.scores,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgb(153, 102, 255)',
                borderWidth: 1
            }]
        });
    }

    setupRealTimeTracking() {
        // Set up WebSocket connection for real-time analytics updates
        const ws = new WebSocket('wss://your-api.com/analytics');
        
        ws.onmessage = (event) => {
            const update = JSON.parse(event.data);
            this.handleRealTimeUpdate(update);
        };
    }

    handleRealTimeUpdate(update) {
        // Update relevant charts and metrics in real-time
        this.charts.updateCharts(update);
        this.updateMetrics(update);
    }

    async generateReport(timeframe = 'weekly') {
        const reportData = await this.loadAnalyticsData();
        return this.reportGenerator.generateReport(reportData, timeframe);
    }
}