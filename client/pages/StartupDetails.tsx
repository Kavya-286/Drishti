import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Building2,
  Calendar,
  Globe,
  Share2,
  Star,
  Heart,
  MessageCircle,
  Download,
  Eye,
  Mail,
  Phone,
  LinkedinIcon
} from 'lucide-react';

export default function StartupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [startup, setStartup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  useEffect(() => {
    const loadStartupDetails = () => {
      try {
        const publicIdeas = JSON.parse(localStorage.getItem('publicStartupIdeas') || '[]');
        const foundStartup = publicIdeas.find((idea: any) => idea.id === id);
        
        if (!foundStartup) {
          navigate('/investor-dashboard');
          return;
        }

        setStartup(foundStartup);

        // Check if startup is in watchlist
        const watchlist = JSON.parse(localStorage.getItem('investorWatchlist') || '[]');
        setIsWatchlisted(watchlist.some((item: any) => item.id === id));
      } catch (error) {
        console.error('Failed to load startup details:', error);
        navigate('/investor-dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadStartupDetails();
  }, [id, navigate]);

  const handleAddToWatchlist = () => {
    const watchlist = JSON.parse(localStorage.getItem('investorWatchlist') || '[]');
    
    if (isWatchlisted) {
      // Remove from watchlist
      const updatedWatchlist = watchlist.filter((item: any) => item.id !== startup.id);
      localStorage.setItem('investorWatchlist', JSON.stringify(updatedWatchlist));
      setIsWatchlisted(false);
      alert('❌ Removed from watchlist');
    } else {
      // Add to watchlist
      const watchlistItem = {
        id: startup.id,
        ideaName: startup.ideaName,
        industry: startup.industry,
        validationScore: startup.validationScore,
        addedAt: new Date().toISOString()
      };
      watchlist.push(watchlistItem);
      localStorage.setItem('investorWatchlist', JSON.stringify(watchlist));
      setIsWatchlisted(true);
      alert('✅ Added to watchlist');
    }
  };

  const handleExpressInterest = () => {
    navigate(`/investment-action/${startup.id}`, { 
      state: { action: 'express-interest', startup } 
    });
  };

  const handleInvest = () => {
    navigate(`/investment-action/${startup.id}`, { 
      state: { action: 'invest', startup } 
    });
  };

  const handleContactFounder = () => {
    const founder = startup.founder;
    const message = `Hi ${founder?.firstName},\n\nI'm interested in learning more about ${startup.ideaName}. Your startup scored ${startup.validationScore}/100 in validation and shows great promise.\n\nI'd love to discuss potential investment opportunities.\n\nBest regards,\nInvestor`;
    
    if (founder?.email) {
      window.open(`mailto:${founder.email}?subject=Investment Interest in ${startup.ideaName}&body=${encodeURIComponent(message)}`);
    } else {
      alert('Founder contact information will be available after expressing interest.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading startup details...</p>
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
          <p className="text-muted-foreground mb-4">The startup you're looking for doesn't exist or is no longer public.</p>
          <Button onClick={() => navigate('/investor-dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getViabilityBadge = (level: string) => {
    const colors = {
      'High': 'bg-green-500 text-white',
      'Moderate': 'bg-yellow-500 text-white',
      'Low': 'bg-red-500 text-white'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="outline" onClick={() => navigate('/investor-dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleAddToWatchlist}>
                <Star className={`w-4 h-4 mr-2 ${isWatchlisted ? 'fill-current text-yellow-500' : ''}`} />
                {isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Header Section */}
          <div className="bg-gradient-to-r from-primary/10 to-blue-50 p-8 rounded-lg mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{startup.ideaName}</h1>
                    <p className="text-lg text-muted-foreground mb-4">{startup.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {startup.founder?.firstName} {startup.founder?.lastName}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Created {new Date(startup.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-1" />
                        {startup.industry}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold text-primary mb-2">{startup.validationScore}/100</div>
                    <Badge className={getViabilityBadge(startup.viabilityLevel)}>
                      {startup.viabilityLevel} Viability
                    </Badge>
                    <Progress value={startup.validationScore} className="mt-4" />
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-sm text-muted-foreground">Stage</div>
                    <div className="font-semibold">{startup.stage}</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-sm text-muted-foreground">Funding</div>
                    <div className="font-semibold text-green-600">{startup.fundingNeeds}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full" onClick={handleInvest}>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Invest Now
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleExpressInterest}>
                    <Heart className="w-4 h-4 mr-2" />
                    Express Interest
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleContactFounder}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Founder
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="problem">Problem & Solution</TabsTrigger>
              <TabsTrigger value="market">Market Analysis</TabsTrigger>
              <TabsTrigger value="business">Business Model</TabsTrigger>
              <TabsTrigger value="validation">Validation Details</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-primary" />
                      <span>Key Highlights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Problem Statement</h4>
                      <p className="text-sm text-muted-foreground">{startup.problemStatement}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Solution</h4>
                      <p className="text-sm text-muted-foreground">{startup.solutionDescription}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Target Market</h4>
                      <p className="text-sm text-muted-foreground">{startup.targetMarket}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      <span>Business Metrics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Revenue Model</div>
                        <div className="font-semibold">{startup.revenueModel}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Industry</div>
                        <div className="font-semibold">{startup.industry}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Development Stage</div>
                        <div className="font-semibold">{startup.stage}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Validation Score</div>
                        <div className="font-semibold text-primary">{startup.validationScore}/100</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Validation Scores Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span>Validation Scores</span>
                  </CardTitle>
                  <CardDescription>Detailed breakdown of validation assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {startup.validationResults?.scores?.map((score: any, index: number) => (
                      <div key={index} className={`p-4 border rounded-lg ${
                        score.score >= 80 ? 'border-green-200 bg-green-50' : 
                        score.score >= 60 ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">{score.category}</h4>
                          <Badge variant="outline" className={getScoreColor(score.score)}>
                            {score.score}%
                          </Badge>
                        </div>
                        <Progress value={score.score} className="mb-3 h-2" />
                        <p className="text-xs text-muted-foreground">{score.feedback}</p>
                      </div>
                    )) || (
                      <div className="col-span-full text-center py-8">
                        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Detailed validation scores not available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="problem" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      <span>Problem Statement</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{startup.problemStatement}</p>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong>Target Market:</strong> {startup.targetMarket}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Solution</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{startup.solutionDescription}</p>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong>Stage:</strong> {startup.stage}
                      </div>
                      <div className="text-sm">
                        <strong>Industry:</strong> {startup.industry}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="market" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span>Market Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Target Market</h4>
                      <p className="text-muted-foreground">{startup.targetMarket}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Industry</h4>
                      <Badge variant="secondary">{startup.industry}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <span>Business Model</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Revenue Model</h4>
                      <p className="text-muted-foreground">{startup.revenueModel}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Funding Requirements</h4>
                      <p className="text-green-600 font-semibold">{startup.fundingNeeds}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="validation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <span>Detailed Validation Report</span>
                  </CardTitle>
                  <CardDescription>
                    AI-powered validation analysis conducted on {new Date(startup.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">{startup.validationScore}/100</div>
                      <Badge className={`${getViabilityBadge(startup.viabilityLevel)} mb-4`}>
                        {startup.viabilityLevel} Viability
                      </Badge>
                      <Progress value={startup.validationScore} className="max-w-md mx-auto" />
                    </div>

                    {startup.validationResults?.scores && (
                      <div className="space-y-4">
                        {startup.validationResults.scores.map((score: any, index: number) => (
                          <Card key={index} className="border-l-4 border-l-primary">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{score.category}</CardTitle>
                                <Badge variant="outline" className={getScoreColor(score.score)}>
                                  {score.score}%
                                </Badge>
                              </div>
                              <CardDescription>{score.feedback}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div>
                                <h5 className="font-semibold mb-2 text-sm">Suggestions for Improvement:</h5>
                                <ul className="space-y-1">
                                  {score.suggestions?.map((suggestion: string, suggestionIndex: number) => (
                                    <li key={suggestionIndex} className="flex items-start space-x-2 text-sm">
                                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                      <span className="text-muted-foreground">{suggestion}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Founder Information */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary" />
                <span>Founder Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {startup.founder?.firstName} {startup.founder?.lastName}
                  </h3>
                  <p className="text-muted-foreground">Founder & CEO</p>
                  <div className="flex space-x-4 mt-2 text-sm text-muted-foreground">
                    {startup.founder?.email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        Contact available after expressing interest
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleContactFounder}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-8 p-6 bg-muted/30 rounded-lg">
            <Button size="lg" onClick={handleInvest}>
              <DollarSign className="w-5 h-5 mr-2" />
              Invest in {startup.ideaName}
            </Button>
            <Button size="lg" variant="outline" onClick={handleExpressInterest}>
              <Heart className="w-5 h-5 mr-2" />
              Express Interest
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
