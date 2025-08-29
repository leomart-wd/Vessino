export class ThemePerformanceMonitor {
    constructor() {
        this.currentUser = {
            login: 'leomart-wd',
            lastActive: '2025-08-29 14:12:38'
        };
        
        this.metrics = new Map();
        this.observers = new Map();
        this.frameData = [];
        this.isMonitoring = false;
        this.dashboard = null;
        
        // Monitoring thresholds
        this.thresholds = {
            fps: 30,
            transitionDuration: 300,
            layoutShift: 0.1,
            memoryUsage: 0.8,
            longTask: 50
        };
    }

    async initialize() {
        this.createMonitoringDashboard();
        this.setupObservers();
        this.initializeMetrics();
        await this.startMonitoring();
    }

    createMonitoringDashboard() {
        const dashboard = document.createElement('div');
        dashboard.className = 'performance-monitor-dashboard';
        dashboard.innerHTML = `
            <div class="monitor-header">
                <h3>Theme Performance Monitor</h3>
                <span class="monitor-timestamp">${this.currentUser.lastActive}</span>
                <div class="monitor-controls">
                    <button class="btn-monitor" data-action="pause">Pause</button>
                    <button class="btn-monitor" data-action="clear">Clear</button>
                    <button class="btn-monitor" data-action="export">Export</button>
                </div>
            </div>
            <div class="monitor-content">
                <div class="monitor-metrics">
                    <div class="metric-group" id="fps-monitor">
                        <h4>FPS</h4>
                        <canvas class="fps-chart"></canvas>
                        <div class="metric-value">-- fps</div>
                    </div>
                    <div class="metric-group" id="memory-monitor">
                        <h4>Memory Usage</h4>
                        <canvas class="memory-chart"></canvas>
                        <div class="metric-value">-- MB</div>
                    </div>
                    <div class="metric-group" id="transition-monitor">
                        <h4>Theme Transitions</h4>
                        <canvas class="transition-chart"></canvas>
                        <div class="metric-value">-- ms</div>
                    </div>
                </div>
                <div class="monitor-timeline">
                    <canvas class="timeline-chart"></canvas>
                </div>
                <div class="monitor-events"></div>
            </div>
        `;

        document.body.appendChild(dashboard);
        this.dashboard = dashboard;
        this.initializeCharts();
    }

    setupObservers() {
        // Performance Observer for various metrics
        const performanceObserver = new PerformanceObserver(this.handlePerformanceEntry.bind(this));
        performanceObserver.observe({
            entryTypes: [
                'measure',
                'paint',
                'layout-shift',
                'longtask',
                'resource',
                'navigation'
            ]
        });
        this.observers.set('performance', performanceObserver);

        // Layout Observer
        const layoutObserver = new PerformanceObserver(this.handleLayoutShift.bind(this));
        layoutObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('layout', layoutObserver);

        // Resource Timing
        const resourceObserver = new PerformanceObserver(this.handleResourceTiming.bind(this));
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
    }

    initializeMetrics() {
        this.metrics = new Map([
            ['fps', []],
            ['memory', []],
            ['transitions', []],
            ['layoutShifts', []],
            ['longTasks', []],
            ['resourceLoads', []]
        ]);
    }

    async startMonitoring() {
        this.isMonitoring = true;
        this.monitorFrameRate();
        this.monitorMemory();
        this.monitorThemeTransitions();

        // Start real-time updates
        this.updateLoop();
    }

    monitorFrameRate() {
        let lastTime = performance.now();
        let frames = 0;

        const measureFPS = (timestamp) => {
            if (!this.isMonitoring) return;

            frames++;
            const elapsed = timestamp - lastTime;

            if (elapsed >= 1000) {
                const fps = Math.round((frames * 1000) / elapsed);
                this.updateMetric('fps', fps);
                
                frames = 0;
                lastTime = timestamp;
            }

            requestAnimationFrame(measureFPS);
        };

        requestAnimationFrame(measureFPS);
    }

    monitorMemory() {
        if (performance.memory) {
            const checkMemory = () => {
                if (!this.isMonitoring) return;

                const used = performance.memory.usedJSHeapSize / 1024 / 1024;
                const total = performance.memory.totalJSHeapSize / 1024 / 1024;
                const usage = used / total;

                this.updateMetric('memory', {
                    used: Math.round(used),
                    total: Math.round(total),
                    usage: usage
                });

                if (usage > this.thresholds.memoryUsage) {
                    this.emitWarning('memory', 'High memory usage detected');
                }

                setTimeout(checkMemory, 1000);
            };

            checkMemory();
        }
    }

    monitorThemeTransitions() {
        document.addEventListener('themechange', (event) => {
            const startTime = performance.now();
            
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const duration = performance.now() - startTime;
                    this.updateMetric('transitions', {
                        duration,
                        timestamp: event.detail.timestamp,
                        theme: event.detail.theme
                    });

                    if (duration > this.thresholds.transitionDuration) {
                        this.emitWarning('transition', 'Slow theme transition detected');
                    }
                });
            });
        });
    }

    handlePerformanceEntry(entries) {
        entries.getEntries().forEach(entry => {
            switch (entry.entryType) {
                case 'measure':
                    if (entry.name.includes('theme')) {
                        this.updateMetric('transitions', {
                            duration: entry.duration,
                            name: entry.name,
                            startTime: entry.startTime
                        });
                    }
                    break;

                case 'longtask':
                    if (entry.duration > this.thresholds.longTask) {
                        this.updateMetric('longTasks', {
                            duration: entry.duration,
                            startTime: entry.startTime
                        });
                        this.emitWarning('performance', 'Long task detected');
                    }
                    break;
            }
        });
    }

    handleLayoutShift(entries) {
        entries.getEntries().forEach(entry => {
            if (entry.value > this.thresholds.layoutShift) {
                this.updateMetric('layoutShifts', {
                    value: entry.value,
                    timestamp: entry.startTime
                });
                this.emitWarning('layout', 'Significant layout shift detected');
            }
        });
    }

    handleResourceTiming(entries) {
        entries.getEntries().forEach(entry => {
            if (entry.name.includes('theme')) {
                this.updateMetric('resourceLoads', {
                    name: entry.name,
                    duration: entry.duration,
                    size: entry.transferSize
                });
            }
        });
    }

    updateMetric(name, value) {
        const metrics = this.metrics.get(name) || [];
        metrics.push({
            value,
            timestamp: performance.now()
        });

        // Keep last 100 measurements
        if (metrics.length > 100) {
            metrics.shift();
        }

        this.metrics.set(name, metrics);
        this.updateDashboard(name);
    }

    updateDashboard(metricName) {
        if (!this.dashboard) return;

        const metrics = this.metrics.get(metricName);
        if (!metrics || !metrics.length) return;

        const latest = metrics[metrics.length - 1];

        switch (metricName) {
            case 'fps':
                this.updateFPSChart(metrics);
                break;
            case 'memory':
                this.updateMemoryChart(metrics);
                break;
            case 'transitions':
                this.updateTransitionChart(metrics);
                break;
        }

        // Update timeline
        this.updateTimelineChart();
    }

    emitWarning(type, message) {
        const warning = {
            type,
            message,
            timestamp: new Date().toISOString()
        };

        const event = new CustomEvent('theme-performance-warning', {
            detail: warning
        });

        document.dispatchEvent(event);
        this.logWarning(warning);
    }

    logWarning(warning) {
        const eventsContainer = this.dashboard.querySelector('.monitor-events');
        const warningElement = document.createElement('div');
        warningElement.className = `performance-warning ${warning.type}`;
        warningElement.innerHTML = `
            <span class="warning-time">${new Date(warning.timestamp).toLocaleTimeString()}</span>
            <span class="warning-message">${warning.message}</span>
        `;
        eventsContainer.prepend(warningElement);

        // Keep only last 10 warnings
        if (eventsContainer.children.length > 10) {
            eventsContainer.lastChild.remove();
        }
    }

    exportData() {
        const data = {
            timestamp: this.currentUser.lastActive,
            user: this.currentUser.login,
            metrics: Object.fromEntries(this.metrics),
            thresholds: this.thresholds
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `theme-performance-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    destroy() {
        this.isMonitoring = false;
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        this.metrics.clear();
        if (this.dashboard) {
            this.dashboard.remove();
        }
    }
}