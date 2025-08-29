// Calendar integration and reminder system
export class ReminderSystem {
    static async scheduleReminder(type, datetime, details) {
        const reminder = {
            type,
            datetime,
            details,
            userId: getCurrentUser()
        };

        try {
            const response = await fetch('/api/reminders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reminder)
            });
            return await response.json();
        } catch (error) {
            console.error('Error scheduling reminder:', error);
            return null;
        }
    }

    static async getUpcomingReminders() {
        try {
            const response = await fetch('/api/reminders');
            return await response.json();
        } catch (error) {
            console.error('Error fetching reminders:', error);
            return [];
        }
    }

    static async syncWithCalendar(calendarProvider = 'google') {
        try {
            const response = await fetch(`/api/calendar/sync/${calendarProvider}`, {
                method: 'POST'
            });
            return await response.json();
        } catch (error) {
            console.error('Error syncing with calendar:', error);
            return false;
        }
    }
}