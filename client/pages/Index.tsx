import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import '../styles.css';
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
  const [pitchVisible, setPitchVisible] = useState(false);
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [generatedPitch, setGeneratedPitch] = useState<any>(null);

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
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-500 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              StartupValidator
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/validate">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-blue-50 to-purple-50">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            ✨ Validate Your Startup Idea in Minutes
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Turn Your Idea Into a Validated Business Plan
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get instant, AI-powered feedback on your startup idea's viability, market potential, and success probability. 
            Perfect for founders, students, and entrepreneurs.
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

      {/* Core Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Validate Your Startup
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive validation platform covers every aspect of startup idea assessment
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
                <span className="font-bold text-xl">StartupValidator</span>
              </div>
              <p className="text-muted-foreground">
                Validate your startup ideas with AI-powered insights and expert guidance.
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
            <p>&copy; 2024 StartupValidator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
