// Authentication specific JavaScript functions

// OTP management
let generatedOTP = null;
let otpSentTime = null;

function sendOTP() {
    const phoneInput = document.getElementById('phone');
    const phone = phoneInput.value.trim();
    
    if (!phone) {
        showAlert('Please enter your phone number', 'error');
        return;
    }
    
    // Basic phone validation
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone)) {
        showAlert('Please enter a valid phone number', 'error');
        return;
    }
    
    // Generate OTP
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    otpSentTime = new Date();
    
    // Show OTP section
    const otpSection = document.getElementById('otp-section');
    if (otpSection) {
        otpSection.style.display = 'block';
    }
    
    // Update button
    const sendButton = document.getElementById('send-otp');
    if (sendButton) {
        sendButton.textContent = 'OTP Sent ✓';
        sendButton.disabled = true;
        sendButton.classList.add('btn-success');
    }
    
    // Show OTP in alert (in production, this would be sent via SMS)
    showAlert(`📱 OTP sent to ${phone}\n\n🔐 Your OTP: ${generatedOTP}\n\n(In production, this would be sent via SMS)`, 'info');
    
    // Set timeout to re-enable button after 60 seconds
    setTimeout(() => {
        if (sendButton) {
            sendButton.textContent = 'Resend OTP';
            sendButton.disabled = false;
            sendButton.classList.remove('btn-success');
        }
    }, 60000);
}

function verifyOTP(otpValue) {
    if (!generatedOTP) {
        showAlert('Please request an OTP first', 'error');
        return false;
    }
    
    // Check if OTP is expired (10 minutes)
    const now = new Date();
    const timeDiff = (now - otpSentTime) / 1000 / 60; // in minutes
    
    if (timeDiff > 10) {
        showAlert('OTP has expired. Please request a new one.', 'error');
        return false;
    }
    
    if (otpValue === generatedOTP) {
        return true;
    }
    
    showAlert('Invalid OTP. Please check and try again.', 'error');
    return false;
}

function validateAuthForm() {
    const email = document.getElementById(authMode === 'signin' ? 'signin-email' : 'signup-email');
    const password = document.getElementById(authMode === 'signin' ? 'signin-password' : 'signup-password');
    
    if (!email.value.trim()) {
        showAlert('Please enter your email address', 'error');
        email.focus();
        return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        showAlert('Please enter a valid email address', 'error');
        email.focus();
        return false;
    }
    
    if (!password.value.trim()) {
        showAlert('Please enter your password', 'error');
        password.focus();
        return false;
    }
    
    if (authMode === 'signup') {
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const confirmPassword = document.getElementById('confirmPassword');
        const phone = document.getElementById('phone');
        const otp = document.getElementById('otp');
        const terms = document.getElementById('terms');
        
        if (!firstName.value.trim()) {
            showAlert('Please enter your first name', 'error');
            firstName.focus();
            return false;
        }
        
        if (!lastName.value.trim()) {
            showAlert('Please enter your last name', 'error');
            lastName.focus();
            return false;
        }
        
        if (password.value.length < 6) {
            showAlert('Password must be at least 6 characters long', 'error');
            password.focus();
            return false;
        }
        
        if (password.value !== confirmPassword.value) {
            showAlert('Passwords do not match', 'error');
            confirmPassword.focus();
            return false;
        }
        
        if (!phone.value.trim()) {
            showAlert('Please enter your phone number', 'error');
            phone.focus();
            return false;
        }
        
        // OTP verification if phone provided
        if (phone.value && otp.value) {
            if (!verifyOTP(otp.value)) {
                return false;
            }
        } else if (phone.value) {
            showAlert('Please enter the OTP sent to your phone', 'error');
            otp.focus();
            return false;
        }
        
        // Additional validation for investor type
        if (currentUserType === 'investor') {
            const investorType = document.getElementById('investorType');
            if (!investorType.value) {
                showAlert('Please select your investor type', 'error');
                investorType.focus();
                return false;
            }
        }
        
        if (!terms.checked) {
            showAlert('Please accept the Terms of Service and Privacy Policy', 'error');
            terms.focus();
            return false;
        }
    }
    
    return true;
}

function handleAuth(event) {
    event.preventDefault();
    
    if (!validateAuthForm()) {
        return;
    }
    
    showLoading();
    
    const form = event.target;
    const formData = new FormData(form);
    
    setTimeout(() => {
        try {
            if (authMode === 'signup') {
                handleSignup(formData);
            } else {
                handleSignin(formData);
            }
        } catch (error) {
            console.error('Authentication error:', error);
            showAlert('Authentication failed. Please try again.', 'error');
        } finally {
            hideLoading();
        }
    }, 1500); // Simulate API call delay
}

function handleSignup(formData) {
    const email = formData.get('email');
    const password = formData.get('password');
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const phone = formData.get('phone');
    const otp = formData.get('otp');
    const location = formData.get('location');
    const experience = formData.get('experience');
    const interests = formData.get('interests');
    const investorType = formData.get('investorType');
    const fundName = formData.get('fundName');
    
    // Create user object
    const user = {
        id: `user_${Date.now()}`,
        email,
        firstName,
        lastName,
        phone,
        location,
        userType: currentUserType,
        joinDate: new Date().toISOString(),
        planType: 'Free',
        isAuthenticated: true,
        authProvider: 'email',
        phoneVerified: phone && otp ? true : false,
        // Add additional fields based on user type
        ...(currentUserType === 'entrepreneur' ? {
            experience: experience || 'first-time',
            interests: interests || 'Technology'
        } : {
            investorType: investorType || 'individual',
            fundName: fundName || ''
        })
    };
    
    saveUserToStorage(user);
    updateAuthUI();
    
    const verificationStatus = phone && otp ? ' Your phone number has been verified!' : '';
    showAlert(`Account created successfully!${verificationStatus} Welcome to Drishti.`, 'success');
    
    // Reset form
    document.getElementById('auth-form').reset();
    generatedOTP = null;
    otpSentTime = null;
    
    // Redirect based on user type
    if (currentUserType === 'investor') {
        showPage('investor-dashboard');
    } else {
        showPage('dashboard');
    }
}

