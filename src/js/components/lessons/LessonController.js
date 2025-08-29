import { store } from '../../core/store.js';
import { API } from '../../core/api.js';
import { EventEmitter } from '../../utils/eventEmitter.js';
import { multimediaController } from '../../features/multimedia/MultimediaController.js';
import { gamification } from '../../features/gamification/gamificationSystem.js';

export class LessonController {
    constructor() {
        this.store = store;
        this.api = new API();
        this.events = new EventEmitter();
        this.multimedia = multimediaController;
        this.currentUser = {
            login: 'leomart-wd',
            lastActive: '2025-08-29 13:05:36'
        };
        this.currentLesson = null;
        this.currentExercise = null;
    }

    async initialize() {
        try {
            await this.loadUserProgress();
            this.setupEventListeners();
            return true;
        } catch (error) {
            console.error('Lesson system initialization failed:', error);
            throw error;
        }
    }

    async loadUserProgress() {
        const progress = await this.api.get(`/users/${this.currentUser.login}/progress`);
        this.store.dispatch('SET_PROGRESS', progress);
    }

    async startLesson(lessonId) {
        try {
            const lesson = await this.api.get(`/lessons/${lessonId}`);
            this.currentLesson = {
                ...lesson,
                startTime: new Date().toISOString(),
                progress: 0,
                completed: false
            };

            // Track lesson start
            await this.trackLessonEvent('start', lessonId);

            // Initialize lesson components
            await this.initializeLessonComponents(lesson);

            return this.currentLesson;
        } catch (error) {
            console.error('Failed to start lesson:', error);
            throw error;
        }
    }

    async initializeLessonComponents(lesson) {
        // Set up lesson UI
        const container = document.getElementById('lesson-container');
        container.innerHTML = this.renderLesson(lesson);

        // Initialize exercises
        await this.initializeExercises(lesson.exercises);

        // Set up progress tracking
        this.setupProgressTracking();
    }

    renderLesson(lesson) {
        return `
            <div class="lesson-wrapper" data-lesson-id="${lesson.id}">
                <header class="lesson-header">
                    <h1>${lesson.title}</h1>
                    <div class="lesson-meta">
                        <span class="duration">
                            <i class="fas fa-clock"></i>
                            ${Math.ceil(lesson.duration / 60)} min
                        </span>
                        <span class="difficulty ${lesson.difficulty.toLowerCase()}">
                            ${lesson.difficulty}
                        </span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                </header>

                <div class="lesson-content">
                    ${lesson.content}
                </div>

                <div class="exercises-container">
                    ${this.renderExercises(lesson.exercises)}
                </div>

                <footer class="lesson-footer">
                    <button class="btn-secondary" id="prev-exercise" disabled>
                        Previous
                    </button>
                    <button class="btn-primary" id="next-exercise">
                        Next
                    </button>
                </footer>
            </div>
        `;
    }

    renderExercises(exercises) {
        return exercises.map((exercise, index) => `
            <div class="exercise-card" 
                 data-exercise-id="${exercise.id}"
                 style="display: ${index === 0 ? 'block' : 'none'}">
                <div class="exercise-header">
                    <h2>${exercise.title}</h2>
                    <span class="exercise-type">${exercise.type}</span>
                </div>
                
                <div class="exercise-content">
                    ${this.renderExerciseContent(exercise)}
                </div>

                <div class="exercise-controls">
                    ${this.renderExerciseControls(exercise)}
                </div>

                <div class="feedback-container hidden"></div>
            </div>
        `).join('');
    }

    renderExerciseContent(exercise) {
        switch (exercise.type) {
            case 'vocalRange':
                return this.renderVocalRangeExercise(exercise);
            case 'pitch':
                return this.renderPitchExercise(exercise);
            case 'rhythm':
                return this.renderRhythmExercise(exercise);
            case 'breathing':
                return this.renderBreathingExercise(exercise);
            default:
                return this.renderBasicExercise(exercise);
        }
    }

