import { TeacherDashboard } from './TeacherDashboard.js';
import { StudentDashboard } from './StudentDashboard.js';
import { auth } from '../../core/auth.js';
import { store } from '../../core/store.js';
import { EventEmitter } from '../../utils/eventEmitter.js';

export class DashboardController {
    constructor() {
        this.events = new EventEmitter();
        this.store = store;
        this.currentUser = {
            login: 'leomart-wd',
            lastActive: '2025-08-29 13:04:23'
        };
        this.dashboard = null;
    }

    async initialize() {
        try {
            // Create appropriate dashboard based on user role
            this.dashboard = auth.isTeacher() ?
                new TeacherDashboard(this) :
                new StudentDashboard(this);

            await this.dashboard.initialize();
            this.setupEventListeners();
            
            return true;
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Listen for store updates
        this.store.subscribe(this.handleStoreUpdate.bind(this));
        
        // Listen for real-time updates
        this.setupRealtimeUpdates();
    }

    handleStoreUpdate(update) {
        if (this.dashboard) {
            this.dashboard.handleUpdate(update);
        }
    }

    setupRealtimeUpdates() {
        const ws = new WebSocket('wss://api.vessiamoci.com/dashboard-updates');
        
        ws.onmessage = (event) => {
            const update = JSON.parse(event.data);
            this.handleRealtimeUpdate(update);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setTimeout(() => this.setupRealtimeUpdates(), 5000);
        };
    }

    handleRealtimeUpdate(update) {
        if (this.dashboard) {
            this.dashboard.handleRealtimeUpdate(update);
        }
    }

    async refreshDashboard() {
        if (this.dashboard) {
            await this.dashboard.refresh();
        }
    }
}

// Initialize dashboard
const dashboardController = new DashboardController();
export default dashboardController;