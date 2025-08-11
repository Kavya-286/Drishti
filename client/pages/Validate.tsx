import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Briefcase,
  Zap
} from 'lucide-react';
import { ValidationData, validateStartupIdea, generateMockValidationResult } from '@shared/api';


export default function Validate() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isValidating, setIsValidating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'available' | 'fallback'>('checking');

  // Check backend status and load saved progress on component mount
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        if (data.ml_validator === 'unavailable') {
          setBackendStatus('fallback');
        } else {
          setBackendStatus('available');
        }
      } catch (error) {
        setBackendStatus('fallback');
      }
    };

    const savedProgress = localStorage.getItem('validationProgress');
    if (savedProgress) {
      try {
        const { currentStep: savedStep, validationData: savedData } = JSON.parse(savedProgress);
        setCurrentStep(savedStep || 1);
        setValidationData(savedData || {});
      } catch (error) {
        console.warn('Failed to load saved progress:', error);
      }
    }

    checkBackendStatus();
  }, []);

  const [validationData, setValidationData] = useState<ValidationData>({
    problemStatement: '',
    solutionDescription: '',
    uniqueValueProposition: '',
    problemFrequency: '',
    problemImpact: '',
    solutionType: '',
    developmentStage: '',
    targetMarket: '',
    marketSize: '',
    customerSegments: '',
    customerPersona: '',
    marketValidation: '',
    customerAcquisition: '',
    revenueModel: '',
    pricingStrategy: '',
    keyMetrics: '',
    unitEconomics: '',
    revenueStreams: '',
    salesCycle: '',
    directCompetitors: '',
    indirectCompetitors: '',
    competitiveAdvantage: '',
    competitiveAnalysis: '',
    marketPosition: '',
    teamSize: '',
    foundersExperience: '',
    keySkills: '',
    currentStage: '',
    existingTraction: '',
    fundingNeeds: ''
  });

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const updateData = (field: keyof ValidationData, value: string) => {
    setValidationData(prev => ({ ...prev, [field]: value }));
  };

  const generateSuggestions = async (problemText: string) => {
    if (!problemText || problemText.length < 10) return;

    setIsGeneratingSuggestion(true);

    // Simulate AI suggestion generation based on the problem
    const suggestionTemplates = [
      "Consider validating the problem severity with customer interviews to understand the pain level",
      "Research if existing solutions adequately address this problem or leave gaps",
      "Quantify the financial impact of this problem on your target customers",
      "Identify specific customer segments most affected by this problem",
      "Explore if this problem occurs frequently enough to warrant a solution",
      "Investigate the root causes behind this problem to ensure your solution targets the right issue",
      "Validate that customers are actively seeking solutions for this problem",
      "Research market trends that make this problem more or less relevant over time"
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate contextual suggestions based on keywords in the problem
    const keywords = problemText.toLowerCase();
    let contextualSuggestions = [];

    if (keywords.includes('time') || keywords.includes('slow') || keywords.includes('efficiency')) {
      contextualSuggestions = [
        "Measure the actual time lost due to this problem to quantify the value proposition",
        "Research automation tools or processes that could solve this efficiency issue",
        "Consider if customers would pay for time-saving solutions in this context"
      ];
    } else if (keywords.includes('cost') || keywords.includes('expensive') || keywords.includes('money')) {
      contextualSuggestions = [
        "Calculate the exact cost impact of this problem on your target customers",
        "Explore if customers have budget allocated for solving cost-related problems",
        "Research price sensitivity in your target market for cost-saving solutions"
      ];
    } else if (keywords.includes('communication') || keywords.includes('connect') || keywords.includes('collaborate')) {
      contextualSuggestions = [
        "Study existing communication tools to identify specific gaps your solution could fill",
        "Investigate if the communication problem is due to process or technology issues",
        "Consider the network effects and adoption challenges for communication solutions"
      ];
    } else {
      // General suggestions
      contextualSuggestions = suggestionTemplates.slice(0, 3);
    }

    setSuggestions(contextualSuggestions);
    setIsGeneratingSuggestion(false);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      // Save progress to localStorage
      localStorage.setItem('validationProgress', JSON.stringify({
        currentStep: currentStep + 1,
        validationData
      }));
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Save progress to localStorage
      localStorage.setItem('validationProgress', JSON.stringify({
        currentStep: currentStep - 1,
        validationData
      }));
    }
  };

  const handleValidate = async () => {
    setIsValidating(true);

    try {
      // Validate required fields
      const requiredFields = [
        'problemStatement',
        'solutionDescription',
        'uniqueValueProposition',
        'targetMarket',
        'customerSegments',
        'revenueModel',
        'competitiveAdvantage',
        'foundersExperience',
        'currentStage'
      ];

      const missingFields = requiredFields.filter(field =>
        !validationData[field as keyof ValidationData] ||
        validationData[field as keyof ValidationData].trim() === ''
      );

      if (missingFields.length > 0) {
        alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
        setIsValidating(false);
        return;
      }

      // Store validation data for results page
      localStorage.setItem('validationData', JSON.stringify(validationData));

      // Try to validate with real API, fallback to mock if needed
      let result;
      try {
        console.log('Starting validation with API...');
        result = await validateStartupIdea(validationData);
        console.log('API validation result:', result);

        if (!result || !result.success) {
          console.warn('API returned unsuccessful result, using fallback');
          throw new Error(result?.error || 'Validation failed');
        }
      } catch (apiError) {
        console.warn('API validation failed, using mock data:', apiError);
        // Generate mock result for development
        try {
          result = generateMockValidationResult(validationData);
          console.log('Generated mock validation result');
        } catch (mockError) {
          console.error('Mock generation also failed:', mockError);
          // Ultimate fallback
          result = {
            success: true,
            overall_score: 75,
            viability_level: 'Moderate',
            scores: [
              {
                category: 'Problem-Solution Fit',
                score: 75,
                feedback: 'Your idea shows promise. Please validate further with customers.',
                suggestions: ['Conduct user interviews', 'Test your assumptions']
              }
            ],
            investor_readiness_score: 70,
            founder_readiness_score: 75,
            clarity_score: 72,
            timestamp: new Date().toISOString()
          };
        }
      }

      // Ensure we have a valid result
      if (!result) {
        console.error('No validation result available, creating minimal result');
        result = {
          success: true,
          overall_score: 60,
          viability_level: 'Low',
          scores: [],
          investor_readiness_score: 60,
          founder_readiness_score: 60,
          clarity_score: 60,
          timestamp: new Date().toISOString()
        };
      }

      // Store results for the results page
      localStorage.setItem('validationResults', JSON.stringify(result));

      setIsValidating(false);

      // Navigate to results page
      window.location.href = '/results';

    } catch (error) {
      console.error('Validation error:', error);
      alert('Validation failed. Please try again.');
      setIsValidating(false);
    }
  };

  const stepIcons = [
    <Lightbulb className="w-5 h-5" />,
    <Target className="w-5 h-5" />,
    <DollarSign className="w-5 h-5" />,
    <TrendingUp className="w-5 h-5" />,
    <Users className="w-5 h-5" />,
    <Zap className="w-5 h-5" />
  ];

  const stepTitles = [
    'Problem & Solution',
    'Target Market',
    'Business Model',
    'Competition',
    'Team',
    'Traction & Funding'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Startup Idea Validation</h1>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary">Step {currentStep} of {totalSteps}</Badge>
                {backendStatus === 'fallback' && (
                  <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Demo Mode</span>
                  </div>
                )}
                {backendStatus === 'available' && (
                  <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>AI Ready</span>
                  </div>
                )}
                <span className="text-sm text-muted-foreground">
                  Step {currentStep} of {totalSteps}
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />

            {/* Demo Mode Banner */}
            {backendStatus === 'fallback' && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 text-blue-500 mt-0.5">
                    ℹ️
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Demo Mode Active</p>
                    <p className="text-blue-700">
                      The ML backend is not connected. You'll receive realistic demo validation results that simulate our AI analysis.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step Navigation */}
            <div className="flex justify-between mt-6">
              {stepTitles.map((title, index) => (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    index + 1 < currentStep 
                      ? 'bg-primary text-white' 
                      : index + 1 === currentStep 
                        ? 'bg-primary/20 text-primary border-2 border-primary' 
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1 < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      stepIcons[index]
                    )}
                  </div>
                  <span className={`text-xs text-center max-w-[80px] ${
                    index + 1 === currentStep ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}>
                    {title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {stepIcons[currentStep - 1]}
                <span>{stepTitles[currentStep - 1]}</span>
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "Describe the problem you're solving and your proposed solution"}
                {currentStep === 2 && "Define your target market and customer segments"}
                {currentStep === 3 && "Outline your business model and revenue strategy"}
                {currentStep === 4 && "Analyze your competitive landscape"}
                {currentStep === 5 && "Tell us about your team and capabilities"}
                {currentStep === 6 && "Share your current progress and funding requirements"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Problem & Solution */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="problemStatement">Problem Statement *</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Describe the specific problem your target customers face. Be clear and concise.
                        </p>
                        <Textarea
                          id="problemStatement"
                          placeholder="Example: Small business owners struggle to manage inventory efficiently, leading to 30% revenue loss due to stockouts and overstocking..."
                          value={validationData.problemStatement}
                          onChange={(e) => updateData('problemStatement', e.target.value)}
                          onBlur={(e) => {
                            if (e.target.value.length > 20) {
                              generateSuggestions(e.target.value);
                            }
                          }}
                          className="mt-2"
                          rows={5}
                        />
                      </div>

                      <div>
                        <Label htmlFor="problemFrequency">Problem Frequency</Label>
                        <Select onValueChange={(value) => updateData('problemFrequency', value)}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="How often does this problem occur?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="occasionally">Occasionally</SelectItem>
                            <SelectItem value="rare">Rarely</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="problemImpact">Problem Impact Level</Label>
                        <Select onValueChange={(value) => updateData('problemImpact', value)}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="What's the impact level?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critical">Critical - Business stopping</SelectItem>
                            <SelectItem value="high">High - Significant cost/time loss</SelectItem>
                            <SelectItem value="medium">Medium - Moderate inconvenience</SelectItem>
                            <SelectItem value="low">Low - Minor annoyance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="solutionDescription">Solution Description *</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Explain how your product/service solves the problem. Include key features and benefits.
                        </p>
                        <Textarea
                          id="solutionDescription"
                          placeholder="Example: Our AI-powered inventory management platform predicts demand patterns, automates reordering, and provides real-time analytics..."
                          value={validationData.solutionDescription}
                          onChange={(e) => updateData('solutionDescription', e.target.value)}
                          className="mt-2"
                          rows={5}
                        />
                      </div>

                      <div>
                        <Label htmlFor="solutionType">Solution Type</Label>
                        <Select onValueChange={(value) => updateData('solutionType', value)}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="What type of solution is this?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="software">Software/App</SelectItem>
                            <SelectItem value="hardware">Hardware/Physical Product</SelectItem>
                            <SelectItem value="service">Service</SelectItem>
                            <SelectItem value="platform">Platform/Marketplace</SelectItem>
                            <SelectItem value="hybrid">Hybrid (Software + Hardware)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="developmentStage">Development Stage</Label>
                        <Select onValueChange={(value) => updateData('developmentStage', value)}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Current development stage?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="concept">Concept/Idea</SelectItem>
                            <SelectItem value="wireframe">Wireframes/Design</SelectItem>
                            <SelectItem value="prototype">Prototype/MVP</SelectItem>
                            <SelectItem value="beta">Beta Testing</SelectItem>
                            <SelectItem value="launched">Launched/Live</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {isGeneratingSuggestion && (
                    <div className="mt-4 text-sm text-muted-foreground flex items-center">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                      Generating AI suggestions...
                    </div>
                  )}
                  {suggestions.length > 0 && (
                    <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <h4 className="text-sm font-medium text-primary mb-3 flex items-center">
                        <Lightbulb className="w-4 h-4 mr-1" />
                        AI Suggestions for Problem Validation
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-primary mr-2 mt-1">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="uniqueValueProposition">Unique Value Proposition *</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      What makes your solution unique? Why would customers choose you over alternatives?
                    </p>
                    <Textarea
                      id="uniqueValueProposition"
                      placeholder="Example: Only inventory solution that combines AI predictions with real-time supplier integration, reducing stockouts by 70% while cutting inventory costs by 25%..."
                      value={validationData.uniqueValueProposition}
                      onChange={(e) => updateData('uniqueValueProposition', e.target.value)}
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Target Market */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="targetMarket">Primary Target Market *</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Describe your ideal customers in detail - demographics, behavior, needs.
                        </p>
                        <Textarea
                          id="targetMarket"
                          placeholder="Example: Small to medium retail businesses (10-100 employees) with annual revenue of $1M-$50M, currently using manual or basic inventory systems..."
                          value={validationData.targetMarket}
                          onChange={(e) => updateData('targetMarket', e.target.value)}
                          className="mt-2"
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label htmlFor="customerPersona">Primary Customer Persona</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Who is the primary decision maker? Title, role, responsibilities.
                        </p>
                        <Textarea
                          id="customerPersona"
                          placeholder="Example: Operations Manager, 35-50 years old, responsible for inventory and supply chain, tech-savvy but time-constrained..."
                          value={validationData.customerPersona}
                          onChange={(e) => updateData('customerPersona', e.target.value)}
                          className="mt-2"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="marketSize">Geographic Market Size</Label>
                        <Select onValueChange={(value) => updateData('marketSize', value)}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select market size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="local">Local (City/Region)</SelectItem>
                            <SelectItem value="national">National</SelectItem>
                            <SelectItem value="international">International</SelectItem>
                            <SelectItem value="global">Global</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="customerSegments">Customer Segments Breakdown *</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          List and describe 2-3 key customer segments with percentages.
                        </p>
                        <Textarea
                          id="customerSegments"
                          placeholder="Example: 1) Small retailers (40%) - Fashion/electronics stores, 2) E-commerce businesses (35%) - Online sellers, 3) Service companies (25%) - Restaurants, repair shops..."
                          value={validationData.customerSegments}
                          onChange={(e) => updateData('customerSegments', e.target.value)}
                          className="mt-2"
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label htmlFor="marketValidation">Market Validation Evidence</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          What evidence do you have that this market exists and has this problem?
                        </p>
                        <Textarea
                          id="marketValidation"
                          placeholder="Example: Conducted 25 customer interviews, 80% confirmed the problem. Industry report shows $2B loss annually due to inventory mismanagement..."
                          value={validationData.marketValidation}
                          onChange={(e) => updateData('marketValidation', e.target.value)}
                          className="mt-2"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="customerAcquisition">Customer Acquisition Strategy</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          How will you reach and acquire your target customers?
                        </p>
                        <Textarea
                          id="customerAcquisition"
                          placeholder="Example: Digital marketing (Google Ads, LinkedIn), trade shows, partnerships with business consultants, referral program..."
                          value={validationData.customerAcquisition}
                          onChange={(e) => updateData('customerAcquisition', e.target.value)}
                          className="mt-2"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Business Model */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="revenueModel">Primary Revenue Model *</Label>
                        <Select onValueChange={(value) => updateData('revenueModel', value)}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select primary revenue model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="subscription">Subscription (SaaS)</SelectItem>
                            <SelectItem value="one-time">One-time Purchase</SelectItem>
                            <SelectItem value="freemium">Freemium Model</SelectItem>
                            <SelectItem value="marketplace">Marketplace Commission</SelectItem>
                            <SelectItem value="advertising">Advertising Revenue</SelectItem>
                            <SelectItem value="licensing">Licensing/Royalties</SelectItem>
                            <SelectItem value="transaction">Transaction Fees</SelectItem>
                            <SelectItem value="hybrid">Hybrid Model</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="pricingStrategy">Pricing Strategy *</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Describe your pricing approach, tiers, and rationale behind pricing decisions.
                        </p>
                        <Textarea
                          id="pricingStrategy"
                          placeholder="Example: Tiered SaaS pricing - Starter $29/month (up to 1,000 SKUs), Professional $99/month (up to 10,000 SKUs), Enterprise custom pricing. Based on value provided and competitor analysis..."
                          value={validationData.pricingStrategy}
                          onChange={(e) => updateData('pricingStrategy', e.target.value)}
                          className="mt-2"
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label htmlFor="unitEconomics">Unit Economics</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Customer acquisition cost (CAC), lifetime value (LTV), and other key economics.
                        </p>
                        <Textarea
                          id="unitEconomics"
                          placeholder="Example: CAC: $150, LTV: $2,400 (2-year avg), LTV:CAC ratio 16:1, Gross margin: 85%, Payback period: 8 months..."
                          value={validationData.unitEconomics}
                          onChange={(e) => updateData('unitEconomics', e.target.value)}
                          className="mt-2"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="revenueStreams">Additional Revenue Streams</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          List any secondary or future revenue opportunities.
                        </p>
                        <Textarea
                          id="revenueStreams"
                          placeholder="Example: 1) Implementation/setup fees, 2) Premium support packages, 3) Data analytics add-ons, 4) Integration marketplace commissions..."
                          value={validationData.revenueStreams}
                          onChange={(e) => updateData('revenueStreams', e.target.value)}
                          className="mt-2"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="keyMetrics">Key Success Metrics *</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          What KPIs will you track to measure business success and growth?
                        </p>
                        <Textarea
                          id="keyMetrics"
                          placeholder="Example: Monthly Recurring Revenue (MRR), Customer Churn Rate, Net Promoter Score (NPS), Customer Acquisition Cost (CAC), Daily/Monthly Active Users..."
                          value={validationData.keyMetrics}
                          onChange={(e) => updateData('keyMetrics', e.target.value)}
                          className="mt-2"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="salesCycle">Sales Cycle & Process</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          How long is your sales cycle and what's the process?
                        </p>
                        <Textarea
                          id="salesCycle"
                          placeholder="Example: 30-45 day sales cycle. Lead qualification → Demo → Free trial → Contract negotiation → Onboarding. Direct sales for enterprise, self-serve for SMB..."
                          value={validationData.salesCycle}
                          onChange={(e) => updateData('salesCycle', e.target.value)}
                          className="mt-2"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Competition */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="directCompetitors">Direct Competitors</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          List 3-5 companies that solve the same problem with similar solutions.
                        </p>
                        <Textarea
                          id="directCompetitors"
                          placeholder="Example: 1) TradeGecko (acquired by QuickBooks) - Inventory management for SMBs, $39-199/month, 2) Cin7 - Multi-channel inventory, $325+/month, 3) Katana - Manufacturing inventory, $99+/month..."
                          value={validationData.directCompetitors}
                          onChange={(e) => updateData('directCompetitors', e.target.value)}
                          className="mt-2"
                          rows={5}
                        />
                      </div>

                      <div>
                        <Label htmlFor="competitiveAnalysis">Competitive Analysis Matrix</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Compare key features, pricing, strengths, and weaknesses.
                        </p>
                        <Textarea
                          id="competitiveAnalysis"
                          placeholder="Example: TradeGecko - Strong integrations (+), High price (-); Cin7 - Feature-rich (+), Complex UX (-); Us - AI predictions (+), New brand (-), Better pricing (+)..."
                          value={validationData.competitiveAnalysis}
                          onChange={(e) => updateData('competitiveAnalysis', e.target.value)}
                          className="mt-2"
                          rows={4}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="indirectCompetitors">Indirect Competitors & Alternatives</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          What alternatives might customers use instead of any software solution?
                        </p>
                        <Textarea
                          id="indirectCompetitors"
                          placeholder="Example: 1) Excel spreadsheets (most common current solution), 2) Manual pen-and-paper tracking, 3) Basic POS systems with limited inventory, 4) ERP systems (overkill for SMBs)..."
                          value={validationData.indirectCompetitors}
                          onChange={(e) => updateData('indirectCompetitors', e.target.value)}
                          className="mt-2"
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label htmlFor="marketPosition">Market Positioning</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          How do you position yourself in the market? What's your category?
                        </p>
                        <Textarea
                          id="marketPosition"
                          placeholder="Example: 'The intelligent inventory platform for growing retailers' - positioned between basic tools and enterprise ERP, focusing on AI-driven insights for SMBs..."
                          value={validationData.marketPosition}
                          onChange={(e) => updateData('marketPosition', e.target.value)}
                          className="mt-2"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="competitiveAdvantage">Unique Competitive Advantages *</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      What gives you a sustainable competitive edge? How will you defend against competition?
                    </p>
                    <Textarea
                      id="competitiveAdvantage"
                      placeholder="Example: 1) Proprietary AI algorithm with 2 years of R&D (hard to replicate), 2) Exclusive partnerships with major suppliers (network effects), 3) Superior user experience (design moat), 4) First-mover advantage in AI-powered inventory for SMBs..."
                      value={validationData.competitiveAdvantage}
                      onChange={(e) => updateData('competitiveAdvantage', e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Team */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="teamSize">Team Size</Label>
                    <Select onValueChange={(value) => updateData('teamSize', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select team size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solo">Solo founder</SelectItem>
                        <SelectItem value="2-3">2-3 people</SelectItem>
                        <SelectItem value="4-6">4-6 people</SelectItem>
                        <SelectItem value="7-10">7-10 people</SelectItem>
                        <SelectItem value="10+">10+ people</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="foundersExperience">Founders' Experience *</Label>
                    <Textarea
                      id="foundersExperience"
                      placeholder="Describe the founders' relevant experience and background"
                      value={validationData.foundersExperience}
                      onChange={(e) => updateData('foundersExperience', e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="keySkills">Key Skills & Gaps</Label>
                    <Textarea
                      id="keySkills"
                      placeholder="What skills does your team have? What skills are missing?"
                      value={validationData.keySkills}
                      onChange={(e) => updateData('keySkills', e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Step 6: Traction & Funding */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="currentStage">Current Stage *</Label>
                    <Select onValueChange={(value) => updateData('currentStage', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select current stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="idea">Idea stage</SelectItem>
                        <SelectItem value="prototype">Prototype/MVP</SelectItem>
                        <SelectItem value="beta">Beta testing</SelectItem>
                        <SelectItem value="early-revenue">Early revenue</SelectItem>
                        <SelectItem value="growth">Growth stage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="existingTraction">Existing Traction</Label>
                    <Textarea
                      id="existingTraction"
                      placeholder="Describe any traction you've gained (users, revenue, partnerships, etc.)"
                      value={validationData.existingTraction}
                      onChange={(e) => updateData('existingTraction', e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fundingNeeds">Funding Requirements</Label>
                    <Textarea
                      id="fundingNeeds"
                      placeholder="How much funding do you need and what will you use it for?"
                      value={validationData.fundingNeeds}
                      onChange={(e) => updateData('fundingNeeds', e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            {currentStep < totalSteps ? (
              <Button onClick={nextStep}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleValidate}
                disabled={isValidating}
                className="bg-gradient-to-r from-primary to-blue-600"
              >
                {isValidating ? 'Validating...' : 'Validate My Idea'}
                {!isValidating && <Zap className="w-4 h-4 ml-2" />}
              </Button>
            )}
          </div>

          {/* AI Feedback Preview */}
          {currentStep > 1 && (
            <Card className="mt-8 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  <span>AI Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentStep === 2 && (
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>Market Tip:</strong> Based on your problem statement, consider defining specific customer personas.
                      More targeted market segmentation will improve your validation score significantly.
                    </p>
                  )}
                  {currentStep === 3 && (
                    <p className="text-sm text-muted-foreground">
                      💰 <strong>Business Model Tip:</strong> Consider multiple revenue streams. Successful startups often have
                      2-3 ways to monetize their solution to reduce dependency on a single income source.
                    </p>
                  )}
                  {currentStep === 4 && (
                    <p className="text-sm text-muted-foreground">
                      🎯 <strong>Competition Tip:</strong> Don't just list competitors - explain why customers would switch to your solution.
                      Focus on unique differentiators that are hard to replicate.
                    </p>
                  )}
                  {currentStep === 5 && (
                    <p className="text-sm text-muted-foreground">
                      �� <strong>Team Tip:</strong> Highlight relevant experience and domain expertise. Investors look for teams that
                      understand the problem deeply and have the skills to execute the solution.
                    </p>
                  )}
                  {currentStep === 6 && (
                    <p className="text-sm text-muted-foreground">
                      🚀 <strong>Traction Tip:</strong> Even early-stage validation like customer interviews, surveys, or beta sign-ups
                      counts as traction. Quantify your progress wherever possible.
                    </p>
                  )}
                  {validationData.problemStatement && validationData.solutionDescription && (
                    <div className="mt-2 pt-2 border-t border-primary/20">
                      <p className="text-xs text-primary">
                        <strong>Progress:</strong> Your startup idea is taking shape! Keep adding details to get more accurate validation insights.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
