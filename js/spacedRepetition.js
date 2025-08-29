// Intervals in days: 1, 3, 7, 14, 30
const INTERVALS = [1, 3, 7, 14, 30];

export function getNextReviewDate(lastReview, strength) {
    // strength: how many times answered correctly in a row (0-4)
    const days = INTERVALS[Math.min(strength, INTERVALS.length - 1)];
    const nextDate = new Date(lastReview);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
}

export function scheduleQuestionReview(questionId, userProgress) {
    const stats = userProgress.questionStats[questionId] || { strength: 0, lastReview: null, nextReview: null };
    stats.nextReview = getNextReviewDate(stats.lastReview || new Date(), stats.strength);
    userProgress.questionStats[questionId] = stats;
}

export function getDueQuestions(allQuestions, userProgress) {
    const today = new Date();
    return allQuestions.filter(q => {
        const stats = userProgress.questionStats[q.id];
        return stats && stats.nextReview && new Date(stats.nextReview) <= today;
    });
}