import { Store } from '../../core/store.js';
import { API } from '../../core/api.js';
import { adaptiveLearning } from '../adaptiveLearning/adaptiveLearning.js';
import { gamification } from '../gamification/gamificationSystem.js';
import { formatDate } from '../../utils/dateFormatter.js';

export class LessonManager {
    constructor() {
        this.store = new Store();
        this.api = new API();
        this.currentUser = {
            login: 'leomart-wd',
            lastActive: '2025-08-29 12:57:41'
        };
        this.currentLesson = null;
        this.progress = {};
    }

    async initialize() {
        try {
            await this.loadUserProgress();
            return true;
        } catch (error) {
            console.error('Failed to initialize lesson manager:', error);
            throw error;
        }
    }

    async loadUserProgress() {
        const response = await this.api.get(`/users/${this.currentUser.login}/progress`);
        this.progress = response.data;
        this.store.dispatch('SET_PROGRESS', this.progress);
    }

    async startLesson(lessonId) {
        try {
            const lesson = await this.api.get(`/lessons/${lessonId}`);
            this.currentLesson = this.prepareLessonStructure(lesson);
            
            // Track lesson start
            await this.trackLessonEvent('start', lessonId);
            
            return this.currentLesson;
        } catch (error) {
            console.error('Failed to start lesson:', error);
            throw error;
        }
    }

    prepareLessonStructure(lessonData) {
        return {
            ...lessonData,
            modules: lessonData.modules.map(module => ({
                ...module,
                completed: false,
                startTime: null,
                endTime: null,
                score: 0,
                attempts: 0
            }))
        };
    }

    async completeModule(moduleId, performance) {
        try {
            const module = this.currentLesson.modules.find(m => m.id === moduleId);
            if (!module) throw new Error('Module not found');

            module.completed = true;
            module.endTime = formatDate(new Date());
            module.score = performance.score;
            module.attempts += 1;

            // Update progress
            await this.updateProgress(moduleId, performance);

            // Award points through gamification
            await gamification.awardPoints(this.currentUser.login, 'MODULE_COMPLETE', {
                moduleId,
                score: performance.score
            });

            // Get next recommended module
            const nextModule = await this.getNextModule(performance);

            return {
                completed: module,
                next: nextModule
            };
        } catch (error) {
            console.error('Failed to complete module:', error);
            throw error;
        }
    }

    async updateProgress(moduleId, performance) {
        const progressUpdate = {
            userId: this.currentUser.login,
            moduleId,
            lessonId: this.currentLesson.id,
            performance,
            timestamp: formatDate(new Date())
        };

        await this.api.post('/progress/update', progressUpdate);
        await this.loadUserProgress(); // Refresh progress data
    }

    async getNextModule(lastPerformance) {
        // Use adaptive learning to determine next best module
        const recommendation = await adaptiveLearning.getNextModule(
            this.currentUser.login,
            this.currentLesson,
            lastPerformance
        );

        return recommendation;
    }

    async trackLessonEvent(eventType, lessonId, details = {}) {
        const event = {
            userId: this.currentUser.login,
            lessonId,
            eventType,
            timestamp: formatDate(new Date()),
            details
        };

        await this.api.post('/lesson-events', event);
    }
}