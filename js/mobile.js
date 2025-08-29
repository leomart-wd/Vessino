export function setupMobile() {
    // Responsive layouts, offline mode, touch behaviors
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js');
    }
    // Touch feedback
    document.body.addEventListener('touchstart', e => {
        e.target.classList.add('touching');
        setTimeout(() => e.target.classList.remove('touching'), 200);
    }, { passive: true });
}