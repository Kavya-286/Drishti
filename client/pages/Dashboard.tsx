import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Lightbulb,
  Plus,
  TrendingUp,
  Users,
  Target,
  FileText,
  Settings,
  LogOut,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Filter,
  Search,
  Download,
  Share2
} from 'lucide-react';

// Mock user data
const mockUser = {
  name: "Kavya Sree",
  email: "kavya@example.com",
  avatar: "/api/placeholder/40/40",
  userType: "entrepreneur", // "entrepreneur" or "founder"
  joinDate: "2024-01-15",
  planType: "Professional"
};

// Mock validation history data
const mockValidationHistory = [
  {
    id: "val_001",
    ideaName: "AI-Powered Learning Platform",
    validatedAt: "2024-01-20T10:30:00Z",
    overallScore: 85,
    viabilityLevel: "High",
    status: "completed",
    category: "EdTech",
    stage: "prototype",
    keyMetrics: {
      problemSolutionFit: 88,
      marketOpportunity: 82,
      businessModel: 85,
      competition: 80,
      teamStrength: 90,
      executionReadiness: 85
    }
  },
  {
    id: "val_002", 
    ideaName: "Sustainable Food Delivery",
    validatedAt: "2024-01-18T14:20:00Z",
    overallScore: 72,
    viabilityLevel: "Moderate",
    status: "completed",
    category: "FoodTech",
    stage: "idea",
    keyMetrics: {
      problemSolutionFit: 75,
      marketOpportunity: 78,
      businessModel: 70,
      competition: 65,
      teamStrength: 75,
      executionReadiness: 68
    }
  },
  {
    id: "val_003",
    ideaName: "Healthcare Analytics Tool",
    validatedAt: "2024-01-15T09:15:00Z", 
    overallScore: 91,
    viabilityLevel: "High",
    status: "completed",
    category: "HealthTech",
    stage: "beta",
    keyMetrics: {
      problemSolutionFit: 95,
      marketOpportunity: 88,
      businessModel: 92,
      competition: 85,
      teamStrength: 95,
      executionReadiness: 90
    }
  },
  {
    id: "val_004",
    ideaName: "Smart Home IoT Platform",
    validatedAt: "2024-01-12T16:45:00Z",
    overallScore: 0,
    viabilityLevel: "Pending",
    status: "draft",
    category: "IoT",
    stage: "idea",
    keyMetrics: null
  }
];

// Mock recent activity data
const mockRecentActivity = [
  { type: "validation", action: "Completed validation for AI-Powered Learning Platform", time: "2 hours ago" },
  { type: "pitch", action: "Generated pitch deck for Healthcare Analytics Tool", time: "1 day ago" },
  { type: "swot", action: "Created SWOT analysis for Sustainable Food Delivery", time: "3 days ago" },
  { type: "comparison", action: "Compared with 5 similar startups", time: "5 days ago" }
];

