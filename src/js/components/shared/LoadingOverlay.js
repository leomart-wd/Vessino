export class LoadingOverlay {
    constructor() {
        this.visible = false;
        this.container = null;
        this.counter = 0;
    }

    initialize() {
        this.createContainer();
        return Promise.resolve();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'loading-overlay hidden';
        document.body.appendChild(this.container);
    }

    show() {
        this.counter++;
        if (this.counter === 1) {
            this.visible = true;
            this.render();
        }
    }

    hide() {
        this.counter = Math.max(0, this.counter - 1);
        if (this.counter === 0) {
            this.visible = false;
            this.render();
        }
    }

    render() {
        if (!this.container) return '';

        this.container.className = `loading-overlay ${this.visible ? '' : 'hidden'}`;
        
        this.container.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading...</div>
            </div>
        `;
    }
}

export const loadingOverlay = new LoadingOverlay();