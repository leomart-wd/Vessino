// Backend storage for elaborations, recall logs, and wellness events
import { getCurrentUser } from '../auth.js';

export class BackendStorage {
    static async saveElaboration(questionId, content, userId = getCurrentUser()) {
        const elaboration = {
            userId,
            questionId,
            content,
            timestamp: new Date().toISOString(),
            type: 'elaboration'
        };
        
        try {
            await fetch('/api/elaborations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(elaboration)
            });
            return true;
        } catch (error) {
            console.error('Error saving elaboration:', error);
            return false;
        }
    }

    static async saveRecallLog(questionId, response, isCorrect, userId = getCurrentUser()) {
        const recallLog = {
            userId,
            questionId,
            response,
            isCorrect,
            timestamp: new Date().toISOString(),
            type: 'recall'
        };

        try {
            await fetch('/api/recall-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recallLog)
            });
            return true;
        } catch (error) {
            console.error('Error saving recall log:', error);
            return false;
        }
    }

    static async saveWellnessEvent(eventType, details, userId = getCurrentUser()) {
        const wellnessEvent = {
            userId,
            eventType,
            details,
            timestamp: new Date().toISOString(),
            type: 'wellness'
        };

        try {
            await fetch('/api/wellness-events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(wellnessEvent)
            });
            return true;
        } catch (error) {
            console.error('Error saving wellness event:', error);
            return false;
        }
    }
}