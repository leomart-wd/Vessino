import { API } from './api.js';
import { store } from './store.js';
import { router } from './router.js';
import { APP_CONFIG } from '../config/appConfig.js';
import { EventEmitter } from '../utils/eventEmitter.js';

class Auth {
    constructor() {
        this.api = new API();
        this.store = store;
        this.events = new EventEmitter();
        this.currentUser = null;
        this.isAuthenticated = false;
        this.refreshTimer = null;
        this.lastActivity = new Date('2025-08-29 13:11:48').getTime();
        
        // Bind methods
        this.checkSession = this.checkSession.bind(this);
        this.handleActivity = this.handleActivity.bind(this);
    }

    async initialize() {
        try {
            // Check for existing session
            await this.checkSession();
            
            // Set up activity monitoring
            this.setupActivityMonitoring();
            
            // Set up token refresh
            this.setupTokenRefresh();

            return true;
        } catch (error) {
            console.error('Auth initialization failed:', error);
            await this.logout();
            return false;
        }
    }

    async checkSession() {
        const token = localStorage.getItem('auth_token');
        const userId = localStorage.getItem('user_id');

        if (token && userId) {
            try {
                const response = await this.api.get('/auth/validate');
                await this.handleAuthSuccess(response.data);
                return true;
            } catch (error) {
                await this.clearSession();
                throw new Error('Invalid session');
            }
        }
        return false;
    }

    setupActivityMonitoring() {
        // Monitor user activity
        ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
            document.addEventListener(event, this.handleActivity);
        });

        // Check session validity periodically
        setInterval(this.checkSession, APP_CONFIG.auth.sessionTimeout / 4);
    }

    handleActivity() {
        this.lastActivity = Date.now();
    }

    async login(credentials) {
        try {
            const response = await this.api.post('/auth/login', credentials);
            await this.handleAuthSuccess(response.data);
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error(error.message || 'Authentication failed');
        }
    }

    async logout(options = {}) {
        try {
            if (!options.silent) {
                await this.api.post('/auth/logout');
            }
        } catch (error) {
            console.warn('Logout request failed:', error);
        } finally {
            await this.clearSession();
            router.navigate('/login');
        }
    }

    async handleAuthSuccess(data) {
        // Store auth data
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_id', data.user.id);
        
        // Update state
        this.currentUser = data.user;
        this.isAuthenticated = true;
        
        // Update store
        this.store.dispatch('SET_USER', this.currentUser);
        
        // Setup token refresh
        this.setupTokenRefresh();
        
        // Emit auth event
        this.events.emit('auth:success', {
            user: this.currentUser,
            timestamp: new Date().toISOString()
        });
    }

    async clearSession() {
        // Clear stored data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        
        // Clear state
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Clear timers
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        // Update store
        this.store.dispatch('CLEAR_USER');
        
        // Emit auth event
        this.events.emit('auth:logout', {
            timestamp: new Date().toISOString()
        });
    }

    setupTokenRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }

        this.refreshTimer = setInterval(async () => {
            try {
                const response = await this.api.post('/auth/refresh');
                localStorage.setItem('auth_token', response.data.token);
            } catch (error) {
                console.error('Token refresh failed:', error);
                await this.logout({ silent: true });
            }
        }, APP_CONFIG.auth.tokenRefreshInterval);
    }

    // Helper methods
    isTeacher() {
        return this.currentUser?.role === 'teacher';
    }

    isStudent() {
        return this.currentUser?.role === 'student';
    }

    hasPermission(permission) {
        return this.currentUser?.permissions?.includes(permission) || false;
    }

    getAuthHeaders() {
        const token = localStorage.getItem('auth_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
}

export const auth = new Auth();