import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Lightbulb,
  ArrowLeft,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Building2,
  Calendar,
  DollarSign,
  Users,
  Globe,
  ExternalLink,
  Star,
  Award,
  Target,
  Zap,
  BarChart3
} from 'lucide-react';

interface SimilarStartup {
  id: string;
  name: string;
  description: string;
  category: string;
  stage: string;
  founded: string;
  location: string;
  website?: string;
  funding: {
    total: string;
    lastRound: string;
    investors: string[];
  };
  teamSize: string;
  similarityScore: number;
  similarityReasons: string[];
  successMetrics: {
    revenue?: string;
    users?: string;
    growth?: string;
    valuation?: string;
  };
  strengths: string[];
  weaknesses: string[];
  keyDifferentiators: string[];
  outcome: 'active' | 'acquired' | 'ipo' | 'failed';
  outcomeDetails?: string;
  lessonsLearned: string[];
}

interface ComparisonProps {
  validationData: any;
  onBack: () => void;
}

// Mock data for similar startups
const mockSimilarStartups: SimilarStartup[] = [
  {
    id: "startup_001",
    name: "TradeGecko",
    description: "Cloud-based inventory management software for SMBs",
    category: "Inventory Management",
    stage: "Acquired",
    founded: "2012",
    location: "Singapore",
    website: "https://tradegecko.com",
    funding: {
      total: "$58M",
      lastRound: "Series B",
      investors: ["Jungle Ventures", "TNB Ventures", "Felicis Ventures"]
    },
    teamSize: "150+",
    similarityScore: 89,
    similarityReasons: [
      "Similar target market (SMB retailers)",
      "Cloud-based inventory management",
      "Multi-channel commerce focus",
      "B2B SaaS model"
    ],
    successMetrics: {
      revenue: "$20M ARR",
      users: "15,000+",
      growth: "150% YoY",
      valuation: "$500M"
    },
    strengths: [
      "Strong product-market fit",
      "Excellent customer retention (95%)",
      "Comprehensive feature set",
      "Strong channel partnerships"
    ],
    weaknesses: [
      "High customer acquisition cost",
      "Complex pricing model",
      "Limited AI/automation features"
    ],
    keyDifferentiators: [
      "Multi-channel inventory sync",
      "Built-in B2B marketplace",
      "Advanced reporting suite"
    ],
    outcome: "acquired",
    outcomeDetails: "Acquired by Intuit QuickBooks for $500M in 2020",
    lessonsLearned: [
      "Focus on customer retention over rapid acquisition",
      "Build strong integrations ecosystem early",
      "Price based on value delivered, not features",
      "International expansion requires local partnerships"
    ]
  },
  {
    id: "startup_002",
    name: "Cin7",
    description: "Connected inventory performance platform for product sellers",
    category: "Inventory Management",
    stage: "Growth",
    founded: "2012",
    location: "New Zealand",
    website: "https://cin7.com",
    funding: {
      total: "$85M",
      lastRound: "Series C",
      investors: ["Tiger Global", "Insight Partners", "Battery Ventures"]
    },
    teamSize: "400+",
    similarityScore: 82,
    similarityReasons: [
      "Inventory management for retailers",
      "Cloud-based platform",
      "Multi-location support",
      "Integration-focused approach"
    ],
    successMetrics: {
      revenue: "$50M ARR",
      users: "8,000+",
      growth: "80% YoY",
      valuation: "$500M"
    },
    strengths: [
      "Comprehensive feature set",
      "Strong enterprise clients",
      "Global presence",
      "Robust integration platform"
    ],
    weaknesses: [
      "Complex user interface",
      "High implementation time",
      "Expensive for SMBs"
    ],
    keyDifferentiators: [
      "End-to-end supply chain visibility",
      "Advanced warehouse management",
      "Built-in EDI capabilities"
    ],
    outcome: "active",
    outcomeDetails: "Rapidly growing, targeting IPO in 2024-2025",
    lessonsLearned: [
      "Enterprise clients provide stability but slower growth",
      "Product complexity can hinder SMB adoption",
      "Global expansion requires significant investment",
      "Partner ecosystem is crucial for growth"
    ]
  },
  {
    id: "startup_003",
    name: "Stitch Labs",
    description: "Multi-channel retail operations platform",
    category: "Retail Operations",
    stage: "Failed",
    founded: "2011",
    location: "San Francisco, USA",
    funding: {
      total: "$25M",
      lastRound: "Series B",
      investors: ["Foundry Group", "500 Startups", "Cross Culture Ventures"]
    },
    teamSize: "80",
    similarityScore: 75,
    similarityReasons: [
      "Multi-channel retail focus",
      "Inventory management core",
      "SMB target market",
      "Cloud-based solution"
    ],
    successMetrics: {
      revenue: "$8M ARR",
      users: "2,000+",
      growth: "-10% YoY",
      valuation: "$100M"
    },
    strengths: [
      "Early market entry",
      "Strong initial product",
      "Good customer relationships",
      "Solid technical foundation"
    ],
    weaknesses: [
      "High churn rate",
      "Inefficient customer acquisition",
      "Limited feature differentiation",
      "Cash flow management issues"
    ],
    keyDifferentiators: [
      "Retail-specific workflows",
      "Multi-location inventory",
      "POS integrations"
    ],
    outcome: "failed",
    outcomeDetails: "Shut down in 2018 due to inability to achieve sustainable growth",
    lessonsLearned: [
      "Product-market fit requires continuous validation",
      "Unit economics must work from early stages",
      "Customer success is as important as acquisition",
      "Market timing and competition pressure matter",
      "Burn rate management is critical for survival"
    ]
  }
];

