function renderQuestion(q) {
    // Display question text, options, and feedback
    document.getElementById('app').innerHTML = `
        <h2>${q.question}</h2>
        ${q.options.map(opt => `
            <button onclick="checkAnswer('${opt}', '${q.answer}', ${JSON.stringify(q.explanation[opt])})">${opt}</button>
        `).join('')}
        <p>${q.reflection_prompt}</p>
    `;
}