    renderExerciseControls(exercise) {
        return `
            <div class="exercise-controls">
                <button class="btn-record" data-action="record">
                    <i class="fas fa-microphone"></i>
                    Record
                </button>
                <button class="btn-play hidden" data-action="play">
                    <i class="fas fa-play"></i>
                    Play
                </button>
                <button class="btn-retry hidden" data-action="retry">
                    <i class="fas fa-redo"></i>
                    Try Again
                </button>
            </div>
        `;
    }

    async initializeExercises(exercises) {
        exercises.forEach(exercise => {
            const element = document.querySelector(`[data-exercise-id="${exercise.id}"]`);
            if (!element) return;

            // Set up exercise controls
            this.setupExerciseControls(element, exercise);

            // Initialize exercise-specific features
            switch (exercise.type) {
                case 'vocalRange':
                    this.initializeVocalRangeExercise(element, exercise);
                    break;
                case 'pitch':
                    this.initializePitchExercise(element, exercise);
                    break;
                // Add other exercise types...
            }
        });
    }

    setupExerciseControls(element, exercise) {
        const controls = element.querySelector('.exercise-controls');
        
        controls.addEventListener('click', async (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (!action) return;

            switch (action) {
                case 'record':
                    await this.startRecording(exercise);
                    break;
                case 'play':
                    await this.playRecording(exercise);
                    break;
                case 'retry':
                    await this.retryExercise(exercise);
                    break;
            }
        });
    }

    async startRecording(exercise) {
        try {
            await this.multimedia.startRecording({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });

            this.updateExerciseUI(exercise.id, 'recording');
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.showError('Could not start recording. Please check your microphone.');
        }
    }

    async stopRecording(exercise) {
        try {
            const recording = await this.multimedia.stopRecording();
            const analysis = await this.analyzeRecording(recording, exercise);
            
            // Update UI with feedback
            this.showExerciseFeedback(exercise.id, analysis);
            
            // Update progress
            await this.updateProgress(exercise, analysis);

        } catch (error) {
            console.error('Failed to stop recording:', error);
            this.showError('Could not process recording.');
        }
    }

    async analyzeRecording(recording, exercise) {
        // Implement exercise-specific analysis
        switch (exercise.type) {
            case 'vocalRange':
                return this.analyzeVocalRange(recording);
            case 'pitch':
                return this.analyzePitch(recording);
            case 'rhythm':
                return this.analyzeRhythm(recording);
            default:
                return this.analyzeBasic(recording);
        }
    }

    showExerciseFeedback(exerciseId, analysis) {
        const element = document.querySelector(`[data-exercise-id="${exerciseId}"]`);
        const feedbackContainer = element.querySelector('.feedback-container');
        
        feedbackContainer.innerHTML = `
            <div class="feedback ${analysis.success ? 'success' : 'needs-improvement'}">
                <h3>${analysis.success ? 'Great job!' : 'Keep practicing!'}</h3>
                <p>${analysis.feedback}</p>
                <div class="metrics">
                    ${this.renderAnalysisMetrics(analysis)}
                </div>
            </div>
        `;
        
        feedbackContainer.classList.remove('hidden');
    }

    async updateProgress(exercise, analysis) {
        const progress = {
            exerciseId: exercise.id,
            lessonId: this.currentLesson.id,
            score: analysis.score,
            completed: analysis.success,
            timestamp: new Date().toISOString()
        };

        await this.api.post('/progress/update', progress);
        
        // Update local progress
        this.currentLesson.progress = this.calculateLessonProgress();
        this.updateProgressBar();

        // Award points through gamification system
        if (analysis.success) {
            await gamification.awardPoints(
                this.currentUser.login,
                'EXERCISE_COMPLETE',
                { exerciseId: exercise.id, score: analysis.score }
            );
        }
    }

    calculateLessonProgress() {
        if (!this.currentLesson) return 0;
        
        const exercises = this.currentLesson.exercises;
        const completed = exercises.filter(e => e.completed).length;
        return (completed / exercises.length) * 100;
    }

    updateProgressBar() {
        const progressBar = document.querySelector('.progress-fill');
        if (progressBar) {
            progressBar.style.width = `${this.currentLesson.progress}%`;
        }
    }
}

export const lessonController = new LessonController();