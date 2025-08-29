class VisualizerManager {
    constructor(audioContext, config) {
        this.audioContext = audioContext;
        this.config = config;
        this.visualizers = new Map();
        this.analyserNode = audioContext.createAnalyser();
        this.setupAnalyser();
    }

    setupAnalyser() {
        this.analyserNode.fftSize = this.config.fftSize;
        this.analyserNode.smoothingTimeConstant = this.config.smoothingTimeConstant;
        
        this.bufferLength = this.analyserNode.frequencyBinCount;
        this.dataArray = new Float32Array(this.bufferLength);
    }

    connect(sourceNode) {
        sourceNode.connect(this.analyserNode);
    }

    addVisualizer(type, canvas) {
        switch (type) {
            case 'waveform':
                this.visualizers.set(type, new WaveformVisualizer(
                    canvas, 
                    this.analyserNode, 
                    this.config
                ));
                break;
            case 'spectrum':
                this.visualizers.set(type, new SpectrumVisualizer(
                    canvas, 
                    this.analyserNode, 
                    this.config
                ));
                break;
            case 'pitch':
                this.visualizers.set(type, new PitchVisualizer(
                    canvas, 
                    this.analyserNode, 
                    this.config
                ));
                break;
        }
    }

    start() {
        this.visualizers.forEach(visualizer => visualizer.start());
    }

    stop() {
        this.visualizers.forEach(visualizer => visualizer.stop());
    }
}

class WaveformVisualizer {
    constructor(canvas, analyserNode, config) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.analyserNode = analyserNode;
        this.config = config;
        this.isActive = false;
    }

    start() {
        this.isActive = true;
        this.draw();
    }

    stop() {
        this.isActive = false;
    }

    draw() {
        if (!this.isActive) return;

        const bufferLength = this.analyserNode.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);
        this.analyserNode.getFloatTimeDomainData(dataArray);

        this.ctx.fillStyle = 'rgb(200, 200, 200)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'rgb(0, 0, 0)';
        this.ctx.beginPath();

        const sliceWidth = this.canvas.width * 1.0 / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] * 0.5;
            const y = this.canvas.height/2 + v * this.canvas.height/2;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        this.ctx.lineTo(this.canvas.width, this.canvas.height/2);
        this.ctx.stroke();

        requestAnimationFrame(() => this.draw());
    }
}