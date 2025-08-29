import { auth } from '../../core/auth.js';
import { store } from '../../core/store.js';
import { API } from '../../core/api.js';
import { ChartManager } from '../visualization/ChartManager.js';
import { ProgressWidget } from './widgets/ProgressWidget.js';
import { UpcomingLessonsWidget } from './widgets/UpcomingLessonsWidget.js';
import { PracticeStatsWidget } from './widgets/PracticeStatsWidget.js';
import { GoalsWidget } from './widgets/GoalsWidget.js';
import { RecommendationsWidget } from './widgets/RecommendationsWidget.js';

export class Dashboard {
    constructor() {
        this.api = new API();
        this.charts = new ChartManager();
        this.currentUser = {
            login: 'leomart-wd',
            lastActive: '2025-08-29 13:17:09'
        };
        
        // Initialize widgets
        this.widgets = {
            progress: new ProgressWidget(),
            upcomingLessons: new UpcomingLessonsWidget(),
            practiceStats: new PracticeStatsWidget(),
            goals: new GoalsWidget(),
            recommendations: new RecommendationsWidget()
        };

        this.refreshInterval = null;
    }

    async initialize() {
        try {
            // Initialize all widgets
            await Promise.all(
                Object.values(this.widgets).map(widget => widget.initialize())
            );

            // Set up auto-refresh
            this.setupAutoRefresh();

            // Set up event listeners
            this.setupEventListeners();

            return true;
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
            throw error;
        }
    }

    setupAutoRefresh() {
        // Refresh dashboard data every 5 minutes
        this.refreshInterval = setInterval(() => {
            this.refreshData();
        }, 5 * 60 * 1000);
    }

    setupEventListeners() {
        // Listen for store updates
        store.subscribe(this.handleStoreUpdate.bind(this));

        // Listen for widget events
        Object.values(this.widgets).forEach(widget => {
            widget.events.on('update', this.handleWidgetUpdate.bind(this));
        });

        // Setup dashboard interaction handlers
        document.addEventListener('click', (event) => {
            const target = event.target;

            if (target.matches('[data-action="refresh"]')) {
                this.refreshData();
            } else if (target.matches('[data-widget-settings]')) {
                this.showWidgetSettings(target.dataset.widgetSettings);
            }
        });
    }

    render() {
        const user = store.getState().user;
        const isTeacher = auth.isTeacher();

        return `
            <div class="dashboard" data-user-role="${user.role}">
                <header class="dashboard-header">
                    <div class="dashboard-title">
                        <h1>Welcome back, ${user.name}!</h1>
                        <p class="last-login">
                            Last login: ${new Date(this.currentUser.lastActive).toLocaleString()}
                        </p>
                    </div>
                    
                    <div class="dashboard-actions">
                        <button class="btn-refresh" data-action="refresh">
                            <i class="fas fa-sync-alt"></i>
                            Refresh
                        </button>
                        ${isTeacher ? this.renderTeacherActions() : ''}
                    </div>
                </header>

                <div class="dashboard-alerts">
                    ${this.renderAlerts()}
                </div>

                <div class="dashboard-grid">
                    <!-- Main Progress Widget -->
                    <div class="dashboard-widget widget-progress">
                        ${this.widgets.progress.render()}
                    </div>

                    <!-- Upcoming Lessons Widget -->
                    <div class="dashboard-widget widget-upcoming">
                        ${this.widgets.upcomingLessons.render()}
                    </div>

                    <!-- Practice Statistics Widget -->
                    <div class="dashboard-widget widget-practice">
                        ${this.widgets.practiceStats.render()}
                    </div>

                    <!-- Goals Widget -->
                    <div class="dashboard-widget widget-goals">
                        ${this.widgets.goals.render()}
                    </div>

                    <!-- Recommendations Widget -->
                    <div class="dashboard-widget widget-recommendations">
                        ${this.widgets.recommendations.render()}
                    </div>
                </div>

                ${this.renderQuickActions()}
            </div>
        `;
    }

    renderTeacherActions() {
        return `
            <div class="teacher-actions">
                <button class="btn-primary" onclick="handleCreateLesson()">
                    <i class="fas fa-plus"></i>
                    New Lesson
                </button>
                <button class="btn-secondary" onclick="handleManageStudents()">
                    <i class="fas fa-users"></i>
                    Manage Students
                </button>
            </div>
        `;
    }

    renderAlerts() {
        const alerts = store.getState().alerts || [];
        if (!alerts.length) return '';

        return `
            <div class="alerts-container">
                ${alerts.map(alert => `
                    <div class="alert alert-${alert.type}">
                        <i class="fas fa-${this.getAlertIcon(alert.type)}"></i>
                        <span>${alert.message}</span>
                        <button class="alert-close" 
                                onclick="handleDismissAlert(${alert.id})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderQuickActions() {
        return `
            <div class="quick-actions">
                <h2>Quick Actions</h2>
                <div class="actions-grid">
                    <button class="action-button" onclick="handleStartPractice()">
                        <i class="fas fa-play"></i>
                        Start Practice
                    </button>
                    <button class="action-button" onclick="handleScheduleLesson()">
                        <i class="fas fa-calendar-plus"></i>
                        Schedule Lesson
                    </button>
                    <button class="action-button" onclick="handleViewProgress()">
                        <i class="fas fa-chart-line"></i>
                        View Progress
                    </button>
                    <button class="action-button" onclick="handleSetGoals()">
                        <i class="fas fa-bullseye"></i>
                        Set Goals
                    </button>
                </div>
            </div>
        `;
    }

    async refreshData() {
        try {
            // Show loading state
            this.setLoading(true);

            // Refresh all widgets
            await Promise.all(
                Object.values(this.widgets).map(widget => widget.refresh())
            );

            // Update last refresh timestamp
            this.lastRefresh = new Date().toISOString();

            // Trigger re-render
            this.update();

        } catch (error) {
            console.error('Failed to refresh dashboard:', error);
            // Show error notification
            this.showError('Failed to refresh dashboard data');
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        const dashboard = document.querySelector('.dashboard');
        if (dashboard) {
            dashboard.classList.toggle('loading', loading);
        }
    }

    showError(message) {
        // Implement error notification
        console.error(message);
    }

    handleStoreUpdate(update) {
        // Handle relevant store updates
        if (['SET_USER', 'UPDATE_PROGRESS', 'UPDATE_GOALS'].includes(update.action)) {
            this.update();
        }
    }

    handleWidgetUpdate(widgetId) {
        // Update specific widget
        const widget = document.querySelector(`.widget-${widgetId}`);
        if (widget && this.widgets[widgetId]) {
            widget.innerHTML = this.widgets[widgetId].render();
        }
    }

    update() {
        const dashboard = document.querySelector('.dashboard');
        if (dashboard) {
            dashboard.innerHTML = this.render();
            this.initializeCharts();
        }
    }

    initializeCharts() {
        // Initialize all charts in widgets
        Object.values(this.widgets).forEach(widget => {
            if (typeof widget.initializeCharts === 'function') {
                widget.initializeCharts();
            }
        });
    }

    getAlertIcon(type) {
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    destroy() {
        // Clean up
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        // Destroy widgets
        Object.values(this.widgets).forEach(widget => {
            if (typeof widget.destroy === 'function') {
                widget.destroy();
            }
        });

        // Remove event listeners
        store.unsubscribe(this.handleStoreUpdate);
    }
}