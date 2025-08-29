// Theme Transition Manager
export class ThemeTransitionManager {
    constructor() {
        this.transitionDuration = 300; // matches CSS var(--theme-transition-duration) in ms
        this.isTransitioning = false;
        this.currentUser = {
            login: 'leomart-wd',
            lastActive: '2025-08-29 13:34:06'
        };
    }

    async toggleTheme() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        const root = document.documentElement;
        const currentTheme = root.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        // Start transition
        root.setAttribute('data-theme-changing', 'true');

        // Apply transitions to main components
        this.applyTransitionClasses();

        // Switch theme
        root.setAttribute('data-theme', newTheme);

        // Wait for transitions to complete
        await this.waitForTransitions();

        // Cleanup
        this.removeTransitionClasses();
        root.removeAttribute('data-theme-changing');
        this.isTransitioning = false;

        // Save preference
        this.saveThemePreference(newTheme);
    }

    applyTransitionClasses() {
        const elements = this.getThemeElements();
        elements.forEach(element => {
            element.classList.add('theme-transition');
            
            // Add specific optimizations based on element type
            if (this.shouldPromoteToLayer(element)) {
                element.classList.add('theme-gpu', 'theme-layer-promote');
            }
            
            if (this.shouldOptimizeLayout(element)) {
                element.classList.add('theme-layout-optimize');
            }
        });
    }

    removeTransitionClasses() {
        const elements = this.getThemeElements();
        elements.forEach(element => {
            element.classList.remove(
                'theme-transition',
                'theme-gpu',
                'theme-layer-promote',
                'theme-layout-optimize'
            );
        });
    }

    getThemeElements() {
        return [
            ...document.querySelectorAll('.dashboard-widget'),
            ...document.querySelectorAll('.goal-card'),
            ...document.querySelectorAll('.lesson-card'),
            ...document.querySelectorAll('.stat-card'),
            ...document.querySelectorAll('.progress-bar'),
            ...document.querySelectorAll('.nav-item')
        ];
    }

    shouldPromoteToLayer(element) {
        // Promote elements that benefit from GPU acceleration
        return element.classList.contains('dashboard-widget') ||
               element.classList.contains('chart-container');
    }

    shouldOptimizeLayout(element) {
        // Optimize layout containment for specific elements
        return element.classList.contains('goal-card') ||
               element.classList.contains('lesson-card');
    }

    async waitForTransitions() {
        return new Promise(resolve => {
            setTimeout(resolve, this.transitionDuration);
        });
    }

    saveThemePreference(theme) {
        localStorage.setItem('theme-preference', theme);
    }
}

// Initialize theme transition manager
export const themeTransitionManager = new ThemeTransitionManager();