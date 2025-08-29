class Store {
    constructor() {
        this.state = {
            user: null,
            questions: [],
            progress: {},
            settings: {}
        };
        this.listeners = new Set();
    }

    async initialize() {
        try {
            // Load initial state from localStorage
            const savedState = localStorage.getItem('app_state');
            if (savedState) {
                this.state = JSON.parse(savedState);
            }

            // Subscribe to changes
            this.subscribe(this.saveState.bind(this));
        } catch (error) {
            console.error('Store initialization failed:', error);
        }
    }

    saveState() {
        localStorage.setItem('app_state', JSON.stringify(this.state));
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    dispatch(action, payload) {
        switch (action) {
            case 'SET_USER':
                this.state.user = payload;
                break;
            case 'UPDATE_PROGRESS':
                this.state.progress = { ...this.state.progress, ...payload };
                break;
            case 'SET_QUESTIONS':
                this.state.questions = payload;
                break;
            default:
                console.warn('Unknown action:', action);
                return;
        }
        this.notifyListeners();
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener(this.state));
    }

    getState() {
        return this.state;
    }

    async refreshData() {
        // Implement data refresh logic
    }
}

export { Store };