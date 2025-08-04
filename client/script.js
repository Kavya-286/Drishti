// Navigation functionality - defined immediately
(function() {
    'use strict';
    
    // Define navigateTo function immediately
    function navigateTo(page) {
        console.log('Navigating to:', page);
        window.location.href = page;
    }
    
    // Make it available globally
    window.navigateTo = navigateTo;
    
    // Also attach to document for extra safety
    if (typeof document !== 'undefined') {
        document.navigateTo = navigateTo;
    }
    
    console.log('navigateTo function defined:', typeof window.navigateTo);
})();

// Demo functionality - defined immediately  
(function() {
    'use strict';
    
    function playDemo() {
        alert('Demo video would play here! For now, try the validation tool to see StartupValidator in action.');
    }
    
    // Make it available globally
    window.playDemo = playDemo;
    
    console.log('playDemo function defined:', typeof window.playDemo);
})();

// Smooth scrolling for anchor links
function smoothScroll(target) {
    document.querySelector(target).scrollIntoView({
        behavior: 'smooth'
    });
}

// Form validation utilities
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateRequired(value) {
    return value && value.trim().length > 0;
}

// Show loading state on button
function showLoading(button, originalText = 'Loading...') {
    button.disabled = true;
    button.classList.add('loading');
    button.textContent = originalText;
}

// Hide loading state on button
function hideLoading(button, originalText) {
    button.disabled = false;
    button.classList.remove('loading');
    button.textContent = originalText;
}

// Show modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

// Hide modal
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Progress bar animation
function animateProgress(progressElement, targetValue, duration = 1000) {
    let currentValue = 0;
    const increment = targetValue / (duration / 16);
    
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        progressElement.style.width = currentValue + '%';
    }, 16);
}

// Intersection Observer for animations
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe elements to animate
    document.querySelectorAll('.feature-card, .addon-card, .pricing-card').forEach(el => {
        observer.observe(el);
    });
}

// Local storage utilities
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

function loadFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
}

function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}

// API simulation utilities
async function simulateApiCall(data, delay = 1500) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                data: data,
                timestamp: new Date().toISOString()
            });
        }, delay);
    });
}

// Share functionality
async function shareResults(title, text, url) {
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
        // Fallback to clipboard
        try {
            await navigator.clipboard.writeText(`${text} ${shareData.url}`);
            showNotification('Link copied to clipboard!', 'success');
            return true;
        } catch (error) {
            // Final fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = `${text} ${shareData.url}`;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('Link copied to clipboard!', 'success');
            return true;
        }
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="margin-left: 10px; background: none; border: none; color: inherit; cursor: pointer;">×</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#6366f1'};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1001;
        font-size: 14px;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Add slide-in animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// PDF generation utility
function generatePDF(content, filename = 'startup-validation-report.pdf') {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${filename}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 40px; 
                        line-height: 1.6;
                    }
                    h1, h2, h3 { 
                        color: #6366f1; 
                        margin-bottom: 16px;
                    }
                    .header { 
                        text-align: center; 
                        margin-bottom: 40px; 
                        padding-bottom: 20px;
                        border-bottom: 2px solid #6366f1;
                    }
                    .section { 
                        margin: 30px 0; 
                        padding: 20px; 
                        border-left: 4px solid #6366f1; 
                        background: #f8f9fa; 
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
                    @media print { 
                        .no-print { display: none; } 
                    }
                </style>
            </head>
            <body>
                ${content}
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

// Scoring algorithm
function calculateValidationScore(data) {
    let totalScore = 0;
    let categories = 0;
    
    // Problem-Solution Fit (0-100)
    let problemSolutionScore = 0;
    if (data.problemStatement && data.problemStatement.length > 50) problemSolutionScore += 30;
    if (data.solutionDescription && data.solutionDescription.length > 50) problemSolutionScore += 30;
    if (data.uniqueValueProposition && data.uniqueValueProposition.length > 30) problemSolutionScore += 40;
    totalScore += problemSolutionScore;
    categories++;
    
    // Market Opportunity (0-100)
    let marketScore = 0;
    if (data.targetMarket && data.targetMarket.length > 30) marketScore += 40;
    if (data.marketSize) marketScore += 30;
    if (data.customerSegments && data.customerSegments.length > 30) marketScore += 30;
    totalScore += marketScore;
    categories++;
    
    // Business Model (0-100)
    let businessScore = 0;
    if (data.revenueModel) businessScore += 40;
    if (data.pricingStrategy && data.pricingStrategy.length > 30) businessScore += 40;
    if (data.keyMetrics && data.keyMetrics.length > 20) businessScore += 20;
    totalScore += businessScore;
    categories++;
    
    // Competition (0-100)
    let competitionScore = 0;
    if (data.competitiveAdvantage && data.competitiveAdvantage.length > 30) competitionScore += 50;
    if (data.directCompetitors && data.directCompetitors.length > 20) competitionScore += 25;
    if (data.indirectCompetitors && data.indirectCompetitors.length > 20) competitionScore += 25;
    totalScore += competitionScore;
    categories++;
    
    // Team (0-100)
    let teamScore = 0;
    if (data.foundersExperience && data.foundersExperience.length > 30) teamScore += 50;
    if (data.teamSize) teamScore += 25;
    if (data.keySkills && data.keySkills.length > 20) teamScore += 25;
    totalScore += teamScore;
    categories++;
    
    // Traction (0-100)
    let tractionScore = 0;
    if (data.currentStage) tractionScore += 40;
    if (data.existingTraction && data.existingTraction.length > 20) tractionScore += 40;
    if (data.fundingNeeds && data.fundingNeeds.length > 20) tractionScore += 20;
    totalScore += tractionScore;
    categories++;
    
    const overallScore = categories > 0 ? Math.round(totalScore / categories) : 0;
    
    return {
        overall: overallScore,
        categories: {
            problemSolution: problemSolutionScore,
            market: marketScore,
            business: businessScore,
            competition: competitionScore,
            team: teamScore,
            traction: tractionScore
        }
    };
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize scroll animations
    initScrollAnimations();
    
    // Initialize lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Initialize progress bars
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach(bar => {
        const value = bar.getAttribute('data-value') || 0;
        animateProgress(bar, value);
    });
    
    console.log('StartupValidator initialized successfully!');
});

// Export functions for use in other files
window.StartupValidator = {
    navigateTo,
    playDemo,
    showLoading,
    hideLoading,
    showModal,
    hideModal,
    showNotification,
    shareResults,
    generatePDF,
    calculateValidationScore,
    saveToStorage,
    loadFromStorage,
    removeFromStorage,
    simulateApiCall,
    validateEmail,
    validateRequired
};
