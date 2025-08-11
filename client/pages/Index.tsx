import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  TrendingUp, 
  Brain, 
  Users, 
  FileText, 
  BarChart3,
  CheckCircle,
  Zap,
  Target,
  Rocket,
  ArrowRight,
  Star
} from 'lucide-react';

export default function Index() {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'enterprise'>('pro');

  const coreFeatures = [
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Structured Input Flow",
      description: "Step-by-step guided process to capture all aspects of your startup idea"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Real-time Viability Scoring",
      description: "Instant assessment of your idea's market potential and feasibility"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-generated Feedback",
      description: "Smart insights and recommendations for each input you provide"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Founder Readiness Checker",
      description: "Detailed evaluation of your preparedness and skill gaps"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Export Pitch Content",
      description: "Generate professional pitch decks and validation reports"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Competitive Benchmarking",
      description: "Compare with similar startups and success metrics"
    }
  ];

  const addOnFeatures = [
    {
      icon: <CheckCircle className="w-5 h-5" />,
      title: "Founder Readiness Checker",
      description: "Comprehensive assessment of your entrepreneurial readiness"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "AI-Powered SWOT Analysis",
      description: "Automated Strengths, Weaknesses, Opportunities, and Threats analysis"
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Pitch Content Generator",
      description: "AI-generated pitch decks and investor materials"
    },
    {
      icon: <Rocket className="w-5 h-5" />,
      title: "Startup Lookalikes",
      description: "Find and analyze similar successful startups"
    }
  ];

  const plans = [
    {
      name: "Basic",
      price: "Free",
      description: "Perfect for getting started",
      features: [
        "1 idea validation per month",
        "Basic scoring algorithm",
        "Core feature access",
        "Email support"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$29/month",
      description: "For serious entrepreneurs",
      features: [
        "Unlimited idea validations",
        "Advanced AI feedback",
        "All add-on features",
        "Priority support",
        "Export to multiple formats",
        "Competitive analysis"
      ],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For accelerators & institutions",
      features: [
        "Multi-user accounts",
        "Custom scoring models",
        "API access",
        "Dedicated support",
        "Custom integrations",
        "Analytics dashboard"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];


  return (
    <div className="min-h-screen bg-background">
      <Header showBreadcrumbs={false} />

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-blue-50 to-purple-50">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            ✨ AI-Powered Startup Intelligence Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Transform Your Vision Into Market Reality
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Drishti provides comprehensive startup intelligence with AI-powered validation, market analysis, and strategic insights.
            Perfect for aspiring entrepreneurs, existing founders, and innovation teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/validate">
              <Button size="lg" className="text-lg px-8 py-6">
                Validate Your Idea
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-muted-foreground">Ideas Validated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">89%</div>
              <div className="text-muted-foreground">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Successful Launches</div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Pitch Generator Section */}
      <section className="py-20 px-4" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            🚀 AI Pitch Generator
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ opacity: 0.9 }}>
            Get a professional, investor-ready pitch for your startup idea in seconds with our advanced AI technology.
          </p>
          <Button
            size="lg"
            className="text-lg px-8 py-6"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '2px solid white',
              borderRadius: '50px',
              backdropFilter: 'blur(10px)'
            }}
            onClick={generateAIPitchDemo}
            disabled={isGeneratingPitch}
          >
            {isGeneratingPitch ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating AI Pitch...
              </>
            ) : (
              <>
                <Zap className="mr-2 w-5 h-5" />
                Generate My AI Pitch
              </>
            )}
          </Button>

          {pitchVisible && generatedPitch && (
            <div className="mt-12 p-8 rounded-lg text-left" style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="grid gap-6">
                <div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#ffd700' }}>
                    �� Executive Summary
                  </h3>
                  <p style={{ opacity: 0.95, lineHeight: 1.6 }}>{generatedPitch.executiveSummary}</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#ffd700' }}>
                    🔍 Problem Statement
                  </h3>
                  <p style={{ opacity: 0.95, lineHeight: 1.6 }}>{generatedPitch.problemStatement}</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#ffd700' }}>
                    💡 Solution Overview
                  </h3>
                  <p style={{ opacity: 0.95, lineHeight: 1.6 }}>{generatedPitch.solutionOverview}</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#ffd700' }}>
                    📈 Market Opportunity
                  </h3>
                  <p style={{ opacity: 0.95, lineHeight: 1.6 }}>{generatedPitch.marketOpportunity}</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#ffd700' }}>
                    💰 Business Model
                  </h3>
                  <p style={{ opacity: 0.95, lineHeight: 1.6 }}>{generatedPitch.businessModel}</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#ffd700' }}>
                    🏆 Competitive Advantage
                  </h3>
                  <p style={{ opacity: 0.95, lineHeight: 1.6 }}>{generatedPitch.competitiveAdvantage}</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#ffd700' }}>
                    💼 Funding Requirements
                  </h3>
                  <p style={{ opacity: 0.95, lineHeight: 1.6 }}>{generatedPitch.fundingRequirements}</p>
                </div>

                <Button
                  className="mt-6"
                  style={{
                    background: '#ffd700',
                    color: '#333',
                    borderRadius: '25px'
                  }}
                  onClick={copyPitchToClipboard}
                >
                  Copy Pitch to Clipboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Complete Startup Intelligence Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Drishti's AI-powered platform provides comprehensive startup intelligence and strategic insights
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Add-On Features */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Add-On Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Supercharge Your Validation Process
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Additional tools to take your startup from idea to launch
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {addOnFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your Validation Plan
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free or upgrade for advanced features and unlimited validations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary">{plan.price}</div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full mt-6" 
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Validate Your Next Big Idea?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of entrepreneurs who have successfully validated and launched their startups
          </p>
          <Link to="/validate">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Start Validating Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-muted/30 border-t">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-500 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">Drishti</span>
              </div>
              <p className="text-muted-foreground">
                Empowering entrepreneurs with AI-driven startup intelligence and strategic insights.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/features" className="hover:text-foreground">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link to="/api" className="hover:text-foreground">API</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/blog" className="hover:text-foreground">Blog</Link></li>
                <li><Link to="/guides" className="hover:text-foreground">Guides</Link></li>
                <li><Link to="/support" className="hover:text-foreground">Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground">About</Link></li>
                <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Drishti. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
