export class Module {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.type = data.type;
        this.content = data.content;
        this.duration = data.duration; // in seconds
        this.difficulty = data.difficulty;
        this.prerequisites = data.prerequisites || [];
        this.learningObjectives = data.learningObjectives || [];
        this.interactiveElements = data.interactiveElements || [];
        this.assessment = data.assessment;
    }

    render() {
        return `
            <div class="module-container" data-module-id="${this.id}">
                <div class="module-header">
                    <h2>${this.title}</h2>
                    <div class="module-meta">
                        <span class="duration">
                            <i class="fas fa-clock"></i>
                            ${Math.ceil(this.duration / 60)} min
                        </span>
                        <span class="difficulty ${this.difficulty.toLowerCase()}">
                            ${this.difficulty}
                        </span>
                    </div>
                </div>

                <div class="learning-objectives">
                    <h3>Learning Objectives</h3>
                    <ul>
                        ${this.learningObjectives.map(obj => 
                            `<li>${obj}</li>`
                        ).join('')}
                    </ul>
                </div>

                <div class="module-content">
                    ${this.renderContent()}
                </div>

                <div class="interactive-elements">
                    ${this.renderInteractiveElements()}
                </div>

                <div class="module-assessment">
                    ${this.renderAssessment()}
                </div>
            </div>
        `;
    }

    renderContent() {
        switch (this.type) {
            case 'video':
                return this.renderVideoContent();
            case 'interactive':
                return this.renderInteractiveContent();
            case 'practice':
                return this.renderPracticeContent();
            default:
                return this.renderTextContent();
        }
    }

    renderVideoContent() {
        return `
            <div class="video-player">
                <video
                    src="${this.content.videoUrl}"
                    controls
                    poster="${this.content.thumbnailUrl}"
                    preload="metadata"
                >
                    <track 
                        kind="captions" 
                        src="${this.content.captionsUrl}" 
                        srclang="it" 
                        label="Italian"
                    >
                </video>
                <div class="video-controls custom">
                    <!-- Custom video controls implementation -->
                </div>
            </div>
        `;
    }

    renderInteractiveContent() {
        return `
            <div class="interactive-content">
                ${this.content.elements.map(element => `
                    <div class="interactive-element" 
                         data-element-type="${element.type}"
                         data-element-id="${element.id}">
                        ${this.renderInteractiveElement(element)}
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderInteractiveElement(element) {
        switch (element.type) {
            case 'dragAndDrop':
                return this.renderDragAndDrop(element);
            case 'clickable':
                return this.renderClickableElements(element);
            case 'fillInBlanks':
                return this.renderFillInBlanks(element);
            default:
                return '';
        }
    }

    renderAssessment() {
        if (!this.assessment) return '';

        return `
            <div class="assessment-container">
                <h3>Quick Check</h3>
                <div class="assessment-questions">
                    ${this.assessment.questions.map(question => `
                        <div class="question" data-question-id="${question.id}">
                            <p class="question-text">${question.text}</p>
                            <div class="options">
                                ${question.options.map(option => `
                                    <button class="option-btn" 
                                            data-option-id="${option.id}">
                                        ${option.text}
                                    </button>
                                `).join('')}
                            </div>
                            <div class="feedback hidden"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}