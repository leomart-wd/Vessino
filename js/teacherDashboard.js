import { t } from './i18n.js';
import { renderStudentAnalytics } from './analytics.js';
import { renderContentManager } from './contentManager.js';
import { renderScheduler } from './scheduler.js';
import { renderCommunity } from './community.js';

export function renderTeacherDashboard() {
    document.getElementById('app').innerHTML = `
        <section class="dashboard teacher" aria-label="Teacher Home">
            <h1>${t('teacher_dashboard')}</h1>
            <button class="btn-primary" onclick="window.showAnalytics()">${t('analytics')}</button>
            <button class="btn-primary" onclick="window.showContentManager()">${t('content_manager')}</button>
            <button class="btn-primary" onclick="window.showScheduler()">${t('scheduler')}</button>
            <button class="btn-primary" onclick="window.showCommunity()">${t('community')}</button>
            <div id="teacher-content"></div>
        </section>
    `;
    window.showAnalytics = () => renderStudentAnalytics();
    window.showContentManager = () => renderContentManager();
    window.showScheduler = () => renderScheduler();
    window.showCommunity = () => renderCommunity();
}