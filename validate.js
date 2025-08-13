// Validation specific JavaScript functions

let validationFormData = {};
let isAutoSaving = false;

// Form auto-save functionality
function initializeAutoSave() {
  const form = document.getElementById("validation-form");
  if (!form) return;

  const inputs = form.querySelectorAll("input, textarea, select");

  inputs.forEach((input) => {
    input.addEventListener(
      "input",
      debounce(() => {
        autoSaveForm();
      }, 1000),
    );

    input.addEventListener("blur", () => {
      autoSaveForm();
    });
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function autoSaveForm() {
  if (isAutoSaving) return;

  const form = document.getElementById("validation-form");
  if (!form) return;

  isAutoSaving = true;
  showAutoSaveStatus("saving");

  const formData = new FormData(form);
  const data = {};

  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }

  // Save to localStorage
  localStorage.setItem(
    "validationFormDraft",
    JSON.stringify({
      data,
      timestamp: new Date().toISOString(),
    }),
  );

  setTimeout(() => {
    showAutoSaveStatus("saved");
    isAutoSaving = false;

    setTimeout(() => {
      hideAutoSaveStatus();
    }, 2000);
  }, 500);
}

function loadFormDraft() {
  const draft = localStorage.getItem("validationFormDraft");
  if (!draft) return;

  try {
    const { data, timestamp } = JSON.parse(draft);
    const draftAge =
      (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60); // hours

    // Don't load drafts older than 24 hours
    if (draftAge > 24) {
      localStorage.removeItem("validationFormDraft");
      return;
    }

    const form = document.getElementById("validation-form");
    if (!form) return;

    Object.entries(data).forEach(([key, value]) => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input && value) {
        input.value = value;
      }
    });

    showAlert("Draft loaded successfully!", "info");
  } catch (error) {
    console.error("Error loading form draft:", error);
  }
}

function showAutoSaveStatus(status) {
  let statusDiv = document.getElementById("auto-save-status");

  if (!statusDiv) {
    statusDiv = document.createElement("div");
    statusDiv.id = "auto-save-status";
    statusDiv.className = "auto-save-status";
    document.body.appendChild(statusDiv);
  }

  statusDiv.className = `auto-save-status ${status} show`;

  switch (status) {
    case "saving":
      statusDiv.innerHTML = "💾 Saving draft...";
      break;
    case "saved":
      statusDiv.innerHTML = "✅ Draft saved";
      break;
    case "error":
      statusDiv.innerHTML = "❌ Save failed";
      break;
  }
}

function hideAutoSaveStatus() {
  const statusDiv = document.getElementById("auto-save-status");
  if (statusDiv) {
    statusDiv.classList.remove("show");
  }
}

function validateValidationForm() {
  const form = document.getElementById("validation-form");
  if (!form) return false;

  const requiredFields = [
    { name: "startupTitle", label: "Startup Name/Title" },
    { name: "problemStatement", label: "Problem Statement" },
    { name: "solutionDescription", label: "Solution Description" },
    { name: "targetMarket", label: "Target Market" },
  ];

  let isValid = true;

  requiredFields.forEach((field) => {
    const input = form.querySelector(`[name="${field.name}"]`);
    if (!input || !input.value.trim()) {
      addValidationFeedback(input, false, `${field.label} is required`);
      isValid = false;
      if (!input.closest(".form-group").querySelector(".field-error")) {
        input.focus();
      }
    } else {
      addValidationFeedback(input, true, "");
    }
  });

  // Additional validation rules
  const problemStatement = form.querySelector('[name="problemStatement"]');
  if (problemStatement && problemStatement.value.trim().length < 50) {
    addValidationFeedback(
      problemStatement,
      false,
      "Problem statement should be at least 50 characters",
    );
    isValid = false;
  }

  const solutionDescription = form.querySelector(
    '[name="solutionDescription"]',
  );
  if (solutionDescription && solutionDescription.value.trim().length < 50) {
    addValidationFeedback(
      solutionDescription,
      false,
      "Solution description should be at least 50 characters",
    );
    isValid = false;
  }

  return isValid;
}

