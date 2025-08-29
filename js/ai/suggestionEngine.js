// AI suggestion engine for elaboration prompts, mindfulness, and hydration
export class AISuggestionEngine {
    static async getElaborationPrompt(question, userHistory) {
        const context = {
            question,
            userHistory,
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch('/api/ai/elaboration-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(context)
            });
            const data = await response.json();
            return data.prompt;
        } catch (error) {
            console.error('Error getting AI elaboration prompt:', error);
            return "How does this connect to your previous knowledge?";
        }
    }

    static async getMindfulnessGuidance(userState) {
        try {
            const response = await fetch('/api/ai/mindfulness', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userState)
            });
            return await response.json();
        } catch (error) {
            return {
                suggestion: "Take a deep breath and focus on your posture.",
                duration: 60
            };
        }
    }

    static async getHydrationRecommendation(userLogs) {
        try {
            const response = await fetch('/api/ai/hydration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userLogs)
            });
            return await response.json();
        } catch (error) {
            return {
                shouldDrink: true,
                amount: "250ml",
                message: "Time for a water break!"
            };
        }
    }
}