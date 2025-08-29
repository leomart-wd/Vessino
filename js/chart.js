export function renderMasteryChart(data) {
    const ctx = document.getElementById('mastery-chart');
    if (!window.Chart) {
        ctx.innerHTML = 'Chart.js not available';
        return;
    }
    return new Chart(ctx, {
        type: 'line',
        data: { labels: data.dates, datasets: [{ label: 'Mastery', data: data.values }] },
        options: {}
    });
}