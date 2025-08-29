import { t } from './i18n.js';

export function showLoader() {
    if (!document.getElementById('app-loader')) {
        document.body.insertAdjacentHTML('beforeend', '<div id="app-loader" role="status" aria-live="polite">🔄 ' + t('loading') + '</div>');
    }
}
export function hideLoader() {
    document.getElementById('app-loader')?.remove();
}
export function showError(message, error, retryFn) {
    document.getElementById('app').innerHTML = `
        <div role="alert" aria-live="assertive" class="error-container">
            <p>${message}</p>
            <pre>${error.message}</pre>
            <button onclick="(${retryFn.toString()})()">${t('retry')}</button>
        </div>`;
}
export function closeAllModals() {
    document.querySelectorAll('.modal-container').forEach(modal => modal.classList.add('hidden'));
}
export function renderDashboard(questions, progress) {
    document.getElementById('app').innerHTML = `
        <nav aria-label="Main Navigation">
            <button aria-label="${t('learn_path')}" id="btn-learn">${t('learn_path')}</button>
            <button aria-label="${t('train_path')}" id="btn-train">${t('train_path')}</button>
            <button aria-label="${t('study_path')}" id="btn-study">${t('study_path')}</button>
        </nav>
        <section>
            <h1>${t('dashboard_title')}</h1>
            <p>${t('dashboard_desc')}</p>
            <div id="dashboard-xp" aria-live="polite">${t('your_xp')}: ${progress.xp || 0}</div>
        </section>
    `;
    // More UI for chart, audio feedback, etc can be added here
}