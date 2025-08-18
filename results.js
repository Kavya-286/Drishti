// Results page specific JavaScript functions

let currentValidationResults = null;
let currentValidationData = null;

function initializeResultsPage() {
  loadValidationResults();
  setupResultsEventListeners();
}

function loadValidationResults() {
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

  try {
    currentValidationResults = JSON.parse(resultsStr);
    currentValidationData = JSON.parse(dataStr);
    renderResults();
  } catch (error) {
    console.error("Error loading validation results:", error);
    showAlert("Error loading validation results. Please try again.", "error");
    showPage("validate");
  }
}

function renderResults() {
  if (!currentValidationResults || !currentValidationData) return;

  const resultsPage = document.getElementById("page-results");
  resultsPage.innerHTML = `
        <div class="results-page">
            <div class="container">
                <div class="results-header">
                    <h1>Validation Results</h1>
                    <p>Comprehensive analysis of ${currentValidationData.startupTitle || "your startup idea"}</p>
                </div>

                <div class="results-summary modern">
                    <div class="score-visualization">
                        <div class="pie-chart-container">
                            <canvas id="scoreChart" width="200" height="200"></canvas>
                            <div class="score-center">
                                <div class="score-value">${currentValidationResults.overall_score}</div>
                                <div class="score-label">Overall Score</div>
                            </div>
                        </div>
                    </div>
                    <div class="score-info">
                        <h3>${currentValidationData.startupTitle || "Your Startup Idea"}</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Viability Level:</span>
                                <span class="info-value ${currentValidationResults.viability_level.toLowerCase()}">${currentValidationResults.viability_level}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Market Size:</span>
                                <span class="info-value">${currentValidationData.marketSize || "Medium"}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Current Stage:</span>
                                <span class="info-value">${currentValidationData.currentStage || "Idea"}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Validation Date:</span>
                                <span class="info-value">${formatDate(new Date().toISOString())}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="results-actions modern">
                    <button onclick="generatePitchDeck()" class="btn btn-primary">
                        📊 Generate Pitch Deck
                    </button>
                    <button onclick="generateSWOTAnalysis()" class="btn btn-outline">
                        🎯 SWOT Analysis
                    </button>
                    <button onclick="showPage('founder-readiness')" class="btn btn-outline">
                        👨‍💼 Founder Readiness
                    </button>
                    <button onclick="generateCompetitorSnapshot()" class="btn btn-outline">
                        🏆 Competitor Snapshot
                    </button>
                    <button onclick="generateMonetizationPath()" class="btn btn-outline">
                        💰 Monetization Path
                    </button>
                    <button onclick="handleMakePublic()" class="btn btn-secondary">
                        🌐 Make Public to Investors
                    </button>
                </div>

                <div class="results-content">
                    <div class="results-tabs">
                        <button class="tab-button active" onclick="switchResultsTab('scores')">
                            📈 Score Breakdown
                        </button>
                        <button class="tab-button" onclick="switchResultsTab('analysis')">
                            🔍 Analysis Summary
                        </button>
                        <button class="tab-button" onclick="switchResultsTab('recommendations')">
                            💡 Strategic Recommendations
                        </button>
                    </div>

                    <div class="tab-content active" id="scores-tab">
                        <div class="results-details">
                            <h2>Detailed Score Breakdown</h2>
                            <div class="score-breakdown modern">
                                ${currentValidationResults.scores
                                  .map(
                                    (score) => `
                                    <div class="score-item modern">
                                        <div class="score-header">
                                            <div class="score-category">${score.category}</div>
                                            <div class="score-number">${score.score}/100</div>
                                        </div>
                                        <div class="score-progress">
                                            <div class="progress-bar">
                                                <div class="progress-fill ${getScoreClass(score.score)}" style="width: ${score.score}%"></div>
                                            </div>
                                        </div>
                                        <div class="score-description">
                                            ${getScoreDescription(score.category, score.score)}
                                        </div>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </div>
                    </div>

                    <div class="tab-content" id="analysis-tab">
                        ${
                          currentValidationResults.analysis
                            ? `
                            <div class="analysis-summary modern">
                                <h2>Analysis Summary</h2>
                    <div class="analysis-grid">
                        <div class="analysis-item">
                            <h4>Problem Quality</h4>
                            <div class="analysis-score">${currentValidationResults.analysis.problem_quality}/100</div>
                        </div>
                        <div class="analysis-item">
                            <h4>Solution Quality</h4>
                            <div class="analysis-score">${currentValidationResults.analysis.solution_quality}/100</div>
                        </div>
                        <div class="analysis-item">
                            <h4>Market Potential</h4>
                            <div class="analysis-score">${Math.round(currentValidationResults.analysis.market_potential)}/100</div>
                        </div>
                        <div class="analysis-item">
                            <h4>Execution Readiness</h4>
                            <div class="analysis-score">${currentValidationResults.analysis.execution_readiness}/100</div>
                        </div>
                    </div>
                </div>
            `
                            : ""
                        }
            
            <div class="results-recommendations">
                <h2>Strategic Recommendations</h2>
                <div class="recommendations-list">
                    ${currentValidationResults.recommendations
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
            
            <div class="export-actions">
                <h4>Export & Share Options</h4>
                <button onclick="exportValidationReport()" class="btn btn-outline">
                    📄 Export Report
                </button>
                <button onclick="shareResults()" class="btn btn-outline">
                    📤 Share Results
                </button>
                <button onclick="emailResults()" class="btn btn-outline">
                    📧 Email Report
                </button>
            </div>
        </div>
    `;

  // Animate progress bars
  setTimeout(() => {
    const progressFills = document.querySelectorAll(".progress-fill");
    progressFills.forEach((fill) => {
      const width = fill.style.width;
      fill.style.width = "0%";
      setTimeout(() => {
        fill.style.width = width;
      }, 100);
    });
  }, 300);
}

function setupResultsEventListeners() {
  // Add any additional event listeners for results page
}

function generatePitchDeck() {
  if (!currentValidationResults || !currentValidationData) {
    showAlert("No validation data available", "error");
    return;
  }

  showLoading();

  setTimeout(() => {
    try {
      const pitchDeckContent = createPitchDeckHTML();

      // Open in new window for printing/saving
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(pitchDeckContent);
        printWindow.document.close();

        // Auto-print after content loads
        setTimeout(() => {
          printWindow.print();
        }, 1000);
      }

      hideLoading();
      showAlert("Pitch deck generated successfully!", "success");
    } catch (error) {
      console.error("Error generating pitch deck:", error);
      hideLoading();
      showAlert("Error generating pitch deck. Please try again.", "error");
    }
  }, 2000);
}

function createPitchDeckHTML() {
  return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${currentValidationData.startupTitle || "Startup"} - Investor Pitch Deck</title>
            <style>
                body { 
                    font-family: 'Segoe UI', system-ui, sans-serif; 
                    margin: 0; 
                    padding: 20px; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: #2d3748;
                }
                .slide { 
                    background: white; 
                    padding: 60px 40px; 
                    margin: 30px auto; 
                    min-height: 600px; 
                    max-width: 900px;
                    border-radius: 12px; 
                    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
                    page-break-after: always;
                    position: relative;
                    overflow: hidden;
                }
                .slide::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 6px;
                    background: linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4);
                }
                .slide h1 { 
                    color: #1a202c; 
                    font-size: 42px; 
                    margin-bottom: 24px; 
                    font-weight: 700;
                    line-height: 1.2;
                }
                .slide h2 { 
                    color: #4a5568; 
                    font-size: 32px; 
                    margin-bottom: 20px; 
                    font-weight: 600;
                }
                .slide h3 {
                    color: #6366f1;
                    font-size: 24px;
                    margin-bottom: 16px;
                    font-weight: 600;
                }
                .slide p { 
                    font-size: 18px; 
                    line-height: 1.7; 
                    color: #4a5568; 
                    margin-bottom: 16px;
                }
                .highlight { 
                    background: linear-gradient(135deg, #6366f1, #8b5cf6); 
                    color: white; 
                    padding: 24px; 
                    border-radius: 12px; 
                    margin: 24px 0;
                    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
                }
                .center { text-align: center; }
                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin: 30px 0;
                }
                .metric-card {
                    background: #f8fafc;
                    padding: 20px;
                    border-radius: 8px;
                    border-left: 4px solid #6366f1;
                    text-align: center;
                }
                .metric-value {
                    font-size: 28px;
                    font-weight: 700;
                    color: #6366f1;
                    margin-bottom: 8px;
                }
                .metric-label {
                    font-size: 14px;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .logo-placeholder {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    border-radius: 50%;
                    margin: 0 auto 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 32px;
                    font-weight: bold;
                }
                .slide-footer {
                    position: absolute;
                    bottom: 20px;
                    right: 30px;
                    font-size: 12px;
                    color: #94a3b8;
                }
                ul { 
                    padding-left: 24px; 
                    line-height: 1.8;
                }
                ul li {
                    margin-bottom: 8px;
                    font-size: 16px;
                }
            </style>
        </head>
        <body>
            <!-- SLIDE 1: TITLE -->
            <div class="slide center">
                <div class="logo-placeholder">${(currentValidationData.startupTitle || "S").charAt(0).toUpperCase()}</div>
                <h1>${currentValidationData.startupTitle || "Revolutionary Startup"}</h1>
                <p style="font-size: 28px; color: #6366f1; font-weight: 600;">Transforming Industries with Innovation</p>
                <div class="highlight">
                    <div class="metrics-grid">
                        <div>
                            <div class="metric-value">${currentValidationResults.overall_score}/100</div>
                            <div class="metric-label" style="color: rgba(255,255,255,0.9);">Validation Score</div>
                        </div>
                        <div>
                            <div class="metric-value">${currentValidationResults.viability_level}</div>
                            <div class="metric-label" style="color: rgba(255,255,255,0.9);">Viability Level</div>
                        </div>
                        <div>
                            <div class="metric-value">${currentValidationData.currentStage || "Early"}</div>
                            <div class="metric-label" style="color: rgba(255,255,255,0.9);">Current Stage</div>
                        </div>
                    </div>
                </div>
                <p style="font-size: 16px; color: #64748b; margin-top: 40px;">Generated on ${new Date().toLocaleDateString()}</p>
                <div class="slide-footer">Slide 1 of 5</div>
            </div>

            <!-- SLIDE 2: PROBLEM STATEMENT -->
            <div class="slide">
                <h1>🔍 The Problem</h1>
                <h2>Market Challenge We're Addressing</h2>
                <div style="background: #fef2f2; padding: 24px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 24px 0;">
                    <p style="font-size: 20px; font-weight: 500; color: #dc2626;">${currentValidationData.problemStatement}</p>
                </div>
                
                <h3>Problem Impact Analysis</h3>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${currentValidationData.marketSize || "Medium"}</div>
                        <div class="metric-label">Market Size</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">High</div>
                        <div class="metric-label">Impact Level</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">Daily</div>
                        <div class="metric-label">Frequency</div>
                    </div>
                </div>
                <div class="slide-footer">Slide 2 of 5</div>
            </div>

            <!-- SLIDE 3: SOLUTION -->
            <div class="slide">
                <h1>💡 Our Solution</h1>
                <h2>How We Solve the Problem</h2>
                <div style="background: #f0fdf4; padding: 24px; border-radius: 8px; border-left: 4px solid #22c55e; margin: 24px 0;">
                    <p style="font-size: 20px; font-weight: 500; color: #16a34a;">${currentValidationData.solutionDescription}</p>
                </div>

                <h3>Target Market</h3>
                <p><strong>Primary Target:</strong> ${currentValidationData.targetMarket}</p>
                ${currentValidationData.customerSegments ? `<p><strong>Customer Segments:</strong> ${currentValidationData.customerSegments}</p>` : ""}

                <div class="highlight">
                    <h3 style="color: white; margin-bottom: 16px;">Unique Value Proposition</h3>
                    <p style="font-size: 18px; margin: 0;">First-to-market solution with superior technology and user experience</p>
                </div>
                <div class="slide-footer">Slide 3 of 5</div>
            </div>

            <!-- SLIDE 4: VALIDATION RESULTS -->
            <div class="slide">
                <h1>📊 Validation Results</h1>
                <h2>AI-Powered Analysis Summary</h2>
                
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${currentValidationResults.overall_score}</div>
                        <div class="metric-label">Overall Score</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${currentValidationResults.viability_level}</div>
                        <div class="metric-label">Viability Level</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${currentValidationData.currentStage || "Idea"}</div>
                        <div class="metric-label">Current Stage</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${currentValidationData.revenueModel || "Subscription"}</div>
                        <div class="metric-label">Revenue Model</div>
                    </div>
                </div>

                <h3>Category Breakdown</h3>
                ${currentValidationResults.scores
                  .map(
                    (score) => `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin: 12px 0; padding: 8px; background: #f8fafc; border-radius: 6px;">
                        <span style="font-weight: 500;">${score.category}</span>
                        <span style="font-weight: 700; color: #6366f1;">${score.score}/100</span>
                    </div>
                `,
                  )
                  .join("")}
                <div class="slide-footer">Slide 4 of 5</div>
            </div>

            <!-- SLIDE 5: NEXT STEPS -->
            <div class="slide center">
                <h1>🚀 Next Steps</h1>
                <h2>Strategic Recommendations</h2>
                
                <div style="margin: 40px 0;">
                    <div class="logo-placeholder">${(currentValidationData.startupTitle || "S").charAt(0).toUpperCase()}</div>
                    <h3 style="font-size: 32px; color: #6366f1; margin: 20px 0;">${currentValidationData.startupTitle || "Your Startup"}</h3>
                </div>

                <div style="background: linear-gradient(135deg, #f8fafc, #e2e8f0); padding: 30px; border-radius: 12px; margin: 30px 0;">
                    <h3 style="color: #1a202c; margin-bottom: 20px;">Key Recommendations</h3>
                    <ul style="text-align: left; display: inline-block;">
                        ${currentValidationResults.recommendations
                          .slice(0, 4)
                          .map(
                            (rec) => `
                            <li>${rec.recommendation}</li>
                        `,
                          )
                          .join("")}
                    </ul>
                </div>

                <div style="margin-top: 50px;">
                    <h3 style="color: #6366f1;">Ready to Move Forward?</h3>
                    <p style="font-size: 18px; color: #4a5568;">Continue building with confidence using data-driven insights</p>
                    <p style="font-size: 16px; color: #64748b; margin-top: 30px;">Generated by Drishti AI • ${new Date().toLocaleDateString()}</p>
                </div>
                <div class="slide-footer">Slide 5 of 5</div>
            </div>
        </body>
        </html>
    `;
}

function generateSWOTAnalysis() {
  if (!currentValidationResults || !currentValidationData) {
    showAlert("No validation data available", "error");
    return;
  }

  showLoading();

  setTimeout(() => {
    try {
      const swotData = generateSWOTData();
      const swotHTML = createSWOTHTML(swotData);

      // Open in new window
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(swotHTML);
        printWindow.document.close();

        setTimeout(() => {
          printWindow.print();
        }, 1000);
      }

      hideLoading();
      showAlert("SWOT analysis generated successfully!", "success");
    } catch (error) {
      console.error("Error generating SWOT analysis:", error);
      hideLoading();
      showAlert("Error generating SWOT analysis. Please try again.", "error");
    }
  }, 2000);
}

