import { auth } from '../core/auth.js';
import { store } from '../core/store.js';
import { Navigation } from './navigation/Navigation.js';
import { Dashboard } from './dashboard/Dashboard.js';
import { NotificationCenter } from './shared/NotificationCenter.js';
import { LoadingOverlay } from './shared/LoadingOverlay.js';

export class App {
    constructor() {
        this.navigation = new Navigation();
        this.dashboard = new Dashboard();
        this.notifications = new NotificationCenter();
        this.loading = new LoadingOverlay();
        this.currentUser = {
            login: 'leomart-wd',
            lastActive: '2025-08-29 13:12:41'
        };
    }

    async initialize() {
        try {
            await Promise.all([
                this.navigation.initialize(),
                this.notifications.initialize()
            ]);

            this.setupEventListeners();
            this.render();
            
            return true;
        } catch (error) {
            console.error('App initialization failed:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Listen for auth state changes
        auth.events.on('auth:success', () => this.handleAuthSuccess());
        auth.events.on('auth:logout', () => this.handleAuthLogout());

        // Listen for store updates
        store.subscribe(this.handleStoreUpdate.bind(this));

        // Handle theme changes
        this.handleThemeChange(store.getState().settings?.theme);
    }

    render() {
        document.getElementById('app').innerHTML = `
            <div class="app-container" data-theme="${store.getState().settings?.theme || 'light'}">
                <div class="app-navigation">
                    ${this.navigation.render()}
                </div>
                
                <main class="app-main">
                    <div id="content"></div>
                </main>
                
                ${this.notifications.render()}
                ${this.loading.render()}
            </div>
        `;

        // Initialize dashboard if authenticated
        if (auth.isAuthenticated) {
            this.renderDashboard();
        }
    }

    async renderDashboard() {
        const contentElement = document.getElementById('content');
        await this.dashboard.initialize();
        contentElement.innerHTML = this.dashboard.render();
    }

    handleAuthSuccess() {
        this.render();
        this.notifications.show({
            type: 'success',
            message: 'Welcome back!'
        });
    }

    handleAuthLogout() {
        this.render();
        this.notifications.show({
            type: 'info',
            message: 'You have been logged out.'
        });
    }

    handleStoreUpdate(update) {
        if (update.action === 'UPDATE_SETTINGS') {
            this.handleThemeChange(update.payload.theme);
        }
    }

    handleThemeChange(theme) {
        document.documentElement.setAttribute('data-theme', theme || 'light');
    }
}