import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import {
  CheckCircle,
  DollarSign,
  Calendar,
  User,
  Building2,
  FileText,
  Send,
  ArrowLeft,
  Star,
  TrendingUp,
  Users
} from 'lucide-react';

export default function InvestorAcknowledgment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [startup, setStartup] = useState<any>(null);
  const [investmentData, setInvestmentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acknowledgmentData, setAcknowledgmentData] = useState({
    investorNotes: '',
    expectedTimeline: '2-4 weeks',
    dueDiligenceItems: [] as string[],
    nextSteps: '',
    contactPreference: 'email'
  });

  useEffect(() => {
    const loadData = () => {
      try {
        // Get startup data
        const publicIdeas = JSON.parse(localStorage.getItem('publicStartupIdeas') || '[]');
        const foundStartup = publicIdeas.find((idea: any) => idea.id === id);
        
        // Get investment data from location state
        const invData = location.state?.investmentData;
        
        if (!foundStartup || !invData) {
          navigate('/investor-dashboard');
          return;
        }

        setStartup(foundStartup);
        setInvestmentData(invData);
      } catch (error) {
        console.error('Failed to load data:', error);
        navigate('/investor-dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate, location.state]);

  const handleInputChange = (field: string, value: any) => {
    setAcknowledgmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDueDiligenceToggle = (item: string) => {
    setAcknowledgmentData(prev => ({
      ...prev,
      dueDiligenceItems: prev.dueDiligenceItems.includes(item)
        ? prev.dueDiligenceItems.filter(i => i !== item)
        : [...prev.dueDiligenceItems, item]
    }));
  };

  const handleSubmitAcknowledgment = async () => {
    setIsSubmitting(true);
    
    try {
      // Create investment acknowledgment record
      const acknowledgment = {
        id: `ack_${Date.now()}`,
        startupId: startup.id,
        startupName: startup.ideaName,
        investorId: JSON.parse(localStorage.getItem('currentUser') || '{}').id,
        investorName: JSON.parse(localStorage.getItem('currentUser') || '{}').firstName,
        originalInvestment: investmentData,
        acknowledgmentData,
        status: 'acknowledged',
        submittedAt: new Date().toISOString()
      };

      // Store investment acknowledgment
      const existingAcknowledgments = JSON.parse(localStorage.getItem('investmentAcknowledgments') || '[]');
      existingAcknowledgments.push(acknowledgment);
      localStorage.setItem('investmentAcknowledgments', JSON.stringify(existingAcknowledgments));

      // Create notification for the startup founder
      const notification = {
        id: `notif_${Date.now()}`,
        recipientId: startup.founder?.id || startup.founder?.email,
        startupId: startup.id,
        type: 'investment_interest',
        title: 'New Investment Interest!',
        message: `${acknowledgment.investorName} has expressed serious investment interest in "${startup.ideaName}". They are ready to proceed with due diligence.`,
        data: {
          investmentAmount: investmentData.investmentAmount,
          investmentType: investmentData.investmentType,
          timeline: acknowledgmentData.expectedTimeline,
          investorName: acknowledgment.investorName,
          acknowledgmentId: acknowledgment.id
        },
        read: false,
        createdAt: new Date().toISOString()
      };

      // Store notification for the founder
      const existingNotifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
      existingNotifications.push(notification);
      localStorage.setItem('userNotifications', JSON.stringify(existingNotifications));

      alert(`🎉 Investment acknowledgment sent successfully!\n\nNext steps:\n• Founder will be notified of your serious interest\n• Due diligence materials will be prepared\n• You'll be contacted within 48 hours\n• Investment process will begin as per timeline\n\nThank you for your investment interest in ${startup.ideaName}!`);
      
      navigate('/investor-dashboard');
    } catch (error) {
      console.error('Failed to submit acknowledgment:', error);
      alert('Failed to submit acknowledgment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

  if (!startup || !investmentData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Investment Data Not Found</h2>
          <p className="text-muted-foreground mb-4">Unable to load investment information.</p>
          <Button onClick={() => navigate('/investor-dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const dueDiligenceChecklist = [
    'Financial statements and projections',
    'Business model validation',
    'Market research and competitive analysis',
    'Technical architecture review',
    'Legal compliance and IP portfolio',
    'Team background verification',
    'Customer references and testimonials',
    'Regulatory compliance assessment'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="outline" onClick={() => navigate('/investor-dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Investment Acknowledgment
            </Badge>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Investment Acknowledgment</h1>
            <p className="text-muted-foreground">
              Confirm your investment interest and next steps
            </p>
          </div>

          {/* Investment Summary */}
          <Card className="mb-8 border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span>Investment Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{startup.ideaName}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{startup.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Validation Score:</span>
                      <Badge variant="default">{startup.validationScore}/100</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Industry:</span>
                      <span className="text-sm font-medium">{startup.industry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Stage:</span>
                      <span className="text-sm font-medium">{startup.stage}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Your Investment Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Investment Amount:</span>
                      <span className="text-sm font-bold text-green-600">${investmentData.investmentAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Investment Type:</span>
                      <span className="text-sm font-medium">{investmentData.investmentType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Preferred Timeline:</span>
                      <span className="text-sm font-medium">{investmentData.timeFrame}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acknowledgment Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Investment Acknowledgment Details</span>
              </CardTitle>
              <CardDescription>
                Provide additional details about your investment process and requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="investor-notes">Additional Investment Notes</Label>
                <Textarea
                  id="investor-notes"
                  placeholder="Share any specific investment criteria, expectations, or additional information about your interest..."
                  value={acknowledgmentData.investorNotes}
                  onChange={(e) => handleInputChange('investorNotes', e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="timeline">Expected Investment Timeline</Label>
                <select
                  id="timeline"
                  value={acknowledgmentData.expectedTimeline}
                  onChange={(e) => handleInputChange('expectedTimeline', e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="2-4 weeks">2-4 weeks</option>
                  <option value="1-2 months">1-2 months</option>
                  <option value="2-3 months">2-3 months</option>
                  <option value="3+ months">3+ months</option>
                </select>
              </div>

              <div>
                <Label>Required Due Diligence Items</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Select the due diligence materials you'll need before finalizing investment
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dueDiligenceChecklist.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`dd-${index}`}
                        checked={acknowledgmentData.dueDiligenceItems.includes(item)}
                        onChange={() => handleDueDiligenceToggle(item)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`dd-${index}`} className="text-sm">{item}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="next-steps">Next Steps & Expectations</Label>
                <Textarea
                  id="next-steps"
                  placeholder="Outline your expected next steps, meeting preferences, and any specific requirements for moving forward..."
                  value={acknowledgmentData.nextSteps}
                  onChange={(e) => handleInputChange('nextSteps', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label>Preferred Contact Method</Label>
                <div className="flex space-x-4 mt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="email"
                      checked={acknowledgmentData.contactPreference === 'email'}
                      onChange={(e) => handleInputChange('contactPreference', e.target.value)}
                    />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="phone"
                      checked={acknowledgmentData.contactPreference === 'phone'}
                      onChange={(e) => handleInputChange('contactPreference', e.target.value)}
                    />
                    <span className="text-sm">Phone Call</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="video"
                      checked={acknowledgmentData.contactPreference === 'video'}
                      onChange={(e) => handleInputChange('contactPreference', e.target.value)}
                    />
                    <span className="text-sm">Video Meeting</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Founder Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary" />
                <span>Founder Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Primary Contact</h4>
                  <p className="text-sm"><strong>Name:</strong> {startup.founder?.firstName} {startup.founder?.lastName}</p>
                  <p className="text-sm"><strong>Role:</strong> Founder & CEO</p>
                  <p className="text-sm text-muted-foreground">Contact details will be shared after acknowledgment</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Startup Details</h4>
                  <p className="text-sm"><strong>Founded:</strong> {new Date(startup.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm"><strong>Validation Date:</strong> {new Date(startup.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm"><strong>Current Status:</strong> Seeking Investment</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Section */}
          <div className="flex justify-between items-center p-6 bg-muted/30 rounded-lg">
            <div>
              <h3 className="font-semibold mb-1">Ready to Proceed?</h3>
              <p className="text-sm text-muted-foreground">
                Your acknowledgment will notify the founder and initiate the investment process
              </p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/startup-details/${startup.id}`)}
              >
                Review Details
              </Button>
              <Button 
                onClick={handleSubmitAcknowledgment}
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Investment Acknowledgment
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