interface ValidationHistory {
  id: string;
  ideaName: string;
  validatedAt: string;
  overallScore: number;
  viabilityLevel: string;
  status: string;
  category: string;
  stage: string;
  keyMetrics: any;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [validationHistory, setValidationHistory] = useState<ValidationHistory[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    // Check authentication
    const user = localStorage.getItem('currentUser');
    const isAuthenticated = localStorage.getItem('isAuthenticated');

    if (!user || !isAuthenticated || isAuthenticated !== 'true') {
      navigate('/auth');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.userType === 'investor') {
      navigate('/investor-dashboard');
      return;
    }

    setCurrentUser(userData);

    // Load validation history from localStorage if available
    const storedHistory = localStorage.getItem(`validationHistory_${userData.id}`);
    if (storedHistory) {
      try {
        const history = JSON.parse(storedHistory);
        setValidationHistory(history);
      } catch (error) {
        console.warn('Failed to load validation history:', error);
        setValidationHistory([]);
      }
    } else {
      // New user - no validation history
      setValidationHistory([]);
    }
  }, [navigate]);

  const handleStartNewValidation = () => {
    localStorage.removeItem('validationProgress');
    localStorage.removeItem('validationData');
    navigate('/validate');
  };

  const handleViewResults = (validationId: string) => {
    // Set the validation data in localStorage for the results page
    const validation = validationHistory.find(v => v.id === validationId);
    if (validation && validation.keyMetrics) {
      localStorage.setItem('selectedValidationResults', JSON.stringify(validation));
      navigate('/results');
    }
  };

  const getScoreColor = (score: number) => {
    // Handle NaN, undefined, or null values
    if (typeof score !== 'number' || isNaN(score) || score < 0) {
      return 'text-gray-600 bg-gray-50 border-gray-200';
    }
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getViabilityBadge = (level: string) => {
    const colors = {
      'High': 'bg-green-500 text-white',
      'Moderate': 'bg-yellow-500 text-white', 
      'Low': 'bg-red-500 text-white',
      'Pending': 'bg-gray-400 text-white'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredHistory = validationHistory.filter(item => {
    const matchesSearch = item.ideaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {currentUser?.firstName || 'User'}!</h1>
            <p className="text-muted-foreground mb-6">
              Track your startup validation journey and discover new opportunities with AI-powered insights.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Validations</p>
                      <p className="text-2xl font-bold">{validationHistory.filter(v => v.status === 'completed').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Avg. Score</p>
                      <p className="text-2xl font-bold">
                        {(() => {
                          const completedValidations = validationHistory.filter(v => v.status === 'completed');
                          if (completedValidations.length === 0) return '—';
                          const totalScore = completedValidations.reduce((acc, v) => acc + (v.overallScore || 0), 0);
                          return Math.round(totalScore / completedValidations.length);
                        })()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Target className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">High Viability</p>
                      <p className="text-2xl font-bold">
                        {validationHistory.filter(v => v.viabilityLevel === 'High').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                      <p className="text-2xl font-bold">
                        {validationHistory.filter(v => v.status === 'draft').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4 mb-8">
              <Button size="lg" onClick={handleStartNewValidation} className="bg-gradient-to-r from-primary to-blue-600">
                <Plus className="w-5 h-5 mr-2" />
                Start New Validation
              </Button>
              <Button variant="outline" size="lg">
                <FileText className="w-5 h-5 mr-2" />
                Generate Report
              </Button>
              <Button variant="outline" size="lg">
                <BarChart3 className="w-5 h-5 mr-2" />
                View Analytics
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Validation History */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Validation History</CardTitle>
                      <CardDescription>
                        Track your startup idea validations and progress
                      </CardDescription>
                    </div>
                    
                    {/* Search and Filter */}
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                          placeholder="Search ideas..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8 pr-3 py-2 text-sm border rounded-md w-48"
                        />
                      </div>
                      <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="text-sm border rounded-md px-3 py-2"
                      >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No validations found</p>
                        <Button className="mt-4" onClick={handleStartNewValidation}>
                          Start Your First Validation
                        </Button>
                      </div>
                    ) : (
                      filteredHistory.map((validation) => (
                        <div key={validation.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-semibold text-lg">{validation.ideaName}</h3>
                                <Badge className={getViabilityBadge(validation.viabilityLevel)}>
                                  {validation.viabilityLevel}
                                </Badge>
                                {validation.status === 'completed' && (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                )}
                                {validation.status === 'draft' && (
                                  <Clock className="h-5 w-5 text-yellow-600" />
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                                <span>Category: {validation.category}</span>
                                <span>Stage: {validation.stage}</span>
                                <span>Validated: {formatDate(validation.validatedAt)}</span>
                              </div>

                              {validation.status === 'completed' && validation.keyMetrics && (
                                <>
                                  <div className="flex items-center space-x-4 mb-3">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm font-medium">Overall Score:</span>
                                      <Badge variant="outline" className={getScoreColor(validation.overallScore)}>
                                        {typeof validation.overallScore === 'number' && !isNaN(validation.overallScore) ? validation.overallScore : '—'}/100
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                    <div>
                                      <span className="text-muted-foreground">Problem-Solution:</span>
                                      <div className="font-medium">{validation.keyMetrics.problemSolutionFit}%</div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Market:</span>
                                      <div className="font-medium">{validation.keyMetrics.marketOpportunity}%</div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Business Model:</span>
                                      <div className="font-medium">{validation.keyMetrics.businessModel}%</div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>

                            <div className="flex flex-col space-y-2 ml-4">
                              {validation.status === 'completed' ? (
                                <>
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleViewResults(validation.id)}
                                  >
                                    View Results
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-1" />
                                    Export
                                  </Button>
                                </>
                              ) : (
                                <Button size="sm" onClick={handleStartNewValidation}>
                                  Continue
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockRecentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Trending Opportunity</p>
                          <p className="text-xs text-blue-700">
                            HealthTech startups are showing 40% higher success rates this quarter
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-green-900">Performance Tip</p>
                          <p className="text-xs text-green-700">
                            Your team strength scores are consistently high - leverage this advantage
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Users className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-purple-900">Network Suggestion</p>
                          <p className="text-xs text-purple-700">
                            Connect with 3 similar founders in your industry for insights
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upgrade Banner */}
              {mockUser.planType === "Free" && (
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Star className="w-5 h-5 text-primary mr-2" />
                      Upgrade to Pro
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get unlimited validations, advanced AI insights, and priority support.
                    </p>
                    <Button className="w-full">Upgrade Now</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
