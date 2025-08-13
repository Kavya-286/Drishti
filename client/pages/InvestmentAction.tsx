import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import {
  ArrowLeft,
  DollarSign,
  Heart,
  CheckCircle,
  AlertTriangle,
  Building2,
  User,
  Calendar,
  FileText,
  Shield,
  TrendingUp,
  Users,
  Clock,
  Mail,
  Phone,
  MessageCircle
} from 'lucide-react';

export default function InvestmentAction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [startup, setStartup] = useState<any>(null);
  const [action, setAction] = useState<'express-interest' | 'invest'>('express-interest');
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    investmentAmount: '',
    investmentType: 'equity',
    timeFrame: '3-6months',
    experience: '',
    message: '',
    contactPreference: 'email',
    dueDiligenceRequired: true,
    legalReviewRequired: true,
    termsAccepted: false
  });

  useEffect(() => {
    const loadData = () => {
      try {
        const publicIdeas = JSON.parse(localStorage.getItem('publicStartupIdeas') || '[]');
        const foundStartup = publicIdeas.find((idea: any) => idea.id === id);
        
        if (!foundStartup) {
          navigate('/investor-dashboard');
          return;
        }

        setStartup(foundStartup);
        
        // Get action from location state or default to express-interest
        const actionFromState = location.state?.action;
        if (actionFromState === 'invest' || actionFromState === 'express-interest') {
          setAction(actionFromState);
        }
      } catch (error) {
        console.error('Failed to load startup details:', error);
        navigate('/investor-dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate, location.state]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.termsAccepted) {
      alert('Please accept the terms and conditions to proceed.');
      return;
    }

    // Store the investment/interest in localStorage for demo
    const investmentRecord = {
      id: `inv_${Date.now()}`,
      startupId: startup.id,
      startupName: startup.ideaName,
      action,
      ...formData,
      submittedAt: new Date().toISOString(),
      status: action === 'invest' ? 'pending-acknowledgment' : 'submitted'
    };

    const existingRecords = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
    existingRecords.push(investmentRecord);
    localStorage.setItem('investmentRecords', JSON.stringify(existingRecords));

    // Handle different actions
    if (action === 'invest') {
      // Redirect to acknowledgment page for investment
      navigate(`/investor-acknowledgment/${startup.id}`, {
        state: { investmentData: investmentRecord }
      });
    } else {
      // For express interest, show success message and redirect
      alert(`✅ Interest expressed successfully!\n\nNext steps:\n• Founder will be notified of your interest\n• You'll receive detailed business information\n• Direct contact with founder will be facilitated\n• Investment details can be discussed further\n\nThank you for showing interest in ${startup.ideaName}!`);
      navigate('/investor-dashboard');
    }
  };

  const getViabilityBadge = (level: string) => {
    const colors = {
      'High': 'bg-green-500 text-white',
      'Moderate': 'bg-yellow-500 text-white',
      'Low': 'bg-red-500 text-white'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading investment details...</p>
        </div>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Startup Not Found</h2>
          <p className="text-muted-foreground mb-4">The startup you're trying to invest in doesn't exist.</p>
          <Button onClick={() => navigate('/investor-dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="outline" onClick={() => navigate(`/startup-details/${startup.id}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Startup Details
            </Button>
            <Badge variant="secondary">
              {action === 'invest' ? 'Investment Process' : 'Express Interest'}
            </Badge>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              {action === 'invest' ? (
                <DollarSign className="w-12 h-12 text-green-500" />
              ) : (
                <Heart className="w-12 h-12 text-red-500" />
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {action === 'invest' ? 'Investment Proposal' : 'Express Interest'}
            </h1>
            <p className="text-muted-foreground">
              {action === 'invest' 
                ? 'Submit your investment proposal for review and due diligence'
                : 'Show your interest and connect with the founder'
              }
            </p>
          </div>

          {/* Startup Summary */}
          <Card className="mb-8 border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{startup.ideaName}</span>
                <Badge className={getViabilityBadge(startup.viabilityLevel)}>
                  {startup.validationScore}/100 • {startup.viabilityLevel}
                </Badge>
              </CardTitle>
              <CardDescription>{startup.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Industry</div>
                  <div className="font-semibold">{startup.industry}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Stage</div>
                  <div className="font-semibold">{startup.stage}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Funding Needs</div>
                  <div className="font-semibold text-green-600">{startup.fundingNeeds}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Revenue Model</div>
                  <div className="font-semibold">{startup.revenueModel}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>
                  {action === 'invest' ? 'Investment Details' : 'Interest Information'}
                </span>
              </CardTitle>
              <CardDescription>
                Please provide your {action === 'invest' ? 'investment' : 'interest'} details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {action === 'invest' && (
                <>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="investment-amount">Investment Amount (USD)</Label>
                      <Input
                        id="investment-amount"
                        type="number"
                        placeholder="e.g., 50000"
                        value={formData.investmentAmount}
                        onChange={(e) => handleInputChange('investmentAmount', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter your proposed investment amount
                      </p>
                    </div>

                    <div>
                      <Label>Investment Type</Label>
                      <RadioGroup
                        value={formData.investmentType}
                        onValueChange={(value) => handleInputChange('investmentType', value)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="equity" id="equity" />
                          <Label htmlFor="equity">Equity Investment</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="convertible" id="convertible" />
                          <Label htmlFor="convertible">Convertible Note</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="safe" id="safe" />
                          <Label htmlFor="safe">SAFE Agreement</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="debt" id="debt" />
                          <Label htmlFor="debt">Debt Financing</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="timeframe">
                  {action === 'invest' ? 'Investment Timeline' : 'Response Timeframe'}
                </Label>
                <RadioGroup
                  value={formData.timeFrame}
                  onValueChange={(value) => handleInputChange('timeFrame', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="immediate" id="immediate" />
                    <Label htmlFor="immediate">
                      {action === 'invest' ? 'Ready to invest immediately' : 'Interested immediately'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1month" id="1month" />
                    <Label htmlFor="1month">Within 1 month</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3-6months" id="3-6months" />
                    <Label htmlFor="3-6months">3-6 months</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="longer" id="longer" />
                    <Label htmlFor="longer">Longer timeline</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="experience">Your Investment Experience</Label>
                <Textarea
                  id="experience"
                  placeholder="Briefly describe your investment experience, focus areas, and what you can bring to this startup beyond capital..."
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="message">
                  {action === 'invest' ? 'Message to Founder (Investment Terms)' : 'Message to Founder'}
                </Label>
                <Textarea
                  id="message"
                  placeholder={action === 'invest' 
                    ? "Explain your investment thesis, what you see in this startup, any specific terms or conditions, and how you can help beyond funding..."
                    : "Introduce yourself and explain why you're interested in this startup..."
                  }
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={5}
                />
              </div>

              <div>
                <Label>Preferred Contact Method</Label>
                <RadioGroup
                  value={formData.contactPreference}
                  onValueChange={(value) => handleInputChange('contactPreference', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email" />
                    <Label htmlFor="email" className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="phone" />
                    <Label htmlFor="phone" className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Phone Call
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="video" id="video" />
                    <Label htmlFor="video" className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Video Meeting
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {action === 'invest' && (
                <>
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-primary" />
                      Due Diligence & Legal
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="due-diligence"
                          checked={formData.dueDiligenceRequired}
                          onCheckedChange={(checked) => handleInputChange('dueDiligenceRequired', checked)}
                        />
                        <Label htmlFor="due-diligence" className="text-sm">
                          I require comprehensive due diligence documentation
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="legal-review"
                          checked={formData.legalReviewRequired}
                          onCheckedChange={(checked) => handleInputChange('legalReviewRequired', checked)}
                        />
                        <Label htmlFor="legal-review" className="text-sm">
                          I require legal review of all investment documents
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900">Investment Process</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          After submission, our team will facilitate the connection with the founder, 
                          prepare due diligence materials, and guide you through the investment process.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) => handleInputChange('termsAccepted', checked)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I accept the terms and conditions and privacy policy
                  </Label>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg text-xs text-muted-foreground">
                  <p>
                    By submitting this {action === 'invest' ? 'investment proposal' : 'interest form'}, 
                    you agree to our platform terms. Your information will be shared with the startup founder 
                    to facilitate communication. {action === 'invest' ? 'Investment terms are subject to due diligence and legal review.' : ''}
                  </p>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.termsAccepted}
                  className="flex-1"
                  size="lg"
                >
                  {action === 'invest' ? (
                    <>
                      <DollarSign className="w-5 h-5 mr-2" />
                      Submit Investment Proposal
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5 mr-2" />
                      Express Interest
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/startup-details/${startup.id}`)}
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>What Happens Next?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {action === 'invest' ? (
                  <>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                      <div>
                        <h4 className="font-semibold">Proposal Review</h4>
                        <p className="text-sm text-muted-foreground">Our team reviews your investment proposal within 24-48 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                      <div>
                        <h4 className="font-semibold">Founder Connection</h4>
                        <p className="text-sm text-muted-foreground">We facilitate direct communication with the startup founder</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                      <div>
                        <h4 className="font-semibold">Due Diligence</h4>
                        <p className="text-sm text-muted-foreground">Access detailed business information, financials, and documentation</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">4</div>
                      <div>
                        <h4 className="font-semibold">Legal Process</h4>
                        <p className="text-sm text-muted-foreground">Investment terms negotiation and legal documentation</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                      <div>
                        <h4 className="font-semibold">Founder Notification</h4>
                        <p className="text-sm text-muted-foreground">The founder is notified of your interest immediately</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                      <div>
                        <h4 className="font-semibold">Information Sharing</h4>
                        <p className="text-sm text-muted-foreground">You'll receive detailed business information and updates</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                      <div>
                        <h4 className="font-semibold">Direct Communication</h4>
                        <p className="text-sm text-muted-foreground">Connect directly with the founder to discuss opportunities</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