function generateSWOTData() {
  const scores = currentValidationResults.scores;
  const data = currentValidationData;

  // Generate SWOT based on scores and data
  const swot = {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
  };

  // Strengths based on high scores
  scores.forEach((score) => {
    if (score.score >= 75) {
      switch (score.category) {
        case "Problem-Solution Fit":
          swot.strengths.push(
            "Strong problem-solution alignment with clear value proposition",
          );
          break;
        case "Market Opportunity":
          swot.strengths.push("Large addressable market with validated demand");
          break;
        case "Business Model":
          swot.strengths.push("Robust and scalable business model");
          break;
        case "Competitive Advantage":
          swot.strengths.push("Clear differentiation from existing solutions");
          break;
        case "Team Strength":
          swot.strengths.push("Experienced team with relevant expertise");
          break;
        case "Execution Readiness":
          swot.strengths.push("Well-prepared for market execution");
          break;
      }
    }
  });

  // Weaknesses based on low scores
  scores.forEach((score) => {
    if (score.score < 60) {
      switch (score.category) {
        case "Problem-Solution Fit":
          swot.weaknesses.push(
            "Need to validate problem-solution fit more thoroughly",
          );
          break;
        case "Market Opportunity":
          swot.weaknesses.push(
            "Market opportunity requires further validation",
          );
          break;
        case "Business Model":
          swot.weaknesses.push("Business model needs refinement and testing");
          break;
        case "Competitive Advantage":
          swot.weaknesses.push("Competitive positioning could be strengthened");
          break;
        case "Team Strength":
          swot.weaknesses.push(
            "Team may need additional expertise in key areas",
          );
          break;
        case "Execution Readiness":
          swot.weaknesses.push("Execution strategy requires development");
          break;
      }
    }
  });

  // General opportunities
  swot.opportunities = [
    "Growing market demand for innovative solutions",
    "Technology advancement enabling new approaches",
    "Increasing customer awareness and adoption",
    "Potential for strategic partnerships",
    "Opportunity to establish market leadership",
  ];

  // General threats
  swot.threats = [
    "Competitive landscape with established players",
    "Changing market conditions and customer preferences",
    "Technology disruption from new entrants",
    "Regulatory changes affecting the industry",
    "Economic factors impacting customer spending",
  ];

  return swot;
}

