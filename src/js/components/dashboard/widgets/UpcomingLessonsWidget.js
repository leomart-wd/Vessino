import { BaseWidget } from './BaseWidget.js';
import { API } from '../../../core/api.js';
import { format, isPast } from 'date-fns';

export class UpcomingLessonsWidget extends BaseWidget {
    constructor() {
        super('upcomingLessons');
        this.api = new API();
        this.lessons = [];
        this.currentUser = {
            login: 'leomart-wd',
            lastActive: '2025-08-29 13:18:13'
        };
    }

    async loadData() {
        try {
            const response = await this.api.get(`/users/${this.currentUser.login}/lessons/upcoming`);
            this.lessons = response.data;
            return true;
        } catch (error) {
            console.error('Failed to load upcoming lessons:', error);
            throw error;
        }
    }

    render() {
        return `
            <div class="upcoming-lessons-widget">
                <div class="widget-header">
                    <h2>Upcoming Lessons</h2>
                    <button class="btn-primary" onclick="handleScheduleLesson()">
                        <i class="fas fa-plus"></i>
                        Schedule
                    </button>
                </div>

                <div class="lessons-list">
                    ${this.lessons.length ? this.renderLessons() : this.renderEmptyState()}
                </div>
            </div>
        `;
    }

    renderLessons() {
        return this.lessons.map(lesson => `
            <div class="lesson-card ${isPast(new Date(lesson.startTime)) ? 'past' : ''}"
                 data-lesson-id="${lesson.id}">
                <div class="lesson-time">
                    <div class="date">${format(new Date(lesson.startTime), 'MMM dd')}</div>
                    <div class="time">${format(new Date(lesson.startTime), 'HH:mm')}</div>
                </div>

                <div class="lesson-info">
                    <h3>${lesson.title}</h3>
                    <div class="lesson-meta">
                        <span class="teacher">
                            <i class="fas fa-user"></i>
                            ${lesson.teacherName}
                        </span>
                        <span class="duration">
                            <i class="fas fa-clock"></i>
                            ${lesson.duration} min
                        </span>
                        ${lesson.isOnline ? `
                            <span class="online">
                                <i class="fas fa-video"></i>
                                Online
                            </span>
                        ` : ''}
                    </div>
                </div>

                <div class="lesson-actions">
                    ${this.renderLessonActions(lesson)}
                </div>
            </div>
        `).join('');
    }

    renderLessonActions(lesson) {
        const now = new Date();
        const lessonTime = new Date(lesson.startTime);
        const canJoin = Math.abs(now - lessonTime) <= 15 * 60 * 1000; // 15 minutes window

        return `
            <div class="action-buttons">
                ${canJoin ? `
                    <button class="btn-join" onclick="handleJoinLesson(${lesson.id})">
                        <i class="fas fa-sign-in-alt"></i>
                        Join
                    </button>
                ` : ''}
                <button class="btn-icon" onclick="handleViewLessonDetails(${lesson.id})">
                    <i class="fas fa-info-circle"></i>
                </button>
                <button class="btn-icon" onclick="handleRescheduleLesson(${lesson.id})">
                    <i class="fas fa-calendar-alt"></i>
                </button>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="empty-state">
                <i class="fas fa-calendar-day"></i>
                <p>No upcoming lessons scheduled</p>
                <button class="btn-primary" onclick="handleScheduleLesson()">
                    Schedule a Lesson
                </button>
            </div>
        `;
    }
}