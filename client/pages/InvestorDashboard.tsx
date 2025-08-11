import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import {
  DollarSign,
  TrendingUp,
  Users,
  BarChart3,
  Search,
  Filter,
  Plus,
  Eye,
  Star,
  ArrowRight,
  Building2,
  Briefcase,
  Target
} from 'lucide-react';

export default function InvestorDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [publicStartupIdeas, setPublicStartupIdeas] = useState<any[]>([]);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (!user || !isAuthenticated || isAuthenticated !== 'true') {
      navigate('/auth');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.userType !== 'investor') {
      navigate('/dashboard');
      return;
    }

    setCurrentUser(userData);

    // Load public startup ideas
    const loadPublicIdeas = () => {
      try {
        const ideas = JSON.parse(localStorage.getItem('publicStartupIdeas') || '[]');
        setPublicStartupIdeas(ideas);
      } catch (error) {
        console.error('Failed to load public startup ideas:', error);
        setPublicStartupIdeas([]);
      }
    };

    loadPublicIdeas();
  }, [navigate]);

  // Mock data for demo purposes
  const portfolioStats = {
    totalInvestments: 24,
    activeInvestments: 18,
    avgInvestmentSize: 125000,
    totalPortfolioValue: 3200000,
    unrealizedGains: 850000,
    successRate: 72
  };

  const recentStartups = [
    {
      id: 1,
      name: 'TechFlow AI',
      industry: 'Technology',
      stage: 'Series A',
      fundingNeeded: '$2M',
      valuation: '$12M',
      matchScore: 92,
      description: 'AI-powered workflow automation for enterprise clients',
      founders: 'Sarah Chen, Michael Rodriguez',
      traction: '250% MRR growth, 50+ enterprise clients'
    },
    {
      id: 2,
      name: 'HealthSync',
      industry: 'Healthcare',
      stage: 'Seed',
      fundingNeeded: '$800K',
      valuation: '$4M',
      matchScore: 88,
      description: 'Digital health platform connecting patients with specialists',
      founders: 'Dr. Emily Watson, James Park',
      traction: '10K+ users, partnerships with 3 hospital networks'
    },
    {
      id: 3,
      name: 'GreenEnergy Solutions',
      industry: 'Energy',
      stage: 'Pre-Seed',
      fundingNeeded: '$500K',
      valuation: '$2.5M',
      matchScore: 85,
      description: 'Solar panel optimization using IoT and ML',
      founders: 'Alex Thompson, Maria Santos',
      traction: 'Pilot with 2 utility companies, 15% efficiency improvement'
    }
  ];

  const marketInsights = [
    {
      sector: 'AI/ML',
      trend: 'up',
      change: '+23%',
      description: 'Enterprise AI adoption accelerating'
    },
    {
      sector: 'FinTech',
      trend: 'down',
      change: '-8%',
      description: 'Regulatory concerns affecting valuations'
    },
    {
      sector: 'HealthTech',
      trend: 'up',
      change: '+15%',
      description: 'Post-pandemic digital health momentum'
    },
    {
      sector: 'Climate Tech',
      trend: 'up',
      change: '+31%',
      description: 'ESG mandates driving investment'
    }
  ];

  const handleInvestmentInterest = (startup: any) => {
    navigate(`/investment-action/${startup.id}`, {
      state: { action: 'express-interest', startup }
    });
  };

  const handleInvest = (startup: any) => {
    navigate(`/investment-action/${startup.id}`, {
      state: { action: 'invest', startup }
    });
  };

  const handleViewDetails = (startup: any) => {
    navigate(`/startup-details/${startup.id}`);
  };

  const handleAddToWatchlist = (startup: any) => {
    const watchlist = JSON.parse(localStorage.getItem('investorWatchlist') || '[]');

    const isAlreadyWatchlisted = watchlist.some((item: any) => item.id === startup.id);

    if (isAlreadyWatchlisted) {
      alert('Already in your watchlist!');
      return;
    }

    const watchlistItem = {
      id: startup.id,
      ideaName: startup.ideaName,
      industry: startup.industry,
      validationScore: startup.validationScore,
      viabilityLevel: startup.viabilityLevel,
      addedAt: new Date().toISOString()
    };

    watchlist.push(watchlistItem);
    localStorage.setItem('investorWatchlist', JSON.stringify(watchlist));
    alert('✅ Added to watchlist!');
  };

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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {currentUser.firstName || 'Investor'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Discover promising startups and manage your investment portfolio
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(portfolioStats.totalPortfolioValue / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{((portfolioStats.unrealizedGains / portfolioStats.totalPortfolioValue) * 100).toFixed(1)}% unrealized gains
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolioStats.activeInvestments}</div>
              <p className="text-xs text-muted-foreground">
                {portfolioStats.totalInvestments} total investments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Check Size</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(portfolioStats.avgInvestmentSize / 1000).toFixed(0)}K
              </div>
              <p className="text-xs text-muted-foreground">
                Per investment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolioStats.successRate}%</div>
              <p className="text-xs text-muted-foreground">
                Successful exits/IPOs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="insights">Market Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Market Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Market Trends</CardTitle>
                <CardDescription>Key sector movements this quarter</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {marketInsights.map((insight, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{insight.sector}</h4>
                        <Badge variant={insight.trend === 'up' ? 'default' : 'destructive'}>
                          {insight.change}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Public Startup Ideas */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Public Startup Ideas</CardTitle>
                    <CardDescription>Validated startup ideas from entrepreneurs on Drishti</CardDescription>
                  </div>
                  <Badge variant="secondary">{publicStartupIdeas.length} ideas available</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {publicStartupIdeas.length === 0 ? (
                    <div className="text-center py-8">
                      <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No public startup ideas yet</h3>
                      <p className="text-muted-foreground text-sm">
                        When entrepreneurs make their ideas public, they'll appear here for investment opportunities.
                      </p>
                    </div>
                  ) : (
                    publicStartupIdeas.slice(0, 3).map((startup) => (
                      <div key={startup.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{startup.ideaName}</h3>
                            <p className="text-sm text-muted-foreground">{startup.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              by {startup.founder?.firstName} {startup.founder?.lastName} •
                              Created {new Date(startup.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="default">
                            {startup.validationScore}/100 score
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Industry</p>
                            <p className="text-sm font-medium">{startup.industry}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Stage</p>
                            <p className="text-sm font-medium">{startup.stage}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Funding Needs</p>
                            <p className="text-sm font-medium">{startup.fundingNeeds}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Viability</p>
                            <Badge variant={startup.viabilityLevel === 'High' ? 'default' : startup.viabilityLevel === 'Moderate' ? 'secondary' : 'destructive'}>
                              {startup.viabilityLevel}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Target: {startup.targetMarket?.substring(0, 50)}...
                          </p>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewDetails(startup)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Button size="sm" onClick={() => handleInvest(startup)}>
                              <DollarSign className="w-4 h-4 mr-2" />
                              Invest
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Find Investment Opportunities</CardTitle>
                <CardDescription>Search and filter startups based on your criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search startups, industries, or keywords..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </div>

                <div className="space-y-4">
                  {publicStartupIdeas.length === 0 ? (
                    <div className="text-center py-12">
                      <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No public startup ideas yet</h3>
                      <p className="text-muted-foreground text-sm">
                        When entrepreneurs make their ideas public, they'll appear here for investment opportunities.
                      </p>
                    </div>
                  ) : (
                    publicStartupIdeas
                      .filter(startup =>
                        startup.ideaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        startup.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        startup.industry.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((startup) => (
                        <div key={startup.id} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold">{startup.ideaName}</h3>
                              <p className="text-muted-foreground mb-2">{startup.description}</p>
                              <p className="text-sm text-muted-foreground">
                                by {startup.founder?.firstName} {startup.founder?.lastName} ���
                                Created {new Date(startup.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant="default" className="mb-2">
                                {startup.validationScore}/100 validated
                              </Badge>
                              <p className="text-sm text-muted-foreground">{startup.industry}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Stage</p>
                              <p className="text-sm font-medium">{startup.stage}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Funding Needs</p>
                              <p className="text-sm font-medium text-green-600">{startup.fundingNeeds}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Revenue Model</p>
                              <p className="text-sm font-medium">{startup.revenueModel}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Viability</p>
                              <Badge variant={startup.viabilityLevel === 'High' ? 'default' : startup.viabilityLevel === 'Moderate' ? 'secondary' : 'destructive'}>
                                {startup.viabilityLevel}
                              </Badge>
                            </div>
                          </div>

                          <div className="bg-muted/30 p-3 rounded-lg mb-4">
                            <p className="text-sm">
                              <strong>Problem:</strong> {startup.problemStatement?.substring(0, 200)}...
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleViewDetails(startup)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Full Details
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleAddToWatchlist(startup)}>
                                <Star className="w-4 h-4 mr-2" />
                                Add to Watchlist
                              </Button>
                            </div>
                            <Button size="sm" onClick={() => handleInvestmentInterest(startup)}>
                              <DollarSign className="w-4 h-4 mr-2" />
                              Express Interest
                            </Button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Overview</CardTitle>
                <CardDescription>Your current investments and their performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Portfolio Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Track your investments, monitor performance, and manage your portfolio
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Investment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Insights & Analytics</CardTitle>
                <CardDescription>Data-driven insights for better investment decisions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Advanced market analytics and investment insights
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