function handleValidation(event) {
  event.preventDefault();

  if (!currentUser) {
    showAlert("Please sign in to validate your startup idea", "error");
    showPage("auth");
    return;
  }

  if (!validateValidationForm()) {
    showAlert("Please fill in all required fields correctly", "error");
    return;
  }

  showLoading();

  const form = event.target;
  const formData = new FormData(form);

  const data = {
    startupTitle: formData.get("startupTitle"),
    problemStatement: formData.get("problemStatement"),
    solutionDescription: formData.get("solutionDescription"),
    targetMarket: formData.get("targetMarket"),
    marketSize: formData.get("marketSize") || "medium",
    customerSegments: formData.get("customerSegments") || "",
    revenueModel: formData.get("revenueModel") || "subscription",
    currentStage: formData.get("currentStage") || "idea",
  };

  // Clear draft after successful submission
  localStorage.removeItem("validationFormDraft");

  // Simulate API call with realistic delay
  setTimeout(() => {
    try {
      const results = generateValidationResults(data);

      localStorage.setItem("validationData", JSON.stringify(data));
      localStorage.setItem("validationResults", JSON.stringify(results));

      // Save to user history
      saveValidationToHistory(results, data);

      hideLoading();
      showAlert("Validation completed successfully!", "success");
      showPage("results");
    } catch (error) {
      console.error("Validation error:", error);
      hideLoading();
      showAlert("Validation failed. Please try again.", "error");
    }
  }, 3000);
}

function generateValidationResults(data) {
  // Enhanced validation algorithm based on multiple factors
  let baseScore = 50;

  // Problem statement analysis
  const problemLength = data.problemStatement.length;
  const problemComplexity = analyzeTextComplexity(data.problemStatement);
  baseScore += Math.min(problemLength / 20, 15); // Up to 15 points for length
  baseScore += problemComplexity * 5; // Up to 10 points for complexity

  // Solution analysis
  const solutionLength = data.solutionDescription.length;
  const solutionComplexity = analyzeTextComplexity(data.solutionDescription);
  baseScore += Math.min(solutionLength / 20, 15); // Up to 15 points for length
  baseScore += solutionComplexity * 5; // Up to 10 points for complexity

  // Market factors
  const marketSizeMultiplier = {
    small: 0.8,
    medium: 1.0,
    large: 1.2,
  };
  baseScore *= marketSizeMultiplier[data.marketSize] || 1.0;

  // Stage bonus
  const stageBonus = {
    idea: 0,
    mvp: 5,
    beta: 10,
    launched: 15,
    growth: 20,
  };
  baseScore += stageBonus[data.currentStage] || 0;

  // Ensure score is within bounds
  const finalScore = Math.max(30, Math.min(95, Math.round(baseScore)));

  // Generate category scores based on overall score
  const scores = generateCategoryScores(finalScore, data);

  // Determine viability level
  let viabilityLevel;
  if (finalScore >= 80) viabilityLevel = "High";
  else if (finalScore >= 65) viabilityLevel = "Medium";
  else if (finalScore >= 50) viabilityLevel = "Low";
  else viabilityLevel = "Very Low";

  // Generate recommendations
  const recommendations = generateRecommendations(scores, data);

  return {
    overall_score: finalScore,
    viability_level: viabilityLevel,
    scores: scores,
    recommendations: recommendations,
    analysis: {
      problem_quality: Math.round(
        (problemLength / 20 + problemComplexity * 5) * 5,
      ),
      solution_quality: Math.round(
        (solutionLength / 20 + solutionComplexity * 5) * 5,
      ),
      market_potential: Math.round(
        baseScore * marketSizeMultiplier[data.marketSize] * 0.3,
      ),
      execution_readiness: stageBonus[data.currentStage] || 0,
    },
  };
}

function analyzeTextComplexity(text) {
  if (!text) return 0;

  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).length;
  const avgWordsPerSentence = words / sentences;

  // Simple complexity score based on length and structure
  let complexity = 0;
  if (words > 50) complexity += 0.5;
  if (words > 100) complexity += 0.5;
  if (avgWordsPerSentence > 15) complexity += 0.5;
  if (
    text.includes("innovative") ||
    text.includes("unique") ||
    text.includes("revolutionary")
  )
    complexity += 0.5;

  return Math.min(2, complexity);
}