function handleSignin(formData) {
    const email = formData.get('email');
    const password = formData.get('password');
    
    // In a real application, this would be validated against a database
    // For demo purposes, we'll create a user object
    const user = {
        id: `user_${Date.now()}`,
        email,
        firstName: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        lastName: 'User',
        userType: currentUserType,
        joinDate: new Date().toISOString(),
        planType: 'Free',
        isAuthenticated: true,
        authProvider: 'email',
        phoneVerified: false
    };
    
    saveUserToStorage(user);
    updateAuthUI();
    
    showAlert('Welcome back!', 'success');
    
    // Reset form
    document.getElementById('auth-form').reset();
    
    // Redirect based on user type
    if (currentUserType === 'investor') {
        showPage('investor-dashboard');
    } else {
        showPage('dashboard');
    }
}

function handleSocialLogin(provider) {
    showLoading();
    
    setTimeout(() => {
        try {
            let userData = {};
            
            if (provider === 'google') {
                const email = prompt(`🔗 Connecting to Google...\n\nFor demo purposes, enter your email:`) || `user${Date.now()}@gmail.com`;
                const firstName = prompt('Enter your first name:') || 'Google';
                const lastName = prompt('Enter your last name:') || 'User';
                
                if (!email || !firstName || !lastName) {
                    hideLoading();
                    return;
                }
                
                userData = {
                    email,
                    firstName,
                    lastName,
                    authProvider: 'google'
                };
            } else if (provider === 'linkedin') {
                const email = prompt(`🔗 Connecting to LinkedIn...\n\nFor demo purposes, enter your professional email:`) || `user${Date.now()}@company.com`;
                const firstName = prompt('Enter your first name:') || 'LinkedIn';
                const lastName = prompt('Enter your last name:') || 'Professional';
                const company = prompt('Enter your company/organization:') || 'Tech Company';
                
                if (!email || !firstName || !lastName) {
                    hideLoading();
                    return;
                }
                
                userData = {
                    email,
                    firstName,
                    lastName,
                    company,
                    authProvider: 'linkedin'
                };
            }
            
            const user = {
                id: `${provider}_${Date.now()}`,
                ...userData,
                userType: currentUserType,
                joinDate: new Date().toISOString(),
                planType: 'Free',
                isAuthenticated: true,
                phoneVerified: false,
                // Add default fields based on user type
                ...(currentUserType === 'entrepreneur' ? {
                    experience: 'first-time',
                    interests: 'Technology'
                } : {
                    investorType: 'individual',
                    fundName: userData.company || ''
                })
            };
            
            saveUserToStorage(user);
            updateAuthUI();
            
            showAlert(`✅ Successfully signed in with ${provider}!\nWelcome ${user.firstName} ${user.lastName}!`, 'success');
            
            // Redirect based on user type
            if (currentUserType === 'investor') {
                showPage('investor-dashboard');
            } else {
                showPage('dashboard');
            }
        } catch (error) {
            console.error('Social login error:', error);
            showAlert('Social login failed. Please try again.', 'error');
        } finally {
            hideLoading();
        }
    }, 2000);
}

// Form validation helpers
function addValidationFeedback(element, isValid, message) {
    const formGroup = element.closest('.form-group');
    
    // Remove existing feedback
    formGroup.classList.remove('has-error', 'has-success');
    const existingFeedback = formGroup.querySelector('.field-error, .field-success');
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    if (!isValid) {
        formGroup.classList.add('has-error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        formGroup.appendChild(errorDiv);
    } else {
        formGroup.classList.add('has-success');
        const successDiv = document.createElement('div');
        successDiv.className = 'field-success';
        successDiv.textContent = 'Looks good!';
        formGroup.appendChild(successDiv);
    }
}

// Real-time form validation
function setupFormValidation() {
    const emailInputs = document.querySelectorAll('input[type="email"]');
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    const phoneInput = document.getElementById('phone');
    
    emailInputs.forEach(input => {
        input.addEventListener('blur', () => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isValid = emailRegex.test(input.value);
            addValidationFeedback(input, isValid, isValid ? '' : 'Please enter a valid email address');
        });
    });
    
    passwordInputs.forEach(input => {
        input.addEventListener('blur', () => {
            const isValid = input.value.length >= 6;
            addValidationFeedback(input, isValid, isValid ? '' : 'Password must be at least 6 characters long');
        });
    });
    
    if (phoneInput) {
        phoneInput.addEventListener('blur', () => {
            const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
            const isValid = phoneRegex.test(phoneInput.value);
            addValidationFeedback(phoneInput, isValid, isValid ? '' : 'Please enter a valid phone number');
        });
    }
    
    // Password confirmation validation
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const signupPasswordInput = document.getElementById('signup-password');
    
    if (confirmPasswordInput && signupPasswordInput) {
        confirmPasswordInput.addEventListener('blur', () => {
            const isValid = confirmPasswordInput.value === signupPasswordInput.value;
            addValidationFeedback(confirmPasswordInput, isValid, isValid ? '' : 'Passwords do not match');
        });
    }
}

// Initialize form validation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(setupFormValidation, 100);
});
