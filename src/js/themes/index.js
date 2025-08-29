import { ThemePreferenceManager } from './themePreferenceManager';
import { ThemeObserver } from './themeObserver';
import { ThemeTransitionManager } from './themeTransitionManager';

class ThemeManager {
    constructor() {
        this.currentUser = {
            login: 'leomart-wd',
            lastActive: '2025-08-29 13:52:45'
        };
        
        this.preferenceManager = new ThemePreferenceManager();
        this.observer = new ThemeObserver();
        this.transitionManager = new ThemeTransitionManager();
        
        this.initialize();
    }

    async initialize() {
        await this.preferenceManager.initialize();
        
        // Listen for theme changes
        document.addEventListener('themechange', this.handleThemeChange.bind(this));
        
        // Initialize theme based on current preferences
        await this.preferenceManager.loadAndApplyTheme();
    }

    handleThemeChange(event) {
        const { theme } = event.detail;
        this.observer.notifyObservers(theme);
    }

    async toggleTheme() {
        const root = document.documentElement;
        const currentTheme = root.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        await this.transitionManager.toggleTheme();
        await this.preferenceManager.setUserPreference(newTheme);
    }
}

// Export singleton instance
export const themeManager = new ThemeManager();
