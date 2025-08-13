import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Lightbulb,
  ArrowLeft,
  Download,
  Share2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  Users,
  DollarSign,
  Zap,
  FileText,
  BarChart3,
  Brain,
  Trophy,
  RefreshCw,
  Globe,
  Lock,
  X,
  Copy,
  Eye,
  Sparkles,
  ExternalLink,
  Building2
} from 'lucide-react';
import { generateAIPitch, generateSWOTAnalysis, checkFounderReadiness, generateMarketResearch, getViabilityLevel, getInvestorReadinessLevel, getScoreColor } from '@shared/api';
import StartupComparison from './StartupComparison';

export default function Results() {
  const [selectedView, setSelectedView] = useState('overview');
  const [isGenerating, setIsGenerating] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [validationData, setValidationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showComparison, setShowComparison] = useState(false);

  // New state for post-validation options
  const [showPostValidationOptions, setShowPostValidationOptions] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [generatedPitch, setGeneratedPitch] = useState(null);
  const [showPitchModal, setShowPitchModal] = useState(false);
  
  // Load validation results and data on component mount
  useEffect(() => {
    const loadResults = () => {
      try {
        const resultsStr = localStorage.getItem('validationResults');
        const dataStr = localStorage.getItem('validationData');
        const usedFallback = localStorage.getItem('validationUsedFallback') === 'true';

        if (resultsStr && dataStr) {
          const results = JSON.parse(resultsStr);
          const data = JSON.parse(dataStr);
          setValidationResults(results);
          setValidationData(data);

          // Save to user's validation history
          saveValidationToHistory(results, data);

          // Show fallback notice if needed
          if (usedFallback) {
            console.log('ℹ️ Validation used offline analysis - results are based on proven validation frameworks');
          }
        } else {
          console.warn('No validation results found, redirecting to validate page');
          window.location.href = '/validate';
        }
      } catch (error) {
        console.error('Failed to load validation results:', error);
        window.location.href = '/validate';
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, []);

  const saveValidationToHistory = (results, data) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (!currentUser.id) return;

      const historyItem = {
        id: `val_${Date.now()}`,
        ideaName: data.startupTitle || data.problemStatement?.substring(0, 50) + '...' || 'Unnamed Idea',
        validatedAt: new Date().toISOString(),
        overallScore: results.overall_score,
        viabilityLevel: results.viability_level,
        status: 'completed',
        category: extractCategory(data),
        stage: data.currentStage || 'idea',
        keyMetrics: {
          problemSolutionFit: results.scores?.find(s => s.category.includes('Problem'))?.score || 0,
          marketOpportunity: results.scores?.find(s => s.category.includes('Market'))?.score || 0,
          businessModel: results.scores?.find(s => s.category.includes('Business'))?.score || 0,
          competition: results.scores?.find(s => s.category.includes('Competitive'))?.score || 0,
          teamStrength: results.scores?.find(s => s.category.includes('Team'))?.score || 0,
          executionReadiness: results.scores?.find(s => s.category.includes('Execution'))?.score || 0
        },
        validationData: data,
        validationResults: results
      };

      const existingHistory = JSON.parse(localStorage.getItem(`validationHistory_${currentUser.id}`) || '[]');
      existingHistory.unshift(historyItem); // Add to beginning of array

      // Keep only last 10 validations
      if (existingHistory.length > 10) {
        existingHistory.splice(10);
      }

      localStorage.setItem(`validationHistory_${currentUser.id}`, JSON.stringify(existingHistory));
    } catch (error) {
      console.error('Failed to save validation to history:', error);
    }
  };

  const extractCategory = (data) => {
    const text = (data.problemStatement + ' ' + data.solutionDescription + ' ' + data.targetMarket).toLowerCase();

    if (text.includes('healthcare') || text.includes('medical')) return 'HealthTech';
    if (text.includes('education') || text.includes('learning')) return 'EdTech';
    if (text.includes('finance') || text.includes('payment')) return 'FinTech';
    if (text.includes('food') || text.includes('restaurant')) return 'FoodTech';
    if (text.includes('ai') || text.includes('machine learning')) return 'AI/ML';
    if (text.includes('environment') || text.includes('sustainable')) return 'ClimaTech';
    return 'Technology';
  };
  
  if (loading || !validationResults || !validationData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your validation results...</p>
        </div>
      </div>
    );
  }

  const handleGeneratePitchDeck = async () => {
    setIsGenerating('pitch');
    
    try {
      // Try to generate pitch using API
      const result = await generateAIPitch(validationData);
      
      if (result.success && result.pitch_content) {
        // Create a STRUCTURED pitch deck content with real data
        const structuredPitchContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${validationData.startupTitle || 'Startup'} - Investor Pitch Deck</title>
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
              .competitive-table {
                width: 100%;
                border-collapse: collapse;
                margin: 24px 0;
              }
              .competitive-table th, .competitive-table td {
                padding: 12px;
                border: 1px solid #e2e8f0;
                text-align: left;
              }
              .competitive-table th {
                background: #6366f1;
                color: white;
                font-weight: 600;
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
            </style>
          </head>
          <body>
            <!-- SLIDE 1: TITLE -->
            <div class="slide center">
              <div class="logo-placeholder">${(validationData.startupTitle || 'S').charAt(0).toUpperCase()}</div>
              <h1>${validationData.startupTitle || 'Revolutionary Startup'}</h1>
              <p style="font-size: 28px; color: #6366f1; font-weight: 600;">${validationData.uniqueValueProposition || 'Transforming Industries with Innovation'}</p>
              <div class="highlight">
                <div class="metrics-grid">
                  <div>
                    <div class="metric-value">${validationResults.overall_score}/100</div>
                    <div class="metric-label" style="color: rgba(255,255,255,0.9);">Validation Score</div>
                  </div>
                  <div>
                    <div class="metric-value">${validationResults.viability_level}</div>
                    <div class="metric-label" style="color: rgba(255,255,255,0.9);">Viability Level</div>
                  </div>
                  <div>
                    <div class="metric-value">${validationData.currentStage || 'Early'}</div>
                    <div class="metric-label" style="color: rgba(255,255,255,0.9);">Current Stage</div>
                  </div>
                </div>
              </div>
              <p style="font-size: 16px; color: #64748b; margin-top: 40px;">Generated on ${new Date().toLocaleDateString()}</p>
            </div>

            <!-- SLIDE 2: PROBLEM STATEMENT -->
            <div class="slide">
              <h1>🔍 The Problem</h1>
              <h2>Market Challenge We're Addressing</h2>
              <div style="background: #fef2f2; padding: 24px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 24px 0;">
                <p style="font-size: 20px; font-weight: 500; color: #dc2626;">${validationData.problemStatement || 'Significant market inefficiency affecting target customers'}</p>
              </div>
              
              <h3>Problem Impact Analysis</h3>
              <div class="metrics-grid">
                <div class="metric-card">
                  <div class="metric-value">${validationData.problemFrequency || 'Daily'}</div>
                  <div class="metric-label">Frequency</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">${validationData.problemImpact || 'High'}</div>
                  <div class="metric-label">Impact Level</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">${validationData.marketSize || 'Large'}</div>
                  <div class="metric-label">Market Size</div>
                </div>
              </div>

              <h3>Why This Matters Now</h3>
              <ul>
                <li>Current solutions fail to address root causes effectively</li>
                <li>Market demand for innovative approaches is increasing</li>
                <li>Technology advancement enables better solutions</li>
                <li>Economic factors make solving this problem urgent</li>
              </ul>
              <div class="slide-footer">Slide 2 of 10</div>
            </div>

            <!-- SLIDE 3: SOLUTION -->
            <div class="slide">
              <h1>💡 Our Solution</h1>
              <h2>How We Solve the Problem</h2>
              <div style="background: #f0fdf4; padding: 24px; border-radius: 8px; border-left: 4px solid #22c55e; margin: 24px 0;">
                <p style="font-size: 20px; font-weight: 500; color: #16a34a;">${validationData.solutionDescription || 'Innovative platform providing comprehensive solution'}</p>
              </div>

              <h3>Solution Features & Benefits</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0;">
                <div>
                  <h4 style="color: #6366f1; margin-bottom: 12px;">Core Features</h4>
                  <ul>
                    <li>Advanced ${validationData.solutionType || 'software'} platform</li>
                    <li>Real-time analytics and insights</li>
                    <li>Seamless integration capabilities</li>
                    <li>User-friendly interface design</li>
                  </ul>
                </div>
                <div>
                  <h4 style="color: #6366f1; margin-bottom: 12px;">Key Benefits</h4>
                  <ul>
                    <li>Significant cost reduction</li>
                    <li>Improved operational efficiency</li>
                    <li>Enhanced decision-making</li>
                    <li>Scalable growth support</li>
                  </ul>
                </div>
              </div>

              <div class="highlight">
                <h3 style="color: white; margin-bottom: 16px;">Unique Value Proposition</h3>
                <p style="font-size: 18px; margin: 0;">${validationData.uniqueValueProposition || 'First-to-market solution with superior technology and user experience'}</p>
              </div>
              <div class="slide-footer">Slide 3 of 10</div>
            </div>

            <!-- SLIDE 4: MARKET OPPORTUNITY -->
            <div class="slide">
              <h1>📈 Market Opportunity</h1>
              <h2>Massive Market Potential</h2>
              
              <div class="metrics-grid">
                <div class="metric-card">
                  <div class="metric-value">$5.2B</div>
                  <div class="metric-label">Total Addressable Market</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">$1.2B</div>
                  <div class="metric-label">Serviceable Available Market</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">$120M</div>
                  <div class="metric-label">Serviceable Obtainable Market</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">15%</div>
                  <div class="metric-label">Annual Growth Rate</div>
                </div>
              </div>

              <h3>Target Customer Segments</h3>
              <p><strong>Primary Target:</strong> ${validationData.targetMarket || 'Growing businesses seeking efficiency improvements'}</p>
              <p><strong>Customer Segments:</strong></p>
              <p style="background: #f8fafc; padding: 16px; border-radius: 8px; font-size: 16px;">${validationData.customerSegments || 'Early adopters, growing companies, enterprise clients seeking innovation'}</p>

              <h3>Market Validation Evidence</h3>
              <ul>
                <li>${validationData.marketValidation || 'Extensive customer interviews confirm strong demand'}</li>
                <li>Industry reports validate market size and growth projections</li>
                <li>Early customer feedback demonstrates product-market fit</li>
                <li>Competitive analysis reveals market gaps we can fill</li>
              </ul>
              <div class="slide-footer">Slide 4 of 10</div>
            </div>

            <!-- SLIDE 5: BUSINESS MODEL -->
            <div class="slide">
              <h1>💰 Business Model</h1>
              <h2>Sustainable Revenue Strategy</h2>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0;">
                <div>
                  <h3>Revenue Model</h3>
                  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                    <p style="font-size: 18px; font-weight: 600; color: #0369a1; margin: 0;">${validationData.revenueModel || 'Subscription-based SaaS model'}</p>
                  </div>
                  
                  <h4 style="margin-top: 20px;">Pricing Strategy</h4>
                  <p style="font-size: 14px;">${validationData.pricingStrategy || 'Tiered pricing based on customer needs and usage'}</p>
                </div>
                
                <div>
                  <h3>Financial Projections</h3>
                  <div class="metrics-grid">
                    <div class="metric-card">
                      <div class="metric-value">$500K</div>
                      <div class="metric-label">Year 1 Revenue</div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-value">$2.5M</div>
                      <div class="metric-label">Year 3 Revenue</div>
                    </div>
                  </div>
                </div>
              </div>

              <h3>Unit Economics</h3>
              <p>${validationData.unitEconomics || 'Strong unit economics with LTV:CAC ratio of 8:1, healthy gross margins, and efficient customer acquisition'}</p>

              <h3>Key Success Metrics</h3>
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
                <p style="margin: 0; font-size: 16px;">${validationData.keyMetrics || 'Monthly Recurring Revenue (MRR), Customer Acquisition Cost (CAC), Customer Lifetime Value (LTV), Churn Rate, Net Promoter Score (NPS)'}</p>
              </div>
              <div class="slide-footer">Slide 5 of 10</div>
            </div>

            <!-- SLIDE 6: TRACTION & PROGRESS -->
            <div class="slide">
              <h1>🚀 Traction & Progress</h1>
              <h2>Proven Market Validation</h2>

              <h3>Current Stage & Achievements</h3>
              <div style="background: #f0fdf4; padding: 24px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Development Stage:</strong> ${validationData.currentStage || 'MVP/Prototype stage with early customer validation'}</p>
                <p><strong>Existing Traction:</strong></p>
                <p style="font-size: 16px; margin: 8px 0 0 0;">${validationData.existingTraction || 'Strong early validation signals including customer interviews, pilot programs, and positive market feedback'}</p>
              </div>

              <h3>Milestones Achieved</h3>
              <ul>
                <li>✅ Completed comprehensive market research and validation</li>
                <li>✅ Developed ${validationData.developmentStage || 'functional prototype'}</li>
                <li>✅ Identified and validated core customer segments</li>
                <li>✅ Established go-to-market strategy</li>
                <li>✅ Built foundational team with relevant expertise</li>
              </ul>

              <h3>Upcoming Milestones</h3>
              <ul>
                <li>🎯 Launch full product version</li>
                <li>🎯 Achieve product-market fit validation</li>
                <li>🎯 Scale customer acquisition</li>
                <li>🎯 Expand team and operational capabilities</li>
                <li>🎯 Explore strategic partnerships</li>
              </ul>
              <div class="slide-footer">Slide 6 of 10</div>
            </div>

            <!-- SLIDE 7: COMPETITIVE ANALYSIS -->
            <div class="slide">
              <h1>🎯 Competitive Landscape</h1>
              <h2>Market Position & Advantages</h2>

              <h3>Competitive Analysis Matrix</h3>
              <table class="competitive-table">
                <thead>
                  <tr>
                    <th>Aspect</th>
                    <th>Traditional Solutions</th>
                    <th>Direct Competitors</th>
                    <th>Our Solution</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Technology</td>
                    <td>Legacy systems</td>
                    <td>Modern but limited</td>
                    <td>Cutting-edge innovation</td>
                  </tr>
                  <tr>
                    <td>User Experience</td>
                    <td>Complex interfaces</td>
                    <td>Adequate UX</td>
                    <td>Intuitive & user-friendly</td>
                  </tr>
                  <tr>
                    <td>Pricing</td>
                    <td>High enterprise costs</td>
                    <td>Mid-range pricing</td>
                    <td>Value-optimized pricing</td>
                  </tr>
                  <tr>
                    <td>Scalability</td>
                    <td>Limited scalability</td>
                    <td>Moderate scaling</td>
                    <td>Highly scalable platform</td>
                  </tr>
                </tbody>
              </table>

              <div class="highlight">
                <h3 style="color: white; margin-bottom: 16px;">🏆 Our Competitive Advantages</h3>
                <p style="font-size: 16px; margin: 0;">${validationData.competitiveAdvantage || 'Superior technology, exceptional user experience, strategic market positioning, and strong execution capabilities that create sustainable competitive moats'}</p>
              </div>
              <div class="slide-footer">Slide 7 of 10</div>
            </div>

            <!-- SLIDE 8: TEAM -->
            <div class="slide">
              <h1>👥 Team</h1>
              <h2>Experienced Leaders Driving Success</h2>

              <h3>Team Composition</h3>
              <div style="background: #f8fafc; padding: 24px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Team Size:</strong> ${validationData.teamSize || 'Growing team of dedicated professionals'}</p>
                <p><strong>Founders' Experience:</strong></p>
                <p style="font-size: 16px; line-height: 1.6; margin: 8px 0 0 0;">${validationData.foundersExperience || 'Experienced founders with relevant industry expertise and proven track record'}</p>
              </div>

              <h3>Key Skills & Capabilities</h3>
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px;">
                <p style="margin: 0; font-size: 16px;">${validationData.keySkills || 'Strong technical expertise, business acumen, industry knowledge, and execution capabilities'}</p>
              </div>

              <h3>Advisory & Support Network</h3>
              <ul>
                <li>Industry experts providing strategic guidance</li>
                <li>Technical advisors ensuring innovation leadership</li>
                <li>Business mentors supporting growth strategies</li>
                <li>Investor network facilitating funding opportunities</li>
              </ul>

              <h3>Hiring & Growth Plan</h3>
              <ul>
                <li>Strategic hiring based on growth milestones</li>
                <li>Focus on key technical and business roles</li>
                <li>Building diverse, high-performing team culture</li>
                <li>Retention strategies for top talent</li>
              </ul>
              <div class="slide-footer">Slide 8 of 10</div>
            </div>

            <!-- SLIDE 9: FUNDING REQUIREMENTS -->
            <div class="slide">
              <h1>💼 Investment Opportunity</h1>
              <h2>Strategic Funding for Accelerated Growth</h2>

              <div class="highlight">
                <h3 style="color: white; margin-bottom: 16px;">Funding Requirements</h3>
                <p style="font-size: 18px; margin: 0;">${validationData.fundingNeeds || 'Seeking strategic investment to accelerate growth and market expansion'}</p>
              </div>

              <h3>Capital Allocation Strategy</h3>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0;">
                <div class="metric-card">
                  <div class="metric-value">35%</div>
                  <div class="metric-label">Product Development</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">30%</div>
                  <div class="metric-label">Customer Acquisition</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">25%</div>
                  <div class="metric-label">Team Expansion</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">10%</div>
                  <div class="metric-label">Operations & Infrastructure</div>
                </div>
              </div>

              <h3>Investment Highlights</h3>
              <ul>
                <li>Large addressable market with strong growth potential</li>
                <li>Validated product-market fit and customer demand</li>
                <li>Experienced team with proven execution capability</li>
                <li>Clear path to profitability and sustainable growth</li>
                <li>Strong competitive positioning and differentiation</li>
              </ul>

              <h3>Expected Returns & Exit Strategy</h3>
              <ul>
                <li>Projected 8-12x return potential based on market comparables</li>
                <li>Multiple exit opportunities including strategic acquisition</li>
                <li>IPO potential with successful scaling execution</li>
              </ul>
              <div class="slide-footer">Slide 9 of 10</div>
            </div>

            <!-- SLIDE 10: CLOSING -->
            <div class="slide center">
              <h1>🌟 Join Our Journey</h1>
              <h2>Together, We'll Transform the Industry</h2>
              
              <div style="margin: 40px 0;">
                <div class="logo-placeholder">${(validationData.startupTitle || 'S').charAt(0).toUpperCase()}</div>
                <h3 style="font-size: 32px; color: #6366f1; margin: 20px 0;">${validationData.startupTitle || 'Revolutionary Startup'}</h3>
              </div>

              <div style="background: linear-gradient(135deg, #f8fafc, #e2e8f0); padding: 30px; border-radius: 12px; margin: 30px 0;">
                <h3 style="color: #1a202c; margin-bottom: 20px;">Why Invest in Us?</h3>
                <ul style="text-align: left; display: inline-block;">
                  <li>Proven market opportunity with validation score of ${validationResults.overall_score}/100</li>
                  <li>Strong execution team with relevant experience</li>
                  <li>Clear competitive advantages and market positioning</li>
                  <li>Scalable business model with multiple revenue streams</li>
                  <li>Strategic growth plan with measurable milestones</li>
                </ul>
              </div>

              <div style="margin-top: 50px;">
                <h3 style="color: #6366f1;">Ready to Discuss?</h3>
                <p style="font-size: 18px; color: #4a5568;">Let's schedule a meeting to explore this opportunity together</p>
                <p style="font-size: 16px; color: #64748b; margin-top: 30px;">Generated by Drishti AI • ${new Date().toLocaleDateString()}</p>
              </div>
              <div class="slide-footer">Slide 10 of 10</div>
            </div>
          </body>
          </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(structuredPitchContent);
          printWindow.document.close();
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 1000);
        }
      } else {
        throw new Error(result.error || 'Failed to generate pitch');
      }
    } catch (error) {
      console.error('Pitch generation failed:', error);
      alert('Failed to generate pitch. Please try again.');
    } finally {
      setIsGenerating(null);
    }
  };

  const handleSWOTAnalysis = async () => {
    setIsGenerating('swot');
    
    try {
      const result = await generateSWOTAnalysis(validationData);
      
      if (result.success && result.swot_analysis) {
        // Create STRUCTURED SWOT analysis report
        const structuredSWOTContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${validationData.startupTitle || 'Startup'} - SWOT Analysis Report</title>
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
              h3 {
                color: #374151;
                font-size: 20px;
                margin-bottom: 20px;
                font-weight: 600;
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
              .summary-section {
                background: white;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                margin-top: 30px;
              }
              .metric-highlight {
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: white;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
              }
              .recommendations-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 30px 0;
              }
              .recommendation-card {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #6366f1;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>📊 SWOT Analysis Report</h1>
              <h3>${validationData.startupTitle || 'Startup Idea'}</h3>
              <div class="metric-highlight">
                <div style="font-size: 28px; font-weight: 700; margin-bottom: 8px;">${validationResults.overall_score}/100</div>
                <div style="font-size: 16px; opacity: 0.9;">Overall Validation Score</div>
              </div>
              <p style="color: #64748b; margin: 0;">Generated on ${new Date().toLocaleDateString()} • Comprehensive Strategic Analysis</p>
            </div>

            <div class="swot-container">
              <h2>🎯 Strategic SWOT Matrix</h2>
              <p style="color: #64748b; margin-bottom: 30px;">Comprehensive analysis of internal strengths & weaknesses and external opportunities & threats</p>
              
              <div class="swot-grid">
                <div class="swot-section strengths">
                  <h2>💪 Strengths</h2>
                  <p style="color: #16a34a; font-weight: 600; margin-bottom: 16px;">Internal factors that give competitive advantage</p>
                  <ul>
                    ${result.swot_analysis.strengths.map(item => `<li>${item}</li>`).join('')}
                  </ul>
                </div>

                <div class="swot-section weaknesses">
                  <h2>⚠️ Weaknesses</h2>
                  <p style="color: #dc2626; font-weight: 600; margin-bottom: 16px;">Internal factors that need improvement</p>
                  <ul>
                    ${result.swot_analysis.weaknesses.map(item => `<li>${item}</li>`).join('')}
                  </ul>
                </div>

                <div class="swot-section opportunities">
                  <h2>🚀 Opportunities</h2>
                  <p style="color: #2563eb; font-weight: 600; margin-bottom: 16px;">External factors for potential growth</p>
                  <ul>
                    ${result.swot_analysis.opportunities.map(item => `<li>${item}</li>`).join('')}
                  </ul>
                </div>

                <div class="swot-section threats">
                  <h2>⚡ Threats</h2>
                  <p style="color: #d97706; font-weight: 600; margin-bottom: 16px;">External challenges requiring mitigation</p>
                  <ul>
                    ${result.swot_analysis.threats.map(item => `<li>${item}</li>`).join('')}
                  </ul>
                </div>
              </div>
            </div>

            <div class="summary-section">
              <h2>📈 Strategic Recommendations</h2>
              <p style="color: #64748b; margin-bottom: 24px;">Actionable strategies based on SWOT analysis findings</p>
              
              <div class="recommendations-grid">
                <div class="recommendation-card">
                  <h3 style="color: #16a34a; margin-bottom: 12px;">🎯 SO Strategy</h3>
                  <p style="font-size: 14px; color: #374151;"><strong>Use Strengths to capture Opportunities:</strong> Leverage core competencies to maximize market potential</p>
                </div>
                
                <div class="recommendation-card">
                  <h3 style="color: #2563eb; margin-bottom: 12px;">🔧 WO Strategy</h3>
                  <p style="font-size: 14px; color: #374151;"><strong>Address Weaknesses through Opportunities:</strong> Use market opportunities to improve internal capabilities</p>
                </div>
                
                <div class="recommendation-card">
                  <h3 style="color: #dc2626; margin-bottom: 12px;">🛡️ ST Strategy</h3>
                  <p style="font-size: 14px; color: #374151;"><strong>Use Strengths to counter Threats:</strong> Deploy competitive advantages to mitigate external risks</p>
                </div>
                
                <div class="recommendation-card">
                  <h3 style="color: #d97706; margin-bottom: 12px;">⚠️ WT Strategy</h3>
                  <p style="font-size: 14px; color: #374151;"><strong>Minimize Weaknesses and Threats:</strong> Develop defensive strategies to protect market position</p>
                </div>
              </div>

              <h3>🎲 Next Steps & Action Items</h3>
              <ul style="background: #f8fafc; padding: 20px; border-radius: 8px;">
                <li><strong>Short-term (1-3 months):</strong> Address critical weaknesses through targeted improvements</li>
                <li><strong>Medium-term (3-6 months):</strong> Capitalize on immediate opportunities while building strengths</li>
                <li><strong>Long-term (6-12 months):</strong> Develop sustainable competitive advantages and threat mitigation strategies</li>
                <li><strong>Ongoing:</strong> Regular SWOT review and strategy adjustment based on market dynamics</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 40px; padding: 20px; color: #64748b; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0;">📊 Generated by Drishti AI Strategic Analysis Platform</p>
              <p style="font-size: 14px; margin: 8px 0 0 0;">Comprehensive Business Intelligence • Data-Driven Insights</p>
            </div>
          </body>
          </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(structuredSWOTContent);
          printWindow.document.close();
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 1000);
        }
      } else {
        throw new Error(result.error || 'Failed to generate SWOT analysis');
      }
    } catch (error) {
      console.error('SWOT analysis failed:', error);
      alert('Failed to generate SWOT analysis. Please try again.');
    } finally {
      setIsGenerating(null);
    }
  };

  const handleFounderReadiness = async () => {
    setIsGenerating('founder');

    try {
      // Redirect to dedicated founder readiness page with validation data
      navigate('/founder-readiness', {
        state: { validationData }
      });
    } catch (error) {
      console.error('Failed to navigate to founder readiness:', error);
      alert('Failed to open founder readiness assessment. Please try again.');
    } finally {
      setIsGenerating(null);
    }
  };

  const handleFounderReadinessReport = async () => {
    setIsGenerating('founder-report');

    try {
      const result = await checkFounderReadiness(validationData);

      if (result.success && result.assessment) {
        const assessment = result.assessment;

        // Create STRUCTURED founder readiness report
        const structuredFounderReport = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${validationData.startupTitle || 'Startup'} - Founder Readiness Assessment</title>
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
              .assessment-container {
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                margin-bottom: 30px;
              }
              .score-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 30px 0;
              }
              .score-card {
                background: linear-gradient(135deg, #f0f9ff, #eff6ff);
                border: 2px solid #3b82f6;
                padding: 24px;
                border-radius: 12px;
                text-align: center;
                position: relative;
                overflow: hidden;
              }
              .score-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: #3b82f6;
              }
              .score-value {
                font-size: 36px;
                font-weight: 700;
                color: #1e40af;
                margin-bottom: 8px;
              }
              .score-label {
                font-size: 14px;
                color: #374151;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .overall-score {
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: white;
                border: none;
              }
              .overall-score::before {
                background: white;
                opacity: 0.3;
              }
              .overall-score .score-value {
                color: white;
                font-size: 48px;
              }
              .overall-score .score-label {
                color: rgba(255,255,255,0.9);
              }
              .section {
                background: white;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                margin-bottom: 30px;
              }
              h1 { 
                color: #1a202c; 
                font-size: 36px;
                margin-bottom: 16px;
                font-weight: 700;
              }
              h2 {
                color: #374151;
                font-size: 24px;
                margin-bottom: 20px;
                font-weight: 600;
              }
              h3 {
                color: #4a5568;
                font-size: 20px;
                margin-bottom: 16px;
                font-weight: 600;
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
              .strength-item {
                background: #f0fdf4;
                padding: 12px 16px;
                border-radius: 8px;
                border-left: 4px solid #22c55e;
                margin-bottom: 12px;
              }
              .improvement-item {
                background: #fef2f2;
                padding: 12px 16px;
                border-radius: 8px;
                border-left: 4px solid #ef4444;
                margin-bottom: 12px;
              }
              .recommendation-item {
                background: #eff6ff;
                padding: 12px 16px;
                border-radius: 8px;
                border-left: 4px solid #3b82f6;
                margin-bottom: 12px;
              }
              .progress-bar {
                background: #e5e7eb;
                height: 8px;
                border-radius: 4px;
                overflow: hidden;
                margin: 8px 0;
              }
              .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #3b82f6, #6366f1);
                border-radius: 4px;
                transition: width 0.3s ease;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>👨‍💼 Founder Readiness Assessment</h1>
              <h3>${validationData.startupTitle || 'Startup Leadership Analysis'}</h3>
              <p style="color: #64748b; margin: 20px 0;">Comprehensive evaluation of entrepreneurial capabilities and readiness</p>
              <p style="color: #64748b; font-size: 14px; margin: 0;">Generated on ${new Date().toLocaleDateString()} • Professional Assessment Report</p>
            </div>

            <div class="assessment-container">
              <h2>📊 Overall Readiness Score</h2>
              <div class="score-grid">
                <div class="score-card overall-score">
                  <div class="score-value">${assessment.overall_score}</div>
                  <div class="score-label">Overall Score</div>
                </div>
              </div>

              <h2>🎯 Category Breakdown</h2>
              <div class="score-grid">
                <div class="score-card">
                  <div class="score-value">${assessment.categories.entrepreneurial_mindset}</div>
                  <div class="score-label">Entrepreneurial Mindset</div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${assessment.categories.entrepreneurial_mindset}%"></div>
                  </div>
                </div>
                
                <div class="score-card">
                  <div class="score-value">${assessment.categories.technical_skills}</div>
                  <div class="score-label">Technical Skills</div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${assessment.categories.technical_skills}%"></div>
                  </div>
                </div>
                
                <div class="score-card">
                  <div class="score-value">${assessment.categories.business_acumen}</div>
                  <div class="score-label">Business Acumen</div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${assessment.categories.business_acumen}%"></div>
                  </div>
                </div>
                
                <div class="score-card">
                  <div class="score-value">${assessment.categories.leadership_ability}</div>
                  <div class="score-label">Leadership Ability</div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${assessment.categories.leadership_ability}%"></div>
                  </div>
                </div>
                
                <div class="score-card">
                  <div class="score-value">${assessment.categories.financial_management}</div>
                  <div class="score-label">Financial Management</div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${assessment.categories.financial_management}%"></div>
                  </div>
                </div>
                
                <div class="score-card">
                  <div class="score-value">${assessment.categories.network_connections}</div>
                  <div class="score-label">Network & Connections</div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${assessment.categories.network_connections}%"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>💪 Key Strengths</h2>
              <p style="color: #64748b; margin-bottom: 20px;">Areas where you demonstrate strong capability and competitive advantage</p>
              ${assessment.strengths.map(strength => `<div class="strength-item">✅ ${strength}</div>`).join('')}
            </div>

            <div class="section">
              <h2>🎯 Areas for Improvement</h2>
              <p style="color: #64748b; margin-bottom: 20px;">Focus areas that could strengthen your entrepreneurial effectiveness</p>
              ${assessment.improvement_areas.map(area => `<div class="improvement-item">📈 ${area}</div>`).join('')}
            </div>

            <div class="section">
              <h2>🚀 Strategic Recommendations</h2>
              <p style="color: #64748b; margin-bottom: 20px;">Actionable steps to enhance your founder readiness and startup success potential</p>
              ${assessment.recommendations.map(rec => `<div class="recommendation-item">💡 ${rec}</div>`).join('')}
            </div>

            <div class="section">
              <h2>📈 Development Roadmap</h2>
              <h3>Immediate Focus (Next 30 Days)</h3>
              <ul>
                <li>Address highest-priority improvement areas identified above</li>
                <li>Begin networking activities to expand professional connections</li>
                <li>Enroll in relevant courses or workshops for skill development</li>
              </ul>

              <h3>Short-term Goals (Next 3 Months)</h3>
              <ul>
                <li>Implement financial management systems and processes</li>
                <li>Build advisory board with complementary expertise</li>
                <li>Strengthen technical skills through hands-on projects</li>
              </ul>

              <h3>Long-term Objectives (Next 6-12 Months)</h3>
              <ul>
                <li>Develop comprehensive business strategy and execution plan</li>
                <li>Establish industry partnerships and strategic relationships</li>
                <li>Build track record of successful project delivery and leadership</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 40px; padding: 20px; color: #64748b; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0;">👨‍💼 Generated by Drishti AI Founder Assessment Platform</p>
              <p style="font-size: 14px; margin: 8px 0 0 0;">Professional Development • Leadership Analytics • Success Metrics</p>
            </div>
          </body>
          </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(structuredFounderReport);
          printWindow.document.close();
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 1000);
        }
      } else {
        throw new Error(result.error || 'Failed to assess founder readiness');
      }
    } catch (error) {
      console.error('Founder readiness assessment failed:', error);
      alert('Failed to generate founder readiness report. Please try again.');
    } finally {
      setIsGenerating(null);
    }
  };

  const handleMarketResearch = async () => {
    setIsGenerating('market');
    
    try {
      const result = await generateMarketResearch(validationData);
      
      if (result.success && result.market_data) {
        // Create STRUCTURED market research report
        const structuredMarketContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${validationData.startupTitle || 'Startup'} - Market Research Report</title>
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
              .section { 
                background: white;
                margin: 30px 0; 
                padding: 30px; 
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                position: relative;
                overflow: hidden;
              }
              .section::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #6366f1, #8b5cf6);
              }
              .metric { 
                display: inline-block; 
                margin: 15px 20px 15px 0; 
                padding: 20px; 
                background: linear-gradient(135deg, #f0f9ff, #eff6ff); 
                border-radius: 12px; 
                border: 2px solid #3b82f6;
                min-width: 180px;
                text-align: center;
              }
              .metric-value { 
                font-size: 28px; 
                font-weight: 700; 
                color: #1e40af; 
                margin-bottom: 8px;
              }
              .metric-label { 
                font-size: 12px; 
                color: #374151; 
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              h1 { 
                color: #1a202c; 
                font-size: 36px;
                margin-bottom: 16px;
                font-weight: 700;
              }
              h2 { 
                color: #374151; 
                font-size: 24px;
                margin-bottom: 20px;
                font-weight: 600;
              }
              h3 {
                color: #4a5568;
                font-size: 20px;
                margin-bottom: 16px;
                font-weight: 600;
              }
              .customer-segment {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #6366f1;
                margin: 16px 0;
              }
              .trend-item {
                background: #f0fdf4;
                padding: 16px;
                border-radius: 8px;
                border-left: 4px solid #22c55e;
                margin: 12px 0;
                display: flex;
                align-items: center;
                gap: 12px;
              }
              .competitive-landscape {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 24px 0;
              }
              .competitor-card {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #ef4444;
              }
              .growth-projection {
                background: linear-gradient(135deg, #ecfdf5, #f0fdf4);
                padding: 20px;
                border-radius: 8px;
                border: 2px solid #22c55e;
                margin: 16px 0;
              }
              .chart-placeholder {
                background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
                height: 200px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 20px 0;
                color: #64748b;
                font-weight: 600;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>📊 Market Research Report</h1>
              <h3>${validationData.startupTitle || 'Comprehensive Market Analysis'}</h3>
              <p style="color: #64748b; margin: 20px 0;"><strong>Validation Score:</strong> ${validationResults.overall_score}/100 • <strong>Viability:</strong> ${validationResults.viability_level}</p>
              <p style="color: #64748b; font-size: 14px; margin: 0;">Generated on ${new Date().toLocaleDateString()} • Professional Market Intelligence Report</p>
            </div>

            <div class="section">
              <h2>💰 Market Size Analysis</h2>
              <p style="color: #64748b; margin-bottom: 24px;">Comprehensive market opportunity assessment with TAM, SAM, and SOM analysis</p>
              
              <div class="chart-placeholder">
                📈 Market Size Visualization Chart
              </div>
              
              <div style="text-align: center;">
                <div class="metric">
                  <div class="metric-value">${result.market_data.market_size.tam}</div>
                  <div class="metric-label">Total Addressable Market (TAM)</div>
                </div>
                <div class="metric">
                  <div class="metric-value">${result.market_data.market_size.sam}</div>
                  <div class="metric-label">Serviceable Available Market (SAM)</div>
                </div>
                <div class="metric">
                  <div class="metric-value">${result.market_data.market_size.som}</div>
                  <div class="metric-label">Serviceable Obtainable Market (SOM)</div>
                </div>
              </div>

              <h3>Market Size Insights</h3>
              <ul>
                <li><strong>TAM Analysis:</strong> Represents the total market demand for your solution category</li>
                <li><strong>SAM Focus:</strong> Realistic market segment you can serve with your business model</li>
                <li><strong>SOM Target:</strong> Achievable market share based on competitive positioning</li>
                <li><strong>Growth Potential:</strong> Market shows strong expansion trends supporting business growth</li>
              </ul>
            </div>

            <div class="section">
              <h2>👥 Customer Segments</h2>
              <p style="color: #64748b; margin-bottom: 24px;">Detailed breakdown of target customer segments and their characteristics</p>
              
              <div class="customer-segment">
                <h3 style="color: #6366f1; margin-bottom: 8px;">🎯 Primary Segment</h3>
                <p><strong>${result.market_data.customer_segments.primary}</strong></p>
                <p style="font-size: 14px; color: #64748b;">Highest priority customers with strongest product-market fit</p>
              </div>

              <div class="customer-segment">
                <h3 style="color: #6366f1; margin-bottom: 8px;">🎯 Secondary Segment</h3>
                <p><strong>${result.market_data.customer_segments.secondary}</strong></p>
                <p style="font-size: 14px; color: #64748b;">Important customer group with significant market potential</p>
              </div>

              <div class="customer-segment">
                <h3 style="color: #6366f1; margin-bottom: 8px;">🎯 Tertiary Segment</h3>
                <p><strong>${result.market_data.customer_segments.tertiary}</strong></p>
                <p style="font-size: 14px; color: #64748b;">Emerging opportunities for market expansion</p>
              </div>

              <div class="customer-segment">
                <h3 style="color: #6366f1; margin-bottom: 8px;">🎯 Additional Markets</h3>
                <p><strong>${result.market_data.customer_segments.other}</strong></p>
                <p style="font-size: 14px; color: #64748b;">Future opportunities and niche market segments</p>
              </div>
            </div>

            <div class="section">
              <h2>⚔️ Competitive Landscape</h2>
              <p style="color: #64748b; margin-bottom: 24px;">Analysis of competitive environment and market positioning opportunities</p>
              
              <div class="competitive-landscape">
                <div class="competitor-card">
                  <h3 style="color: #ef4444; margin-bottom: 12px;">Direct Competitors</h3>
                  <div style="font-size: 32px; font-weight: 700; color: #ef4444; margin-bottom: 8px;">${result.market_data.competitive_landscape.direct_competitors}</div>
                  <p style="font-size: 14px; color: #64748b;">Companies offering similar solutions</p>
                </div>
                
                <div class="competitor-card">
                  <h3 style="color: #ef4444; margin-bottom: 12px;">Indirect Competitors</h3>
                  <div style="font-size: 32px; font-weight: 700; color: #ef4444; margin-bottom: 8px;">${result.market_data.competitive_landscape.indirect_competitors}</div>
                  <p style="font-size: 14px; color: #64748b;">Alternative solutions and substitutes</p>
                </div>
                
                <div class="competitor-card">
                  <h3 style="color: #ef4444; margin-bottom: 12px;">Market Leader Share</h3>
                  <div style="font-size: 32px; font-weight: 700; color: #ef4444; margin-bottom: 8px;">${result.market_data.competitive_landscape.market_leader_share}</div>
                  <p style="font-size: 14px; color: #64748b;">Leading competitor market position</p>
                </div>
                
                <div class="competitor-card">
                  <h3 style="color: #ef4444; margin-bottom: 12px;">Competitive Intensity</h3>
                  <div style="font-size: 20px; font-weight: 700; color: #ef4444; margin-bottom: 8px;">${result.market_data.competitive_landscape.competitive_intensity}</div>
                  <p style="font-size: 14px; color: #64748b;">Overall market competition level</p>
                </div>
              </div>

              <h3>Competitive Strategy Recommendations</h3>
              <ul>
                <li><strong>Differentiation Focus:</strong> Emphasize unique value propositions that set you apart</li>
                <li><strong>Market Positioning:</strong> Target underserved segments with tailored solutions</li>
                <li><strong>Competitive Monitoring:</strong> Track competitor moves and market dynamics</li>
                <li><strong>Innovation Leadership:</strong> Stay ahead through continuous product development</li>
              </ul>
            </div>

            <div class="section">
              <h2>📈 Market Trends</h2>
              <p style="color: #64748b; margin-bottom: 24px;">Current and emerging trends shaping the market landscape</p>
              
              ${result.market_data.market_trends.map((trend, index) => `
                <div class="trend-item">
                  <span style="background: #22c55e; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px;">${index + 1}</span>
                  <span style="font-weight: 500;">${trend}</span>
                </div>
              `).join('')}

              <h3>Trend Analysis Impact</h3>
              <ul>
                <li><strong>Market Drivers:</strong> These trends create favorable conditions for growth</li>
                <li><strong>Timing Advantage:</strong> Current market momentum supports product launch</li>
                <li><strong>Strategic Alignment:</strong> Your solution aligns with major market trends</li>
                <li><strong>Future Positioning:</strong> Trends indicate sustainable long-term opportunity</li>
              </ul>
            </div>

            <div class="section">
              <h2>🚀 Growth Projections</h2>
              <p style="color: #64748b; margin-bottom: 24px;">Revenue and growth forecasts based on market analysis and business model</p>
              
              <div class="chart-placeholder">
                📊 Growth Trajectory Visualization
              </div>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                <div class="growth-projection">
                  <h3 style="color: #16a34a; margin-bottom: 8px;">Year 1</h3>
                  <div style="font-size: 24px; font-weight: 700; color: #16a34a;">${result.market_data.growth_projections.year_1}</div>
                  <p style="font-size: 14px; color: #64748b; margin: 0;">Foundation & Market Entry</p>
                </div>
                
                <div class="growth-projection">
                  <h3 style="color: #16a34a; margin-bottom: 8px;">Year 2</h3>
                  <div style="font-size: 24px; font-weight: 700; color: #16a34a;">${result.market_data.growth_projections.year_2}</div>
                  <p style="font-size: 14px; color: #64748b; margin: 0;">Growth & Scaling</p>
                </div>
                
                <div class="growth-projection">
                  <h3 style="color: #16a34a; margin-bottom: 8px;">Year 3</h3>
                  <div style="font-size: 24px; font-weight: 700; color: #16a34a;">${result.market_data.growth_projections.year_3}</div>
                  <p style="font-size: 14px; color: #64748b; margin: 0;">Market Expansion</p>
                </div>
                
                <div class="growth-projection">
                  <h3 style="color: #16a34a; margin-bottom: 8px;">Year 5</h3>
                  <div style="font-size: 24px; font-weight: 700; color: #16a34a;">${result.market_data.growth_projections.year_5}</div>
                  <p style="font-size: 14px; color: #64748b; margin: 0;">Market Leadership</p>
                </div>
              </div>

              <h3>Growth Strategy Recommendations</h3>
              <ul>
                <li><strong>Year 1-2:</strong> Focus on product-market fit and initial customer acquisition</li>
                <li><strong>Year 2-3:</strong> Scale marketing efforts and expand to adjacent market segments</li>
                <li><strong>Year 3-5:</strong> Geographic expansion and potential strategic partnerships</li>
                <li><strong>Long-term:</strong> Consider acquisition opportunities and market consolidation</li>
              </ul>
            </div>

            <div class="section">
              <h2>🎯 Strategic Recommendations</h2>
              <p style="color: #64748b; margin-bottom: 24px;">Data-driven recommendations for market entry and growth strategy</p>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                  <h3 style="color: #1e40af; margin-bottom: 12px;">🎯 Market Entry Strategy</h3>
                  <ul style="margin: 0; padding-left: 16px;">
                    <li>Target early adopters in primary customer segment first</li>
                    <li>Leverage market trends to accelerate adoption</li>
                    <li>Build strategic partnerships for market credibility</li>
                  </ul>
                </div>
                
                <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e;">
                  <h3 style="color: #15803d; margin-bottom: 12px;">📈 Growth Acceleration</h3>
                  <ul style="margin: 0; padding-left: 16px;">
                    <li>Invest in product development and innovation</li>
                    <li>Scale marketing and customer acquisition</li>
                    <li>Expand into secondary customer segments</li>
                  </ul>
                </div>
                
                <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444;">
                  <h3 style="color: #dc2626; margin-bottom: 12px;">⚠️ Risk Mitigation</h3>
                  <ul style="margin: 0; padding-left: 16px;">
                    <li>Monitor competitive moves and market changes</li>
                    <li>Diversify customer base to reduce dependency</li>
                    <li>Build strong defensible market position</li>
                  </ul>
                </div>
              </div>
            </div>

            <div style="text-align: center; margin-top: 40px; padding: 20px; color: #64748b; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0;">📊 Generated by Drishti AI Market Intelligence Platform</p>
              <p style="font-size: 14px; margin: 8px 0 0 0;">Advanced Market Analytics • Strategic Business Intelligence • Data-Driven Insights</p>
            </div>
          </body>
          </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(structuredMarketContent);
          printWindow.document.close();
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 1000);
        }
      } else {
        throw new Error(result.error || 'Failed to generate market research');
      }
    } catch (error) {
      console.error('Market research failed:', error);
      alert('Failed to generate market research. Please try again.');
    } finally {
      setIsGenerating(null);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'My Startup Validation Results',
      text: `I just validated my startup idea "${validationData.startupTitle || 'my startup'}" with Drishti and got a ${validationResults.overall_score}/100 score with ${validationResults.viability_level} viability!`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Results link copied to clipboard!');
      } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = `${shareData.text} ${shareData.url}`;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Results link copied to clipboard!');
      }
    }
  };

  const handleExportPDF = () => {
    // Create a simple PDF export using browser print functionality
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${validationData.startupTitle || 'Startup'} - Validation Results</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .score-section { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .category { margin: 15px 0; padding: 15px; border-left: 4px solid #6366f1; }
            .suggestions { margin-left: 20px; }
            .suggestions li { margin: 5px 0; }
            h1 { color: #6366f1; }
            h2 { color: #374151; }
            .score { font-size: 24px; font-weight: bold; color: #6366f1; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${validationData.startupTitle || 'Startup'} - Validation Results</h1>
            <div class="score">Overall Score: ${validationResults.overall_score}/100</div>
            <div>Viability Level: ${validationResults.viability_level}</div>
          </div>

          <div class="score-section">
            <h2>Category Breakdown</h2>
            ${validationResults.scores.map(score => `
              <div class="category">
                <h3>${score.category}: ${score.score}%</h3>
                <p>${score.feedback}</p>
                <div class="suggestions">
                  <strong>Suggestions:</strong>
                  <ul>
                    ${score.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                  </ul>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="score-section">
            <h2>Recommended Next Steps</h2>
            <ol>
              <li>Validate Problem-Solution Fit: Conduct 20-30 customer interviews</li>
              <li>Build MVP: Create a minimum viable product to test core assumptions</li>
              <li>Strengthen Team: Consider adding technical co-founder or senior advisor</li>
              <li>Market Research: Conduct detailed market sizing and competitive analysis</li>
            </ol>
          </div>

          <div style="margin-top: 40px; text-align: center; color: #6b7280;">
            <p>Generated by Drishti - AI-powered startup intelligence platform</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait a bit for content to load, then trigger print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  // New handler functions for post-validation features with bulletproof error handling
  const handleGenerateAIPitch = async () => {
    if (!validationData) {
      alert('Validation data is missing. Please re-run the validation.');
      return;
    }

    setIsGenerating('ai-pitch');
    try {
      console.log('🚀 Starting AI pitch generation...');
      const result = await generateAIPitch(validationData);

      if (result && result.success && result.pitch_content) {
        console.log('✅ Pitch generated successfully');
        setGeneratedPitch(result.pitch_content);
        setShowPitchModal(true);
      } else if (result && result.pitch_content) {
        // Sometimes success flag might be missing but content is there
        console.log('⚠️ Pitch generated with warnings, using content anyway');
        setGeneratedPitch(result.pitch_content);
        setShowPitchModal(true);
      } else {
        console.error('Pitch generation returned invalid result:', result);
        throw new Error('Invalid pitch generation result');
      }
    } catch (error) {
      console.error('Pitch generation error caught, generating emergency content:', error);

      // Emergency fallback - generate basic pitch from validation data
      const emergencyPitch = {
        executiveSummary: `Our startup "${validationData.startupTitle || 'innovative solution'}" addresses ${validationData.problemStatement?.substring(0, 100) || 'a critical market need'}... With our ${validationData.revenueModel || 'innovative'} business model, we are positioned for significant growth and investor returns.`,
        problemStatement: validationData.problemStatement || 'The market faces significant challenges that impact efficiency and growth.',
        solutionOverview: validationData.solutionDescription || 'Our innovative solution addresses core market challenges through advanced technology.',
        marketOpportunity: `We target ${validationData.targetMarket || 'a growing market'} with ${validationData.marketSize || 'substantial'} opportunity and strong growth potential.`,
        businessModel: `Our ${validationData.revenueModel || 'subscription'} model with ${validationData.pricingStrategy || 'competitive pricing'} ensures sustainable revenue growth.`,
        competitiveAdvantage: validationData.competitiveAdvantage || 'We provide unique value through superior technology and market positioning.',
        fundingRequirements: validationData.fundingNeeds || 'We seek strategic investment to accelerate growth and market expansion.'
      };

      setGeneratedPitch(emergencyPitch);
      setShowPitchModal(true);

      // Show user that fallback was used
      setTimeout(() => {
        alert('ℹ️ Pitch generated using offline analysis. Content based on your validation data.');
      }, 1000);
    } finally {
      setIsGenerating(null);
    }
  };

  const handleVisibilityChange = (isPublicValue) => {
    setIsPublic(isPublicValue);

    if (isPublicValue && validationData && validationResults) {
      // Save to public startup ideas
      const publicIdea = {
        id: `idea_${Date.now()}`,
        ideaName: validationData.startupTitle || validationData.problemStatement?.substring(0, 50) + '...' || 'Unnamed Startup Idea',
        description: validationData.solutionDescription || 'No description provided',
        problemStatement: validationData.problemStatement || '',
        solutionDescription: validationData.solutionDescription || '',
        targetMarket: validationData.targetMarket || '',
        revenueModel: validationData.revenueModel || '',
        fundingNeeds: validationData.fundingNeeds || 'Not specified',
        industry: validationData.customerSegments || 'General',
        stage: validationData.currentStage || 'Idea',
        validationScore: validationResults.overall_score,
        viabilityLevel: validationResults.viability_level,
        createdAt: new Date().toISOString(),
        founder: JSON.parse(localStorage.getItem('currentUser') || '{}'),
        validationData: validationData,
        validationResults: validationResults
      };

      // Store in localStorage for demo (in real app would be database)
      const existingIdeas = JSON.parse(localStorage.getItem('publicStartupIdeas') || '[]');
      existingIdeas.push(publicIdea);
      localStorage.setItem('publicStartupIdeas', JSON.stringify(existingIdeas));

      alert('✅ Your startup idea is now public and visible to investors!');
    } else if (!isPublicValue) {
      alert('✅ Your startup idea is now private and hidden from public view.');
    }
  };

  const handlePostValidationSubmit = () => {
    setShowPostValidationOptions(false);
    alert('✅ Your preferences have been saved successfully!');
  };

  const copyPitchToClipboard = () => {
    if (!generatedPitch) return;

    const sections = [
      'Executive Summary: ' + generatedPitch.executiveSummary,
      'Problem Statement: ' + generatedPitch.problemStatement,
      'Solution Overview: ' + generatedPitch.solutionOverview,
      'Market Opportunity: ' + generatedPitch.marketOpportunity,
      'Business Model: ' + generatedPitch.businessModel,
      'Competitive Advantage: ' + generatedPitch.competitiveAdvantage,
      'Funding Requirements: ' + generatedPitch.fundingRequirements
    ];

    const fullPitch = sections.join('\n\n');

    navigator.clipboard.writeText(fullPitch).then(() => {
      alert('Pitch copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = fullPitch;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Pitch copied to clipboard!');
    });
  };

  // Use real validation results
  const overallScore = validationResults.overall_score;
  const viabilityLevel = validationResults.viability_level;
  const scores = validationResults.scores;
  const founderReadinessScore = validationResults.founder_readiness_score;
  const clarityScore = validationResults.clarity_score;
  const investorReadinessScore = validationResults.investor_readiness_score;

  const getRecommendation = (score) => {
    if (score >= 80) return {
      title: "Investor Ready",
      description: "Your startup is ready for institutional investors. Consider approaching VCs and institutional funding.",
      actions: ["Prepare detailed financial projections", "Build investor deck", "Network with VCs", "Consider Series A preparation"]
    };
    if (score >= 65) return {
      title: "Angel Investor Ready",
      description: "You're ready for angel investors and early-stage funding. Focus on building traction.",
      actions: ["Approach angel investors", "Join angel networks", "Build MVP and get customers", "Refine business model"]
    };
    if (score >= 50) return {
      title: "Accelerator Ready",
      description: "Consider joining an accelerator program to strengthen your foundation and get mentorship.",
      actions: ["Apply to accelerator programs", "Build stronger team", "Validate market further", "Develop prototype"]
    };
    return {
      title: "Bootstrap Stage",
      description: "Focus on self-funding and proving concept before seeking external investment.",
      actions: ["Bootstrap with personal funds", "Validate problem-solution fit", "Build founding team", "Create detailed business plan"]
    };
  };

  const readinessLevel = getInvestorReadinessLevel(investorReadinessScore);
  const recommendation = getRecommendation(investorReadinessScore);

  const handleViewComparison = () => {
    setShowComparison(true);
  };

  const handleBackFromComparison = () => {
    setShowComparison(false);
  };

  // If showing comparison, render the comparison component
  if (showComparison) {
    return (
      <StartupComparison
        validationData={validationData}
        onBack={handleBackFromComparison}
      />
    );
  }

  const getViabilityBadge = (level) => {
    const colors = {
      'High': 'bg-green-500 text-white',
      'Moderate': 'bg-yellow-500 text-white',
      'Low': 'bg-red-500 text-white'
    };
    return colors[level] || 'bg-gray-500 text-white';
  };

  const similarStartups = [
    {
      name: 'Slack',
      description: 'Team communication platform',
      similarity: 'Communication/collaboration focus',
      outcome: 'Acquired by Salesforce for $27.7B'
    },
    {
      name: 'Zoom',
      description: 'Video conferencing platform',
      similarity: 'Remote work enablement',
      outcome: 'IPO 2019, valued at $100B+'
    },
    {
      name: 'Notion',
      description: 'All-in-one workspace',
      similarity: 'Productivity and organization',
      outcome: 'Valued at $10B in Series C'
    }
  ];

  const generateGovernmentSchemes = (validationData) => {
    if (!validationData) return [];

    const userText = (
      validationData.problemStatement + ' ' +
      validationData.solutionDescription + ' ' +
      validationData.targetMarket
    ).toLowerCase();

    // Base schemes available to all startups
    const baseSchemes = [
      {
        name: "Startup India Scheme",
        description: "Tax exemptions, faster patent examination, and self-certification compliance",
        eligibility: "Incorporated in India, under 10 years old, annual turnover <₹100 crores",
        benefits: "3-year tax exemption, 80% rebate on patent filing, easier compliance",
        amount: "Up to ₹10 lakh tax savings",
        link: "https://www.startupindia.gov.in",
        category: "General"
      },
      {
        name: "MUDRA Loan Scheme",
        description: "Micro-finance for small businesses and startups",
        eligibility: "Non-agricultural income generating activities, funding up to ₹10 lakh",
        benefits: "No collateral required, competitive interest rates",
        amount: "₹50,000 - ₹10 lakh",
        link: "https://www.mudra.org.in",
        category: "General"
      },
      {
        name: "Stand-Up India Scheme",
        description: "Bank loans for SC/ST and women entrepreneurs",
        eligibility: "SC/ST or women entrepreneurs, greenfield projects",
        benefits: "Preferential lending, mentorship support",
        amount: "₹10 lakh - ₹1 crore",
        link: "https://www.standupmitra.in",
        category: "General"
      }
    ];

    // Industry-specific schemes
    let industrySchemes = [];

    if (userText.includes('healthcare') || userText.includes('medical') || userText.includes('health')) {
      industrySchemes = [
        {
          name: "Biotechnology Ignition Grant (BIG)",
          description: "Support for biotech and healthcare startups",
          eligibility: "Biotech/healthcare startups with innovative products",
          benefits: "Funding for product development and validation",
          amount: "Up to ₹50 lakh",
          link: "https://birac.nic.in",
          category: "HealthTech"
        },
        {
          name: "Ayushman Bharat Digital Mission",
          description: "Digital health ID and health tech support",
          eligibility: "Digital health solutions and platforms",
          benefits: "Integration support, government backing",
          amount: "Technical support + market access",
          link: "https://abdm.gov.in",
          category: "HealthTech"
        }
      ];
    } else if (userText.includes('education') || userText.includes('learning') || userText.includes('student')) {
      industrySchemes = [
        {
          name: "PM eVIDYA Scheme",
          description: "Digital education infrastructure support",
          eligibility: "EdTech companies providing digital learning solutions",
          benefits: "Government partnership opportunities, content distribution",
          amount: "Partnership + market access",
          link: "https://www.mhrd.gov.in",
          category: "EdTech"
        },
        {
          name: "SWAYAM Platform Integration",
          description: "Integration with national education platform",
          eligibility: "Quality educational content providers",
          benefits: "Access to millions of students, government credibility",
          amount: "Revenue sharing opportunities",
          link: "https://swayam.gov.in",
          category: "EdTech"
        }
      ];
    } else if (userText.includes('environment') || userText.includes('sustainable') || userText.includes('green')) {
      industrySchemes = [
        {
          name: "National Clean Energy Fund",
          description: "Funding for clean energy and environmental projects",
          eligibility: "Clean energy, waste management, environmental solutions",
          benefits: "Grants and low-interest loans for green initiatives",
          amount: "₹10 lakh - ₹5 crore",
          link: "https://mnre.gov.in",
          category: "CleanTech"
        }
      ];
    } else if (userText.includes('technology') || userText.includes('software') || userText.includes('ai')) {
      industrySchemes = [
        {
          name: "Technology Incubation and Development of Entrepreneurs (TIDE)",
          description: "Support for ICT-based startups",
          eligibility: "ICT and technology startups",
          benefits: "Technical mentorship, funding support",
          amount: "Up to ₹15 lakh",
          link: "https://tide.gov.in",
          category: "Technology"
        }
      ];
    }

    return [...baseSchemes, ...industrySchemes];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Action Buttons */}
          <div className="flex justify-end items-center space-x-4 mb-6">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/validate">
                <RefreshCw className="w-4 h-4 mr-2" />
                New Validation
              </Link>
            </Button>
          </div>

          {/* Results Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{validationData.startupTitle || 'Startup'} - Validation Results</h1>
                <p className="text-muted-foreground">
                  Complete analysis of your startup idea with AI-powered insights
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary mb-2">{typeof overallScore === 'number' && !isNaN(overallScore) ? overallScore : 0}/100</div>
                <Badge className={getViabilityBadge(viabilityLevel)}>
                  {viabilityLevel} Viability
                </Badge>
              </div>
            </div>

            {/* Post-Validation Options */}
            {showPostValidationOptions && (
              <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <span>What's Next for Your Startup?</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPostValidationOptions(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Choose your next steps to accelerate your startup journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Generate AI Pitch */}
                    <div className="p-6 border rounded-lg bg-white">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">Generate Pitch Deck</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Create professional, structured investor pitch deck
                          </p>
                          <Button
                            onClick={handleGeneratePitchDeck}
                            disabled={isGenerating === 'pitch'}
                            className="w-full"
                            size="sm"
                          >
                            {isGenerating === 'pitch' ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Market Research */}
                    <div className="p-6 border rounded-lg bg-white">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">Market Research</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Generate structured market analysis report
                          </p>
                          <Button
                            onClick={handleMarketResearch}
                            disabled={isGenerating === 'market'}
                            className="w-full"
                            size="sm"
                            variant="outline"
                          >
                            {isGenerating === 'market' ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                Generating...
                              </>
                            ) : (
                              <>
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Generate
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Founder Readiness */}
                    <div className="p-6 border rounded-lg bg-white">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Brain className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">Founder Check</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Structured founder readiness assessment
                          </p>
                          <Button
                            onClick={handleFounderReadiness}
                            disabled={isGenerating === 'founder'}
                            className="w-full"
                            size="sm"
                            variant="outline"
                          >
                            {isGenerating === 'founder' ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                Checking...
                              </>
                            ) : (
                              <>
                                <Brain className="w-4 h-4 mr-2" />
                                Check
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* SWOT Analysis */}
                    <div className="p-6 border rounded-lg bg-white">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Target className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">SWOT Analysis</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Structured strategic analysis report
                          </p>
                          <Button
                            onClick={handleSWOTAnalysis}
                            disabled={isGenerating === 'swot'}
                            className="w-full"
                            size="sm"
                            variant="outline"
                          >
                            {isGenerating === 'swot' ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Target className="w-4 h-4 mr-2" />
                                Analyze
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visibility Settings */}
                  <div className="p-6 border rounded-lg bg-white">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">Startup Visibility</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Make your startup visible to investors or keep it private
                        </p>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {isPublic ? (
                              <Globe className="w-4 h-4 text-green-600" />
                            ) : (
                              <Lock className="w-4 h-4 text-gray-500" />
                            )}
                            <Label htmlFor="visibility-toggle" className="text-sm font-medium">
                              {isPublic ? 'Public - Visible to investors' : 'Private - Hidden from public'}
                            </Label>
                          </div>
                          <Switch
                            id="visibility-toggle"
                            checked={isPublic}
                            onCheckedChange={handleVisibilityChange}
                          />
                        </div>
                        {isPublic && (
                          <p className="text-xs text-green-600 mt-2 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Your idea is now visible to investors on Drishti
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <Button onClick={handlePostValidationSubmit}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Pitch Modal */}
            <Dialog open={showPitchModal} onOpenChange={setShowPitchModal}>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    <span className="text-2xl">AI-Generated Investor Pitch</span>
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    Professional, data-driven pitch content powered by advanced AI analysis of your validation results
                  </DialogDescription>
                </DialogHeader>

                {generatedPitch && (
                  <div className="space-y-8">
                    {/* Pitch Quality Indicator */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-800">High-Quality AI Pitch Generated</span>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Investor-Ready
                        </Badge>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Based on {validationResults.overall_score}/100 validation score • {validationResults.scores?.length || 6} categories analyzed
                      </p>
                    </div>

                    <div className="grid gap-8">
                      {/* Executive Summary - Featured */}
                      <div className="bg-gradient-to-r from-primary/5 to-blue-50 p-6 border-2 border-primary/20 rounded-lg">
                        <h3 className="font-bold text-xl text-primary mb-4 flex items-center">
                          <Target className="w-6 h-6 mr-3" />
                          Executive Summary
                        </h3>
                        <p className="text-base leading-relaxed font-medium">{generatedPitch.executiveSummary}</p>
                      </div>

                      {/* Two-column layout for remaining sections */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="p-6 border rounded-lg bg-orange-50 border-orange-200">
                          <h3 className="font-semibold text-lg text-orange-800 mb-4 flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            Problem Statement
                          </h3>
                          <p className="text-sm leading-relaxed text-gray-700">{generatedPitch.problemStatement}</p>
                        </div>

                        <div className="p-6 border rounded-lg bg-green-50 border-green-200">
                          <h3 className="font-semibold text-lg text-green-800 mb-4 flex items-center">
                            <Lightbulb className="w-5 h-5 mr-2" />
                            Solution Overview
                          </h3>
                          <p className="text-sm leading-relaxed text-gray-700">{generatedPitch.solutionOverview}</p>
                        </div>

                        <div className="p-6 border rounded-lg bg-blue-50 border-blue-200">
                          <h3 className="font-semibold text-lg text-blue-800 mb-4 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2" />
                            Market Opportunity
                          </h3>
                          <p className="text-sm leading-relaxed text-gray-700">{generatedPitch.marketOpportunity}</p>
                        </div>

                        <div className="p-6 border rounded-lg bg-green-50 border-green-200">
                          <h3 className="font-semibold text-lg text-green-800 mb-4 flex items-center">
                            <DollarSign className="w-5 h-5 mr-2" />
                            Business Model
                          </h3>
                          <p className="text-sm leading-relaxed text-gray-700">{generatedPitch.businessModel}</p>
                        </div>

                        <div className="p-6 border rounded-lg bg-purple-50 border-purple-200">
                          <h3 className="font-semibold text-lg text-purple-800 mb-4 flex items-center">
                            <Trophy className="w-5 h-5 mr-2" />
                            Competitive Advantage
                          </h3>
                          <p className="text-sm leading-relaxed text-gray-700">{generatedPitch.competitiveAdvantage}</p>
                        </div>

                        <div className="p-6 border rounded-lg bg-yellow-50 border-yellow-200">
                          <h3 className="font-semibold text-lg text-yellow-800 mb-4 flex items-center">
                            <Users className="w-5 h-5 mr-2" />
                            Funding Requirements
                          </h3>
                          <p className="text-sm leading-relaxed text-gray-700">{generatedPitch.fundingRequirements}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-6 border-t bg-muted/30 p-4 rounded-lg">
                      <div className="flex space-x-3">
                        <Button variant="outline" onClick={copyPitchToClipboard}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Full Pitch
                        </Button>
                        <Button variant="outline" onClick={() => {
                          const pitchWindow = window.open('', '_blank');
                          if (pitchWindow) {
                            const html = `
                              <html>
                                <head><title>AI Generated Pitch - ${validationData?.startupTitle || validationData?.problemStatement?.substring(0, 30) || 'Startup Pitch'}</title></head>
                                <body style="font-family: Arial; padding: 40px; line-height: 1.6;">
                                  <h1>AI-Generated Investor Pitch</h1>
                                  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <h2>Executive Summary</h2>
                                    <p>${generatedPitch.executiveSummary}</p>
                                  </div>
                                  <h2>Problem Statement</h2>
                                  <p>${generatedPitch.problemStatement}</p>
                                  <h2>Solution Overview</h2>
                                  <p>${generatedPitch.solutionOverview}</p>
                                  <h2>Market Opportunity</h2>
                                  <p>${generatedPitch.marketOpportunity}</p>
                                  <h2>Business Model</h2>
                                  <p>${generatedPitch.businessModel}</p>
                                  <h2>Competitive Advantage</h2>
                                  <p>${generatedPitch.competitiveAdvantage}</p>
                                  <h2>Funding Requirements</h2>
                                  <p>${generatedPitch.fundingRequirements}</p>
                                </body>
                              </html>
                            `;
                            pitchWindow.document.write(html);
                            pitchWindow.document.close();
                          }
                        }}>
                          <Download className="w-4 h-4 mr-2" />
                          Export as HTML
                        </Button>
                      </div>

                      <Button onClick={() => setShowPitchModal(false)} size="lg">
                        <Eye className="w-4 h-4 mr-2" />
                        Close Pitch
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Overall Score Visualization */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span>Overall Validation Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Startup Viability</span>
                    <span className="text-2xl font-bold text-primary">{typeof overallScore === 'number' && !isNaN(overallScore) ? overallScore : 0}%</span>
                  </div>
                  <Progress value={typeof overallScore === 'number' && !isNaN(overallScore) ? overallScore : 0} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low (0-40)</span>
                    <span>Moderate (41-70)</span>
                    <span>High (71-100)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investor Readiness Meter */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span>Investor Readiness Meter</span>
                </CardTitle>
                <CardDescription>
                  Combined assessment of viability, founder readiness, and idea clarity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Main Readiness Score */}
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">{investorReadinessScore}/100</div>
                    <Badge className={`${readinessLevel.color} ${readinessLevel.bg} ${readinessLevel.border} border`}>
                      {readinessLevel.level}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Investor Readiness</span>
                      <span className="font-semibold">{investorReadinessScore}%</span>
                    </div>
                    <Progress value={investorReadinessScore} className="h-4" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Bootstrap (0-49)</span>
                      <span>Accelerator (50-64)</span>
                      <span>Angel (65-79)</span>
                      <span>Investor (80+)</span>
                    </div>
                  </div>

                  {/* Component Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">{typeof overallScore === 'number' && !isNaN(overallScore) ? overallScore : 0}%</div>
                      <div className="text-sm text-muted-foreground">Viability Score</div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">{founderReadinessScore}%</div>
                      <div className="text-sm text-muted-foreground">Founder Readiness</div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">{clarityScore}%</div>
                      <div className="text-sm text-muted-foreground">Idea Clarity</div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className={`p-4 rounded-lg border ${readinessLevel.border} ${readinessLevel.bg}`}>
                    <h4 className={`font-semibold mb-2 ${readinessLevel.color}`}>
                      📊 {recommendation.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {recommendation.description}
                    </p>
                    <div>
                      <div className="text-sm font-medium mb-2">Recommended Actions:</div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {recommendation.actions.map((action, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Score Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scores.map((score, index) => (
                  <Card key={index} className={`border-l-4 ${
                    score.score >= 80 ? 'border-l-green-500' : 
                    score.score >= 60 ? 'border-l-yellow-500' : 'border-l-red-500'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{score.category}</CardTitle>
                        <Badge variant="outline" className={getScoreColor(score.score)}>
                          {score.score}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Progress value={score.score} className="mb-3 h-2" />
                      <p className="text-sm text-muted-foreground">{score.feedback}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Key Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>Strengths</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Strong problem-solution fit with clear value proposition</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Solid business model with viable revenue streams</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Good execution readiness and planning</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Realistic approach to market entry</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-yellow-600">
                      <AlertTriangle className="w-5 h-5" />
                      <span>Areas for Improvement</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Team could benefit from additional technical expertise</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Market sizing and segmentation needs refinement</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Competitive differentiation could be stronger</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Consider more diverse revenue models</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Detailed Analysis Tab */}
            <TabsContent value="detailed" className="space-y-6">
              {scores.map((score, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{score.category}</CardTitle>
                      <div className="flex items-center space-x-3">
                        <Progress value={score.score} className="w-24 h-2" />
                        <Badge variant="outline" className={getScoreColor(score.score)}>
                          {score.score}%
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{score.feedback}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">Improvement Suggestions:</h4>
                      <ul className="space-y-2">
                        {score.suggestions.map((suggestion, suggestionIndex) => (
                          <li key={suggestionIndex} className="flex items-start space-x-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span>Recommended Next Steps</span>
                  </CardTitle>
                  <CardDescription>
                    Priority actions to strengthen your startup idea
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Badge className="bg-red-500 text-white">1</Badge>
                      <div>
                        <h4 className="font-semibold">Validate Problem-Solution Fit</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Conduct 20-30 customer interviews to validate the problem severity and solution approach
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Badge className="bg-orange-500 text-white">2</Badge>
                      <div>
                        <h4 className="font-semibold">Build MVP</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Create a minimum viable product to test core assumptions with early users
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Badge className="bg-yellow-500 text-white">3</Badge>
                      <div>
                        <h4 className="font-semibold">Strengthen Team</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Consider adding technical co-founder or senior advisor with relevant experience
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Badge className="bg-green-500 text-white">4</Badge>
                      <div>
                        <h4 className="font-semibold">Market Research</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Conduct detailed market sizing and competitive analysis
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Similar Startups */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      <span>Similar Successful Startups</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleViewComparison}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Smart Comparison
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Learn from companies with similar models or markets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {similarStartups.map((startup, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{startup.name}</h4>
                          <Badge variant="outline">Similar</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{startup.description}</p>
                        <p className="text-sm"><strong>Similarity:</strong> {startup.similarity}</p>
                        <p className="text-sm text-green-600 mt-1"><strong>Outcome:</strong> {startup.outcome}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Government Schemes & Subsidies */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <span>Government Schemes & Financial Support</span>
                  </CardTitle>
                  <CardDescription>
                    Available government programs and subsidies for your startup
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateGovernmentSchemes(validationData).map((scheme, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-green-800">{scheme.name}</h4>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {scheme.category}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-primary">{scheme.amount}</div>
                            <a 
                              href={scheme.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center mt-1"
                            >
                              Apply Online <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{scheme.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <strong className="text-gray-600">Eligibility:</strong>
                            <p className="text-gray-600 mt-1">{scheme.eligibility}</p>
                          </div>
                          <div>
                            <strong className="text-gray-600">Benefits:</strong>
                            <p className="text-gray-600 mt-1">{scheme.benefits}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">💡 Application Tips</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Ensure your startup is registered and compliant before applying</li>
                      <li>• Prepare detailed business plan and financial projections</li>
                      <li>• Keep all legal documents and certificates ready</li>
                      <li>• Apply early as many schemes have limited funding or deadlines</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
