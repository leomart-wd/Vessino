import { APP_CONFIG, THEME_COLORS } from '../config/appConfig.js';

class UserInterface {
    constructor(role = 'student') {
        this.role = role;
        this.theme = APP_CONFIG.defaultTheme;
        this.mediaQuery = window.matchMedia('(max-width: 768px)');
        this.setupResponsiveListeners();
    }

    setupResponsiveListeners() {
        this.mediaQuery.addListener(e => this.handleResponsiveChange(e));
        window.addEventListener('resize', () => this.optimizeLayout());
    }

    handleResponsiveChange(e) {
        if (e.matches) {
            // Mobile layout optimizations
            this.optimizeMobileLayout();
        } else {
            // Desktop layout optimizations
            this.optimizeDesktopLayout();
        }
    }

    optimizeMobileLayout() {
        document.body.classList.add('mobile-layout');
        // Adjust button sizes for touch
        document.querySelectorAll('button').forEach(btn => {
            btn.style.minHeight = '44px';
            btn.style.minWidth = '44px';
        });
    }

    optimizeDesktopLayout() {
        document.body.classList.remove('mobile-layout');
    }

    renderInterface() {
        const mainContainer = document.getElementById('app');
        mainContainer.innerHTML = this.role === 'teacher' ? 
            this.renderTeacherDashboard() : 
            this.renderStudentDashboard();
    }

    renderTeacherDashboard() {
        return `
            <div class="dashboard teacher-dashboard" role="main">
                <nav class="dashboard-nav" role="navigation">
                    <button class="nav-item" data-section="students">
                        <i class="fas fa-users"></i>
                        <span>Students</span>
                    </button>
                    <button class="nav-item" data-section="content">
                        <i class="fas fa-book"></i>
                        <span>Content</span>
                    </button>
                    <button class="nav-item" data-section="analytics">
                        <i class="fas fa-chart-bar"></i>
                        <span>Analytics</span>
                    </button>
                    <button class="nav-item" data-section="schedule">
                        <i class="fas fa-calendar"></i>
                        <span>Schedule</span>
                    </button>
                </nav>
                <main class="dashboard-content">
                    <div id="teacher-main-content"></div>
                </main>
            </div>
        `;
    }

    renderStudentDashboard() {
        return `
            <div class="dashboard student-dashboard" role="main">
                <div class="progress-overview" role="region" aria-label="Your Progress">
                    <div class="xp-display">
                        <span class="xp-amount">750 XP</span>
                        <div class="level-progress" role="progressbar" 
                             aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
                            <div class="progress-bar" style="width: 75%"></div>
                        </div>
                    </div>
                    <div class="daily-streak">
                        <i class="fas fa-fire"></i>
                        <span>7 Day Streak!</span>
                    </div>
                </div>
                <div class="quick-actions" role="region" aria-label="Quick Actions">
                    <button class="action-btn" data-action="continue-lesson">
                        <i class="fas fa-play"></i>
                        Continue Learning
                    </button>
                    <button class="action-btn" data-action="practice">
                        <i class="fas fa-microphone"></i>
                        Practice Now
                    </button>
                </div>
                <div class="micro-lessons" role="region" aria-label="Today's Lessons">
                    <!-- Micro-lessons will be dynamically inserted here -->
                </div>
            </div>
        `;
    }
}

export default UserInterface;