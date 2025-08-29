import { initializeApp } from './core/auth.js';
import { Router } from './core/router.js';
import { Store } from './core/store.js';
import { APP_CONFIG } from './config/appConfig.js';

class App {
    constructor() {
        this.store = new Store();
        this.router = new Router();
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Initialize core systems
            await initializeApp();
            await this.store.initialize();
            await this.router.initialize();

            // Set up event listeners
            this.setupEventListeners();
            
            // Check online status
            this.handleConnectionStatus();

            this.initialized = true;
            console.log('App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.handleInitializationError(error);
        }
    }

    setupEventListeners() {
        // Handle online/offline status
        window.addEventListener('online', () => this.handleConnectionStatus());
        window.addEventListener('offline', () => this.handleConnectionStatus());

        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.handleAppFocus();
            }
        });
    }

    handleConnectionStatus() {
        const offlineNotification = document.getElementById('offline-notification');
        if (navigator.onLine) {
            offlineNotification.classList.add('hidden');
        } else {
            offlineNotification.classList.remove('hidden');
        }
    }

    handleAppFocus() {
        // Refresh data when app comes to foreground
        this.store.refreshData();
    }

    handleInitializationError(error) {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="error-screen" role="alert">
                <h1>Errore di Inizializzazione</h1>
                <p>Si è verificato un errore durante l'avvio dell'applicazione.</p>
                <button onclick="window.location.reload()">Riprova</button>
            </div>
        `;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.initialize().catch(error => {
        console.error('Critical initialization error:', error);
    });
});

// Export for testing
export default App;
