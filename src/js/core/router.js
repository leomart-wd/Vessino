import { ROUTES } from '../config/appConfig.js';
import { auth } from './auth.js';

export class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.defaultRoute = '/';
    }

    initialize() {
        // Set up route handlers
        this.registerRoutes();
        
        // Handle browser navigation
        window.addEventListener('popstate', this.handlePopState.bind(this));
        
        // Handle initial route
        this.handleCurrentRoute();
    }

    registerRoutes() {
        // Public routes
        this.addRoute(ROUTES.home, this.renderHome.bind(this));
        this.addRoute(ROUTES.login, this.renderLogin.bind(this));
        
        // Protected routes
        this.addProtectedRoute(ROUTES.dashboard, this.renderDashboard.bind(this));
        this.addProtectedRoute(ROUTES.lessons, this.renderLessons.bind(this));
        this.addProtectedRoute(ROUTES.practice, this.renderPractice.bind(this));
        this.addProtectedRoute(ROUTES.profile, this.renderProfile.bind(this));
        this.addProtectedRoute(ROUTES.analytics, this.renderAnalytics.bind(this));
    }

    addRoute(path, handler, options = {}) {
        this.routes.set(path, { handler, ...options });
    }

    addProtectedRoute(path, handler, options = {}) {
        this.addRoute(path, handler, { 
            ...options, 
            protected: true 
        });
    }

    async navigate(path, options = {}) {
        // Check if route exists
        const route = this.routes.get(path);
        if (!route) {
            return this.handleNotFound();
        }

        // Check authentication for protected routes
        if (route.protected && !auth.isAuthenticated) {
            return this.redirectToLogin(path);
        }

        try {
            // Update browser history
            if (!options.replace) {
                window.history.pushState(null, '', path);
            }

            // Render route
            await this.renderRoute(route, path);
            
            // Update current route
            this.currentRoute = path;

            // Scroll to top
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Navigation failed:', error);
            this.handleError(error);
        }
    }

    async handleCurrentRoute() {
        const path = window.location.pathname;
        await this.navigate(path, { replace: true });
    }

    async handlePopState() {
        await this.handleCurrentRoute();
    }

    redirectToLogin(returnTo) {
        const loginPath = `/login?returnTo=${encodeURIComponent(returnTo)}`;
        this.navigate(loginPath, { replace: true });
    }

    handleNotFound() {
        const container = document.getElementById('app');
        container.innerHTML = `
            <div class="not-found">
                <h1>404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
                <button onclick="window.history.back()">Go Back</button>
            </div>
        `;
    }

    handleError(error) {
        const container = document.getElementById('app');
        container.innerHTML = `
            <div class="error-page">
                <h1>Something went wrong</h1>
                <p>${error.message}</p>
                <button onclick="window.location.reload()">Reload Page</button>
            </div>
        `;
    }

    // Route handlers
    async renderHome() {
        const container = document.getElementById('app');
        container.innerHTML = await this.loadView('home');
    }

    async renderDashboard() {
        const container = document.getElementById('app');
        container.innerHTML = await this.loadView(
            auth.isTeacher() ? 'dashboard/teacher' : 'dashboard/student'
        );
    }

    async renderLessons() {
        const container = document.getElementById('app');
        container.innerHTML = await this.loadView('lessons/index');
    }

    async loadView(viewName) {
        try {
            const response = await fetch(`/views/${viewName}.html`);
            if (!response.ok) throw new Error('View not found');
            return await response.text();
        } catch (error) {
            console.error('Failed to load view:', error);
            return '<div class="error">Failed to load content</div>';
        }
    }
}

export const router = new Router();