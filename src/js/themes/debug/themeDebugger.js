export class ThemeDebugger {
    constructor() {
        this.currentUser = {
            login: 'leomart-wd',
            lastActive: '2025-08-29 13:53:33'
        };
        
        this.transitions = new Map();
        this.performanceMarks = new Map();
        this.isDebugMode = false;
        this.debugPanel = null;
        this.logger = null;
    }

    initialize() {
        if (process.env.NODE_ENV === 'development') {
            this.createDebugPanel();
            this.initializeLogger();
            this.attachEventListeners();
            this.startPerformanceMonitoring();
            console.log(`Theme debugger initialized for user ${this.currentUser.login}`);
        }
    }

    createDebugPanel() {
        const panel = document.createElement('div');
        panel.className = 'theme-debug-panel';
        panel.innerHTML = `
            <div class="debug-header">
                <h3>Theme Transition Debugger</h3>
                <span class="debug-timestamp">${this.currentUser.lastActive}</span>
            </div>
            <div class="debug-content">
                <div class="debug-metrics"></div>
                <div class="debug-log"></div>
                <div class="debug-controls">
                    <button class="btn-debug" onclick="themeDebugger.toggleDebugMode()">
                        Toggle Debug Mode
                    </button>
                    <button class="btn-debug" onclick="themeDebugger.captureSnapshot()">
                        Capture Snapshot
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.debugPanel = panel;
    }

    initializeLogger() {
        this.logger = {
            transitions: [],
            performance: [],
            errors: [],
            maxEntries: 100,

            log(type, message, data = {}) {
                const entry = {
                    timestamp: new Date().toISOString(),
                    type,
                    message,
                    data
                };

                this.transitions.push(entry);
                if (this.transitions.length > this.maxEntries) {
                    this.transitions.shift();
                }

                this.updateDebugPanel();
            }
        };
    }

    attachEventListeners() {
        document.addEventListener('themechange', this.handleThemeChange.bind(this));
        
        // Monitor CSS transitions
        document.addEventListener('transitionstart', this.handleTransitionStart.bind(this));
        document.addEventListener('transitionend', this.handleTransitionEnd.bind(this));
        
        // Monitor performance
        const observer = new PerformanceObserver(this.handlePerformanceEntry.bind(this));
        observer.observe({ entryTypes: ['measure', 'paint'] });
    }

    handleThemeChange(event) {
        const { theme, timestamp } = event.detail;
        this.logger.log('theme-change', `Theme changed to ${theme}`, {
            previousTheme: document.documentElement.getAttribute('data-theme'),
            timestamp
        });

        this.capturePerformanceMetrics();
    }

    handleTransitionStart(event) {
        const { propertyName, target } = event;
        const transitionId = crypto.randomUUID();
        
        this.transitions.set(transitionId, {
            startTime: performance.now(),
            propertyName,
            targetElement: target,
            completed: false
        });

        this.logger.log('transition-start', `Transition started for ${propertyName}`, {
            transitionId,
            targetElement: this.getElementIdentifier(target)
        });
    }

    handleTransitionEnd(event) {
        const { propertyName, target } = event;
        let transitionId = null;

        // Find the matching transition
        for (const [id, transition] of this.transitions) {
            if (transition.propertyName === propertyName && 
                transition.targetElement === target) {
                transitionId = id;
                break;
            }
        }

        if (transitionId) {
            const transition = this.transitions.get(transitionId);
            const duration = performance.now() - transition.startTime;

            this.logger.log('transition-end', `Transition completed for ${propertyName}`, {
                transitionId,
                duration: `${duration.toFixed(2)}ms`,
                targetElement: this.getElementIdentifier(target)
            });

            this.transitions.delete(transitionId);
        }
    }

    handlePerformanceEntry(entries) {
        entries.getEntries().forEach(entry => {
            this.performanceMarks.set(entry.name, entry);
            
            this.logger.log('performance', `Performance entry recorded: ${entry.name}`, {
                duration: `${entry.duration.toFixed(2)}ms`,
                entryType: entry.entryType,
                startTime: entry.startTime
            });
        });
    }

    capturePerformanceMetrics() {
        performance.mark('theme-transition-start');

        // Measure frame rates during transition
        let frames = 0;
        const startTime = performance.now();

        const measureFrames = (timestamp) => {
            frames++;
            
            if (performance.now() - startTime < 1000) {
                requestAnimationFrame(measureFrames);
            } else {
                const fps = Math.round(frames * 1000 / (performance.now() - startTime));
                
                this.logger.log('performance', `Frame rate during transition`, {
                    fps,
                    frames,
                    duration: `${(performance.now() - startTime).toFixed(2)}ms`
                });
            }
        };

        requestAnimationFrame(measureFrames);
    }

    captureSnapshot() {
        const snapshot = {
            timestamp: this.currentUser.lastActive,
            theme: document.documentElement.getAttribute('data-theme'),
            transitions: Array.from(this.transitions.entries()),
            performanceMarks: Array.from(this.performanceMarks.entries()),
            logs: this.logger.transitions,
            metrics: {
                pendingTransitions: this.transitions.size,
                completedTransitions: this.performanceMarks.size,
                errors: this.logger.errors.length
            }
        };

        // Download snapshot
        const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `theme-debug-snapshot-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    getElementIdentifier(element) {
        return {
            tagName: element.tagName.toLowerCase(),
            id: element.id,
            className: element.className,
            path: this.getElementPath(element)
        };
    }

    getElementPath(element) {
        const path = [];
        while (element && element.nodeType === Node.ELEMENT_NODE) {
            let selector = element.tagName.toLowerCase();
            if (element.id) {
                selector += `#${element.id}`;
            } else if (element.className) {
                selector += `.${element.className.split(' ').join('.')}`;
            }
            path.unshift(selector);
            element = element.parentNode;
        }
        return path.join(' > ');
    }

    toggleDebugMode() {
        this.isDebugMode = !this.isDebugMode;
        document.documentElement.classList.toggle('theme-debug-mode', this.isDebugMode);
        
        if (this.isDebugMode) {
            this.highlightTransitionElements();
        } else {
            this.removeTransitionHighlights();
        }
    }

    highlightTransitionElements() {
        document.querySelectorAll('[class*="theme-"]').forEach(element => {
            element.setAttribute('data-debug-theme', 'true');
        });
    }

    removeTransitionHighlights() {
        document.querySelectorAll('[data-debug-theme]').forEach(element => {
            element.removeAttribute('data-debug-theme');
        });
    }

    destroy() {
        if (this.debugPanel) {
            this.debugPanel.remove();
        }
        this.transitions.clear();
        this.performanceMarks.clear();
    }
}