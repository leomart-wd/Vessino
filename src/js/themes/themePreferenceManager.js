export class ThemePreferenceManager {
    constructor() {
        this.currentUser = {
            login: 'leomart-wd',
            lastActive: '2025-08-29 13:52:45'
        };
        
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.storageKey = 'theme-preference';
        this.userSettingsKey = `user-${this.currentUser.login}-theme`;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Set up system preference listener
            this.mediaQuery.addEventListener('change', this.handleSystemPreferenceChange.bind(this));

            // Load and apply initial theme
            await this.loadAndApplyTheme();

            this.initialized = true;
            console.log(`Theme preference manager initialized for user ${this.currentUser.login}`);
        } catch (error) {
            console.error('Failed to initialize theme preference manager:', error);
        }
    }

    async loadAndApplyTheme() {
        const theme = await this.determineTheme();
        this.applyTheme(theme);
    }

    async determineTheme() {
        try {
            // Priority order:
            // 1. User's explicit preference (stored in backend)
            // 2. Local storage preference
            // 3. System preference
            // 4. Default theme (light)

            const userPreference = await this.getUserThemePreference();
            if (userPreference) {
                return userPreference;
            }

            const localPreference = localStorage.getItem(this.storageKey);
            if (localPreference) {
                return localPreference;
            }

            return this.getSystemPreference();
        } catch (error) {
            console.error('Error determining theme:', error);
            return 'light'; // Fallback to light theme
        }
    }

    async getUserThemePreference() {
        try {
            const response = await fetch(`/api/users/${this.currentUser.login}/preferences`);
            if (!response.ok) throw new Error('Failed to fetch user preferences');
            
            const data = await response.json();
            return data.theme;
        } catch (error) {
            console.warn('Failed to fetch user theme preference:', error);
            return null;
        }
    }

    getSystemPreference() {
        return this.mediaQuery.matches ? 'dark' : 'light';
    }

    async handleSystemPreferenceChange(event) {
        // Only apply system preference if no user preference exists
        const userPreference = await this.getUserThemePreference();
        const localPreference = localStorage.getItem(this.storageKey);

        if (!userPreference && !localPreference) {
            const newTheme = event.matches ? 'dark' : 'light';
            this.applyTheme(newTheme);
            this.emitThemeChangeEvent(newTheme);
        }
    }

    applyTheme(theme) {
        const root = document.documentElement;
        const currentTheme = root.getAttribute('data-theme');

        if (currentTheme !== theme) {
            root.setAttribute('data-theme', theme);
            this.emitThemeChangeEvent(theme);
            this.updateMetaThemeColor(theme);
        }
    }

    updateMetaThemeColor(theme) {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        const color = theme === 'dark' ? '#1a1a1a' : '#ffffff';
        
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', color);
        } else {
            const meta = document.createElement('meta');
            meta.name = 'theme-color';
            meta.content = color;
            document.head.appendChild(meta);
        }
    }

    async setUserPreference(theme) {
        try {
            // Update backend
            await fetch(`/api/users/${this.currentUser.login}/preferences`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ theme })
            });

            // Update local storage
            localStorage.setItem(this.storageKey, theme);
            localStorage.setItem(this.userSettingsKey, JSON.stringify({
                theme,
                updatedAt: new Date().toISOString()
            }));

            // Apply theme
            this.applyTheme(theme);

            console.log(`Theme preference updated to ${theme} for user ${this.currentUser.login}`);
        } catch (error) {
            console.error('Failed to set user theme preference:', error);
            throw error;
        }
    }

    emitThemeChangeEvent(theme) {
        const event = new CustomEvent('themechange', {
            detail: {
                theme,
                timestamp: new Date().toISOString(),
                user: this.currentUser.login
            }
        });
        document.dispatchEvent(event);
    }

    destroy() {
        this.mediaQuery.removeEventListener('change', this.handleSystemPreferenceChange);
        this.initialized = false;
    }
}
