import { auth } from './core/auth.js';
import { router } from './core/router.js';
import { store } from './core/store.js';
import { analytics } from './core/analytics.js';
import { ErrorHandler } from './utils/errorHandler.js';

class App {
  constructor() {
    this.initialized = false;
    this.errorHandler = new ErrorHandler();
    
    // Set up global error handling
    window.onerror = this.errorHandler.handleError.bind(this.errorHandler);
    window.onunhandledrejection = this.errorHandler.handlePromiseRejection.bind(this.errorHandler);
  }

  async initialize() {
    if (this.initialized) return;

    try {
      console.log('Initializing application...');
      
      // Initialize core systems
      await Promise.all([
        store.initialize(),
        auth.initialize(),
        router.initialize(),
        analytics.initialize()
      ]);

      // Set up service worker
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/sw.js');
      }

      // Set up real-time updates
      this.setupRealtimeUpdates();

      // Set up performance monitoring
      this.setupPerformanceMonitoring();

      this.initialized = true;
      console.log('Application initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.errorHandler.handleFatalError(error);
    }
  }

  setupRealtimeUpdates() {
    const ws = new WebSocket(APP_CONFIG.api.wsUrl);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      store.dispatch('HANDLE_REALTIME_UPDATE', update);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setTimeout(() => this.setupRealtimeUpdates(), 5000);
    };
  }

  setupPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          analytics.trackPerformance(entry);
        }
      });

      observer.observe({ 
        entryTypes: ['navigation', 'resource', 'largest-contentful-paint'] 
      });
    }
  }
}

// Initialize application
const app = new App();
document.addEventListener('DOMContentLoaded', () => app.initialize());

// Export for testing
export default app;