import { auth } from '../../core/auth.js';
import { store } from '../../core/store.js';
import { router } from '../../core/router.js';

export class Navigation {
    constructor() {
        this.currentUser = {
            login: 'leomart-wd',
            lastActive: '2025-08-29 13:12:41'
        };
        this.menuItems = this.getMenuItems();
    }

    initialize() {
        this.setupEventListeners();
        return Promise.resolve();
    }

    setupEventListeners() {
        document.addEventListener('click', (event) => {
            const menuToggle = event.target.closest('.menu-toggle');
            if (menuToggle) {
                this.toggleMenu();
            }

            const navItem = event.target.closest('.nav-item');
            if (navItem) {
                this.handleNavigation(navItem.dataset.route);
            }
        });

        // Listen for auth changes
        auth.events.on('auth:success', () => {
            this.menuItems = this.getMenuItems();
            this.update();
        });
    }

    getMenuItems() {
        const baseItems = [
            {
                id: 'dashboard',
                label: 'Dashboard',
                icon: 'fas fa-home',
                route: '/dashboard'
            },
            {
                id: 'lessons',
                label: 'Lessons',
                icon: 'fas fa-book',
                route: '/lessons'
            },
            {
                id: 'practice',
                label: 'Practice',
                icon: 'fas fa-microphone',
                route: '/practice'
            }
        ];

        // Add teacher-specific items
        if (auth.isTeacher()) {
            baseItems.push({
                id: 'students',
                label: 'Students',
                icon: 'fas fa-users',
                route: '/students'
            });
        }

        // Add common items
        baseItems.push(
            {
                id: 'progress',
                label: 'Progress',
                icon: 'fas fa-chart-line',
                route: '/progress'
            },
            {
                id: 'settings',
                label: 'Settings',
                icon: 'fas fa-cog',
                route: '/settings'
            }
        );

        return baseItems;
    }

    render() {
        const user = store.getState().user;

        return `
            <nav class="main-navigation">
                <div class="nav-header">
                    <div class="logo">
                        <img src="/assets/logo.svg" alt="Vessiamoci">
                    </div>
                    <button class="menu-toggle md:hidden">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>

                <div class="nav-content">
                    <ul class="nav-items">
                        ${this.menuItems.map(item => this.renderMenuItem(item)).join('')}
                    </ul>

                    ${user ? this.renderUserSection(user) : this.renderAuthButtons()}
                </div>
            </nav>
        `;
    }

    renderMenuItem(item) {
        const isActive = window.location.pathname === item.route;
        
        return `
            <li class="nav-item ${isActive ? 'active' : ''}" 
                data-route="${item.route}">
                <a href="${item.route}" class="nav-link">
                    <i class="${item.icon}"></i>
                    <span>${item.label}</span>
                    ${item.badge ? `
                        <span class="badge ${item.badge.type}">
                            ${item.badge.value}
                        </span>
                    ` : ''}
                </a>
            </li>
        `;
    }

    renderUserSection(user) {
        return `
            <div class="user-section">
                <div class="user-info">
                    <img src="${user.avatar}" 
                         alt="${user.name}"
                         class="user-avatar">
                    <div class="user-details">
                        <span class="user-name">${user.name}</span>
                        <span class="user-role">${user.role}</span>
                    </div>
                </div>
                <button class="btn-logout" onclick="handleLogout()">
                    <i class="fas fa-sign-out-alt"></i>
                    Logout
                </button>
            </div>
        `;
    }

    renderAuthButtons() {
        return `
            <div class="auth-buttons">
                <button class="btn-login" onclick="handleLogin()">
                    Login
                </button>
                <button class="btn-signup" onclick="handleSignup()">
                    Sign Up
                </button>
            </div>
        `;
    }

    update() {
        const navElement = document.querySelector('.main-navigation');
        if (navElement) {
            navElement.innerHTML = this.render();
        }
    }

    toggleMenu() {
        const navContent = document.querySelector('.nav-content');
        navContent.classList.toggle('show');
    }

    async handleNavigation(route) {
        if (!route) return;

        try {
            await router.navigate(route);
        } catch (error) {
            console.error('Navigation failed:', error);
        }
    }

    async handleLogout() {
        try {
            await auth.logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }
}