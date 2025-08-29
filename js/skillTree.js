import { t } from './i18n.js';

export function setupSkillTreeHandlers(allQuestions, userProgress) {
    document.getElementById('btn-train')?.addEventListener('click', () => {
        renderSkillTree(allQuestions, userProgress);
    });
}

function renderSkillTree(questions, progress) {
    // Example: group questions by macro_area
    const areas = {};
    questions.forEach(q => {
        if (!areas[q.macro_area]) areas[q.macro_area] = [];
        areas[q.macro_area].push(q);
    });
    document.getElementById('app').innerHTML = `
        <section aria-labelledby="skill-tree-title">
            <h2 id="skill-tree-title">${t('skill_tree')}</h2>
            <ul>
                ${Object.entries(areas).map(([area, qs]) => `
                    <li>
                        <strong>${area}</strong> (${qs.length} ${t('questions')})
                    </li>
                `).join('')}
            </ul>
            <button onclick="window.location.reload();">${t('dashboard_title')}</button>
        </section>
    `;
}