function createSWOTHTML(swotData) {
  return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${currentValidationData.startupTitle || "Startup"} - SWOT Analysis</title>
            <style>
                body { 
                    font-family: 'Segoe UI', system-ui, sans-serif; 
                    margin: 40px; 
                    background: #f8fafc;
                    color: #2d3748;
                }
                .header {
                    text-align: center;
                    background: white;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    margin-bottom: 40px;
                }
                .swot-container {
                    background: white;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    margin-bottom: 30px;
                }
                .swot-grid { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 30px; 
                    margin: 40px 0; 
                }
                .swot-section { 
                    padding: 24px; 
                    border-radius: 12px; 
                    min-height: 250px;
                    position: relative;
                    overflow: hidden;
                }
                .swot-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                }
                .strengths { 
                    background: linear-gradient(135deg, #ecfdf5, #f0fdf4); 
                    border: 2px solid #22c55e;
                }
                .strengths::before { background: #22c55e; }
                .weaknesses { 
                    background: linear-gradient(135deg, #fef2f2, #fef7f7); 
                    border: 2px solid #ef4444;
                }
                .weaknesses::before { background: #ef4444; }
                .opportunities { 
                    background: linear-gradient(135deg, #eff6ff, #f0f9ff); 
                    border: 2px solid #3b82f6;
                }
                .opportunities::before { background: #3b82f6; }
                .threats { 
                    background: linear-gradient(135deg, #fefce8, #fffbeb); 
                    border: 2px solid #f59e0b;
                }
                .threats::before { background: #f59e0b; }
                h1 { 
                    color: #1a202c; 
                    font-size: 36px;
                    margin-bottom: 16px;
                    font-weight: 700;
                }
                h2 { 
                    margin-top: 0; 
                    font-size: 24px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                ul { 
                    padding-left: 24px; 
                    line-height: 1.8;
                }
                ul li {
                    margin-bottom: 12px;
                    font-size: 16px;
                    line-height: 1.6;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📊 SWOT Analysis Report</h1>
                <h3>${currentValidationData.startupTitle || "Startup Idea"}</h3>
                <p style="color: #64748b; margin: 0;">Generated on ${new Date().toLocaleDateString()} • Strategic Analysis</p>
            </div>

            <div class="swot-container">
                <h2>🎯 Strategic SWOT Matrix</h2>
                <p style="color: #64748b; margin-bottom: 30px;">Comprehensive analysis of internal strengths & weaknesses and external opportunities & threats</p>
                
                <div class="swot-grid">
                    <div class="swot-section strengths">
                        <h2>💪 Strengths</h2>
                        <ul>
                            ${swotData.strengths.map((item) => `<li>${item}</li>`).join("")}
                        </ul>
                    </div>

                    <div class="swot-section weaknesses">
                        <h2>⚠️ Weaknesses</h2>
                        <ul>
                            ${swotData.weaknesses.map((item) => `<li>${item}</li>`).join("")}
                        </ul>
                    </div>

                    <div class="swot-section opportunities">
                        <h2>🚀 Opportunities</h2>
                        <ul>
                            ${swotData.opportunities.map((item) => `<li>${item}</li>`).join("")}
                        </ul>
                    </div>

                    <div class="swot-section threats">
                        <h2>⚡ Threats</h2>
                        <ul>
                            ${swotData.threats.map((item) => `<li>${item}</li>`).join("")}
                        </ul>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}

function handleMakePublic() {
  if (!currentUser) {
    showAlert("Please sign in to make your startup public", "error");
    showPage("auth");
    return;
  }

  if (!currentUser.contactDetails) {
    showContactModal();
    return;
  }

  makeStartupPublic();
}

function makeStartupPublic() {
  if (!currentValidationResults || !currentValidationData) {
    showAlert("No validation data to publish", "error");
    return;
  }

  showLoading();

  setTimeout(() => {
    try {
      const publicStartup = {
        id: `startup_${Date.now()}`,
        ideaName: currentValidationData.startupTitle,
        description: currentValidationData.problemStatement,
        solution: currentValidationData.solutionDescription,
        targetMarket: currentValidationData.targetMarket,
        industry: extractCategory(currentValidationData),
        stage: currentValidationData.currentStage || "idea",
        validationScore: currentValidationResults.overall_score,
        viabilityLevel: currentValidationResults.viability_level,
        revenueModel: currentValidationData.revenueModel,
        marketSize: currentValidationData.marketSize,
        founder: {
          id: currentUser.id,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email,
          contactDetails: currentUser.contactDetails,
        },
        publishedAt: new Date().toISOString(),
        validationData: currentValidationData,
        validationResults: currentValidationResults,
      };

      // Add to public startups list
      const publicStartups = JSON.parse(
        localStorage.getItem("publicStartupIdeas") || "[]",
      );
      publicStartups.unshift(publicStartup);
      localStorage.setItem(
        "publicStartupIdeas",
        JSON.stringify(publicStartups),
      );

      hideLoading();
      showAlert(
        "🎉 Your startup is now visible to investors! Investors can now discover and express interest in your idea.",
        "success",
      );
    } catch (error) {
      console.error("Error making startup public:", error);
      hideLoading();
      showAlert("Error publishing startup. Please try again.", "error");
    }
  }, 1500);
}

function exportValidationReport() {
  if (!currentValidationResults || !currentValidationData) {
    showAlert("No validation data to export", "error");
    return;
  }

  const reportContent = createValidationReportHTML();

  // Open in new window for saving/printing
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(reportContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 1000);
  }

  showAlert("Validation report exported successfully!", "success");
}

function createValidationReportHTML() {
  return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${currentValidationData.startupTitle || "Startup"} - Validation Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
                .header { text-align: center; margin-bottom: 40px; }
                .section { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
                .score { font-size: 48px; font-weight: bold; color: #6366f1; text-align: center; }
                .category { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; background: #f8f9fa; }
                .recommendation { margin: 10px 0; padding: 15px; background: #e3f2fd; border-left: 4px solid #2196f3; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Startup Validation Report</h1>
                <h2>${currentValidationData.startupTitle || "Your Startup Idea"}</h2>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="section">
                <h3>Overall Score</h3>
                <div class="score">${currentValidationResults.overall_score}/100</div>
                <p><strong>Viability Level:</strong> ${currentValidationResults.viability_level}</p>
            </div>
            
            <div class="section">
                <h3>Category Breakdown</h3>
                ${currentValidationResults.scores
                  .map(
                    (score) => `
                    <div class="category">
                        <span>${score.category}</span>
                        <strong>${score.score}/100</strong>
                    </div>
                `,
                  )
                  .join("")}
            </div>
            
            <div class="section">
                <h3>Recommendations</h3>
                ${currentValidationResults.recommendations
                  .map(
                    (rec) => `
                    <div class="recommendation">
                        <h4>${rec.category}</h4>
                        <p>${rec.recommendation}</p>
                    </div>
                `,
                  )
                  .join("")}
            </div>
            
            <div class="section">
                <h3>Startup Details</h3>
                <p><strong>Problem Statement:</strong> ${currentValidationData.problemStatement}</p>
                <p><strong>Solution:</strong> ${currentValidationData.solutionDescription}</p>
                <p><strong>Target Market:</strong> ${currentValidationData.targetMarket}</p>
                <p><strong>Market Size:</strong> ${currentValidationData.marketSize || "Not specified"}</p>
                <p><strong>Revenue Model:</strong> ${currentValidationData.revenueModel || "Not specified"}</p>
                <p><strong>Current Stage:</strong> ${currentValidationData.currentStage || "Idea"}</p>
            </div>
        </body>
        </html>
    `;
}

function shareResults() {
  if (!currentValidationResults) {
    showAlert("No results to share", "error");
    return;
  }

  const shareText = `I just validated my startup idea "${currentValidationData.startupTitle || "my startup"}" with Drishti and got a ${currentValidationResults.overall_score}/100 score! Check out the AI-powered startup validation platform.`;
  const shareUrl = window.location.origin;

  if (navigator.share && navigator.canShare) {
    navigator
      .share({
        title: "Startup Validation Results",
        text: shareText,
        url: shareUrl,
      })
      .catch((error) => {
        console.log("Share cancelled");
      });
  } else {
    // Fallback to clipboard
    navigator.clipboard
      .writeText(`${shareText} ${shareUrl}`)
      .then(() => {
        showAlert("Results link copied to clipboard!", "success");
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = `${shareText} ${shareUrl}`;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        showAlert("Results link copied to clipboard!", "success");
      });
  }
}

function emailResults() {
  if (!currentValidationResults || !currentValidationData) {
    showAlert("No results to email", "error");
    return;
  }

  const subject = encodeURIComponent(
    `Validation Results for ${currentValidationData.startupTitle || "My Startup"}`,
  );
  const body = encodeURIComponent(`Hi,

I wanted to share the validation results for ${currentValidationData.startupTitle || "my startup idea"}:

Overall Score: ${currentValidationResults.overall_score}/100
Viability Level: ${currentValidationResults.viability_level}

Problem: ${currentValidationData.problemStatement}

Solution: ${currentValidationData.solutionDescription}

Target Market: ${currentValidationData.targetMarket}

This analysis was generated using Drishti's AI-powered startup validation platform.

Best regards`);

  const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
  window.location.href = mailtoLink;
}

// Initialize results page when loaded
document.addEventListener("DOMContentLoaded", function () {
  if (window.location.hash === "#results") {
    initializeResultsPage();
  }
});

// Also initialize when page is shown
window.addEventListener("hashchange", function () {
  if (window.location.hash === "#results") {
    initializeResultsPage();
  }
});
