import { getNextMicrolesson } from './adaptive.js';
import { renderQuiz } from './lesson.js';
import { renderAudioPractice } from './audioPractice.js';

export function renderMicroLesson() {
    const lesson = getNextMicrolesson();
    document.getElementById('next-microlesson').innerHTML = `
        <div class="microlesson-card">
            <h2>${lesson.title}</h2>
            <video src="${lesson.video}" controls></video>
            <p>${lesson.theory}</p>
            <button class="btn-secondary" onclick="window.startQuiz()">${lesson.quiz.title}</button>
            <button class="btn-secondary" onclick="window.startAudioPractice()">${lesson.audioPractice.title}</button>
        </div>
    `;
    window.startQuiz = () => renderQuiz(lesson.quiz);
    window.startAudioPractice = () => renderAudioPractice(lesson.audioPractice);
}