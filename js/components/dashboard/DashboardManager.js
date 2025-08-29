import { TeacherDashboard } from './TeacherDashboard.js';
import { StudentDashboard } from './StudentDashboard.js';
import { Store } from '../../core/store.js';
import { API } from '../../core/api.js';
import { EventEmitter } from '../../utils/eventEmitter.js';

export class DashboardManager {
    constructor() {
        this.store = new Store();
        this.api = new API();
        this.events = new EventEmitter();
        this.currentUser = {
            login: 'leomart-wd',
            lastActive: '2025-08-29 12:56:28'
        };
        this.dashboards = {
            teacher: new TeacherDashboard(this),
            student: new StudentDashboard(this)
        };
    }

    async initialize(userRole) {
        try {
            await this.loadUserData();
            const dashboard = this.dashboards[userRole];
            if (!dashboard) {
                throw new Error(`Invalid role: ${userRole}`);
            }
            await dashboard.initialize();
            this.setupEventListeners();
            return dashboard;
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
            throw error;
        }
    }

    async loadUserData() {
        try {
            const userData = await this.api.get(`/users/${this.currentUser.login}`);
            this.store.dispatch('SET_USER_DATA', userData);
        } catch (error) {
            console.error('Failed to load user data:', error);
            throw error;
        }
    }

    setupEventListeners() {
        this.events.on('dashboardUpdate', this.handleDashboardUpdate.bind(this));
        this.events.on('notificationReceived', this.handleNotification.bind(this));
    }

    handleDashboardUpdate(data) {
        this.store.dispatch('UPDATE_DASHBOARD', data);
    }

    handleNotification(notification) {
        // Implementation for handling real-time notifications
    }
}