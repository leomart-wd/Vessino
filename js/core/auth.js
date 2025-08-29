import { API } from './api.js';
import { APP_CONFIG } from '../config/appConfig.js';

class Auth {
    constructor() {
        this.api = new API();
        this.currentUser = null;
        this.isAuthenticated = false;
    }

    async initialize() {
        try {
            const token = localStorage.getItem('auth_token');
            if (token) {
                await this.validateToken(token);
            }
        } catch (error) {
            console.error('Auth initialization failed:', error);
            this.logout();
        }
    }

    async login(credentials) {
        try {
            const response = await this.api.post('/auth/login', credentials);
            this.handleAuthSuccess(response.data);
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error('Authentication failed');
        }
    }

    async logout() {
        localStorage.removeItem('auth_token');
        this.currentUser = null;
        this.isAuthenticated = false;
        window.location.href = '/login';
    }

    async validateToken(token) {
        try {
            const response = await this.api.get('/auth/validate');
            this.currentUser = response.data.user;
            this.isAuthenticated = true;
            return true;
        } catch (error) {
            this.logout();
            return false;
        }
    }

    handleAuthSuccess(data) {
        localStorage.setItem('auth_token', data.token);
        this.currentUser = data.user;
        this.isAuthenticated = true;
    }

    isTeacher() {
        return this.currentUser?.role === 'teacher';
    }

    isStudent() {
        return this.currentUser?.role === 'student';
    }
}

export const auth = new Auth();
export const initializeApp = () => auth.initialize();