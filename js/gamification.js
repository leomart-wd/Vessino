export function updateXP(user, amount) {
    user.xp = (user.xp || 0) + amount;
    // Check for streaks, badges, weekly challenges...
}
export function renderLeaderboard(users) {
    // Display sorted list with points, badges, avatars
}
export function awardBadge(user, badgeId) {
    user.badges = user.badges || [];
    if (!user.badges.includes(badgeId)) user.badges.push(badgeId);
}