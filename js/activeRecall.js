export function renderActiveRecall(q) {
    document.getElementById('app').innerHTML = `
        <section>
            <h2>Active Recall</h2>
            <p>${q.active_recall_prompt || "Can you recall the key point?"}</p>
            <textarea id="recall-response" rows="3" placeholder="Type your answer..."></textarea>
            <button class="btn-primary" onclick="window.submitRecall()">Submit</button>
        </section>
    `;
    window.submitRecall = () => {
        const response = document.getElementById('recall-response').value;
        // Could compare with correct answer, log for teacher review, etc.
        alert("Great job! Keep practicing active recall.");
    };
}