export class ThemePerformanceVisualizations {
    constructor() {
        this.currentUser = {
            login: 'leomart-wd',
            lastActive: '2025-08-29 14:20:21'
        };
        
        this.charts = new Map();
        this.canvasContexts = new Map();
        this.colors = {
            fps: {
                good: '#4CAF50',
                warning: '#FFC107',
                critical: '#F44336'
            },
            memory: {
                used: '#2196F3',
                total: '#90CAF9'
            },
            transition: {
                duration: '#9C27B0',
                threshold: '#E1BEE7'
            },
            timeline: {
                background: '#424242',
                grid: '#616161',
                events: {
                    theme: '#7E57C2',
                    layout: '#26A69A',
                    performance: '#EF5350'
                }
            }
        };
    }

    initializeCharts() {
        this.initializeFPSChart();
        this.initializeMemoryChart();
        this.initializeTransitionChart();
        this.initializeTimelineChart();
        this.initializeHeatmap();
    }

    initializeFPSChart() {
        const ctx = document.querySelector('.fps-chart').getContext('2d');
        this.charts.set('fps', new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'FPS',
                    data: [],
                    borderColor: this.colors.fps.good,
                    backgroundColor: this.colors.fps.good + '40',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                scales: {
                    y: {
                        min: 0,
                        max: 60,
                        grid: {
                            color: this.colors.timeline.grid + '40'
                        }
                    },
                    x: {
                        display: false
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        }));
    }

