export async function fetchQuestions() {
    try {
        const response = await fetch('data/questions.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        throw new Error('Failed to fetch questions');
    }
}