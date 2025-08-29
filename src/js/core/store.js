import { EventEmitter } from '../utils/eventEmitter.js';
import { APP_CONFIG } from '../config/appConfig.js';

class Store {
    constructor() {
        this.state = {
            user: null,
            settings: {},
            lessons: [],
            progress: {},
            notifications: []
        };
        this.events = new EventEmitter();
        this.lastUpdate = new Date('2025-08-29 13:11:48').getTime();
        this.version = APP_CONFIG.storage.version;
    }

    async initialize() {
        try {
            // Load persisted state
            await this.loadPersistedState();
            
            // Set up state persistence
            this.setupStatePersistence();
            
            // Set up state validation
            this.setupStateValidation();

            return true;
        } catch (error) {
            console.error('Store initialization failed:', error);
            return false;
        }
    }

    async loadPersistedState() {
        try {
            const storedState = localStorage.getItem(`${APP_CONFIG.storage.prefix}state`);
            const storedVersion = localStorage.getItem(`${APP_CONFIG.storage.prefix}version`);

            if (storedState && storedVersion === this.version.toString()) {
                this.state = JSON.parse(storedState);
                this.lastUpdate = Date.now();
            }
        } catch (error) {
            console.error('Failed to load persisted state:', error);
            // Continue with default state
        }
    }

    setupStatePersistence() {
        this.events.on('stateChange', () => {
            try {
                localStorage.setItem(
                    `${APP_CONFIG.storage.prefix}state`,
                    JSON.stringify(this.state)
                );
                localStorage.setItem(
                    `${APP_CONFIG.storage.prefix}version`,
                    this.version.toString()
                );
            } catch (error) {
                console.error('Failed to persist state:', error);
            }
        });
    }

    setupStateValidation() {
        this.events.on('stateChange', (change) => {
            if (!this.validateStateChange(change)) {
                console.error('Invalid state change:', change);
                this.rollbackState();
            }
        });
    }

    dispatch(action, payload) {
        console.log(`[Store] Dispatching: ${action}`, payload);
        
        const previousState = { ...this.state };
        
        try {
            switch (action) {
                case 'SET_USER':
                    this.state.user = payload;
                    break;
                    
                case 'CLEAR_USER':
                    this.state.user = null;
                    break;
                    
                case 'UPDATE_SETTINGS':
                    this.state.settings = {
                        ...this.state.settings,
                        ...payload
                    };
                    break;
                    
                case 'SET_LESSONS':
                    this.state.lessons = payload;
                    break;
                    
                case 'UPDATE_PROGRESS':
                    this.state.progress = {
                        ...this.state.progress,
                        ...payload
                    };
                    break;
                    
                case 'ADD_NOTIFICATION':
                    this.state.notifications.push({
                        id: Date.now(),
                        timestamp: new Date().toISOString(),
                        ...payload
                    });
                    break;
                    
                case 'REMOVE_NOTIFICATION':
                    this.state.notifications = this.state.notifications
                        .filter(n => n.id !== payload);
                    break;
                    
                default:
                    console.warn('Unknown action:', action);
                    return;
            }

            this.lastUpdate = Date.now();
            
            // Emit state change event
            this.events.emit('stateChange', {
                action,
                payload,
                previousState,
                currentState: this.state
            });

        } catch (error) {
            console.error('Error during dispatch:', error);
            this.state = previousState;
            throw error;
        }
    }

    validateStateChange(change) {
        // Implement state validation logic
        return true; // Placeholder
    }

    rollbackState() {
        // Implement state rollback logic
    }

    getState() {
        return { ...this.state };
    }

    subscribe(listener) {
        return this.events.on('stateChange', listener);
    }

    unsubscribe(listener) {
        this.events.off('stateChange', listener);
    }
}

export const store = new Store();