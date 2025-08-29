import { AudioProcessor } from './audioProcessor.js';
import { VisualizerManager } from './visualizer.js';
import { MediaRecorder } from './mediaRecorder.js';
import { API } from '../../core/api.js';

class MultimediaSystem {
    constructor() {
        this.audioContext = null;
        this.mediaRecorder = null;
        this.visualizer = null;
        this.audioProcessor = null;
        this.api = new API();
        this.isInitialized = false;
        this.recordingState = {
            isRecording: false,
            startTime: null,
            duration: 0
        };
        
        // Configuration
        this.config = {
            audio: {
                sampleRate: 48000,
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            },
            recording: {
                maxDuration: 300, // 5 minutes
                format: 'audio/webm',
                timeslice: 1000 // 1 second chunks
            },
            visualization: {
                fftSize: 2048,
                smoothingTimeConstant: 0.8
            }
        };
    }

    async initialize() {
        if (this.isInitialized) return true;

        try {
            // Initialize Audio Context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Initialize components
            this.audioProcessor = new AudioProcessor(this.audioContext);
            this.visualizer = new VisualizerManager(this.audioContext, this.config.visualization);
            
            // Check for media permissions
            await this.checkPermissions();
            
            this.isInitialized = true;
            console.log('Multimedia system initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize multimedia system:', error);
            throw new Error('Multimedia initialization failed');
        }
    }

    async checkPermissions() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: this.config.audio 
            });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.error('Media permissions denied:', error);
            throw new Error('Media permissions required');
        }
    }

    async startRecording() {
        if (!this.isInitialized) await this.initialize();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: this.config.audio 
            });

            // Set up MediaRecorder
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: this.config.recording.format
            });

            const chunks = [];
            this.mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            
            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunks, { type: this.config.recording.format });
                await this.processRecording(audioBlob);
            };

            // Set up audio processing pipeline
            const sourceNode = this.audioContext.createMediaStreamSource(stream);
            await this.setupAudioPipeline(sourceNode);

            // Start recording
            this.mediaRecorder.start(this.config.recording.timeslice);
            this.recordingState = {
                isRecording: true,
                startTime: Date.now(),
                duration: 0
            };

            // Start duration timer
            this.durationTimer = setInterval(() => {
                this.recordingState.duration = Date.now() - this.recordingState.startTime;
                this.updateRecordingUI();
            }, 100);

            return true;
        } catch (error) {
            console.error('Failed to start recording:', error);
            throw new Error('Recording failed to start');
        }
    }

    async stopRecording() {
        if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') return;

        clearInterval(this.durationTimer);
        this.mediaRecorder.stop();
        this.recordingState.isRecording = false;
        
        // Stop all tracks
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        // Clean up audio pipeline
        this.cleanupAudioPipeline();
    }

    async setupAudioPipeline(sourceNode) {
        // Connect source to processor for real-time analysis
        await this.audioProcessor.connect(sourceNode);
        
        // Set up visualizer
        this.visualizer.connect(sourceNode);
        this.visualizer.start();

        // Start monitoring pitch and volume
        this.audioProcessor.startAnalysis();
    }

    cleanupAudioPipeline() {
        this.audioProcessor.disconnect();
        this.visualizer.stop();
    }

    async processRecording(audioBlob) {
        try {
            // Convert blob to array buffer for analysis
            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            // Analyze the recording
            const analysis = await this.audioProcessor.analyzeRecording(audioBuffer);

            // Generate feedback
            const feedback = this.generateFeedback(analysis);

            // Save recording with metadata
            const metadata = {
                timestamp: new Date().toISOString(),
                duration: this.recordingState.duration,
                analysis,
                feedback
            };

            await this.saveRecording(audioBlob, metadata);

            return {
                success: true,
                analysis,
                feedback
            };
        } catch (error) {
            console.error('Failed to process recording:', error);
            throw new Error('Recording processing failed');
        }
    }

    generateFeedback(analysis) {
        return {
            pitch: this.analyzePitch(analysis.pitchData),
            rhythm: this.analyzeRhythm(analysis.rhythmData),
            volume: this.analyzeVolume(analysis.volumeData),
            suggestions: this.generateSuggestions(analysis)
        };
    }

    async saveRecording(blob, metadata) {
        const formData = new FormData();
        formData.append('audio', blob);
        formData.append('metadata', JSON.stringify(metadata));

        try {
            const response = await this.api.post('/recordings', formData);
            return response.data;
        } catch (error) {
            console.error('Failed to save recording:', error);
            throw new Error('Failed to save recording');
        }
    }

    updateRecordingUI() {
        const recordingStatus = document.getElementById('recording-status');
        if (recordingStatus) {
            const duration = Math.floor(this.recordingState.duration / 1000);
            recordingStatus.textContent = `Recording: ${duration}s`;
        }
    }
}

export const multimediaSystem = new MultimediaSystem();