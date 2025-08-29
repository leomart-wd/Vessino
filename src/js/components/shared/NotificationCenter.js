export class NotificationCenter {
    constructor() {
        this.notifications = [];
        this.container = null;
    }

    initialize() {
        this.createContainer();
        return Promise.resolve();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'notification-center';
        document.body.appendChild(this.container);
    }

    show({ type = 'info', message, duration = 5000 }) {
        const notification = {
            id: Date.now(),
            type,
            message,
            timestamp: new Date().toISOString()
        };

        this.notifications.push(notification);
        this.render();

        if (duration > 0) {
            setTimeout(() => this.remove(notification.id), duration);
        }

        return notification.id;
    }

    remove(id) {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index !== -1) {
            this.notifications.splice(index, 1);
            this.render();
        }
    }

    render() {
        if (!this.container) return '';

        this.container.innerHTML = `
            <div class="notifications-list">
                ${this.notifications.map(notification => `
                    <div class="notification ${notification.type}" 
                         data-id="${notification.id}">
                        <div class="notification-content">
                            <i class="notification-icon ${this.getIcon(notification.type)}"></i>
                            <span class="notification-message">
                                ${notification.message}
                            </span>
                        </div>
                        <button class="notification-close" 
                                onclick="notificationCenter.remove(${notification.id})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }
}

export const notificationCenter = new NotificationCenter();