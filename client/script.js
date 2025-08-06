// StartupValidator JavaScript - ML Backend Integration
class StartupValidator {
    constructor() {
        this.apiBase = window.location.origin;
        this.currentValidation = null;
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.initScrollAnimations();
        this.checkHealthStatus();
    }
    
    bindEvents() {
        // Global navigation functions
        window.navigateTo = this.navigateTo.bind(this);
        window.playDemo = this.playDemo.bind(this);
        window.generateAIPitch = this.generateAIPitch.bind(this);
        window.copyPitchToClipboard = this.copyPitchToClipboard.bind(this);
        
        // Intersection observer for animations
        this.setupIntersectionObserver();
    }
    
    // Navigation
    navigateTo(page) {
        console.log('Navigating to:', page);
        window.location.href = page;
    }
    
    playDemo() {
        this.showNotification('Demo feature coming soon! Try our validation tool to see StartupValidator in action.', 'info');
    }
    
    // API Communication
    async makeRequest(endpoint, method = 'GET', data = null) {
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data) {
            config.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(`${this.apiBase}/api/${endpoint}`, config);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Request failed');
            }
            
            return result;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }
    
    // Health Check
    async checkHealthStatus() {
        try {
            const health = await this.makeRequest('health');
            console.log('Backend status:', health);
        } catch (error) {
            console.warn('Backend not available:', error.message);
        }
    }
    
    // AI Pitch Generation
    async generateAIPitch() {
        const button = document.querySelector('.btn-glow');
        const originalText = button.innerHTML;
        
        // Show loading state
        button.disabled = true;
        button.innerHTML = `
            <div class="loading-spinner"></div>
            Generating AI Pitch...
        `;
        
        try {
            // Get validation data if available
            const validationData = this.loadFromStorage('validationData') || {};
            
            const result = await this.makeRequest('generate-pitch', 'POST', validationData);
            
            if (result.success) {
                this.displayPitchContent(result.pitch_content);
                this.showNotification('AI Pitch generated successfully!', 'success');
            } else {
                throw new Error(result.error || 'Pitch generation failed');
            }
            
        } catch (error) {
            this.showNotification('Failed to generate pitch: ' + error.message, 'error');
            console.error('Pitch generation error:', error);
        } finally {
            button.disabled = false;
            button.innerHTML = originalText;
        }
    }
    
    displayPitchContent(pitchContent) {
        const container = document.getElementById('pitch-output-container');
        const sectionsContainer = document.getElementById('pitch-sections');
        
        if (!container || !sectionsContainer) return;
        
        // Store pitch content for copying
        this.currentPitch = pitchContent;
        
        const sections = [
            { key: 'executiveSummary', title: '🎯 Executive Summary', icon: 'target' },
            { key: 'problemStatement', title: '🔍 Problem Statement', icon: 'search' },
            { key: 'solutionOverview', title: '💡 Solution Overview', icon: 'lightbulb' },
            { key: 'marketOpportunity', title: '📈 Market Opportunity', icon: 'trending-up' },
            { key: 'businessModel', title: '💰 Business Model', icon: 'dollar-sign' },
            { key: 'competitiveAdvantage', title: '🏆 Competitive Advantage', icon: 'award' },
            { key: 'fundingRequirements', title: '💼 Funding Requirements', icon: 'briefcase' }
        ];
        
        sectionsContainer.innerHTML = sections.map(section => `
            <div class="pitch-section">
                <h4>
                    <i data-lucide="${section.icon}"></i>
                    ${section.title}
                </h4>
                <p>${pitchContent[section.key]}</p>
            </div>
        `).join('');
        
        // Show the container
        container.style.display = 'block';
        container.scrollIntoView({ behavior: 'smooth' });
        
        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    copyPitchToClipboard() {
        if (!this.currentPitch) {
            this.showNotification('No pitch content to copy', 'warning');
            return;
        }
        
        const sections = [
            'Executive Summary: ' + this.currentPitch.executiveSummary,
            'Problem Statement: ' + this.currentPitch.problemStatement,
            'Solution Overview: ' + this.currentPitch.solutionOverview,
            'Market Opportunity: ' + this.currentPitch.marketOpportunity,
            'Business Model: ' + this.currentPitch.businessModel,
            'Competitive Advantage: ' + this.currentPitch.competitiveAdvantage,
            'Funding Requirements: ' + this.currentPitch.fundingRequirements
        ];
        
        const fullPitch = sections.join('\n\n');
        
        this.copyToClipboard(fullPitch, 'Pitch copied to clipboard!');
    }
    
    // Startup Validation (for validation page)
    async validateStartup(formData) {
        try {
            this.isLoading = true;
            
            const result = await this.makeRequest('validate', 'POST', formData);
            
            if (result.success) {
                // Store validation results
                this.saveToStorage('validationResults', result);
                this.saveToStorage('validationData', formData);
                
                return result;
            } else {
                throw new Error(result.error || 'Validation failed');
            }
            
        } catch (error) {
            console.error('Validation error:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }
    
    // Generate SWOT Analysis
    async generateSWOT(formData = {}) {
        try {
            const result = await this.makeRequest('generate-swot', 'POST', formData);
            
            if (result.success) {
                return result.swot_analysis;
            } else {
                throw new Error(result.error || 'SWOT generation failed');
            }
        } catch (error) {
            console.error('SWOT generation error:', error);
            throw error;
        }
    }
    
    // Check Founder Readiness
    async checkFounderReadiness(formData = {}) {
        try {
            const result = await this.makeRequest('founder-readiness', 'POST', formData);
            
            if (result.success) {
                return result.assessment;
            } else {
                throw new Error(result.error || 'Founder assessment failed');
            }
        } catch (error) {
            console.error('Founder readiness error:', error);
            throw error;
        }
    }
    
    // Generate Market Research
    async generateMarketResearch(formData = {}) {
        try {
            const result = await this.makeRequest('market-research', 'POST', formData);
            
            if (result.success) {
                return result.market_data;
            } else {
                throw new Error(result.error || 'Market research failed');
            }
        } catch (error) {
            console.error('Market research error:', error);
            throw error;
        }
    }
    
    // Utility Functions
    copyToClipboard(text, successMessage = 'Copied to clipboard!') {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification(successMessage, 'success');
            }).catch(() => {
                this.fallbackCopyToClipboard(text, successMessage);
            });
        } else {
            this.fallbackCopyToClipboard(text, successMessage);
        }
    }
    
    fallbackCopyToClipboard(text, successMessage) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showNotification(successMessage, 'success');
        } catch (err) {
            this.showNotification('Failed to copy to clipboard', 'error');
        }
        
        document.body.removeChild(textArea);
    }
    
    // Notification System
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i data-lucide="${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="margin-left: auto; background: none; border: none; cursor: pointer; opacity: 0.7;">
                    <i data-lucide="x"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info'
        };
        return icons[type] || 'info';
    }
    
    // Local Storage
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    }
    
    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return null;
        }
    }
    
    removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
            return false;
        }
    }
    
    // Animation Setup
    initScrollAnimations() {
        const animateElements = document.querySelectorAll('.feature-card, .step, .pricing-card');
        
        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
        });
    }
    
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.transition = 'all 0.6s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe feature cards, steps, and pricing cards
        document.querySelectorAll('.feature-card, .step, .pricing-card').forEach(el => {
            observer.observe(el);
        });
    }
    
    // Validation Helpers
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    validateRequired(value) {
        return value && value.trim().length > 0;
    }
    
    // Share functionality
    async shareResults(title, text, url) {
        const shareData = {
            title: title,
            text: text,
            url: url || window.location.href
        };
        
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
                return true;
            } catch (error) {
                console.log('Share cancelled or failed');
                return false;
            }
        } else {
            this.copyToClipboard(`${text} ${shareData.url}`, 'Link copied to clipboard!');
            return true;
        }
    }
    
    // PDF Generation
    generatePDF(content, filename = 'startup-validation-report.pdf') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${filename}</title>
                    <style>
                        body { 
                            font-family: 'Inter', Arial, sans-serif; 
                            margin: 40px; 
                            line-height: 1.6;
                            color: #1e293b;
                        }
                        h1, h2, h3 { 
                            color: #6366f1; 
                            margin-bottom: 16px;
                        }
                        .header { 
                            text-align: center; 
                            margin-bottom: 40px; 
                            padding-bottom: 20px;
                            border-bottom: 3px solid #6366f1;
                        }
                        .section { 
                            margin: 30px 0; 
                            padding: 20px; 
                            border-left: 4px solid #6366f1; 
                            background: #f8fafc; 
                            border-radius: 8px;
                        }
                        .score { 
                            font-size: 24px; 
                            font-weight: bold; 
                            color: #6366f1; 
                        }
                        ul { 
                            margin-left: 20px; 
                        }
                        li { 
                            margin: 8px 0; 
                        }
                        .footer {
                            margin-top: 40px;
                            text-align: center;
                            color: #64748b;
                            border-top: 1px solid #e2e8f0;
                            padding-top: 20px;
                        }
                        @media print { 
                            .no-print { display: none; } 
                        }
                    </style>
                </head>
                <body>
                    ${content}
                    <div class="footer">
                        <p>Generated by StartupValidator - AI-Powered Startup Validation</p>
                        <p>Visit startupvalidator.com for more insights</p>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    window.startupValidator = new StartupValidator();
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
    
    console.log('🚀 StartupValidator initialized successfully!');
    console.log('🤖 ML Backend integration ready');
    console.log('🎨 Modern UI loaded without Tailwind');
});

// Add loading spinner styles
const style = document.createElement('style');
style.textContent = `
    .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        display: inline-block;
        margin-right: 8px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
