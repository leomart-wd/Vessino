import { t } from './i18n.js';
import { renderMicroLesson } from './microlearning.js';
import { renderSkillTree } from './skillTree.js';
import { renderProgress, renderXPBar } from './gamification.js';
import { renderCommunity } from './community.js';

export function renderStudentDashboard() {
    document.getElementById('app').innerHTML = `
        <section class="dashboard student" aria-label="Student Home">
            <div class="avatar-coach">${t('welcome')}, <span id="student-name"></span>!</div>
            <div id="xp-bar"></div>
            <div id="next-microlesson"></div>
            <button class="btn-primary" onclick="window.showSkillTree()">${t('skill_tree')}</button>
            <button class="btn-primary" onclick="window.showCommunity()">${t('community')}</button>
            <div id="progress-summary"></div>
        </section>
    `;
    renderXPBar();
    renderMicroLesson();
    renderProgress();
    window.showSkillTree = () => renderSkillTree();
    window.showCommunity = () => renderCommunity();
}