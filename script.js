// Global application state
let currentUser = null;
let currentUserType = "entrepreneur";
let authMode = "signin";
let validationResults = null;
let validationData = null;
let notifications = [];

// Initialize application when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

// Initialize the application
function initializeApp() {
  loadUserFromStorage();
  updateAuthUI();
  loadNotifications();
  showPage("landing");

  // Check if user is returning from a previous session
  const urlPath = window.location.hash.substring(1);
  if (urlPath) {
    showPage(urlPath);
  }
}

// Navigation function to show different pages
function showPage(pageName) {
  // Hide all pages
  const pages = document.querySelectorAll(".page");
  pages.forEach((page) => {
    page.classList.remove("active");
  });

  // Show the requested page
  const targetPage = document.getElementById(`page-${pageName}`);
  if (targetPage) {
    targetPage.classList.add("active");

    // Update URL hash
    window.location.hash = pageName;

    // Load page-specific content
    loadPageContent(pageName);
  }
}

// Load page-specific content
function loadPageContent(pageName) {
  switch (pageName) {
    case "dashboard":
      loadDashboard();
      break;
    case "investor-dashboard":
      loadInvestorDashboard();
      break;
    case "validate":
      loadValidationPage();
      break;
    case "results":
      loadResultsPage();
      break;
    case "founder-readiness":
      loadFounderReadinessPage();
      break;
    case "features":
      loadFeaturesPage();
      break;
    case "pricing":
      loadPricingPage();
      break;
    case "about":
      loadAboutPage();
      break;
    case "auth":
      // Auth page is already in HTML, just show it
      // Initialize auto-save for the auth form if needed
      initializeAuthPage();
      break;
  }
}

// User Management Functions
function loadUserFromStorage() {
  const userData = localStorage.getItem("currentUser");
  const isAuthenticated = localStorage.getItem("isAuthenticated");

  if (userData && isAuthenticated === "true") {
    try {
      currentUser = JSON.parse(userData);
      console.log("User loaded from storage:", currentUser);
    } catch (error) {
      console.error("Error loading user data:", error);
      clearUserSession();
    }
  }
}

function saveUserToStorage(user) {
  currentUser = user;
  localStorage.setItem("currentUser", JSON.stringify(user));
  localStorage.setItem("isAuthenticated", "true");
}

function clearUserSession() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  localStorage.removeItem("isAuthenticated");
  updateAuthUI();
}

function updateAuthUI() {
  const authButton = document.getElementById("auth-button");
  const logoutButton = document.getElementById("logout-button");
  const notificationBell = document.getElementById("notification-bell");
  const userWelcome = document.getElementById("user-welcome");

  if (currentUser) {
    authButton.style.display = "none";
    logoutButton.style.display = "inline-flex";

    if (currentUser.userType !== "investor") {
      notificationBell.style.display = "block";
    }

    if (userWelcome) {
      const userName = currentUser.firstName || currentUser.email.split("@")[0];
      userWelcome.textContent = `Welcome back, ${userName}!`;
    }
  } else {
    authButton.style.display = "inline-flex";
    logoutButton.style.display = "none";
    notificationBell.style.display = "none";

    if (userWelcome) {
      userWelcome.textContent = "Ready to validate your next startup idea?";
    }
  }
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    clearUserSession();
    showPage("landing");
    showAlert("Logged out successfully!", "success");
  }
}

// Authentication Functions
function selectUserType(type) {
  currentUserType = type;

  // Update UI
  const cards = document.querySelectorAll(".user-type-card");
  cards.forEach((card) => card.classList.remove("active"));

  event.target.closest(".user-type-card").classList.add("active");

  // Show/hide relevant form fields
  const entrepreneurFields = document.getElementById("entrepreneur-fields");
  const investorFields = document.getElementById("investor-fields");

  if (type === "entrepreneur") {
    entrepreneurFields.style.display = "block";
    investorFields.style.display = "none";
  } else {
    entrepreneurFields.style.display = "none";
    investorFields.style.display = "block";
  }
}

function switchTab(tab) {
  authMode = tab;

  // Update tab buttons
  const tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  // Update form content
  const signinForm = document.getElementById("signin-form");
  const signupForm = document.getElementById("signup-form");

  if (tab === "signin") {
    signinForm.classList.add("active");
    signupForm.classList.remove("active");
  } else {
    signinForm.classList.remove("active");
    signupForm.classList.add("active");
  }
}