    initializeMemoryChart() {
        const ctx = document.querySelector('.memory-chart').getContext('2d');
        this.charts.set('memory', new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Used Memory',
                    data: [],
                    borderColor: this.colors.memory.used,
                    backgroundColor: this.colors.memory.used + '40',
                    fill: true
                }, {
                    label: 'Total Memory',
                    data: [],
                    borderColor: this.colors.memory.total,
                    backgroundColor: 'transparent',
                    borderDash: [5, 5]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                scales: {
                    y: {
                        grid: {
                            color: this.colors.timeline.grid + '40'
                        }
                    },
                    x: {
                        display: false
                    }
                }
            }
        }));
    }

    initializeTransitionChart() {
        const ctx = document.querySelector('.transition-chart').getContext('2d');
        this.charts.set('transition', new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Duration',
                    data: [],
                    backgroundColor: this.colors.transition.duration
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: this.colors.timeline.grid + '40'
                        }
                    }
                }
            }
        }));
    }

    initializeTimelineChart() {
        const canvas = document.querySelector('.timeline-chart');
        const ctx = canvas.getContext('2d');
        this.canvasContexts.set('timeline', ctx);

        // Set up the timeline visualization
        this.timelineData = {
            events: [],
            viewStart: Date.now(),
            viewEnd: Date.now() + 30000,
            height: canvas.height,
            width: canvas.width
        };

        // Add interaction handlers
        canvas.addEventListener('wheel', this.handleTimelineZoom.bind(this));
        canvas.addEventListener('mousedown', this.handleTimelinePan.bind(this));
    }

    initializeHeatmap() {
        const canvas = document.createElement('canvas');
        canvas.className = 'performance-heatmap';
        document.querySelector('.monitor-content').appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        this.canvasContexts.set('heatmap', ctx);
        
        this.heatmapData = {
            cells: new Map(),
            maxValue: 0,
            colorScale: d3.scaleSequential(d3.interpolateYlOrRd)
        };
    }

    updateFPSChart(fpsData) {
        const chart = this.charts.get('fps');
        const dataset = chart.data.datasets[0];
        
        dataset.data = fpsData.slice(-30);
        chart.data.labels = Array(dataset.data.length).fill('');
        
        // Update color based on FPS
        const latestFPS = fpsData[fpsData.length - 1];
        dataset.borderColor = this.getFPSColor(latestFPS);
        dataset.backgroundColor = dataset.borderColor + '40';
        
        chart.update('none');
    }

    updateMemoryChart(memoryData) {
        const chart = this.charts.get('memory');
        const usedDataset = chart.data.datasets[0];
        const totalDataset = chart.data.datasets[1];
        
        usedDataset.data = memoryData.map(d => d.used).slice(-30);
        totalDataset.data = memoryData.map(d => d.total).slice(-30);
        chart.data.labels = Array(usedDataset.data.length).fill('');
        
        chart.update('none');
    }

    updateTransitionChart(transitionData) {
        const chart = this.charts.get('transition');
        
        chart.data.labels = transitionData.map(d => 
            new Date(d.timestamp).toLocaleTimeString()
        ).slice(-10);
        
        chart.data.datasets[0].data = transitionData.map(d => 
            d.duration
        ).slice(-10);
        
        chart.update('none');
    }

    updateTimelineChart() {
        const ctx = this.canvasContexts.get('timeline');
        const { width, height } = this.timelineData;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw timeline background
        ctx.fillStyle = this.colors.timeline.background;
        ctx.fillRect(0, 0, width, height);
        
        // Draw grid
        this.drawTimelineGrid(ctx);
        
        // Draw events
        this.drawTimelineEvents(ctx);
        
        // Draw current time marker
        this.drawCurrentTimeMarker(ctx);
    }

    updateHeatmap(performanceData) {
        const ctx = this.canvasContexts.get('heatmap');
        const { width, height } = ctx.canvas;
        
        // Update heatmap data
        this.updateHeatmapData(performanceData);
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw heatmap cells
        this.drawHeatmapCells(ctx);
        
        // Draw legend
        this.drawHeatmapLegend(ctx);
    }

    drawTimelineGrid(ctx) {
        const { width, height, viewStart, viewEnd } = this.timelineData;
        
        ctx.strokeStyle = this.colors.timeline.grid;
        ctx.lineWidth = 1;
        
        // Draw vertical grid lines
        const timeRange = viewEnd - viewStart;
        const gridInterval = timeRange / 10;
        
        for (let i = 0; i <= 10; i++) {
            const x = (i / 10) * width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
            
            // Draw time labels
            const time = new Date(viewStart + (i * gridInterval));
            ctx.fillStyle = this.colors.timeline.grid;
            ctx.fillText(time.toLocaleTimeString(), x, height - 5);
        }
    }

    drawTimelineEvents(ctx) {
        const { events, viewStart, viewEnd, height, width } = this.timelineData;
        
        events.forEach(event => {
            if (event.timestamp >= viewStart && event.timestamp <= viewEnd) {
                const x = ((event.timestamp - viewStart) / (viewEnd - viewStart)) * width;
                const color = this.colors.timeline.events[event.type];
                
                // Draw event marker
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, height / 2, 4, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw event label if space allows
                if (event.label) {
                    ctx.save();
                    ctx.translate(x, height / 2 - 10);
                    ctx.rotate(-Math.PI / 4);
                    ctx.fillText(event.label, 0, 0);
                    ctx.restore();
                }
            }
        });
    }

    drawCurrentTimeMarker(ctx) {
        const { viewStart, viewEnd, height, width } = this.timelineData;
        const now = Date.now();
        
        if (now >= viewStart && now <= viewEnd) {
            const x = ((now - viewStart) / (viewEnd - viewStart)) * width;
            
            ctx.strokeStyle = '#FF4081';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
    }

    updateHeatmapData(performanceData) {
        performanceData.forEach(data => {
            const cellKey = `${data.x},${data.y}`;
            const currentValue = this.heatmapData.cells.get(cellKey) || 0;
            const newValue = currentValue + data.value;
            
            this.heatmapData.cells.set(cellKey, newValue);
            this.heatmapData.maxValue = Math.max(this.heatmapData.maxValue, newValue);
        });
    }

    drawHeatmapCells(ctx) {
        const { width, height } = ctx.canvas;
        const cellSize = 10;
        
        this.heatmapData.cells.forEach((value, key) => {
            const [x, y] = key.split(',').map(Number);
            const intensity = value / this.heatmapData.maxValue;
            const color = this.heatmapData.colorScale(intensity);
            
            ctx.fillStyle = color;
            ctx.fillRect(
                x * cellSize,
                y * cellSize,
                cellSize,
                cellSize
            );
        });
    }

    drawHeatmapLegend(ctx) {
        const { width, height } = ctx.canvas;
        const legendWidth = 20;
        const legendHeight = height - 40;
        
        // Draw gradient
        const gradient = ctx.createLinearGradient(
            width - legendWidth,
            20,
            width - legendWidth,
            legendHeight + 20
        );
        
        gradient.addColorStop(0, this.heatmapData.colorScale(1));
        gradient.addColorStop(1, this.heatmapData.colorScale(0));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
            width - legendWidth,
            20,
            legendWidth,
            legendHeight
        );
        
        // Draw labels
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'right';
        ctx.fillText('High', width - legendWidth - 5, 15);
        ctx.fillText('Low', width - legendWidth - 5, height - 5);
    }

    getFPSColor(fps) {
        if (fps >= 50) return this.colors.fps.good;
        if (fps >= 30) return this.colors.fps.warning;
        return this.colors.fps.critical;
    }

    handleTimelineZoom(event) {
        event.preventDefault();
        
        const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;
        const centerTime = this.timelineData.viewStart +
            (this.timelineData.viewEnd - this.timelineData.viewStart) / 2;
        
        this.timelineData.viewStart = centerTime -
            (centerTime - this.timelineData.viewStart) * zoomFactor;
        this.timelineData.viewEnd = centerTime +
            (this.timelineData.viewEnd - centerTime) * zoomFactor;
        
        this.updateTimelineChart();
    }

    handleTimelinePan(event) {
        const startX = event.clientX;
        const startViewStart = this.timelineData.viewStart;
        const startViewEnd = this.timelineData.viewEnd;
        const timeRange = startViewEnd - startViewStart;
        
        const handleMove = (moveEvent) => {
            const dx = moveEvent.clientX - startX;
            const timeShift = (dx / this.timelineData.width) * timeRange;
            
            this.timelineData.viewStart = startViewStart - timeShift;
            this.timelineData.viewEnd = startViewEnd - timeShift;
            
            this.updateTimelineChart();
        };
        
        const handleUp = () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
        };
        
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
    }

    destroy() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
        this.canvasContexts.clear();
    }
}
