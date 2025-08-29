export class ThemeObserver {
    constructor() {
        this.currentUser = {
            login: 'leomart-wd',
            lastActive: '2025-08-29 13:52:45'
        };
        this.callbacks = new Map();
    }

    observe(callback) {
        const id = crypto.randomUUID();
        this.callbacks.set(id, callback);
        return id;
    }

    unobserve(id) {
        this.callbacks.delete(id);
    }

    notifyObservers(theme) {
        this.callbacks.forEach(callback => {
            try {
                callback(theme);
            } catch (error) {
                console.error('Error in theme observer callback:', error);
            }
        });
    }
}