function sendOTP() {
  const phoneInput = document.getElementById("phone");
  const phone = phoneInput.value.trim();

  if (!phone) {
    showAlert("Please enter your phone number", "error");
    return;
  }

  // Basic phone validation
  const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
  if (!phoneRegex.test(phone)) {
    showAlert("Please enter a valid phone number", "error");
    return;
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP temporarily
  sessionStorage.setItem("generatedOTP", otp);

  // Show OTP section
  const otpSection = document.getElementById("otp-section");
  otpSection.style.display = "block";

  // Update button
  const sendButton = document.getElementById("send-otp");
  sendButton.textContent = "OTP Sent";
  sendButton.disabled = true;

  // Show OTP in alert (in production, this would be sent via SMS)
  showAlert(
    `📱 OTP sent to ${phone}\n🔐 Your OTP: ${otp}\n\n(In production, this would be sent via SMS)`,
    "info",
  );
}

function handleAuth(event) {
  event.preventDefault();
  showLoading();

  const form = event.target;
  const formData = new FormData(form);

  setTimeout(() => {
    try {
      if (authMode === "signup") {
        handleSignup(formData);
      } else {
        handleSignin(formData);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      showAlert("Authentication failed. Please try again.", "error");
    } finally {
      hideLoading();
    }
  }, 1500); // Simulate API call delay
}

function handleSignup(formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const phone = formData.get("phone");
  const otp = formData.get("otp");

  // Validation
  if (!email || !password || !firstName || !lastName) {
    showAlert("Please fill in all required fields", "error");
    return;
  }

  if (password !== confirmPassword) {
    showAlert("Passwords do not match", "error");
    return;
  }

  if (password.length < 6) {
    showAlert("Password must be at least 6 characters long", "error");
    return;
  }

  // OTP verification if phone provided
  if (phone && otp) {
    const generatedOTP = sessionStorage.getItem("generatedOTP");
    if (otp !== generatedOTP) {
      showAlert("Invalid OTP. Please check and try again.", "error");
      return;
    }
  }

  // Additional validation for investor type
  if (currentUserType === "investor") {
    const investorType = formData.get("investorType");
    if (!investorType) {
      showAlert("Please select your investor type", "error");
      return;
    }
  }

  // Create user object
  const user = {
    id: `user_${Date.now()}`,
    email,
    firstName,
    lastName,
    phone,
    userType: currentUserType,
    joinDate: new Date().toISOString(),
    planType: "Free",
    isAuthenticated: true,
    authProvider: "email",
    phoneVerified: phone && otp ? true : false,
    // Add additional fields based on user type
    ...(currentUserType === "entrepreneur"
      ? {
          experience: formData.get("experience"),
          interests: formData.get("interests"),
        }
      : {
          investorType: formData.get("investorType"),
          fundName: formData.get("fundName"),
        }),
  };

  saveUserToStorage(user);
  updateAuthUI();

  const verificationStatus =
    phone && otp ? " Your phone number has been verified!" : "";
  showAlert(
    `Account created successfully!${verificationStatus} Welcome to Drishti.`,
    "success",
  );

  // Redirect based on user type
  if (currentUserType === "investor") {
    showPage("investor-dashboard");
  } else {
    showPage("dashboard");
  }
}

function handleSignin(formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    showAlert("Please enter your email and password", "error");
    return;
  }

  // Simulate authentication (in real app, this would be an API call)
  const user = {
    id: `user_${Date.now()}`,
    email,
    firstName: email.split("@")[0],
    lastName: "User",
    userType: currentUserType,
    joinDate: new Date().toISOString(),
    planType: "Free",
    isAuthenticated: true,
    authProvider: "email",
    phoneVerified: false,
  };

  saveUserToStorage(user);
  updateAuthUI();

  showAlert("Welcome back!", "success");

  // Redirect based on user type
  if (currentUserType === "investor") {
    showPage("investor-dashboard");
  } else {
    showPage("dashboard");
  }
}

function handleSocialLogin(provider) {
  showLoading();

  setTimeout(() => {
    try {
      let userData = {};

      if (provider === "google") {
        const email =
          prompt(
            `🔗 Connecting to Google...\n\nFor demo purposes, enter your email:`,
          ) || `user${Date.now()}@gmail.com`;
        const firstName = prompt("Enter your first name:") || "Google";
        const lastName = prompt("Enter your last name:") || "User";

        userData = {
          email,
          firstName,
          lastName,
          authProvider: "google",
        };
      } else if (provider === "linkedin") {
        const email =
          prompt(
            `🔗 Connecting to LinkedIn...\n\nFor demo purposes, enter your professional email:`,
          ) || `user${Date.now()}@company.com`;
        const firstName = prompt("Enter your first name:") || "LinkedIn";
        const lastName = prompt("Enter your last name:") || "Professional";
        const company =
          prompt("Enter your company/organization:") || "Tech Company";

        userData = {
          email,
          firstName,
          lastName,
          company,
          authProvider: "linkedin",
        };
      }

      if (!userData.email || !userData.firstName || !userData.lastName) {
        return;
      }

      const user = {
        id: `${provider}_${Date.now()}`,
        ...userData,
        userType: currentUserType,
        joinDate: new Date().toISOString(),
        planType: "Free",
        isAuthenticated: true,
        phoneVerified: false,
      };

      saveUserToStorage(user);
      updateAuthUI();

      showAlert(
        `✅ Successfully signed in with ${provider}!\nWelcome ${user.firstName} ${user.lastName}!`,
        "success",
      );

      // Redirect based on user type
      if (currentUserType === "investor") {
        showPage("investor-dashboard");
      } else {
        showPage("dashboard");
      }
    } catch (error) {
      console.error("Social login error:", error);
      showAlert("Social login failed. Please try again.", "error");
    } finally {
      hideLoading();
    }
  }, 2000);
}

// Notification Functions
function loadNotifications() {
  if (!currentUser) return;

  try {
    const allNotifications = JSON.parse(
      localStorage.getItem("userNotifications") || "[]",
    );
    notifications = allNotifications.filter(
      (notif) =>
        notif.recipientId === currentUser.id ||
        notif.recipientId === currentUser.email,
    );

    updateNotificationUI();
  } catch (error) {
    console.error("Error loading notifications:", error);
  }
}

function updateNotificationUI() {
  const notificationCount = document.getElementById("notification-count");
  const notificationList = document.getElementById("notification-list");

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (unreadCount > 0) {
    notificationCount.textContent = unreadCount > 99 ? "99+" : unreadCount;
    notificationCount.style.display = "block";
  } else {
    notificationCount.style.display = "none";
  }

  // Update notification list
  if (notifications.length === 0) {
    notificationList.innerHTML =
      '<div class="no-notifications"><p>No notifications yet</p></div>';
  } else {
    notificationList.innerHTML = notifications
      .slice(0, 10)
      .map(
        (notification) => `
            <div class="notification-item ${!notification.read ? "unread" : ""}" data-id="${notification.id}">
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    ${
                      notification.type === "investment_interest" &&
                      notification.data
                        ? `
                        <div class="investment-details">
                            <div><strong>Amount:</strong> $${notification.data.investmentAmount}</div>
                            <div><strong>Investor:</strong> ${notification.data.investorName}</div>
                            ${notification.data.investorEmail ? `<div><strong>Email:</strong> <a href="mailto:${notification.data.investorEmail}">${notification.data.investorEmail}</a></div>` : ""}
                        </div>
                    `
                        : ""
                    }
                    <div class="notification-time">${formatTime(notification.createdAt)}</div>
                </div>
                <div class="notification-actions">
                    ${!notification.read ? `<button onclick="markAsRead('${notification.id}')" class="btn-small">Mark read</button>` : ""}
                    <button onclick="deleteNotification('${notification.id}')" class="btn-small delete">×</button>
                </div>
            </div>
        `,
      )
      .join("");
  }
}

function toggleNotifications() {
  const dropdown = document.getElementById("notification-dropdown");
  dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
}

function markAsRead(notificationId) {
  try {
    const allNotifications = JSON.parse(
      localStorage.getItem("userNotifications") || "[]",
    );
    const updatedNotifications = allNotifications.map((notif) =>
      notif.id === notificationId ? { ...notif, read: true } : notif,
    );

    localStorage.setItem(
      "userNotifications",
      JSON.stringify(updatedNotifications),
    );
    loadNotifications();
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}

function markAllAsRead() {
  try {
    const allNotifications = JSON.parse(
      localStorage.getItem("userNotifications") || "[]",
    );
    const updatedNotifications = allNotifications.map((notif) =>
      notif.recipientId === currentUser?.id ||
      notif.recipientId === currentUser?.email
        ? { ...notif, read: true }
        : notif,
    );

    localStorage.setItem(
      "userNotifications",
      JSON.stringify(updatedNotifications),
    );
    loadNotifications();
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
  }
}

function deleteNotification(notificationId) {
  try {
    const allNotifications = JSON.parse(
      localStorage.getItem("userNotifications") || "[]",
    );
    const updatedNotifications = allNotifications.filter(
      (notif) => notif.id !== notificationId,
    );

    localStorage.setItem(
      "userNotifications",
      JSON.stringify(updatedNotifications),
    );
    loadNotifications();
  } catch (error) {
    console.error("Error deleting notification:", error);
  }
}

// Dashboard Functions
function loadDashboard() {
  if (!currentUser) {
    showPage("auth");
    return;
  }

  const dashboardPage = document.getElementById("page-dashboard");
  if (currentUser.userType === "investor") {
    // Load investor dashboard instead
    showPage("investor-dashboard");
    return;
  }

  // Load entrepreneur dashboard with enhanced design
  const validationHistory = JSON.parse(
    localStorage.getItem(`validationHistory_${currentUser.id}`) || "[]",
  );

  const totalValidations = validationHistory.length;
  const avgScore =
    totalValidations > 0
      ? Math.round(
          validationHistory.reduce((sum, val) => sum + val.overallScore, 0) /
            totalValidations,
        )
      : 0;
  const successRate =
    totalValidations > 0
      ? Math.round(
          (validationHistory.filter((val) => val.overallScore >= 70).length /
            totalValidations) *
            100,
        )
      : 0;

  dashboardPage.innerHTML = `
    <div class="dashboard-page">
      <div class="container">
        <div class="dashboard-header">
          <div class="welcome-section">
            <h1>Welcome to Your Dashboard</h1>
            <p>Welcome back, ${currentUser.firstName || currentUser.email.split('@')[0]}!</p>
          </div>
          <div class="quick-actions">
            <button onclick="showPage('validate')" class="btn btn-primary">
              🚀 Start New Validation
            </button>
            <button onclick="showPage('features')" class="btn btn-outline">
              ✨ Explore Features
            </button>
          </div>
        </div>

        <div class="dashboard-stats">
          <div class="stat-card modern">
            <div class="stat-icon">📈</div>
            <div class="stat-content">
              <div class="stat-value">${totalValidations}</div>
              <div class="stat-label">Total Validations</div>
              <div class="stat-trend ${totalValidations > 0 ? 'positive' : 'neutral'}">
                ${totalValidations > 0 ? '+' + totalValidations + ' this month' : 'Get started today'}
              </div>
            </div>
          </div>

          <div class="stat-card modern">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <div class="stat-value">${avgScore}</div>
              <div class="stat-label">Average Score</div>
              <div class="stat-trend ${avgScore >= 70 ? 'positive' : avgScore >= 50 ? 'warning' : 'neutral'}">
                ${avgScore >= 70 ? 'Excellent performance' : avgScore >= 50 ? 'Good progress' : 'Start validating'}
              </div>
            </div>
          </div>

          <div class="stat-card modern">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
              <div class="stat-value">${successRate}%</div>
              <div class="stat-label">Success Rate</div>
              <div class="stat-trend ${successRate >= 60 ? 'positive' : successRate >= 30 ? 'warning' : 'neutral'}">
                ${successRate >= 60 ? 'Great success rate' : successRate >= 30 ? 'Keep improving' : 'Start your journey'}
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard-content">
          <div class="dashboard-section">
            <div class="section-header">
              <h2>Recent Validations</h2>
              <button onclick="showPage('results')" class="btn btn-secondary btn-small">View All</button>
            </div>
            <div class="validation-list modern">
              ${totalValidations === 0 ? `
                <div class="no-data-modern">
                  <div class="no-data-icon">🚀</div>
                  <h3>Ready to validate your first idea?</h3>
                  <p>Start your entrepreneurial journey by validating your startup concept with our AI-powered analysis.</p>
                  <button onclick="showPage('validate')" class="btn btn-primary">Start First Validation</button>
                </div>
              ` : validationHistory.slice(0, 5).map(validation => `
                <div class="validation-item modern" onclick="loadValidationDetail('${validation.id}')">
                  <div class="validation-icon">
                    ${getValidationIcon(validation.overallScore)}
                  </div>
                  <div class="validation-content">
                    <div class="validation-title">${validation.ideaName}</div>
                    <div class="validation-meta">
                      <span class="validation-date">${formatTime(validation.validatedAt)}</span>
                      <span class="validation-stage badge">${validation.stage || "Idea"}</span>
                    </div>
                  </div>
                  <div class="validation-score-circle ${getScoreClass(validation.overallScore)}">
                    <span class="score-value">${validation.overallScore}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="dashboard-section">
            <div class="section-header">
              <h2>Quick Tools</h2>
            </div>
            <div class="tools-grid">
              <div class="tool-card" onclick="showCompetitorAnalysis()">
                <div class="tool-icon">🏆</div>
                <h3>Competitor Analysis</h3>
                <p>Analyze top 5 competitors and find your differentiation</p>
              </div>
              <div class="tool-card" onclick="showPitchGenerator()">
                <div class="tool-icon">🎤</div>
                <h3>AI Pitch Generator</h3>
                <p>Generate compelling pitches with AI assistance</p>
              </div>
              <div class="tool-card" onclick="showMonetizationFinder()">
                <div class="tool-icon">💰</div>
                <h3>Monetization Finder</h3>
                <p>Discover revenue models for your business</p>
              </div>
              <div class="tool-card" onclick="showPitchDeckGenerator()">
                <div class="tool-icon">📊</div>
                <h3>Pitch Deck Builder</h3>
                <p>Create professional pitch decks automatically</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Initialize any charts or dynamic content
  setTimeout(() => {
    initializeDashboardCharts();
  }, 100);
}

function loadDashboardStats() {
  try {
    const history = JSON.parse(
      localStorage.getItem(`validationHistory_${currentUser.id}`) || "[]",
    );

    const totalValidations = history.length;
    const avgScore =
      totalValidations > 0
        ? Math.round(
            history.reduce((sum, val) => sum + val.overallScore, 0) /
              totalValidations,
          )
        : 0;
    const successRate =
      totalValidations > 0
        ? Math.round(
            (history.filter((val) => val.overallScore >= 70).length /
              totalValidations) *
              100,
          )
        : 0;

    document.getElementById("total-validations").textContent = totalValidations;
    document.getElementById("avg-score").textContent = avgScore;
    document.getElementById("success-rate").textContent = `${successRate}%`;
  } catch (error) {
    console.error("Error loading dashboard stats:", error);
  }
}

function loadValidationHistory() {
  try {
    const history = JSON.parse(
      localStorage.getItem(`validationHistory_${currentUser.id}`) || "[]",
    );
    const historyContainer = document.getElementById("validation-history");

    if (history.length === 0) {
      historyContainer.innerHTML =
        '<div class="no-data"><p>No validations yet. <a href="#" onclick="showPage(\'validate\')">Start your first validation</a></p></div>';
      return;
    }

    historyContainer.innerHTML = history
      .slice(0, 5)
      .map(
        (item) => `
            <div class="validation-item">
                <div class="validation-info">
                    <h4>${item.ideaName}</h4>
                    <p>Score: ${item.overallScore}/100 • ${item.viabilityLevel}</p>
                    <span class="validation-date">${formatDate(item.validatedAt)}</span>
                </div>
                <div class="validation-actions">
                    <button onclick="viewValidation('${item.id}')" class="btn btn-outline btn-small">View</button>
                </div>
            </div>
        `,
      )
      .join("");
  } catch (error) {
    console.error("Error loading validation history:", error);
  }
}

function loadInvestorDashboard() {
  if (!currentUser || currentUser.userType !== "investor") {
    showPage("auth");
    return;
  }

  loadPublicStartups();
}

function loadPublicStartups() {
  try {
    const publicStartups = JSON.parse(
      localStorage.getItem("publicStartupIdeas") || "[]",
    );
    const startupsContainer = document.getElementById("public-startups");

    if (publicStartups.length === 0) {
      startupsContainer.innerHTML =
        '<div class="no-data"><p>No public startup opportunities available at this time.</p></div>';
      return;
    }

    startupsContainer.innerHTML = publicStartups
      .map(
        (startup) => `
            <div class="startup-card">
                <div class="startup-header">
                    <h3>${startup.ideaName}</h3>
                    <div class="startup-score">${startup.validationScore}/100</div>
                </div>
                <p class="startup-description">${startup.description}</p>
                <div class="startup-meta">
                    <span class="startup-industry">${startup.industry}</span>
                    <span class="startup-stage">${startup.stage}</span>
                </div>
                <div class="startup-actions">
                    <button onclick="viewStartupDetails('${startup.id}')" class="btn btn-outline">View Details</button>
                    <button onclick="showInvestmentAction('${startup.id}')" class="btn btn-primary">Invest</button>
                </div>
            </div>
        `,
      )
      .join("");
  } catch (error) {
    console.error("Error loading public startups:", error);
  }
}

// Contact Details Modal Functions
function showContactModal() {
  const modal = document.getElementById("contact-details-modal");
  modal.style.display = "flex";

  // Pre-fill form if user data exists
  if (currentUser) {
    document.getElementById("contact-fullName").value =
      `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById("contact-email").value = currentUser.email;
    if (currentUser.phone) {
      document.getElementById("contact-phone").value = currentUser.phone;
    }
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = "none";
}

function saveContactDetails(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const contactDetails = {
    fullName: formData.get("fullName"),
    title: formData.get("title"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    company: formData.get("company"),
    website: formData.get("website"),
    shareDetails: formData.get("shareDetails") === "on",
    marketingConsent: formData.get("marketingConsent") === "on",
  };

  // Save to user profile
  if (currentUser) {
    currentUser.contactDetails = contactDetails;
    saveUserToStorage(currentUser);
  }

  closeModal("contact-details-modal");
  showAlert("Contact details saved successfully!", "success");

  // Handle making startup public if this was triggered by visibility change
  makeStartupPublic();
}

function makeStartupPublic() {
  // This would be called when user wants to make their startup visible to investors
  // Implementation would depend on the validation results being available
  showAlert("Your startup is now visible to investors!", "success");
}

// Utility Functions
function showLoading() {
  const loadingScreen = document.getElementById("loading-screen");
  loadingScreen.style.display = "flex";
}

function hideLoading() {
  const loadingScreen = document.getElementById("loading-screen");
  loadingScreen.style.display = "none";
}

function showAlert(message, type = "info") {
  // Create alert element
  const alert = document.createElement("div");
  alert.className = `alert alert-${type}`;
  alert.textContent = message;

  // Add to page
  const main = document.getElementById("main-content");
  main.insertBefore(alert, main.firstChild);

  // Remove after 5 seconds
  setTimeout(() => {
    if (alert.parentNode) {
      alert.parentNode.removeChild(alert);
    }
  }, 5000);
}

function formatTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

// Page Loading Functions
function loadValidationPage() {
  // This will be implemented in validate.js
  if (!document.getElementById("validation-form")) {
    loadValidationContent();
  }
}

function loadValidationContent() {
  const validatePage = document.getElementById("page-validate");
  validatePage.innerHTML = `
        <div class="container">
            <div class="validation-header">
                <h1>Validate Your Startup Idea</h1>
                <p>Get comprehensive AI-powered insights about your startup's potential</p>
            </div>
            <div class="validation-form-container">
                <form id="validation-form" onsubmit="handleValidation(event)">
                    <div class="form-section">
                        <h3>Basic Information</h3>
                        <div class="form-group">
                            <label for="startup-title">Startup Name/Title *</label>
                            <input type="text" id="startup-title" name="startupTitle" required>
                        </div>
                        <div class="form-group">
                            <label for="problem-statement">Problem Statement *</label>
                            <textarea id="problem-statement" name="problemStatement" required 
                                placeholder="Describe the problem your startup solves..."></textarea>
                        </div>
                        <div class="form-group">
                            <label for="solution-description">Solution Description *</label>
                            <textarea id="solution-description" name="solutionDescription" required
                                placeholder="Describe your solution in detail..."></textarea>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>Market Information</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="target-market">Target Market *</label>
                                <input type="text" id="target-market" name="targetMarket" required>
                            </div>
                            <div class="form-group">
                                <label for="market-size">Market Size</label>
                                <select id="market-size" name="marketSize">
                                    <option value="">Select market size</option>
                                    <option value="small">Small (< $100M)</option>
                                    <option value="medium">Medium ($100M - $1B)</option>
                                    <option value="large">Large (> $1B)</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="customer-segments">Customer Segments</label>
                            <textarea id="customer-segments" name="customerSegments"
                                placeholder="Describe your target customer segments..."></textarea>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>Business Model</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="revenue-model">Revenue Model</label>
                                <select id="revenue-model" name="revenueModel">
                                    <option value="">Select revenue model</option>
                                    <option value="subscription">Subscription</option>
                                    <option value="one-time">One-time purchase</option>
                                    <option value="freemium">Freemium</option>
                                    <option value="marketplace">Marketplace</option>
                                    <option value="advertising">Advertising</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="current-stage">Current Stage</label>
                                <select id="current-stage" name="currentStage">
                                    <option value="">Select current stage</option>
                                    <option value="idea">Idea</option>
                                    <option value="mvp">MVP/Prototype</option>
                                    <option value="beta">Beta Testing</option>
                                    <option value="launched">Launched</option>
                                    <option value="growth">Growth Stage</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" onclick="showPage('dashboard')" class="btn btn-outline">Cancel</button>
                        <button type="submit" class="btn btn-primary">Validate Startup</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Force white styling after DOM is updated
    setTimeout(() => {
        forceValidationFormWhite();
        if (typeof initializeAutoSave === 'function') {
            initializeAutoSave();
        }
    }, 100);
}

function forceValidationFormWhite() {
    const container = document.querySelector('.validation-form-container');
    const form = document.getElementById('validation-form');

    if (container) {
        container.style.backgroundColor = 'white';
        container.style.color = '#1a202c';
    }

    if (form) {
        const inputs = form.querySelectorAll('input, select, textarea, label, h3');
        inputs.forEach(input => {
            if (input.tagName === 'INPUT' || input.tagName === 'SELECT' || input.tagName === 'TEXTAREA') {
                input.style.backgroundColor = 'white';
                input.style.color = '#1a202c';
            } else {
                input.style.color = '#1a202c';
            }
        });
    }
}

function loadResultsPage() {
  const resultsStr = localStorage.getItem("validationResults");
  const dataStr = localStorage.getItem("validationData");

  if (!resultsStr || !dataStr) {
    showAlert(
      "No validation results found. Please run a validation first.",
      "warning",
    );
    showPage("validate");
    return;
  }

  validationResults = JSON.parse(resultsStr);
  validationData = JSON.parse(dataStr);

  loadResultsContent();
}

function loadResultsContent() {
  const resultsPage = document.getElementById("page-results");
  resultsPage.innerHTML = `
        <div class="container">
            <div class="results-header">
                <h1>Validation Results</h1>
                <p>Comprehensive analysis of your startup idea</p>
            </div>
            
            <div class="results-summary">
                <div class="score-card main-score">
                    <div class="score-value">${validationResults.overall_score}</div>
                    <div class="score-label">Overall Score</div>
                </div>
                <div class="score-info">
                    <h3>${validationData.startupTitle}</h3>
                    <p><strong>Viability Level:</strong> ${validationResults.viability_level}</p>
                    <p><strong>Validation Date:</strong> ${formatDate(new Date().toISOString())}</p>
                </div>
            </div>
            
            <div class="results-actions">
                <button onclick="generatePitchDeck()" class="btn btn-primary">Generate Pitch Deck</button>
                <button onclick="generateSWOTAnalysis()" class="btn btn-outline">SWOT Analysis</button>
                <button onclick="showPage('founder-readiness')" class="btn btn-outline">Founder Readiness</button>
                <button onclick="showContactModal()" class="btn btn-secondary">Make Public</button>
            </div>
            
            <div class="results-details">
                <h2>Detailed Breakdown</h2>
                <div class="score-breakdown">
                    ${validationResults.scores
                      .map(
                        (score) => `
                        <div class="score-item">
                            <div class="score-category">${score.category}</div>
                            <div class="score-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${score.score}%"></div>
                                </div>
                                <div class="score-number">${score.score}/100</div>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
            
            <div class="results-recommendations">
                <h2>Recommendations</h2>
                <div class="recommendations-list">
                    ${validationResults.recommendations
                      .map(
                        (rec) => `
                        <div class="recommendation-item">
                            <h4>${rec.category}</h4>
                            <p>${rec.recommendation}</p>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        </div>
    `;
}

function loadFounderReadinessPage() {
  const foundernessPage = document.getElementById("page-founder-readiness");
  foundernessPage.innerHTML = `
        <div class="container">
            <div class="founder-readiness-header">
                <h1>Founder Readiness Assessment</h1>
                <p>Comprehensive evaluation of your entrepreneurial capabilities</p>
            </div>
            <div class="assessment-content">
                <div class="loading-message">
                    <div class="loading-spinner"></div>
                    <p>Generating your founder readiness assessment...</p>
                </div>
            </div>
        </div>
    `;

  // Simulate assessment generation
  setTimeout(() => {
    generateFounderReadinessContent();
  }, 2000);
}

function generateFounderReadinessContent() {
  const assessment = {
    overall_score: 78,
    categories: {
      entrepreneurial_mindset: 85,
      technical_skills: 72,
      business_acumen: 80,
      leadership_ability: 75,
      financial_management: 70,
      network_connections: 68,
    },
    strengths: [
      "Strong entrepreneurial vision and passion",
      "Good technical foundation",
      "Effective communication skills",
      "Market awareness and customer focus",
    ],
    improvement_areas: [
      "Financial planning and management",
      "Professional networking",
      "Team building and delegation",
      "Strategic partnerships",
    ],
    recommendations: [
      "Enroll in financial management courses",
      "Join entrepreneur networking groups",
      "Seek mentorship from experienced founders",
      "Develop strategic partnership skills",
    ],
  };

  const foundernessPage = document.getElementById("page-founder-readiness");
  foundernessPage.innerHTML = `
        <div class="container">
            <div class="founder-readiness-header">
                <h1>Founder Readiness Assessment</h1>
                <p>Comprehensive evaluation of your entrepreneurial capabilities</p>
            </div>
            
            <div class="overall-score-section">
                <div class="score-card main-score">
                    <div class="score-value">${assessment.overall_score}</div>
                    <div class="score-label">Overall Readiness Score</div>
                </div>
            </div>
            
            <div class="category-breakdown">
                <h2>Category Assessment</h2>
                <div class="categories-grid">
                    ${Object.entries(assessment.categories)
                      .map(([key, score]) => {
                        const categoryNames = {
                          entrepreneurial_mindset: "Entrepreneurial Mindset",
                          technical_skills: "Technical Skills",
                          business_acumen: "Business Acumen",
                          leadership_ability: "Leadership Ability",
                          financial_management: "Financial Management",
                          network_connections: "Network & Connections",
                        };
                        return `
                            <div class="category-card">
                                <h4>${categoryNames[key]}</h4>
                                <div class="score-display">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${score}%"></div>
                                    </div>
                                    <span class="score-number">${score}%</span>
                                </div>
                            </div>
                        `;
                      })
                      .join("")}
                </div>
            </div>
            
            <div class="assessment-details">
                <div class="assessment-section">
                    <h3>Key Strengths</h3>
                    <div class="strengths-list">
                        ${assessment.strengths
                          .map(
                            (strength) => `
                            <div class="strength-item">✅ ${strength}</div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
                
                <div class="assessment-section">
                    <h3>Areas for Improvement</h3>
                    <div class="improvements-list">
                        ${assessment.improvement_areas
                          .map(
                            (area) => `
                            <div class="improvement-item">📈 ${area}</div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
                
                <div class="assessment-section">
                    <h3>Strategic Recommendations</h3>
                    <div class="recommendations-list">
                        ${assessment.recommendations
                          .map(
                            (rec, index) => `
                            <div class="recommendation-item">
                                <span class="rec-number">${index + 1}</span>
                                <span class="rec-text">${rec}</span>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
            </div>
            
            <div class="assessment-actions">
                <button onclick="exportFounderReport()" class="btn btn-primary">Export Report</button>
                <button onclick="showPage('results')" class="btn btn-outline">Back to Results</button>
            </div>
        </div>
    `;
}

function loadFeaturesPage() {
  const featuresPage = document.getElementById("page-features");
  featuresPage.innerHTML = `
        <div class="features-page">
            <div class="container">
                <div class="features-hero">
                    <div class="badge">🚀 Comprehensive Platform</div>
                    <h1>Powerful Features for Startup Success</h1>
                    <p>Everything you need to validate, analyze, and launch your startup with confidence</p>
                </div>

                <div class="features-main-grid">
                    <div class="feature-showcase">
                        <div class="feature-showcase-icon">🤖</div>
                        <div class="feature-showcase-content">
                            <h2>AI-Powered Analysis</h2>
                            <p>Advanced machine learning algorithms analyze your startup idea across 15+ dimensions, providing insights that would take months of manual research.</p>
                            <ul class="feature-benefits">
                                <li>Natural language processing for idea assessment</li>
                                <li>Market sentiment analysis</li>
                                <li>Competitive landscape mapping</li>
                                <li>Risk assessment algorithms</li>
                            </ul>
                        </div>
                    </div>

                    <div class="feature-showcase">
                        <div class="feature-showcase-icon">📊</div>
                        <div class="feature-showcase-content">
                            <h2>Comprehensive Scoring System</h2>
                            <p>Multi-dimensional scoring framework that evaluates your startup across critical success factors with transparent methodology.</p>
                            <ul class="feature-benefits">
                                <li>Problem-solution fit analysis</li>
                                <li>Market opportunity assessment</li>
                                <li>Business model viability</li>
                                <li>Team strength evaluation</li>
                            </ul>
                        </div>
                    </div>

                    <div class="feature-showcase">
                        <div class="feature-showcase-icon">💡</div>
                        <div class="feature-showcase-content">
                            <h2>Actionable Recommendations</h2>
                            <p>Receive personalized, step-by-step guidance based on your specific startup challenges and market conditions.</p>
                            <ul class="feature-benefits">
                                <li>Strategic roadmap creation</li>
                                <li>Priority action items</li>
                                <li>Resource recommendations</li>
                                <li>Risk mitigation strategies</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">🎯</div>
                        <h3>Market Analysis</h3>
                        <p>Deep market research, size estimation, and trend analysis to understand your opportunity.</p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon">🏆</div>
                        <h3>Competitive Intelligence</h3>
                        <p>Comprehensive competitor analysis and positioning strategies to find your unique advantage.</p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon">💰</div>
                        <h3>Financial Modeling</h3>
                        <p>Revenue projections, cost analysis, and business model validation with scenario planning.</p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon">👥</div>
                        <h3>Team Assessment</h3>
                        <p>Founder readiness evaluation and team capability analysis for execution success.</p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon">📈</div>
                        <h3>Growth Potential</h3>
                        <p>Scalability analysis and growth trajectory forecasting with market expansion insights.</p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon">🔄</div>
                        <h3>Real-time Updates</h3>
                        <p>Live market data integration and continuous validation updates as conditions change.</p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon">📋</div>
                        <h3>Export & Reports</h3>
                        <p>Professional pitch decks, investor reports, and detailed analysis exports in multiple formats.</p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon">🌐</div>
                        <h3>Investor Matching</h3>
                        <p>Connect with relevant investors based on your industry, stage, and funding requirements.</p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon">🔍</div>
                        <h3>SWOT Analysis</h3>
                        <p>Automated strengths, weaknesses, opportunities, and threats analysis for strategic planning.</p>
                    </div>
                </div>

                <div class="features-cta">
                    <div class="cta-content">
                        <h2>Ready to Experience These Features?</h2>
                        <p>Start your free validation today and see how our comprehensive platform can accelerate your startup journey.</p>
                        <div class="cta-buttons">
                            <button onclick="showPage('validate')" class="btn btn-primary btn-large">
                                Start Free Validation
                            </button>
                            <button onclick="showDemoModal()" class="btn btn-outline btn-large">
                                Watch Demo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadPricingPage() {
  const pricingPage = document.getElementById("page-pricing");
  pricingPage.innerHTML = `
        <div class="pricing-page">
            <div class="container">
                <div class="pricing-hero">
                    <div class="badge">💰 Flexible Pricing</div>
                    <h1>Choose Your Success Plan</h1>
                    <p>Transparent pricing designed to grow with your startup journey. No hidden fees, cancel anytime.</p>
                </div>

                <div class="pricing-cards">
                    <div class="pricing-card">
                        <h3>Starter</h3>
                        <div class="price">$0<span class="period">/month</span></div>
                        <p class="plan-description">Perfect for exploring your first startup idea</p>
                        <ul>
                            <li>1 validation per month</li>
                            <li>Basic AI analysis</li>
                            <li>Essential scoring metrics</li>
                            <li>Email support</li>
                            <li>Community access</li>
                        </ul>
                        <button onclick="showPage('auth')" class="btn btn-outline">Get Started Free</button>
                    </div>

                    <div class="pricing-card featured">
                        <h3>Professional</h3>
                        <div class="price">$29<span class="period">/month</span></div>
                        <p class="plan-description">Ideal for serious entrepreneurs and early-stage startups</p>
                        <ul>
                            <li>Unlimited validations</li>
                            <li>Advanced AI analysis</li>
                            <li>Comprehensive scoring</li>
                            <li>SWOT analysis</li>
                            <li>Pitch deck generation</li>
                            <li>Export capabilities</li>
                            <li>Priority support</li>
                            <li>Investor matching</li>
                        </ul>
                        <button onclick="showAlert('Pro plan coming soon!', 'info')" class="btn btn-primary">Upgrade to Pro</button>
                    </div>

                    <div class="pricing-card">
                        <h3>Enterprise</h3>
                        <div class="price">$99<span class="period">/month</span></div>
                        <p class="plan-description">For teams, accelerators, and established companies</p>
                        <ul>
                            <li>Everything in Professional</li>
                            <li>Team collaboration</li>
                            <li>Multiple project management</li>
                            <li>Custom branding</li>
                            <li>API access</li>
                            <li>Dedicated support</li>
                            <li>Custom integrations</li>
                            <li>Training sessions</li>
                        </ul>
                        <button onclick="showAlert('Enterprise plan coming soon!', 'info')" class="btn btn-secondary">Contact Sales</button>
                    </div>
                </div>

                <div class="pricing-features">
                    <div class="features-comparison">
                        <h2>Why Choose Drishti?</h2>
                        <div class="comparison-grid">
                            <div class="comparison-item">
                                <div class="comparison-icon">🎯</div>
                                <h4>Accurate Analysis</h4>
                                <p>95% accuracy rate validated by successful startup outcomes</p>
                            </div>
                            <div class="comparison-item">
                                <div class="comparison-icon">⚡</div>
                                <h4>Lightning Fast</h4>
                                <p>Get comprehensive validation results in under 3 minutes</p>
                            </div>
                            <div class="comparison-item">
                                <div class="comparison-icon">🔒</div>
                                <h4>Secure & Private</h4>
                                <p>Your ideas are protected with enterprise-grade security</p>
                            </div>
                            <div class="comparison-item">
                                <div class="comparison-icon">🌟</div>
                                <h4>Proven Results</h4>
                                <p>500+ successful startups validated and $2M+ in funding secured</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pricing-faq">
                    <h2>Frequently Asked Questions</h2>
                    <div class="faq-grid">
                        <div class="faq-item">
                            <h4>Can I change plans anytime?</h4>
                            <p>Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
                        </div>
                        <div class="faq-item">
                            <h4>Is there a free trial?</h4>
                            <p>Our Starter plan is completely free with no time limit. Upgrade when you're ready for more features.</p>
                        </div>
                        <div class="faq-item">
                            <h4>What payment methods do you accept?</h4>
                            <p>We accept all major credit cards, PayPal, and bank transfers for enterprise plans.</p>
                        </div>
                        <div class="faq-item">
                            <h4>Do you offer refunds?</h4>
                            <p>Yes, we offer a 30-day money-back guarantee on all paid plans, no questions asked.</p>
                        </div>
                    </div>
                </div>

                <div class="pricing-cta">
                    <div class="cta-content">
                        <h2>Ready to Validate Your Startup?</h2>
                        <p>Join thousands of entrepreneurs who trust Drishti for their startup validation needs.</p>
                        <div class="cta-buttons">
                            <button onclick="showPage('validate')" class="btn btn-primary btn-large">
                                Start Free Validation
                            </button>
                            <button onclick="showDemoModal()" class="btn btn-outline btn-large">
                                Watch Demo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadAboutPage() {
  const aboutPage = document.getElementById("page-about");
  aboutPage.innerHTML = `
        <div class="about-page">
            <div class="container">
                <div class="about-hero">
                    <div class="badge">🌟 Our Story</div>
                    <h1>Empowering Entrepreneurs Worldwide</h1>
                    <p>We're on a mission to democratize startup success through AI-powered validation and insights.</p>
                </div>

                <div class="about-content">
                    <div class="about-section">
                        <h2>🎯 Our Mission</h2>
                        <p>To help entrepreneurs validate their startup ideas and increase their chances of success through advanced AI analysis and comprehensive market research. We believe that every great idea deserves a fair chance to succeed, and our platform provides the tools and insights needed to turn ideas into thriving businesses.</p>
                        <p>Founded by entrepreneurs for entrepreneurs, we understand the challenges of building a startup from the ground up. That's why we've created a platform that combines cutting-edge technology with practical business wisdom to guide you through the validation process.</p>
                    </div>

                    <div class="about-section">
                        <h2>🚀 How Drishti Works</h2>
                        <p>Our platform uses advanced machine learning algorithms to analyze your startup idea across 15+ critical dimensions including market potential, competitive landscape, financial viability, and execution readiness. Here's how we make it happen:</p>
                        <div class="process-steps">
                            <div class="step-item">
                                <div class="step-number">1</div>
                                <div class="step-content">
                                    <h4>Idea Submission</h4>
                                    <p>Share your startup concept through our comprehensive questionnaire</p>
                                </div>
                            </div>
                            <div class="step-item">
                                <div class="step-number">2</div>
                                <div class="step-content">
                                    <h4>AI Analysis</h4>
                                    <p>Our algorithms analyze market data, competition, and business model viability</p>
                                </div>
                            </div>
                            <div class="step-item">
                                <div class="step-number">3</div>
                                <div class="step-content">
                                    <h4>Insights & Recommendations</h4>
                                    <p>Receive detailed scores, analysis, and actionable next steps</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="about-section">
                        <h2>👥 Meet Our Team</h2>
                        <p>We're a diverse team of entrepreneurs, engineers, and business experts passionate about helping startups succeed.</p>
                        <div class="team-grid">
                            <div class="team-member">
                                <div class="member-avatar">👨‍💻</div>
                                <div class="member-name">Alex Thompson</div>
                                <div class="member-role">CEO & Co-founder</div>
                            </div>
                            <div class="team-member">
                                <div class="member-avatar">👩‍🔬</div>
                                <div class="member-name">Dr. Sarah Chen</div>
                                <div class="member-role">CTO & AI Lead</div>
                            </div>
                            <div class="team-member">
                                <div class="member-avatar">👨‍📊</div>
                                <div class="member-name">Michael Rodriguez</div>
                                <div class="member-role">Head of Business Development</div>
                            </div>
                            <div class="team-member">
                                <div class="member-avatar">👩‍💼</div>
                                <div class="member-name">Emma Wilson</div>
                                <div class="member-role">Head of Product</div>
                            </div>
                        </div>
                    </div>

                    <div class="about-section">
                        <h2>💎 Our Values</h2>
                        <p>These core values guide everything we do and shape our commitment to helping entrepreneurs succeed.</p>
                        <div class="values-grid">
                            <div class="value-item">
                                <span class="value-icon">🎯</span>
                                <h4>Accuracy First</h4>
                                <p>We're committed to providing the most accurate and reliable startup validation insights in the industry.</p>
                            </div>
                            <div class="value-item">
                                <span class="value-icon">🚀</span>
                                <h4>Innovation</h4>
                                <p>We continuously push the boundaries of what's possible with AI and machine learning for business validation.</p>
                            </div>
                            <div class="value-item">
                                <span class="value-icon">🤝</span>
                                <h4>Transparency</h4>
                                <p>We believe in clear, honest communication and transparent methodologies in all our analyses.</p>
                            </div>
                            <div class="value-item">
                                <span class="value-icon">🌟</span>
                                <h4>Empowerment</h4>
                                <p>We empower entrepreneurs with the tools and knowledge they need to make informed decisions.</p>
                            </div>
                        </div>
                    </div>

                    <div class="about-section">
                        <h2>📈 Our Impact</h2>
                        <p>Since our launch, we've helped thousands of entrepreneurs validate their ideas and achieve remarkable success.</p>
                        <div class="impact-stats">
                            <div class="stat-highlight">
                                <div class="stat-number">500+</div>
                                <div class="stat-label">Startups Validated</div>
                            </div>
                            <div class="stat-highlight">
                                <div class="stat-number">95%</div>
                                <div class="stat-label">Accuracy Rate</div>
                            </div>
                            <div class="stat-highlight">
                                <div class="stat-number">$2M+</div>
                                <div class="stat-label">Funding Secured</div>
                            </div>
                            <div class="stat-highlight">
                                <div class="stat-number">50+</div>
                                <div class="stat-label">Countries Served</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="about-cta">
                    <div class="cta-content">
                        <h2>Ready to Validate Your Idea?</h2>
                        <p>Join the community of successful entrepreneurs who trust Drishti for their startup validation needs.</p>
                        <div class="cta-buttons">
                            <button onclick="showPage('validate')" class="btn btn-primary btn-large">
                                Start Your Validation
                            </button>
                            <button onclick="showPage('auth')" class="btn btn-outline btn-large">
                                Create Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Close dropdowns when clicking outside
document.addEventListener("click", function (event) {
  const notificationDropdown = document.getElementById("notification-dropdown");
  const notificationBell = document.getElementById("notification-bell");

  if (!notificationBell.contains(event.target)) {
    notificationDropdown.style.display = "none";
  }
});

// Handle validation form submission
function handleValidation(event) {
  event.preventDefault();
  showLoading();

  const form = event.target;
  const formData = new FormData(form);

  const data = {
    startupTitle: formData.get("startupTitle"),
    problemStatement: formData.get("problemStatement"),
    solutionDescription: formData.get("solutionDescription"),
    targetMarket: formData.get("targetMarket"),
    marketSize: formData.get("marketSize"),
    customerSegments: formData.get("customerSegments"),
    revenueModel: formData.get("revenueModel"),
    currentStage: formData.get("currentStage"),
  };

  // Simulate API call
  setTimeout(() => {
    const results = generateMockValidationResults(data);

    localStorage.setItem("validationData", JSON.stringify(data));
    localStorage.setItem("validationResults", JSON.stringify(results));

    // Save to user history
    saveValidationToHistory(results, data);

    hideLoading();
    showAlert("Validation completed successfully!", "success");
    showPage("results");
  }, 3000);
}

function generateMockValidationResults(data) {
  // Generate realistic validation results based on input
  const baseScore = 60 + Math.random() * 30; // Random score between 60-90

  return {
    overall_score: Math.round(baseScore),
    viability_level:
      baseScore > 80 ? "High" : baseScore > 65 ? "Medium" : "Low",
    scores: [
      {
        category: "Problem-Solution Fit",
        score: Math.round(baseScore + (Math.random() - 0.5) * 20),
      },
      {
        category: "Market Opportunity",
        score: Math.round(baseScore + (Math.random() - 0.5) * 20),
      },
      {
        category: "Business Model",
        score: Math.round(baseScore + (Math.random() - 0.5) * 20),
      },
      {
        category: "Competitive Advantage",
        score: Math.round(baseScore + (Math.random() - 0.5) * 20),
      },
      {
        category: "Team Strength",
        score: Math.round(baseScore + (Math.random() - 0.5) * 20),
      },
      {
        category: "Execution Readiness",
        score: Math.round(baseScore + (Math.random() - 0.5) * 20),
      },
    ],
    recommendations: [
      {
        category: "Market Research",
        recommendation:
          "Conduct deeper customer interviews to validate problem-solution fit",
      },
      {
        category: "Business Model",
        recommendation: "Test different pricing models with early customers",
      },
      {
        category: "Competition",
        recommendation:
          "Analyze competitor strategies and identify differentiation opportunities",
      },
      {
        category: "Team",
        recommendation:
          "Consider adding expertise in marketing and business development",
      },
    ],
  };
}

function saveValidationToHistory(results, data) {
  if (!currentUser) return;

  try {
    const historyItem = {
      id: `val_${Date.now()}`,
      ideaName:
        data.startupTitle ||
        data.problemStatement?.substring(0, 50) + "..." ||
        "Unnamed Idea",
      validatedAt: new Date().toISOString(),
      overallScore: results.overall_score,
      viabilityLevel: results.viability_level,
      status: "completed",
      validationData: data,
      validationResults: results,
    };

    const existingHistory = JSON.parse(
      localStorage.getItem(`validationHistory_${currentUser.id}`) || "[]",
    );
    existingHistory.unshift(historyItem); // Add to beginning

    // Keep only last 10 validations
    if (existingHistory.length > 10) {
      existingHistory.splice(10);
    }

    localStorage.setItem(
      `validationHistory_${currentUser.id}`,
      JSON.stringify(existingHistory),
    );
  } catch (error) {
    console.error("Error saving validation to history:", error);
  }
}

// Export functions
function generatePitchDeck() {
  showAlert("Generating pitch deck...", "info");
  // Implementation would generate and download pitch deck
  setTimeout(() => {
    showAlert("Pitch deck generated successfully!", "success");
  }, 2000);
}

function generateSWOTAnalysis() {
  showAlert("Generating SWOT analysis...", "info");
  // Implementation would generate and display SWOT analysis
  setTimeout(() => {
    showAlert("SWOT analysis generated successfully!", "success");
  }, 2000);
}

function exportFounderReport() {
  showAlert("Exporting founder readiness report...", "info");
  // Implementation would generate and download report
  setTimeout(() => {
    showAlert("Report exported successfully!", "success");
  }, 1500);
}

// Demo Modal Functions
function showDemoModal() {
  const modal = document.getElementById("demo-modal");
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}

function startInteractiveDemo() {
  // Close the modal first
  closeModal("demo-modal");

  // Show a demo version of the validation page
  showAlert("Starting interactive demo...", "info");

  // Navigate to validation page with demo data
  setTimeout(() => {
    showPage("validate");
    loadDemoData();
  }, 1000);
}

function loadDemoData() {
  // Auto-fill the validation form with demo data
  setTimeout(() => {
    const form = document.getElementById("validation-form");
    if (form) {
      const startupTitle = form.querySelector('[name="startupTitle"]');
      const problemStatement = form.querySelector('[name="problemStatement"]');
      const solutionDescription = form.querySelector('[name="solutionDescription"]');
      const targetMarket = form.querySelector('[name="targetMarket"]');
      const marketSize = form.querySelector('[name="marketSize"]');
      const revenueModel = form.querySelector('[name="revenueModel"]');
      const currentStage = form.querySelector('[name="currentStage"]');

      if (startupTitle) startupTitle.value = "EcoClean Solutions";
      if (problemStatement) problemStatement.value = "Traditional cleaning products contain harmful chemicals that damage the environment and pose health risks to users. Many eco-friendly alternatives are either expensive or ineffective, leaving consumers with limited sustainable options.";
      if (solutionDescription) solutionDescription.value = "EcoClean Solutions offers biodegradable, plant-based cleaning products that are both environmentally safe and highly effective. Our products use innovative natural formulations that clean as well as traditional chemicals without the environmental impact.";
      if (targetMarket) targetMarket.value = "Environmentally conscious households and businesses";
      if (marketSize) marketSize.value = "large";
      if (revenueModel) revenueModel.value = "subscription";
      if (currentStage) currentStage.value = "mvp";

      showAlert("Demo data loaded! Feel free to modify the inputs and submit for validation.", "success");
    }
  }, 500);
}

// Initialize auth page
function initializeAuthPage() {
  // Reset any auth-related states
  authMode = "signin";
  currentUserType = "entrepreneur";

  // Update user type selection UI if needed
  const userTypeCards = document.querySelectorAll(".user-type-card");
  userTypeCards.forEach(card => {
    card.classList.remove("active");
    if (card.onclick.toString().includes("entrepreneur")) {
      card.classList.add("active");
    }
  });

  // Ensure the signin tab is active
  switchTab("signin");
}

// Close modal when clicking outside
window.addEventListener("click", function(event) {
  const modals = document.querySelectorAll(".modal");
  modals.forEach(modal => {
    if (event.target === modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });
});
