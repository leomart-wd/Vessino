export class TeacherDashboard {
    constructor(manager) {
        this.manager = manager;
        this.currentView = 'overview';
        this.students = [];
        this.lessons = [];
        this.analytics = {};
    }

    async initialize() {
        try {
            await Promise.all([
                this.loadStudents(),
                this.loadLessons(),
                this.loadAnalytics()
            ]);
            this.render();
            this.setupEventListeners();
            return true;
        } catch (error) {
            console.error('Teacher dashboard initialization failed:', error);
            throw error;
        }
    }

    async loadStudents() {
        const response = await this.manager.api.get('/teacher/students');
        this.students = response.data;
    }

    async loadLessons() {
        const response = await this.manager.api.get('/teacher/lessons');
        this.lessons = response.data;
    }

    async loadAnalytics() {
        const response = await this.manager.api.get('/teacher/analytics');
        this.analytics = response.data;
    }

    render() {
        const container = document.getElementById('dashboard-container');
        container.innerHTML = `
            <div class="teacher-dashboard">
                <nav class="dashboard-nav">
                    ${this.renderNavigation()}
                </nav>
                <main class="dashboard-content">
                    ${this.renderContent()}
                </main>
                <aside class="dashboard-sidebar">
                    ${this.renderSidebar()}
                </aside>
            </div>
        `;
    }

    renderNavigation() {
        return `
            <div class="nav-items">
                <button class="nav-item ${this.currentView === 'overview' ? 'active' : ''}"
                        data-view="overview">
                    <i class="fas fa-home"></i>
                    <span>Overview</span>
                </button>
                <button class="nav-item ${this.currentView === 'students' ? 'active' : ''}"
                        data-view="students">
                    <i class="fas fa-users"></i>
                    <span>Students</span>
                </button>
                <button class="nav-item ${this.currentView === 'lessons' ? 'active' : ''}"
                        data-view="lessons">
                    <i class="fas fa-book"></i>
                    <span>Lessons</span>
                </button>
                <button class="nav-item ${this.currentView === 'analytics' ? 'active' : ''}"
                        data-view="analytics">
                    <i class="fas fa-chart-bar"></i>
                    <span>Analytics</span>
                </button>
            </div>
        `;
    }

    renderContent() {
        switch (this.currentView) {
            case 'overview':
                return this.renderOverview();
            case 'students':
                return this.renderStudentsView();
            case 'lessons':
                return this.renderLessonsView();
            case 'analytics':
                return this.renderAnalyticsView();
            default:
                return '<div>Invalid view</div>';
        }
    }

    renderOverview() {
        return `
            <div class="overview-container">
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Total Students</h3>
                        <p class="stat-value">${this.students.length}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Active Lessons</h3>
                        <p class="stat-value">${this.lessons.filter(l => l.status === 'active').length}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Average Progress</h3>
                        <p class="stat-value">${this.calculateAverageProgress()}%</p>
                    </div>
                    <div class="stat-card">
                        <h3>This Week's Sessions</h3>
                        <p class="stat-value">${this.analytics.weeklySessionCount || 0}</p>
                    </div>
                </div>
                <div class="recent-activity">
                    <h2>Recent Activity</h2>
                    ${this.renderRecentActivity()}
                </div>
                <div class="upcoming-sessions">
                    <h2>Upcoming Sessions</h2>
                    ${this.renderUpcomingSessions()}
                </div>
            </div>
        `;
    }

    renderStudentsView() {
        return `
            <div class="students-container">
                <div class="students-header">
                    <h2>Students</h2>
                    <div class="actions">
                        <input type="search" 
                               placeholder="Search students..." 
                               class="search-input"
                               id="student-search">
                        <button class="btn-primary" onclick="handleAddStudent()">
                            Add Student
                        </button>
                    </div>
                </div>
                <div class="students-grid">
                    ${this.students.map(student => this.renderStudentCard(student)).join('')}
                </div>
            </div>
        `;
    }

    renderStudentCard(student) {
        return `
            <div class="student-card" data-student-id="${student.id}">
                <div class="student-header">
                    <img src="${student.avatar}" alt="${student.name}" class="student-avatar">
                    <h3>${student.name}</h3>
                </div>
                <div class="student-info">
                    <p>Progress: ${student.progress}%</p>
                    <p>Last Active: ${this.formatDate(student.lastActive)}</p>
                </div>
                <div class="student-actions">
                    <button onclick="viewStudent('${student.id}')" class="btn-secondary">
                        View Details
                    </button>
                </div>
            </div>
        `;
    }

    calculateAverageProgress() {
        if (!this.students.length) return 0;
        const total = this.students.reduce((sum, student) => sum + student.progress, 0);
        return Math.round(total / this.students.length);
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('it-IT', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    setupEventListeners() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });
    }

    switchView(view) {
        this.currentView = view;
        this.render();
    }
}