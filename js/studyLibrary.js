import { t } from './i18n.js';

export function setupStudyLibraryHandlers(allQuestions, userProgress) {
    document.getElementById('btn-study')?.addEventListener('click', () => {
        renderStudyLibrary(allQuestions);
    });
}

export function renderStudyLibrary(questions) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <section aria-labelledby="study-library-title">
            <h2 id="study-library-title">${t('study_library')}</h2>
            <input id="study-search" aria-label="${t('search_questions')}" placeholder="${t('search_questions')}">
            <select id="study-filter-area" aria-label="${t('filter_by_area')}">
                <option value="">${t('all_areas')}</option>
                ${[...new Set(questions.map(q => q.macro_area))].map(area =>
                    `<option value="${area}">${area}</option>`
                ).join('')}
            </select>
            <select id="study-filter-level" aria-label="${t('filter_by_level')}">
                <option value="">${t('all_levels')}</option>
                ${[...new Set(questions.map(q => q.level))].map(lvl =>
                    `<option value="${lvl}">${lvl}</option>`
                ).join('')}
            </select>
            <div id="study-list"></div>
            <div id="study-detail"></div>
        </section>
    `;
    const searchInput = document.getElementById('study-search');
    const areaSelect = document.getElementById('study-filter-area');
    const levelSelect = document.getElementById('study-filter-level');

    function filterQuestions() {
        const search = searchInput.value.toLowerCase();
        const area = areaSelect.value;
        const level = levelSelect.value;
        let filtered = questions.filter(q =>
            (!search || q.question.toLowerCase().includes(search) || (q.explanation && q.explanation.toString().toLowerCase().includes(search)))
            && (!area || q.macro_area === area)
            && (!level || q.level === level)
        );
        renderStudyList(filtered);
    }

    searchInput.addEventListener('input', filterQuestions);
    areaSelect.addEventListener('change', filterQuestions);
    levelSelect.addEventListener('change', filterQuestions);

    // Initial render
    renderStudyList(questions);

    function renderStudyList(filteredQuestions) {
        const el = document.getElementById('study-list');
        el.innerHTML = filteredQuestions.map(q => `
            <div tabindex="0" role="button" class="study-q-item" aria-label="${q.question}" data-qid="${q.id}">
                <strong>${q.question}</strong>
                <span class="macro-area">${q.macro_area}</span>
                <span class="level">${q.level}</span>
            </div>
        `).join('') || `<p>${t('no_questions_found')}</p>`;

        // Accessible selection and click handlers
        document.querySelectorAll('.study-q-item').forEach(item => {
            item.addEventListener('click', () => showQuestionDetail(item.getAttribute('data-qid')));
            item.addEventListener('keydown', e => { if (e.key === 'Enter') showQuestionDetail(item.getAttribute('data-qid')); });
        });
    }

    function showQuestionDetail(qid) {
        const q = questions.find(q => String(q.id) === String(qid));
        if (!q) return;
        document.getElementById('study-detail').innerHTML = `
            <div class="question-detail-card" role="region" aria-labelledby="question-title-${q.id}">
                <h3 id="question-title-${q.id}">${q.question}</h3>
                <div class="options-list">
                    ${q.options.map(opt => {
                        const isCorrect = opt === q.answer;
                        const expl = q.explanation?.[opt] || '';
                        return `
                            <div class="option-row ${isCorrect ? 'correct' : ''}">
                                <span class="option-text">${opt}</span>
                                <span class="option-feedback">${expl}</span>
                                ${isCorrect ? `<span class="correct-indicator" aria-label="Correct answer">✔️</span>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
                ${q.reflection_prompt ? `<div class="reflection"><strong>${t('reflection_prompt')}:</strong> ${q.reflection_prompt}</div>` : ''}
                ${q.active_recall_prompt ? `<div class="active-recall"><strong>${t('active_recall_prompt')}:</strong> ${q.active_recall_prompt}</div>` : ''}
                ${q.learning_outcome ? `<div class="learning-outcome"><strong>${t('learning_outcome')}:</strong> ${q.learning_outcome}</div>` : ''}
                ${q.didactic_note ? `<div class="didactic-note"><strong>${t('didactic_note')}:</strong> ${q.didactic_note}</div>` : ''}
                ${q.key_concepts && q.key_concepts.length ? 
                    `<div class="key-concepts"><strong>${t('key_concepts')}:</strong> ${q.key_concepts.join(', ')}</div>` : ''}
                ${q.related_lessons && q.related_lessons.length ?
                    `<div class="related-lessons"><strong>${t('related_lessons')}:</strong> ${q.related_lessons.join(', ')}</div>` : ''}
                ${q.tags && q.tags.length ?
                    `<div class="tags"><strong>${t('tags')}:</strong> ${q.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</div>` : ''}
                <button class="btn-primary" onclick="document.getElementById('study-detail').innerHTML = '';">${t('close')}</button>
            </div>
        `;
    }
}