function generateCategoryScores(overallScore, data) {
  const variance = 15; // Allow some variance in category scores

  return [
    {
      category: "Problem-Solution Fit",
      score: Math.max(
        20,
        Math.min(100, overallScore + (Math.random() - 0.5) * variance),
      ),
    },
    {
      category: "Market Opportunity",
      score: Math.max(
        20,
        Math.min(100, overallScore + (Math.random() - 0.5) * variance),
      ),
    },
    {
      category: "Business Model",
      score: Math.max(
        20,
        Math.min(100, overallScore + (Math.random() - 0.5) * variance),
      ),
    },
    {
      category: "Competitive Advantage",
      score: Math.max(
        20,
        Math.min(100, overallScore + (Math.random() - 0.5) * variance),
      ),
    },
    {
      category: "Team Strength",
      score: Math.max(
        20,
        Math.min(100, overallScore + (Math.random() - 0.5) * variance),
      ),
    },
    {
      category: "Execution Readiness",
      score: Math.max(
        20,
        Math.min(100, overallScore + (Math.random() - 0.5) * variance),
      ),
    },
  ].map((item) => ({ ...item, score: Math.round(item.score) }));
}

function generateRecommendations(scores, data) {
  const recommendations = [];

  // Problem-Solution Fit recommendations
  const problemSolutionScore =
    scores.find((s) => s.category === "Problem-Solution Fit")?.score || 0;
  if (problemSolutionScore < 70) {
    recommendations.push({
      category: "Problem-Solution Fit",
      recommendation:
        "Conduct deeper customer interviews to validate that your solution truly addresses the core problem. Consider creating user personas and journey maps.",
    });
  }

  // Market Opportunity recommendations
  const marketScore =
    scores.find((s) => s.category === "Market Opportunity")?.score || 0;
  if (marketScore < 70) {
    recommendations.push({
      category: "Market Research",
      recommendation:
        "Expand your market research to include competitor analysis, market size validation, and customer willingness to pay studies.",
    });
  }

  // Business Model recommendations
  const businessScore =
    scores.find((s) => s.category === "Business Model")?.score || 0;
  if (businessScore < 70) {
    recommendations.push({
      category: "Business Model",
      recommendation:
        "Test different pricing models and revenue streams with early customers. Consider creating a detailed financial projection model.",
    });
  }

  // Competitive Advantage recommendations
  const competitiveScore =
    scores.find((s) => s.category === "Competitive Advantage")?.score || 0;
  if (competitiveScore < 70) {
    recommendations.push({
      category: "Competitive Strategy",
      recommendation:
        "Identify and strengthen your unique value proposition. Analyze competitor strategies and find opportunities for differentiation.",
    });
  }

  // Team recommendations
  const teamScore =
    scores.find((s) => s.category === "Team Strength")?.score || 0;
  if (teamScore < 70) {
    recommendations.push({
      category: "Team Building",
      recommendation:
        "Consider adding team members with complementary skills, especially in areas like marketing, business development, or technical expertise.",
    });
  }

  // Execution recommendations
  const executionScore =
    scores.find((s) => s.category === "Execution Readiness")?.score || 0;
  if (executionScore < 70) {
    recommendations.push({
      category: "Execution",
      recommendation:
        "Develop a detailed go-to-market strategy and implementation roadmap. Consider starting with an MVP to test market response.",
    });
  }

  // Add general recommendations based on current stage
  if (data.currentStage === "idea") {
    recommendations.push({
      category: "Next Steps",
      recommendation:
        "Focus on validating your assumptions through customer interviews and creating a minimum viable product (MVP) to test market demand.",
    });
  }

  return recommendations;
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
      category: extractCategory(data),
      stage: data.currentStage || "idea",
      keyMetrics: {
        problemSolutionFit:
          results.scores?.find((s) => s.category.includes("Problem"))?.score ||
          0,
        marketOpportunity:
          results.scores?.find((s) => s.category.includes("Market"))?.score ||
          0,
        businessModel:
          results.scores?.find((s) => s.category.includes("Business"))?.score ||
          0,
        competition:
          results.scores?.find((s) => s.category.includes("Competitive"))
            ?.score || 0,
        teamStrength:
          results.scores?.find((s) => s.category.includes("Team"))?.score || 0,
        executionReadiness:
          results.scores?.find((s) => s.category.includes("Execution"))
            ?.score || 0,
      },
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

function extractCategory(data) {
  const text = (
    data.problemStatement +
    " " +
    data.solutionDescription +
    " " +
    data.targetMarket
  ).toLowerCase();

  if (
    text.includes("healthcare") ||
    text.includes("medical") ||
    text.includes("health")
  )
    return "HealthTech";
  if (
    text.includes("education") ||
    text.includes("learning") ||
    text.includes("teach")
  )
    return "EdTech";
  if (
    text.includes("finance") ||
    text.includes("payment") ||
    text.includes("bank")
  )
    return "FinTech";
  if (
    text.includes("food") ||
    text.includes("restaurant") ||
    text.includes("delivery")
  )
    return "FoodTech";
  if (
    text.includes("ai") ||
    text.includes("machine learning") ||
    text.includes("artificial intelligence")
  )
    return "AI/ML";
  if (
    text.includes("environment") ||
    text.includes("sustainable") ||
    text.includes("green")
  )
    return "ClimaTech";
  if (
    text.includes("ecommerce") ||
    text.includes("e-commerce") ||
    text.includes("retail")
  )
    return "E-commerce";
  if (
    text.includes("social") ||
    text.includes("community") ||
    text.includes("network")
  )
    return "Social";
  if (
    text.includes("mobile") ||
    text.includes("app") ||
    text.includes("software")
  )
    return "Mobile/Software";

  return "Technology";
}

// Character count for textareas
function setupCharacterCount() {
  const textareas = document.querySelectorAll("textarea");

  textareas.forEach((textarea) => {
    const maxLength = textarea.getAttribute("maxlength") || 1000;

    // Create character count element
    const countDiv = document.createElement("div");
    countDiv.className = "char-count";
    countDiv.textContent = `0/${maxLength}`;

    textarea.parentNode.appendChild(countDiv);

    textarea.addEventListener("input", () => {
      const currentLength = textarea.value.length;
      countDiv.textContent = `${currentLength}/${maxLength}`;

      // Add warning/error classes
      countDiv.className = "char-count";
      if (currentLength > maxLength * 0.9) {
        countDiv.classList.add("warning");
      }
      if (currentLength >= maxLength) {
        countDiv.classList.add("error");
      }
    });
  });
}

// Progress tracking
function updateValidationProgress() {
  const form = document.getElementById("validation-form");
  if (!form) return;

  const requiredFields = form.querySelectorAll(
    "input[required], textarea[required], select[required]",
  );
  const filledFields = Array.from(requiredFields).filter(
    (field) => field.value.trim() !== "",
  );

  const progress = (filledFields.length / requiredFields.length) * 100;

  let progressDiv = document.querySelector(".validation-progress");
  if (!progressDiv) {
    progressDiv = document.createElement("div");
    progressDiv.className = "validation-progress";
    progressDiv.innerHTML = `
            <div class="progress-text">
                <span>Form Progress</span>
                <span id="progress-percentage">0%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" id="progress-fill"></div>
            </div>
        `;
    form.insertBefore(progressDiv, form.firstChild);
  }

  const progressFill = document.getElementById("progress-fill");
  const progressPercentage = document.getElementById("progress-percentage");

  if (progressFill && progressPercentage) {
    progressFill.style.width = `${progress}%`;
    progressPercentage.textContent = `${Math.round(progress)}%`;
  }
}

// Initialize validation page functionality
function initializeValidationPage() {
  setTimeout(() => {
    initializeAutoSave();
    setupCharacterCount();
    loadFormDraft();

    // Set up progress tracking
    const form = document.getElementById("validation-form");
    if (form) {
      const inputs = form.querySelectorAll("input, textarea, select");
      inputs.forEach((input) => {
        input.addEventListener("input", updateValidationProgress);
        input.addEventListener("change", updateValidationProgress);
      });
      updateValidationProgress();
    }
  }, 100);
}

// Call initialization when validation page is loaded
document.addEventListener("DOMContentLoaded", function () {
  if (window.location.hash === "#validate") {
    initializeValidationPage();
  }
});
