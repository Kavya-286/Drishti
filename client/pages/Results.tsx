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
  Sparkles
} from 'lucide-react';
import { ValidationData, ValidationResult, ValidationScore, generateAIPitch, generateSWOTAnalysis, checkFounderReadiness, generateMarketResearch, getViabilityLevel, getInvestorReadinessLevel, getScoreColor } from '@shared/api';
import StartupComparison from './StartupComparison';

export default function Results() {
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'recommendations'>('overview');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);
  const [validationData, setValidationData] = useState<ValidationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showComparison, setShowComparison] = useState(false);

  // New state for post-validation options
  const [showPostValidationOptions, setShowPostValidationOptions] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [generatedPitch, setGeneratedPitch] = useState<any>(null);
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

  const saveValidationToHistory = (results: ValidationResult, data: ValidationData) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (!currentUser.id) return;

      const historyItem = {
        id: `val_${Date.now()}`,
        ideaName: data.problemStatement?.substring(0, 50) + '...' || 'Unnamed Idea',
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

  const extractCategory = (data: ValidationData): string => {
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
        // Create a pitch deck content with real data
        const pitchContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Startup Pitch Deck</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
              .slide { background: white; padding: 40px; margin: 20px 0; min-height: 500px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); page-break-after: always; }
              .slide h1 { color: #6366f1; font-size: 36px; margin-bottom: 20px; }
              .slide h2 { color: #374151; font-size: 28px; margin-bottom: 15px; }
              .slide p { font-size: 18px; line-height: 1.6; color: #6b7280; }
              .highlight { background: #6366f1; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .center { text-align: center; }
            </style>
          </head>
          <body>
            <div class="slide center">
              <h1>Your Startup Name</h1>
              <p style="font-size: 24px;">Transforming [Industry] with [Solution]</p>
              <div class="highlight">
                <p>Validation Score: ${validationResults.overall_score}/100 | ${validationResults.viability_level} Viability</p>
              </div>
            </div>

            <div class="slide">
              <h1>Problem</h1>
              <h2>The Challenge We're Solving</h2>
              <p>${validationData.problemStatement}</p>
            </div>

            <div class="slide">
              <h1>Solution</h1>
              <h2>Our Approach</h2>
              <p>${validationData.solutionDescription}</p>
              <p><strong>Unique Value Proposition:</strong></p>
              <p>${validationData.uniqueValueProposition}</p>
            </div>

            <div class="slide">
              <h1>Market</h1>
              <h2>Market Analysis</h2>
              <p><strong>Target Market:</strong> ${validationData.targetMarket}</p>
              <p><strong>Market Size:</strong> ${validationData.marketSize}</p>
              <p><strong>Customer Segments:</strong> ${validationData.customerSegments}</p>
            </div>

            <div class="slide">
              <h1>Business Model</h1>
              <h2>Revenue Strategy</h2>
              <p><strong>Revenue Model:</strong> ${validationData.revenueModel}</p>
              <p><strong>Pricing Strategy:</strong> ${validationData.pricingStrategy}</p>
              <p><strong>Key Metrics:</strong> ${validationData.keyMetrics}</p>
            </div>

            <div class="slide">
              <h1>Traction</h1>
              <h2>Progress & Milestones</h2>
              <p><strong>Current Stage:</strong> ${validationData.currentStage}</p>
              <p><strong>Existing Traction:</strong> ${validationData.existingTraction}</p>
            </div>

            <div class="slide">
              <h1>Funding</h1>
              <h2>Investment Requirements</h2>
              <p>${validationData.fundingNeeds}</p>
            </div>
          </body>
          </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(pitchContent);
          printWindow.document.close();
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 500);
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
        const swotContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>SWOT Analysis Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .swot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
              .swot-section { padding: 20px; border-radius: 8px; min-height: 200px; }
              .strengths { background: #ecfdf5; border-left: 4px solid #10b981; }
              .weaknesses { background: #fef2f2; border-left: 4px solid #ef4444; }
              .opportunities { background: #eff6ff; border-left: 4px solid #3b82f6; }
              .threats { background: #fefce8; border-left: 4px solid #f59e0b; }
              h1 { color: #6366f1; }
              h2 { margin-top: 0; }
              ul { padding-left: 20px; }
            </style>
          </head>
          <body>
            <h1>SWOT Analysis Report</h1>
            <p><strong>Startup Validation Score:</strong> ${validationResults.overall_score}/100</p>

            <div class="swot-grid">
              <div class="swot-section strengths">
                <h2>🟢 Strengths</h2>
                <ul>
                  ${result.swot_analysis.strengths.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>

              <div class="swot-section weaknesses">
                <h2>🔴 Weaknesses</h2>
                <ul>
                  ${result.swot_analysis.weaknesses.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>

              <div class="swot-section opportunities">
                <h2>🔵 Opportunities</h2>
                <ul>
                  ${result.swot_analysis.opportunities.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>

              <div class="swot-section threats">
                <h2>🟡 Threats</h2>
                <ul>
                  ${result.swot_analysis.threats.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>
            </div>

            <h2>Strategic Recommendations</h2>
            <ul>
              <li>Leverage strengths to capitalize on opportunities</li>
              <li>Address weaknesses through strategic partnerships</li>
              <li>Monitor threats and develop contingency plans</li>
              <li>Focus on unique differentiators</li>
            </ul>
          </body>
          </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(swotContent);
          printWindow.document.close();
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 500);
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
      const result = await checkFounderReadiness(validationData);
      
      if (result.success && result.assessment) {
        const assessment = result.assessment;
        alert(`
Founder Readiness Assessment Complete!

✅ Entrepreneurial Mindset: ${assessment.categories.entrepreneurial_mindset}/100
✅ Technical Skills: ${assessment.categories.technical_skills}/100
✅ Business Acumen: ${assessment.categories.business_acumen}/100
✅ Leadership Ability: ${assessment.categories.leadership_ability}/100
⚠️  Financial Management: ${assessment.categories.financial_management}/100
⚠️  Network & Connections: ${assessment.categories.network_connections}/100

Overall Readiness: ${assessment.overall_score}/100

Recommendations:
${assessment.recommendations.map(rec => `• ${rec}`).join('\n')}
        `);
      } else {
        throw new Error(result.error || 'Failed to assess founder readiness');
      }
    } catch (error) {
      console.error('Founder readiness assessment failed:', error);
      alert('Failed to assess founder readiness. Please try again.');
    } finally {
      setIsGenerating(null);
    }
  };

  const handleMarketResearch = async () => {
    setIsGenerating('market');
    
    try {
      const result = await generateMarketResearch(validationData);
      
      if (result.success && result.market_data) {
        const marketContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Market Research Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .section { margin: 30px 0; padding: 20px; border-left: 4px solid #6366f1; background: #f8f9fa; }
              .metric { display: inline-block; margin: 10px 20px 10px 0; padding: 15px; background: white; border-radius: 8px; border: 1px solid #e5e7eb; }
              .metric-value { font-size: 24px; font-weight: bold; color: #6366f1; }
              .metric-label { font-size: 12px; color: #6b7280; }
              h1 { color: #6366f1; }
              h2 { color: #374151; }
            </style>
          </head>
          <body>
            <h1>Market Research Report</h1>
            <p><strong>Based on your startup validation with score:</strong> ${validationResults.overall_score}/100</p>

            <div class="section">
              <h2>Market Size Analysis</h2>
              <div class="metric">
                <div class="metric-value">${result.market_data.market_size.tam}</div>
                <div class="metric-label">Total Addressable Market</div>
              </div>
              <div class="metric">
                <div class="metric-value">${result.market_data.market_size.sam}</div>
                <div class="metric-label">Serviceable Available Market</div>
              </div>
              <div class="metric">
                <div class="metric-value">${result.market_data.market_size.som}</div>
                <div class="metric-label">Serviceable Obtainable Market</div>
              </div>
            </div>

            <div class="section">
              <h2>Customer Segments</h2>
              <ul>
                <li><strong>Primary:</strong> ${result.market_data.customer_segments.primary}</li>
                <li><strong>Secondary:</strong> ${result.market_data.customer_segments.secondary}</li>
                <li><strong>Tertiary:</strong> ${result.market_data.customer_segments.tertiary}</li>
                <li><strong>Other:</strong> ${result.market_data.customer_segments.other}</li>
              </ul>
            </div>

            <div class="section">
              <h2>Competitive Landscape</h2>
              <ul>
                <li><strong>Direct Competitors:</strong> ${result.market_data.competitive_landscape.direct_competitors} established players</li>
                <li><strong>Indirect Competitors:</strong> ${result.market_data.competitive_landscape.indirect_competitors} alternative solutions</li>
                <li><strong>Market Position:</strong> ${result.market_data.competitive_landscape.competitive_intensity} competitive intensity</li>
                <li><strong>Market Leader Share:</strong> ${result.market_data.competitive_landscape.market_leader_share}</li>
              </ul>
            </div>

            <div class="section">
              <h2>Market Trends</h2>
              <ul>
                ${result.market_data.market_trends.map(trend => `<li>${trend}</li>`).join('')}
              </ul>
            </div>

            <div class="section">
              <h2>Growth Projections</h2>
              <ul>
                <li><strong>Year 1:</strong> ${result.market_data.growth_projections.year_1}</li>
                <li><strong>Year 2:</strong> ${result.market_data.growth_projections.year_2}</li>
                <li><strong>Year 3:</strong> ${result.market_data.growth_projections.year_3}</li>
                <li><strong>Year 5:</strong> ${result.market_data.growth_projections.year_5}</li>
              </ul>
            </div>

            <div class="section">
              <h2>Recommendations</h2>
              <ul>
                <li>Target early-stage entrepreneurs first</li>
                <li>Focus on AI-powered differentiation</li>
                <li>Build strong online presence</li>
                <li>Consider freemium pricing model</li>
              </ul>
            </div>
          </body>
          </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(marketContent);
          printWindow.document.close();
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 500);
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
      text: `I just validated my startup idea with Drishti and got a ${validationResults.overall_score}/100 score with ${validationResults.viability_level} viability!`,
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
          <title>Startup Validation Results</title>
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
            <h1>Startup Validation Results</h1>
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
        executiveSummary: `Our startup addresses ${validationData.problemStatement?.substring(0, 100) || 'a critical market need'}... With our ${validationData.revenueModel || 'innovative'} business model, we are positioned for significant growth and investor returns.`,
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

  const handleVisibilityChange = (isPublicValue: boolean) => {
    setIsPublic(isPublicValue);

    if (isPublicValue && validationData && validationResults) {
      // Save to public startup ideas
      const publicIdea = {
        id: `idea_${Date.now()}`,
        ideaName: validationData.problemStatement?.substring(0, 50) + '...' || 'Unnamed Startup Idea',
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

  const getRecommendation = (score: number) => {
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

  const getViabilityBadge = (level: string) => {
    const colors = {
      'High': 'bg-green-500 text-white',
      'Moderate': 'bg-yellow-500 text-white',
      'Low': 'bg-red-500 text-white'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-500 text-white';
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
                <h1 className="text-3xl font-bold mb-2">Startup Validation Results</h1>
                <p className="text-muted-foreground">
                  Complete analysis of your startup idea with AI-powered insights
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary mb-2">{overallScore}/100</div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Generate AI Pitch */}
                    <div className="p-6 border rounded-lg bg-white">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">Generate AI Pitch Deck</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Create a professional, investor-ready pitch deck based on your validation results
                          </p>
                          <Button
                            onClick={handleGenerateAIPitch}
                            disabled={isGenerating === 'ai-pitch'}
                            className="w-full"
                          >
                            {isGenerating === 'ai-pitch' ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate Pitch
                              </>
                            )}
                          </Button>
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
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span>AI-Generated Pitch Deck</span>
                  </DialogTitle>
                  <DialogDescription>
                    Professional pitch content generated from your validation data
                  </DialogDescription>
                </DialogHeader>

                {generatedPitch && (
                  <div className="space-y-6">
                    <div className="grid gap-6">
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold text-primary mb-3 flex items-center">
                          <Target className="w-4 h-4 mr-2" />
                          Executive Summary
                        </h3>
                        <p className="text-sm leading-relaxed">{generatedPitch.executiveSummary}</p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold text-primary mb-3 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Problem Statement
                        </h3>
                        <p className="text-sm leading-relaxed">{generatedPitch.problemStatement}</p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold text-primary mb-3 flex items-center">
                          <Lightbulb className="w-4 h-4 mr-2" />
                          Solution Overview
                        </h3>
                        <p className="text-sm leading-relaxed">{generatedPitch.solutionOverview}</p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold text-primary mb-3 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Market Opportunity
                        </h3>
                        <p className="text-sm leading-relaxed">{generatedPitch.marketOpportunity}</p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold text-primary mb-3 flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Business Model
                        </h3>
                        <p className="text-sm leading-relaxed">{generatedPitch.businessModel}</p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold text-primary mb-3 flex items-center">
                          <Trophy className="w-4 h-4 mr-2" />
                          Competitive Advantage
                        </h3>
                        <p className="text-sm leading-relaxed">{generatedPitch.competitiveAdvantage}</p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold text-primary mb-3 flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Funding Requirements
                        </h3>
                        <p className="text-sm leading-relaxed">{generatedPitch.fundingRequirements}</p>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t">
                      <Button variant="outline" onClick={copyPitchToClipboard}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy to Clipboard
                      </Button>
                      <Button onClick={() => setShowPitchModal(false)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Close
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
                    <span className="text-2xl font-bold text-primary">{overallScore}%</span>
                  </div>
                  <Progress value={overallScore} className="h-3" />
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
                      <div className="text-2xl font-bold text-primary mb-1">{overallScore}%</div>
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

          <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)} className="space-y-6">
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
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <span>Similar Successful Startups</span>
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

              {/* Additional Tools */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-primary" />
                      <span>AI-Powered Add-ons</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleGeneratePitchDeck}
                      disabled={isGenerating === 'pitch'}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {isGenerating === 'pitch' ? 'Generating...' : 'Generate Pitch Deck'}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleSWOTAnalysis}
                      disabled={isGenerating === 'swot'}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      {isGenerating === 'swot' ? 'Generating...' : 'SWOT Analysis'}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleFounderReadiness}
                      disabled={isGenerating === 'founder'}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      {isGenerating === 'founder' ? 'Analyzing...' : 'Founder Readiness Check'}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleMarketResearch}
                      disabled={isGenerating === 'market'}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      {isGenerating === 'market' ? 'Researching...' : 'Market Research Report'}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleViewComparison}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Compare with Similar Startups
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <span>Quick Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full" onClick={handleExportPDF}>
                      <Download className="w-4 h-4 mr-2" />
                      Download Full Report
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share with Team
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/validate">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Validate Another Idea
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
