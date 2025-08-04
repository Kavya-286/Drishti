// Validation Form Controller
class ValidationController {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 6;
        this.formData = {};
        this.isGeneratingSuggestions = false;
        
        this.stepTitles = [
            'Problem & Solution',
            'Target Market', 
            'Business Model',
            'Competition',
            'Team',
            'Traction & Funding'
        ];
        
        this.stepDescriptions = [
            "Describe the problem you're solving and your proposed solution",
            "Define your target market and customer segments",
            "Outline your business model and revenue strategy", 
            "Analyze your competitive landscape",
            "Tell us about your team and capabilities",
            "Share your current progress and funding requirements"
        ];
        
        this.init();
    }
    
    init() {
        this.updateUI();
        this.bindEvents();
        this.loadSavedData();
        this.updateProgress();
    }
    
    bindEvents() {
        // Problem statement suggestions
        const problemField = document.getElementById('problem-statement');
        if (problemField) {
            problemField.addEventListener('blur', (e) => {
                if (e.target.value.length > 20) {
                    this.generateSuggestions(e.target.value);
                }
            });
        }
        
        // Form field changes
        const form = document.getElementById('validation-form');
        if (form) {
            form.addEventListener('input', (e) => {
                this.saveFormData();
                this.validateField(e.target);
                this.updateInsights();
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.previousStep();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.nextStep();
                }
            }
        });
    }
    
    updateUI() {
        // Update step indicators
        document.getElementById('current-step').textContent = this.currentStep;
        document.getElementById('step-number').textContent = this.currentStep;
        document.getElementById('total-steps').textContent = this.totalSteps;
        
        // Update form title and description
        document.getElementById('form-title').textContent = this.stepTitles[this.currentStep - 1];
        document.getElementById('form-description').textContent = this.stepDescriptions[this.currentStep - 1];
        
        // Update step navigation
        document.querySelectorAll('.step-item').forEach((item, index) => {
            const stepNumber = index + 1;
            item.classList.remove('active', 'completed');
            
            if (stepNumber === this.currentStep) {
                item.classList.add('active');
            } else if (stepNumber < this.currentStep) {
                item.classList.add('completed');
                item.querySelector('.step-icon i').setAttribute('data-lucide', 'check');
            }
        });
        
        // Update form steps
        document.querySelectorAll('.form-step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.toggle('active', stepNumber === this.currentStep);
        });
        
        // Update navigation buttons
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const validateBtn = document.getElementById('validate-btn');
        
        prevBtn.disabled = this.currentStep === 1;
        
        if (this.currentStep === this.totalSteps) {
            nextBtn.style.display = 'none';
            validateBtn.style.display = 'inline-flex';
        } else {
            nextBtn.style.display = 'inline-flex';
            validateBtn.style.display = 'none';
        }
        
        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    updateProgress() {
        const progress = (this.currentStep / this.totalSteps) * 100;
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.width = progress + '%';
            progressBar.setAttribute('data-value', progress);
        }
    }
    
    nextStep() {
        if (this.currentStep < this.totalSteps && this.validateCurrentStep()) {
            this.currentStep++;
            this.updateUI();
            this.updateProgress();
            this.updateInsights();
            this.scrollToTop();
        }
    }
    
    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateUI();
            this.updateProgress();
            this.updateInsights();
            this.scrollToTop();
        }
    }
    
    goToStep(stepNumber) {
        if (stepNumber >= 1 && stepNumber <= this.totalSteps) {
            this.currentStep = stepNumber;
            this.updateUI();
            this.updateProgress();
            this.updateInsights();
            this.scrollToTop();
        }
    }
    
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    validateCurrentStep() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            this.showNotification('Please fill in all required fields', 'error');
        }
        
        return isValid;
    }
    
    validateField(field) {
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        const group = field.closest('.form-group');
        
        // Remove existing error states
        group.classList.remove('error', 'success');
        const existingError = group.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Validate required fields
        if (isRequired && !value) {
            this.showFieldError(group, 'This field is required');
            return false;
        }
        
        // Validate specific field types
        if (value) {
            switch (field.type) {
                case 'email':
                    if (!this.validateEmail(value)) {
                        this.showFieldError(group, 'Please enter a valid email address');
                        return false;
                    }
                    break;
                case 'textarea':
                    if (isRequired && value.length < 10) {
                        this.showFieldError(group, 'Please provide more detail (at least 10 characters)');
                        return false;
                    }
                    break;
            }
            
            group.classList.add('success');
        }
        
        return true;
    }
    
    showFieldError(group, message) {
        group.classList.add('error');
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `<i data-lucide="alert-circle"></i> ${message}`;
        group.appendChild(errorElement);
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    saveFormData() {
        const form = document.getElementById('validation-form');
        const formData = new FormData(form);
        
        this.formData = {};
        for (let [key, value] of formData.entries()) {
            this.formData[key] = value;
        }
        
        // Save to localStorage
        if (typeof StartupValidator !== 'undefined') {
            StartupValidator.saveToStorage('validationData', this.formData);
        }
    }
    
    loadSavedData() {
        if (typeof StartupValidator !== 'undefined') {
            const savedData = StartupValidator.loadFromStorage('validationData');
            if (savedData) {
                this.formData = savedData;
                
                // Populate form fields
                Object.keys(savedData).forEach(key => {
                    const field = document.querySelector(`[name="${key}"]`);
                    if (field) {
                        field.value = savedData[key];
                    }
                });
            }
        }
    }
    
    async generateSuggestions(problemText) {
        if (this.isGeneratingSuggestions || problemText.length < 10) return;
        
        this.isGeneratingSuggestions = true;
        const suggestionsBox = document.getElementById('problem-suggestions');
        
        // Show loading state
        suggestionsBox.innerHTML = `
            <div class="generating-suggestions">
                <div class="spinner"></div>
                Generating AI suggestions...
            </div>
        `;
        suggestionsBox.classList.add('active');
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Generate contextual suggestions
            const suggestions = this.getContextualSuggestions(problemText);
            
            suggestionsBox.innerHTML = `
                <div class="suggestions-header">
                    <i data-lucide="lightbulb"></i>
                    AI Suggestions for Problem Validation
                </div>
                <ul class="suggestions-list">
                    ${suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                </ul>
            `;
            
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            
        } catch (error) {
            suggestionsBox.innerHTML = `
                <div class="error-message">
                    <i data-lucide="alert-circle"></i>
                    Failed to generate suggestions. Please try again.
                </div>
            `;
        } finally {
            this.isGeneratingSuggestions = false;
        }
    }
    
    getContextualSuggestions(problemText) {
        const keywords = problemText.toLowerCase();
        
        if (keywords.includes('time') || keywords.includes('slow') || keywords.includes('efficiency')) {
            return [
                "Measure the actual time lost due to this problem to quantify the value proposition",
                "Research automation tools or processes that could solve this efficiency issue",
                "Consider if customers would pay for time-saving solutions in this context"
            ];
        } else if (keywords.includes('cost') || keywords.includes('expensive') || keywords.includes('money')) {
            return [
                "Calculate the exact cost impact of this problem on your target customers",
                "Explore if customers have budget allocated for solving cost-related problems",
                "Research price sensitivity in your target market for cost-saving solutions"
            ];
        } else if (keywords.includes('communication') || keywords.includes('connect') || keywords.includes('collaborate')) {
            return [
                "Study existing communication tools to identify specific gaps your solution could fill",
                "Investigate if the communication problem is due to process or technology issues",
                "Consider the network effects and adoption challenges for communication solutions"
            ];
        } else {
            return [
                "Consider validating the problem severity with customer interviews to understand the pain level",
                "Research if existing solutions adequately address this problem or leave gaps",
                "Quantify the financial impact of this problem on your target customers",
                "Identify specific customer segments most affected by this problem"
            ];
        }
    }
    
    updateInsights() {
        const insights = document.getElementById('ai-insights');
        const insightText = document.getElementById('insight-text');
        
        if (this.currentStep > 1) {
            insights.style.display = 'block';
            
            const stepInsights = {
                2: "Market Tip: Based on your problem statement, consider defining specific customer personas. More targeted market segmentation will improve your validation score significantly.",
                3: "Business Model Tip: Consider multiple revenue streams. Successful startups often have 2-3 ways to monetize their solution to reduce dependency on a single income source.",
                4: "Competition Tip: Don't just list competitors - explain why customers would switch to your solution. Focus on unique differentiators that are hard to replicate.",
                5: "Team Tip: Highlight relevant experience and domain expertise. Investors look for teams that understand the problem deeply and have the skills to execute the solution.",
                6: "Traction Tip: Even early-stage validation like customer interviews, surveys, or beta sign-ups counts as traction. Quantify your progress wherever possible."
            };
            
            const insight = stepInsights[this.currentStep] || "Keep adding details to get more accurate validation insights.";
            insightText.innerHTML = `<strong>💡 ${insight.split(':')[0]}:</strong> ${insight.split(':')[1]}`;
            
        } else {
            insights.style.display = 'none';
        }
    }
    
    showNotification(message, type = 'info') {
        if (typeof StartupValidator !== 'undefined') {
            StartupValidator.showNotification(message, type);
        } else {
            alert(message);
        }
    }
    
    async validateIdea() {
        // Final validation
        if (!this.validateCurrentStep()) {
            return;
        }
        
        this.saveFormData();
        
        const validateBtn = document.getElementById('validate-btn');
        const originalText = validateBtn.textContent;
        
        // Show loading state
        validateBtn.disabled = true;
        validateBtn.innerHTML = 'Validating... <div class="spinner"></div>';
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Save validation data
            if (typeof StartupValidator !== 'undefined') {
                StartupValidator.saveToStorage('lastValidation', {
                    data: this.formData,
                    timestamp: new Date().toISOString()
                });
            }
            
            // Navigate to results
            window.location.href = 'results.html';
            
        } catch (error) {
            this.showNotification('Validation failed. Please try again.', 'error');
            validateBtn.disabled = false;
            validateBtn.innerHTML = originalText;
        }
    }
}

// Navigation functions (called from HTML)
function nextStep() {
    if (window.validationController) {
        window.validationController.nextStep();
    }
}

function previousStep() {
    if (window.validationController) {
        window.validationController.previousStep();
    }
}

function validateIdea() {
    if (window.validationController) {
        window.validationController.validateIdea();
    }
}

function goToStep(stepNumber) {
    if (window.validationController) {
        window.validationController.goToStep(stepNumber);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.validationController = new ValidationController();
    
    // Add click handlers to step navigation
    document.querySelectorAll('.step-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            const stepNumber = index + 1;
            if (stepNumber <= window.validationController.currentStep + 1) {
                window.validationController.goToStep(stepNumber);
            }
        });
    });
    
    console.log('Validation form initialized successfully!');
});
