import { useState } from 'react';
import { Link } from 'react-router-dom';
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

interface ValidationData {
  // Problem & Solution
  problemStatement: string;
  solutionDescription: string;
  uniqueValueProposition: string;
  
  // Market
  targetMarket: string;
  marketSize: string;
  customerSegments: string;
  
  // Business Model
  revenueModel: string;
  pricingStrategy: string;
  keyMetrics: string;
  
  // Competition
  directCompetitors: string;
  indirectCompetitors: string;
  competitiveAdvantage: string;
  
  // Team
  teamSize: string;
  foundersExperience: string;
  keySkills: string;
  
  // Traction
  currentStage: string;
  existingTraction: string;
  fundingNeeds: string;
}

export default function Validate() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isValidating, setIsValidating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);

  const [validationData, setValidationData] = useState<ValidationData>({
    problemStatement: '',
    solutionDescription: '',
    uniqueValueProposition: '',
    targetMarket: '',
    marketSize: '',
    customerSegments: '',
    revenueModel: '',
    pricingStrategy: '',
    keyMetrics: '',
    directCompetitors: '',
    indirectCompetitors: '',
    competitiveAdvantage: '',
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
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleValidate = async () => {
    setIsValidating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsValidating(false);
    // Navigate to results page
    window.location.href = '/results';
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
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-500 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                StartupValidator
              </span>
            </Link>
            <div className="hidden md:block text-muted-foreground">|</div>
            <div className="hidden md:block text-sm font-medium text-muted-foreground">
              Validate Your Startup Idea
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">{currentStep}/{totalSteps}</Badge>
            <Button variant="outline" size="sm" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Startup Idea Validation</h1>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            
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
                  <div>
                    <Label htmlFor="problemStatement">Problem Statement *</Label>
                    <Textarea
                      id="problemStatement"
                      placeholder="What specific problem are you solving? Who faces this problem?"
                      value={validationData.problemStatement}
                      onChange={(e) => updateData('problemStatement', e.target.value)}
                      onBlur={(e) => {
                        if (e.target.value.length > 20) {
                          generateSuggestions(e.target.value);
                        }
                      }}
                      className="mt-2"
                      rows={4}
                    />
                    {isGeneratingSuggestion && (
                      <div className="mt-2 text-sm text-muted-foreground flex items-center">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                        Generating AI suggestions...
                      </div>
                    )}
                    {suggestions.length > 0 && (
                      <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <h4 className="text-sm font-medium text-primary mb-2 flex items-center">
                          <Lightbulb className="w-4 h-4 mr-1" />
                          AI Suggestions for Problem Validation
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-primary mr-2">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="solutionDescription">Solution Description *</Label>
                    <Textarea
                      id="solutionDescription"
                      placeholder="How does your product/service solve this problem?"
                      value={validationData.solutionDescription}
                      onChange={(e) => updateData('solutionDescription', e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="uniqueValueProposition">Unique Value Proposition *</Label>
                    <Textarea
                      id="uniqueValueProposition"
                      placeholder="What makes your solution unique? Why would customers choose you?"
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
                  <div>
                    <Label htmlFor="targetMarket">Target Market *</Label>
                    <Textarea
                      id="targetMarket"
                      placeholder="Describe your ideal customers and target market"
                      value={validationData.targetMarket}
                      onChange={(e) => updateData('targetMarket', e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="marketSize">Market Size</Label>
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
                  <div>
                    <Label htmlFor="customerSegments">Customer Segments *</Label>
                    <Textarea
                      id="customerSegments"
                      placeholder="List and describe your key customer segments"
                      value={validationData.customerSegments}
                      onChange={(e) => updateData('customerSegments', e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Business Model */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="revenueModel">Revenue Model *</Label>
                    <Select onValueChange={(value) => updateData('revenueModel', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select revenue model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="subscription">Subscription</SelectItem>
                        <SelectItem value="one-time">One-time Purchase</SelectItem>
                        <SelectItem value="freemium">Freemium</SelectItem>
                        <SelectItem value="marketplace">Marketplace Commission</SelectItem>
                        <SelectItem value="advertising">Advertising</SelectItem>
                        <SelectItem value="licensing">Licensing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pricingStrategy">Pricing Strategy *</Label>
                    <Textarea
                      id="pricingStrategy"
                      placeholder="How will you price your product? What's your pricing rationale?"
                      value={validationData.pricingStrategy}
                      onChange={(e) => updateData('pricingStrategy', e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="keyMetrics">Key Metrics</Label>
                    <Textarea
                      id="keyMetrics"
                      placeholder="What metrics will you track to measure success?"
                      value={validationData.keyMetrics}
                      onChange={(e) => updateData('keyMetrics', e.target.value)}
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Competition */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="directCompetitors">Direct Competitors</Label>
                    <Textarea
                      id="directCompetitors"
                      placeholder="List your direct competitors and their key features"
                      value={validationData.directCompetitors}
                      onChange={(e) => updateData('directCompetitors', e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="indirectCompetitors">Indirect Competitors</Label>
                    <Textarea
                      id="indirectCompetitors"
                      placeholder="List alternatives your customers might use instead"
                      value={validationData.indirectCompetitors}
                      onChange={(e) => updateData('indirectCompetitors', e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="competitiveAdvantage">Competitive Advantage *</Label>
                    <Textarea
                      id="competitiveAdvantage"
                      placeholder="What gives you a competitive edge? How will you defend it?"
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
