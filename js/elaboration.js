export function renderElaboration(q) {
    document.getElementById('app').innerHTML += `
        <div class="elaboration-section">
            <h4>Connect & Elaborate</h4>
            <p>${q.reflection_prompt || "How does this connect to what you already know?"}</p>
            <textarea id="elaboration-input" rows="2" placeholder="Write your connection..."></textarea>
        </div>
    `;
    // Optional: Save and revisit elaborations in dashboard
}