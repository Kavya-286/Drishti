import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Download,
  Share2,
  Brain,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  User,
  Trophy
} from 'lucide-react';
import { checkFounderReadiness } from '@shared/api';

export default function FounderReadiness() {
  const navigate = useNavigate();
  const location = useLocation();
  const [validationData, setValidationData] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get validation data from location state or localStorage
        let data = location.state?.validationData;
        if (!data) {
          const stored = localStorage.getItem('validationData');
          if (stored) {
            data = JSON.parse(stored);
          }
        }

        if (!data) {
          navigate('/validate');
          return;
        }

        setValidationData(data);

        // Generate founder readiness assessment
        const result = await checkFounderReadiness(data);
        
        if (result.success && result.assessment) {
          setAssessment(result.assessment);
        } else {
          throw new Error(result.error || 'Failed to generate assessment');
        }
      } catch (err) {
        console.error('Error loading founder readiness:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [location.state, navigate]);

  const handleExportReport = () => {
    if (!assessment || !validationData) return;

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
  };

  const handleShare = async () => {
    if (!assessment || !validationData) return;

    const shareData = {
      title: 'My Founder Readiness Assessment',
      text: `I just completed my founder readiness assessment with Drishti and got a ${assessment.overall_score}/100 score! Check out my entrepreneurial capabilities.`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Assessment link copied to clipboard!');
      } catch (error) {
        const textArea = document.createElement('textarea');
        textArea.value = `${shareData.text} ${shareData.url}`;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Assessment link copied to clipboard!');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Generating your founder readiness assessment...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Button variant="outline" onClick={() => navigate('/results')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Results
            </Button>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Assessment Error</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Button variant="outline" onClick={() => navigate('/results')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Results
            </Button>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Assessment Data</h2>
                <p className="text-muted-foreground mb-4">Unable to load founder readiness assessment.</p>
                <Button onClick={() => navigate('/results')}>
                  Back to Results
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="outline" onClick={() => navigate('/results')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Results
            </Button>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportReport}>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Brain className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Founder Readiness Assessment</h1>
            <p className="text-muted-foreground">
              {validationData?.startupTitle && `for ${validationData.startupTitle} • `}
              Comprehensive evaluation of your entrepreneurial capabilities
            </p>
          </div>

          {/* Overall Score */}
          <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <Trophy className="w-6 h-6 text-primary" />
                <span>Overall Readiness Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-4">{assessment.overall_score}</div>
                <div className="text-xl text-muted-foreground mb-6">out of 100</div>
                <div className="max-w-md mx-auto">
                  <Progress value={assessment.overall_score} className="h-4" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Needs Development</span>
                    <span>Good</span>
                    <span>Excellent</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <span>Category Assessment</span>
              </CardTitle>
              <CardDescription>
                Detailed breakdown across key entrepreneurial competencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(assessment.categories).map(([key, score]) => {
                  const categoryNames = {
                    entrepreneurial_mindset: 'Entrepreneurial Mindset',
                    technical_skills: 'Technical Skills',
                    business_acumen: 'Business Acumen',
                    leadership_ability: 'Leadership Ability',
                    financial_management: 'Financial Management',
                    network_connections: 'Network & Connections'
                  };

                  const categoryIcons = {
                    entrepreneurial_mindset: <Brain className="w-5 h-5" />,
                    technical_skills: <TrendingUp className="w-5 h-5" />,
                    business_acumen: <DollarSign className="w-5 h-5" />,
                    leadership_ability: <Users className="w-5 h-5" />,
                    financial_management: <DollarSign className="w-5 h-5" />,
                    network_connections: <User className="w-5 h-5" />
                  };

                  return (
                    <Card key={key} className={`border-l-4 ${
                      score >= 80 ? 'border-l-green-500 bg-green-50' : 
                      score >= 60 ? 'border-l-yellow-500 bg-yellow-50' : 'border-l-red-500 bg-red-50'
                    }`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {categoryIcons[key]}
                            <CardTitle className="text-base">{categoryNames[key]}</CardTitle>
                          </div>
                          <Badge variant="outline" className={
                            score >= 80 ? 'border-green-500 text-green-700' : 
                            score >= 60 ? 'border-yellow-500 text-yellow-700' : 'border-red-500 text-red-700'
                          }>
                            {score}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Progress value={score} className="h-2" />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Strengths and Areas for Improvement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>Key Strengths</span>
                </CardTitle>
                <CardDescription>
                  Areas where you demonstrate strong capability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assessment.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-green-800">{strength}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-600">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Areas for Improvement</span>
                </CardTitle>
                <CardDescription>
                  Focus areas to strengthen your entrepreneurial profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assessment.improvement_areas.map((area, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-orange-800">{area}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>Strategic Recommendations</span>
              </CardTitle>
              <CardDescription>
                Actionable steps to enhance your founder readiness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assessment.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-sm text-blue-800">{recommendation}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Development Roadmap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <span>Development Roadmap</span>
              </CardTitle>
              <CardDescription>
                Timeline-based approach to enhance your entrepreneurial capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-l-4 border-red-500 pl-6">
                  <h3 className="font-semibold text-red-700 mb-2">Immediate Focus (Next 30 Days)</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Address highest-priority improvement areas identified above</li>
                    <li>• Begin networking activities to expand professional connections</li>
                    <li>• Enroll in relevant courses or workshops for skill development</li>
                  </ul>
                </div>

                <div className="border-l-4 border-yellow-500 pl-6">
                  <h3 className="font-semibold text-yellow-700 mb-2">Short-term Goals (Next 3 Months)</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Implement financial management systems and processes</li>
                    <li>• Build advisory board with complementary expertise</li>
                    <li>• Strengthen technical skills through hands-on projects</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-6">
                  <h3 className="font-semibold text-green-700 mb-2">Long-term Objectives (Next 6-12 Months)</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Develop comprehensive business strategy and execution plan</li>
                    <li>• Establish industry partnerships and strategic relationships</li>
                    <li>• Build track record of successful project delivery and leadership</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
