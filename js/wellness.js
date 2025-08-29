export function showWellnessReminders() {
    const now = new Date();
    // Example: every hour, show hydration reminder
    if (now.getHours() % 2 === 0) {
        showToast("💧 Time to hydrate! Drink a glass of water.");
    }
    // Example: after 45 min study, suggest a stretch
    if (window.studySessionStart && (now - window.studySessionStart) > 45 * 60 * 1000) {
        showToast("🧘‍♂️ Take a movement or mindfulness break!");
    }
}

export function logWellnessEvent(type) {
    // Could save to localStorage or backend
    let log = JSON.parse(localStorage.getItem('wellnessLog') || "[]");
    log.push({ type, time: new Date() });
    localStorage.setItem('wellnessLog', JSON.stringify(log));
}