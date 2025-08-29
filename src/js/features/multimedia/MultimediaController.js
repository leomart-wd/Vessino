import { AudioProcessor } from './AudioProcessor.js';
import { VideoProcessor } from './VideoProcessor.js';
import { store } from '../../core/store.js';
import { EventEmitter } from '../../utils/eventEmitter.js';

export class MultimediaController {
    constructor() {
        this.audioProcessor = new AudioProcessor();
        this.videoProcessor = new VideoProcessor();
        this.store = store;
        this.events = new EventEmitter();
        this.currentSession = null;
        
        this.config = {
            audio: {
                sampleRate: 48000,
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            },
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 30 }
            }
        };
    }

    async initialize() {
        try {
            await this.checkPermissions();
            await this.setupDevices();
            return true;
        } catch (error) {
            console.error('Multimedia initialization failed:', error);
            throw error;
        }
    }

    async checkPermissions() {
        try {
            await navigator.mediaDevices.getUserMedia({ 
                audio: this.config.audio,
                video: this.config.video
            });
            return true;
        } catch (error) {
            console.error('Media permissions denied:', error);
            throw new Error('Media permissions required');
        }
    }

    async setupDevices() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        this.audioDevices = devices.filter(device => device.kind === 'audioinput');
        this.videoDevices = devices.filter(device => device.kind === 'videoinput');
    }

    async startRecording(options = {}) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { ...this.config.audio, ...options.audio },
                video: options.video ? { ...this.config.video, ...options.video } : false
            });

            this.currentSession = {
                startTime: new Date(),
                stream: stream,
                chunks: []
            };

            // Set up MediaRecorder
            const mediaRecorder = new MediaRecorder(stream);
            
            mediaRecorder.ondataavailable = (e) => {
                this.currentSession.chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                this.processRecording();
            };

            this.currentSession.mediaRecorder = mediaRecorder;
            mediaRecorder.start();

            return true;
        } catch (error) {
            console.error('Failed to start recording:', error);
            throw error;
        }
    }

    stopRecording() {
        if (this.currentSession?.mediaRecorder) {
            this.currentSession.mediaRecorder.stop();
            this.currentSession.stream.getTracks().forEach(track => track.stop());
        }
    }

    async processRecording() {
        if (!this.currentSession) return;

        const blob = new Blob(this.currentSession.chunks, { 
            type: 'audio/webm;codecs=opus' 
        });

        try {
            // Process the recording
            const analysis = await this.audioProcessor.analyzeAudio(blob);
            
            // Save the recording
            const recording = {
                id: Date.now(),
                blob: blob,
                analysis: analysis,
                duration: Date.now() - this.currentSession.startTime.getTime(),
                timestamp: new Date().toISOString()
            };

            // Store the recording
            await this.saveRecording(recording);

            // Emit recording complete event
            this.events.emit('recordingComplete', recording);

            return recording;
        } catch (error) {
            console.error('Failed to process recording:', error);
            throw error;
        } finally {
            this.currentSession = null;
        }
    }

    async saveRecording(recording) {
        try {
            const formData = new FormData();
            formData.append('audio', recording.blob);
            formData.append('metadata', JSON.stringify({
                analysis: recording.analysis,
                duration: recording.duration,
                timestamp: recording.timestamp
            }));

            const response = await fetch('/api/recordings', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to save recording');

            return await response.json();
        } catch (error) {
            console.error('Failed to save recording:', error);
            throw error;
        }
    }
}

export const multimediaController = new MultimediaController();