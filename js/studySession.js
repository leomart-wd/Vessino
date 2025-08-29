import { getDueQuestions, scheduleQuestionReview } from './spacedRepetition.js';
import { getInterleavedQuestions } from './interleaving.js';
import { renderActiveRecall } from './activeRecall.js';
import { renderElaboration } from './elaboration.js';
import { showWellnessReminders } from './wellness.js';

export function startSmartStudySession(allQuestions, userProgress) {
    window.studySessionStart = new Date();
    showWellnessReminders();
    // Spaced repetition: prioritize due questions
    let sessionQuestions = getDueQuestions(allQuestions, userProgress);
    // Interleaving: mix subjects/types if more variety needed
    if (sessionQuestions.length < 10) {
        sessionQuestions = sessionQuestions.concat(
            getInterleavedQuestions(allQuestions, ["Fisiologia", "Anatomia"], ["multiple_choice", "true_false"], 10 - sessionQuestions.length)
        );
    }
    sessionQuestions.forEach(q => {
        // For each question: show, recall, elaborate, schedule next review
        renderActiveRecall(q);
        renderElaboration(q);
        scheduleQuestionReview(q.id, userProgress);
    });
    // After session, encourage wellness
    setTimeout(showWellnessReminders, 1800000); // 30 min later
}