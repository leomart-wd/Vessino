import { EventEmitter } from '../../../utils/eventEmitter.js';

export class BaseWidget {
    constructor(id) {
        this.id = id;
        this.events = new EventEmitter();
        this.isInitialized = false;
        this.lastUpdate = null;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            await this.loadData();
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error(`Failed to initialize widget ${this.id}:`, error);
            throw error;
        }
    }

    async loadData() {
        // To be implemented by child classes
        throw new Error('loadData method must be implemented');
    }

    async refresh() {
        try {
            await this.loadData();
            this.lastUpdate = new Date().toISOString();
            this.events.emit('update', this.id);
            return true;
        } catch (error) {
            console.error(`Failed to refresh widget ${this.id}:`, error);
            throw error;
        }
    }

    render() {
        // To be implemented by child classes
        throw new Error('render method must be implemented');
    }

    destroy() {
        this.events.removeAllListeners();
    }

    setLoading(loading) {
        const widget = document.querySelector(`.widget-${this.id}`);
        if (widget) {
            widget.classList.toggle('loading', loading);
        }
    }

    showError(message) {
        return `
            <div class="widget-error">
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
            </div>
        `;
    }
}