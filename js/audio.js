let soundEnabled = true;
let sounds = {};
export function setupAudio() {
    if (typeof Audio !== 'function') return;
    sounds = {
        correct: new Audio('https://actions.google.com/sounds/v1/positive/success.ogg'),
        incorrect: new Audio('https://actions.google.com/sounds/v1/negative/failure.ogg')
    };
    Object.values(sounds).forEach(sound => sound.volume = 0.4);
}
export function playFeedbackSound(isCorrect) {
    if (!soundEnabled || !sounds.correct) return;
    const sound = isCorrect ? sounds.correct : sounds.incorrect;
    sound.currentTime = 0;
    sound.play().catch(() => {});
}