export default function StartupComparison({ validationData, onBack }: ComparisonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [similarStartups, setSimilarStartups] = useState<SimilarStartup[]>([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate analysis
    const analyzeStartups = async () => {
      setIsAnalyzing(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Intelligent filtering based on user's startup idea
      const userText = (
        validationData.problemStatement + ' ' +
        validationData.solutionDescription + ' ' +
        validationData.targetMarket + ' ' +
        validationData.revenueModel + ' ' +
        validationData.customerSegments
      ).toLowerCase();

      // Industry detection
      const detectIndustry = (text: string): string => {
        if (text.includes('healthcare') || text.includes('medical') || text.includes('health')) return 'healthcare';
        if (text.includes('education') || text.includes('learning') || text.includes('student') || text.includes('teach')) return 'education';
        if (text.includes('finance') || text.includes('payment') || text.includes('banking') || text.includes('fintech')) return 'finance';
        if (text.includes('food') || text.includes('restaurant') || text.includes('delivery') || text.includes('meal')) return 'food';
        if (text.includes('real estate') || text.includes('property') || text.includes('housing')) return 'realestate';
        if (text.includes('transport') || text.includes('logistics') || text.includes('delivery') || text.includes('shipping')) return 'logistics';
        if (text.includes('ai') || text.includes('machine learning') || text.includes('artificial intelligence')) return 'ai';
        if (text.includes('blockchain') || text.includes('crypto') || text.includes('web3')) return 'blockchain';
        if (text.includes('environment') || text.includes('sustainable') || text.includes('green') || text.includes('climate')) return 'environment';
        if (text.includes('retail') || text.includes('ecommerce') || text.includes('shopping') || text.includes('inventory')) return 'retail';
        if (text.includes('saas') || text.includes('software') || text.includes('platform') || text.includes('tool')) return 'software';
        return 'technology';
      };

      const userIndustry = detectIndustry(userText);

      // Enhanced industry-specific startups
      const industryStartups = {
        healthcare: [
          {
            id: "health_001", name: "Teladoc Health", description: "Virtual healthcare platform connecting patients with doctors",
            category: "Telehealth", stage: "Public", founded: "2002", location: "New York, USA",
            funding: { total: "$1.2B", lastRound: "IPO", investors: ["Public"] }, teamSize: "3,000+", similarityScore: 95,
            similarityReasons: ["Healthcare technology platform", "Digital patient care", "Subscription model", "Scalable solution"],
            successMetrics: { revenue: "$2.4B", users: "54M+", growth: "85% YoY", valuation: "$13B" },
            strengths: ["Market leader", "Regulatory compliance", "Global reach"], weaknesses: ["High competition", "Regulatory dependencies"],
            keyDifferentiators: ["Integrated platform", "AI diagnostics", "Global network"], outcome: "successful",
            outcomeDetails: "IPO 2015, market cap $13B+", lessonsLearned: ["Regulatory compliance critical", "Network effects drive growth"]
          },
          {
            id: "health_002", name: "Oscar Health", description: "Technology-driven health insurance company",
            category: "Health Insurance", stage: "Public", founded: "2012", location: "New York, USA",
            funding: { total: "$1.6B", lastRound: "IPO", investors: ["Public"] }, teamSize: "1,500+", similarityScore: 88,
            similarityReasons: ["Healthcare innovation", "Consumer-focused", "Data-driven", "Digital-first"],
            successMetrics: { revenue: "$2.7B", users: "1M+", growth: "42% YoY", valuation: "$4.5B" },
            strengths: ["Technology integration", "User experience", "Data analytics"], weaknesses: ["Complex regulations", "High CAC"],
            keyDifferentiators: ["Virtual primary care", "Personalized guidance", "Transparent pricing"], outcome: "successful",
            outcomeDetails: "IPO 2021, transforming health insurance", lessonsLearned: ["Customer experience drives retention"]
          }
        ],
        education: [
          {
            id: "ed_001", name: "Coursera", description: "Online learning platform with university courses",
            category: "Online Education", stage: "Public", founded: "2012", location: "California, USA",
            funding: { total: "$464M", lastRound: "IPO", investors: ["Public"] }, teamSize: "1,000+", similarityScore: 92,
            similarityReasons: ["Educational platform", "Scalable learning", "Content marketplace", "Global reach"],
            successMetrics: { revenue: "$524M", users: "100M+", growth: "60% YoY", valuation: "$5.2B" },
            strengths: ["University partnerships", "Quality content", "Global brand"], weaknesses: ["Completion rates", "Competition"],
            keyDifferentiators: ["University content", "Professional certificates", "Degree programs"], outcome: "successful",
            outcomeDetails: "IPO 2021, leading online education", lessonsLearned: ["Content quality drives engagement"]
          }
        ],
        finance: [
          {
            id: "fin_001", name: "Stripe", description: "Online payment processing platform",
            category: "Payment Processing", stage: "Private", founded: "2010", location: "California, USA",
            funding: { total: "$2.2B", lastRound: "Series H", investors: ["Sequoia", "General Catalyst"] }, teamSize: "4,000+", similarityScore: 94,
            similarityReasons: ["Financial platform", "Developer-focused API", "Global infrastructure", "B2B SaaS"],
            successMetrics: { revenue: "$12B+", users: "4M+", growth: "70% YoY", valuation: "$95B" },
            strengths: ["Developer experience", "Global reach", "Innovation"], weaknesses: ["Regulatory complexity", "Competition"],
            keyDifferentiators: ["Simple integration", "Global compliance", "Developer tools"], outcome: "successful",
            outcomeDetails: "Valued at $95B, leading payment processor", lessonsLearned: ["Developer experience drives adoption"]
          }
        ],
        food: [
          {
            id: "food_001", name: "DoorDash", description: "Food delivery platform connecting restaurants with customers",
            category: "Food Delivery", stage: "Public", founded: "2013", location: "California, USA",
            funding: { total: "$2.5B", lastRound: "IPO", investors: ["Public"] }, teamSize: "8,000+", similarityScore: 91,
            similarityReasons: ["Food platform", "On-demand delivery", "Marketplace model", "Local focus"],
            successMetrics: { revenue: "$6.6B", users: "25M+", growth: "35% YoY", valuation: "$45B" },
            strengths: ["Market leader", "Strong logistics", "Restaurant partnerships"], weaknesses: ["Low margins", "Driver dependency"],
            keyDifferentiators: ["Fastest delivery", "Restaurant tools", "DashPass subscription"], outcome: "successful",
            outcomeDetails: "IPO 2020, leading food delivery", lessonsLearned: ["Local dominance matters"]
          }
        ],
        retail: [
          {
            id: "retail_001", name: "Shopify", description: "E-commerce platform for online stores",
            category: "E-commerce Platform", stage: "Public", founded: "2006", location: "Ontario, Canada",
            funding: { total: "$122M", lastRound: "IPO", investors: ["Public"] }, teamSize: "10,000+", similarityScore: 93,
            similarityReasons: ["Retail platform", "E-commerce enablement", "SaaS model", "SMB focus"],
            successMetrics: { revenue: "$5.6B", users: "2M+", growth: "57% YoY", valuation: "$60B" },
            strengths: ["Platform ecosystem", "Developer community", "Global reach"], weaknesses: ["Platform dependency", "Amazon competition"],
            keyDifferentiators: ["Ease of use", "App ecosystem", "Payment integration"], outcome: "successful",
            outcomeDetails: "IPO 2015, leading e-commerce platform", lessonsLearned: ["Platform approach scales"]
          }
        ],
        software: [
          {
            id: "soft_001", name: "Slack", description: "Business communication platform",
            category: "Communication Software", stage: "Acquired", founded: "2009", location: "California, USA",
            funding: { total: "$1.4B", lastRound: "Acquisition", investors: ["Salesforce"] }, teamSize: "2,500+", similarityScore: 89,
            similarityReasons: ["Business software", "Team collaboration", "SaaS subscription", "Enterprise market"],
            successMetrics: { revenue: "$1.5B", users: "18M+", growth: "43% YoY", valuation: "$27.7B" },
            strengths: ["User experience", "Integration ecosystem", "Strong brand"], weaknesses: ["Microsoft competition", "Feature complexity"],
            keyDifferentiators: ["Intuitive interface", "Third-party integrations", "Channel organization"], outcome: "successful",
            outcomeDetails: "Acquired by Salesforce for $27.7B", lessonsLearned: ["User experience drives adoption"]
          }
        ]
      };

      // Get industry-specific startups or fall back to general ones
      let relevant = industryStartups[userIndustry] || industryStartups['software'] || [];

      // If we have fewer than 3 industry-specific startups, add some from the mock data
      if (relevant.length < 3) {
        const additionalStartups = mockSimilarStartups.filter(startup =>
          !relevant.find(r => r.name === startup.name)
        ).slice(0, 3 - relevant.length);
        relevant = [...relevant, ...additionalStartups];
      }
      
      setSimilarStartups(relevant);
      setIsAnalyzing(false);
    };

    analyzeStartups();
  }, [validationData]);

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'acquired':
        return <Award className="w-5 h-5 text-green-600" />;
      case 'ipo':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'active':
        return <CheckCircle className="w-5 h-5 text-primary" />;
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  const getOutcomeBadge = (outcome: string) => {
    const styles = {
      acquired: 'bg-green-500 text-white',
      ipo: 'bg-blue-500 text-white',
      active: 'bg-primary text-white',
      failed: 'bg-red-500 text-white'
    };
    return styles[outcome as keyof typeof styles] || 'bg-gray-500 text-white';
  };

  const filteredStartups = similarStartups.filter(startup =>
    startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    startup.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const successfulStartups = similarStartups.filter(s => s.outcome === 'acquired' || s.outcome === 'ipo' || s.outcome === 'active');
  const failedStartups = similarStartups.filter(s => s.outcome === 'failed');

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-4">Analyzing Similar Startups</h2>
          <p className="text-muted-foreground mb-6">
            Drishti is searching through thousands of startups to find companies similar to your idea...
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✓ Scanning startup databases</p>
            <p>✓ Analyzing business models</p>
            <p>✓ Calculating similarity scores</p>
            <p>⏳ Generating insights...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-500 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Drishti
              </span>
            </div>
            <div className="text-muted-foreground">|</div>
            <div className="text-sm font-medium text-muted-foreground">
              Startup Comparison & Benchmarking
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Overview Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Startup Intelligence Report</h1>
            <p className="text-muted-foreground mb-6">
              Analysis of similar startups, market validation, and competitive benchmarking for your idea.
            </p>

            {/* Key Insights */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Similar Startups</p>
                      <p className="text-2xl font-bold">{similarStartups.length}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                      <p className="text-2xl font-bold text-green-600">
                        {Math.round((successfulStartups.length / similarStartups.length) * 100)}%
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Market Validation</p>
                      <p className="text-2xl font-bold text-primary">High</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                      <p className="text-2xl font-bold text-yellow-600">Medium</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Market Validation Alert */}
            <Card className="mb-8 border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Market Validation Confirmed</h3>
                    <p className="text-blue-800 mb-3">
                      Great news! We found {similarStartups.length} similar startups in your space, with {successfulStartups.length} achieving significant success. 
                      This validates that there's a real market for your solution.
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Multiple successful exits prove market demand</li>
                      <li>• Growing market with recent successful funding rounds</li>
                      <li>• Opportunity for differentiation and improvement</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
              <TabsTrigger value="benchmarks">Success Benchmarks</TabsTrigger>
              <TabsTrigger value="lessons">Lessons Learned</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search startups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredStartups.map((startup) => (
                  <Card key={startup.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <CardTitle className="text-lg">{startup.name}</CardTitle>
                            <Badge className={getOutcomeBadge(startup.outcome)}>
                              {startup.outcome.charAt(0).toUpperCase() + startup.outcome.slice(1)}
                            </Badge>
                          </div>
                          <CardDescription className="mb-3">
                            {startup.description}
                          </CardDescription>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {startup.founded}
                            </span>
                            <span className="flex items-center">
                              <Globe className="w-3 h-3 mr-1" />
                              {startup.location}
                            </span>
                            <span className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {startup.teamSize}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-semibold">{startup.similarityScore}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Similarity</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Why Similar:</h4>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {startup.similarityReasons.slice(0, 3).map((reason, idx) => (
                              <li key={idx}>• {reason}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-muted-foreground">Funding:</span>
                            <div className="font-medium">{startup.funding.total}</div>
                          </div>
                          {startup.successMetrics.revenue && (
                            <div>
                              <span className="text-muted-foreground">Revenue:</span>
                              <div className="font-medium">{startup.successMetrics.revenue}</div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center space-x-2">
                            {getOutcomeIcon(startup.outcome)}
                            <span className="text-sm font-medium">
                              {startup.outcome === 'acquired' && 'Successful Exit'}
                              {startup.outcome === 'ipo' && 'Public Company'}
                              {startup.outcome === 'active' && 'Growing'}
                              {startup.outcome === 'failed' && 'Failed'}
                            </span>
                          </div>
                          {startup.website && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={startup.website} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Detailed Analysis Tab */}
            <TabsContent value="detailed" className="space-y-6 mt-6">
              {filteredStartups.map((startup) => (
                <Card key={startup.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-3">
                          {startup.name}
                          <Badge className={getOutcomeBadge(startup.outcome)}>
                            {startup.outcome}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{startup.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{startup.similarityScore}%</div>
                        <p className="text-xs text-muted-foreground">Similarity Score</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                            Strengths
                          </h4>
                          <ul className="text-sm space-y-1">
                            {startup.strengths.map((strength, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-green-600 mr-2">+</span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2 flex items-center">
                            <TrendingDown className="w-4 h-4 mr-2 text-red-600" />
                            Weaknesses
                          </h4>
                          <ul className="text-sm space-y-1">
                            {startup.weaknesses.map((weakness, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-red-600 mr-2">-</span>
                                {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center">
                            <Target className="w-4 h-4 mr-2 text-primary" />
                            Key Differentiators
                          </h4>
                          <ul className="text-sm space-y-1">
                            {startup.keyDifferentiators.map((diff, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-primary mr-2">•</span>
                                {diff}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Success Metrics</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {startup.successMetrics.revenue && (
                              <div>
                                <span className="text-muted-foreground">Revenue:</span>
                                <div className="font-medium">{startup.successMetrics.revenue}</div>
                              </div>
                            )}
                            {startup.successMetrics.users && (
                              <div>
                                <span className="text-muted-foreground">Users:</span>
                                <div className="font-medium">{startup.successMetrics.users}</div>
                              </div>
                            )}
                            {startup.successMetrics.growth && (
                              <div>
                                <span className="text-muted-foreground">Growth:</span>
                                <div className="font-medium">{startup.successMetrics.growth}</div>
                              </div>
                            )}
                            {startup.successMetrics.valuation && (
                              <div>
                                <span className="text-muted-foreground">Valuation:</span>
                                <div className="font-medium">{startup.successMetrics.valuation}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {startup.outcomeDetails && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-sm mb-1">Outcome Details</h4>
                        <p className="text-sm text-muted-foreground">{startup.outcomeDetails}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Success Benchmarks Tab */}
            <TabsContent value="benchmarks" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">Success Patterns</CardTitle>
                    <CardDescription>Common traits of successful similar startups</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Revenue Milestones</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Year 1:</span>
                            <span className="font-medium">$500K - $2M ARR</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Year 3:</span>
                            <span className="font-medium">$5M - $20M ARR</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Year 5:</span>
                            <span className="font-medium">$20M - $100M ARR</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Key Success Factors</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Strong customer retention (90%+ annual)</li>
                          <li>• Efficient customer acquisition (CAC payback &lt; 12 months)</li>
                          <li>• Product-market fit before scaling</li>
                          <li>• Strong integration ecosystem</li>
                          <li>• International expansion strategy</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Failure Patterns</CardTitle>
                    <CardDescription>Common reasons for failure in this space</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Warning Signs</h4>
                        <ul className="text-sm space-y-1">
                          <li>• High customer churn (&gt;20% annually)</li>
                          <li>• Long sales cycles (&gt;12 months)</li>
                          <li>• High customer acquisition costs</li>
                          <li>• Complex product with poor UX</li>
                          <li>• Insufficient market differentiation</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Risk Mitigation</h4>
                        <ul className="text-sm space-y-1">
                          <li>�� Focus on customer success from day one</li>
                          <li>• Simplify onboarding and user experience</li>
                          <li>• Build unique value propositions</li>
                          <li>• Monitor unit economics closely</li>
                          <li>• Validate pricing with customers</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Benchmarking Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Benchmarks</CardTitle>
                  <CardDescription>How successful startups performed across key metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">18 months</div>
                      <div className="text-sm text-muted-foreground">Average time to product-market fit</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">$180</div>
                      <div className="text-sm text-muted-foreground">Average customer acquisition cost</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">14x</div>
                      <div className="text-sm text-muted-foreground">Average LTV:CAC ratio</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Lessons Learned Tab */}
            <TabsContent value="lessons" className="space-y-6 mt-6">
              {filteredStartups.map((startup) => (
                <Card key={startup.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      {startup.name}
                      <Badge className={getOutcomeBadge(startup.outcome)}>
                        {startup.outcome}
                      </Badge>
                    </CardTitle>
                    <CardDescription>Key lessons from their journey</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {startup.lessonsLearned.map((lesson, idx) => (
                        <div key={idx} className="flex items-start space-x-3">
                          <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{lesson}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Summary Insights */}
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Key Insights for Your Startup
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-green-600">Opportunities</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Proven market demand with multiple successful exits</li>
                        <li>• Room for innovation with AI and automation features</li>
                        <li>• Growing SMB market underserved by current solutions</li>
                        <li>• Opportunity for better user experience and pricing</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-red-600">Key Risks to Avoid</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Over-complicating the product with unnecessary features</li>
                        <li>• Ignoring customer success and retention metrics</li>
                        <li>• Underestimating competition from established players</li>
                        <li>• Scaling too quickly without solid unit economics</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-primary">Recommended Next Steps</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Study TradeGecko's customer success strategies</li>
                        <li>• Differentiate through AI features that competitors lack</li>
                        <li>• Focus on SMB market with simpler, more affordable solution</li>
                        <li>• Build strong integration ecosystem early</li>
                      </ul>
                    </div>
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
