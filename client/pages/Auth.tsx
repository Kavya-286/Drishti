import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Lightbulb,
  ArrowLeft,
  User,
  Building2,
  Mail,
  Lock,
  Phone,
  MapPin,
  Users,
  Calendar,
  Briefcase,
  Star,
  Eye,
  EyeOff,
  DollarSign,
  Chrome,
  Linkedin
} from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [userType, setUserType] = useState<'entrepreneur' | 'investor'>('entrepreneur');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    // Entrepreneur specific
    experience: '',
    interests: '',
    // Investor specific
    investorType: '',
    fundName: '',
    investmentStage: '',
    industryFocus: '',
    checkSize: '',
    portfolioSize: '',
    website: '',
    linkedIn: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Basic validation
      if (authMode === 'signup') {
        if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
          alert('Please fill in all required fields');
          setIsLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match');
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          alert('Password must be at least 6 characters long');
          setIsLoading(false);
          return;
        }

        // Additional validation for investor type
        if (userType === 'investor' && !formData.investorType) {
          alert('Please select your investor type');
          setIsLoading(false);
          return;
        }
      }

      if (!formData.email || !formData.password) {
        alert('Please enter your email and password');
        setIsLoading(false);
        return;
      }

      // Simulate authentication
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Store user data in localStorage (in a real app, this would be handled by your auth system)
      const userData = {
        ...formData,
        userType,
        id: `user_${Date.now()}`,
        joinDate: new Date().toISOString(),
        planType: 'Free',
        isAuthenticated: true
      };

      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');

      // Show success message
      if (authMode === 'signup') {
        alert('Account created successfully! Welcome to Drishti.');
      } else {
        alert('Welcome back!');
      }

      // Redirect based on user type
      if (userType === 'investor') {
        navigate('/investor-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 
    'Food & Beverage', 'Travel & Tourism', 'Real Estate', 'Manufacturing',
    'Entertainment', 'Fashion', 'Transportation', 'Energy', 'Agriculture', 'Other'
  ];

  const experienceLevels = [
    'First-time entrepreneur', '1-2 years experience', '3-5 years experience',
    '5-10 years experience', '10+ years experience', 'Serial entrepreneur'
  ];

  const companyStages = [
    'Idea stage', 'MVP/Prototype', 'Beta/Testing', 'Early revenue', 
    'Growth stage', 'Scaling', 'Established'
  ];

  const teamSizes = [
    'Solo founder', '2-3 people', '4-10 people', '11-25 people', 
    '26-50 people', '50+ people'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {authMode === 'signin' ? 'Welcome Back to Drishti' : 'Join the Drishti Community'}
            </h1>
            <p className="text-muted-foreground">
              {authMode === 'signin' 
                ? 'Sign in to continue your startup intelligence journey'
                : 'Start your journey with AI-powered startup intelligence'
              }
            </p>
          </div>

          {/* User Type Selection */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  userType === 'entrepreneur' 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setUserType('entrepreneur')}
              >
                <div className="flex items-center space-x-3">
                  <User className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Aspiring Entrepreneur</h3>
                    <p className="text-sm text-muted-foreground">
                      Validate your startup ideas and get insights
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  userType === 'investor'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setUserType('investor')}
              >
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Investor</h3>
                    <p className="text-sm text-muted-foreground">
                      Evaluate startup opportunities and market trends
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Auth Form */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    {userType === 'entrepreneur' ? (
                      <User className="w-5 h-5" />
                    ) : (
                      <DollarSign className="w-5 h-5" />
                    )}
                    <span>
                      {authMode === 'signin' ? 'Sign In' : 'Create Account'} as {' '}
                      {userType === 'entrepreneur' ? 'Aspiring Entrepreneur' : 'Investor'}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {authMode === 'signin' 
                      ? 'Enter your credentials to access your account'
                      : 'Fill in your details to create your account'
                    }
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {userType === 'entrepreneur' ? 'Entrepreneur' : 'Investor'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as any)}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit}>
                  <TabsContent value="signin" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remember" />
                        <Label htmlFor="remember" className="text-sm">
                          Remember me
                        </Label>
                      </div>
                      <Button variant="link" className="p-0 h-auto text-sm">
                        Forgot password?
                      </Button>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          placeholder="Enter first name"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          placeholder="Enter last name"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create password"
                            className="pl-10 pr-10"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff /> : <Eye />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            placeholder="Your phone number"
                            className="pl-10"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="location"
                            placeholder="City, Country"
                            className="pl-10"
                            value={formData.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* User Type Specific Fields */}
                    {userType === 'entrepreneur' ? (
                      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-semibold text-sm flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Entrepreneur Details
                        </h4>
                        
                        <div className="space-y-2">
                          <Label htmlFor="experience">Experience Level</Label>
                          <Select onValueChange={(value) => handleInputChange('experience', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your experience level" />
                            </SelectTrigger>
                            <SelectContent>
                              {experienceLevels.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="interests">Industry Interests</Label>
                          <Input
                            id="interests"
                            placeholder="e.g., Technology, Healthcare, Finance"
                            value={formData.interests}
                            onChange={(e) => handleInputChange('interests', e.target.value)}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-semibold text-sm flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Investor Details
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="investorType">Investor Type *</Label>
                            <Select onValueChange={(value) => handleInputChange('investorType', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select investor type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="angel">Angel Investor</SelectItem>
                                <SelectItem value="vc">Venture Capitalist</SelectItem>
                                <SelectItem value="corporate">Corporate Investor</SelectItem>
                                <SelectItem value="family-office">Family Office</SelectItem>
                                <SelectItem value="fund">Investment Fund</SelectItem>
                                <SelectItem value="individual">Individual Investor</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="fundName">Fund/Organization Name</Label>
                            <Input
                              id="fundName"
                              placeholder="Your fund or organization name"
                              value={formData.fundName}
                              onChange={(e) => handleInputChange('fundName', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="investmentStage">Investment Stage Focus</Label>
                            <Select onValueChange={(value) => handleInputChange('investmentStage', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select stage focus" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                                <SelectItem value="seed">Seed</SelectItem>
                                <SelectItem value="series-a">Series A</SelectItem>
                                <SelectItem value="series-b">Series B</SelectItem>
                                <SelectItem value="growth">Growth Stage</SelectItem>
                                <SelectItem value="all-stages">All Stages</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="checkSize">Check Size Range</Label>
                            <Select onValueChange={(value) => handleInputChange('checkSize', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select check size" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="under-25k">Under $25K</SelectItem>
                                <SelectItem value="25k-100k">$25K - $100K</SelectItem>
                                <SelectItem value="100k-500k">$100K - $500K</SelectItem>
                                <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                                <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                                <SelectItem value="over-5m">Over $5M</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="industryFocus">Industry Focus</Label>
                            <Select onValueChange={(value) => handleInputChange('industryFocus', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select industry focus" />
                              </SelectTrigger>
                              <SelectContent>
                                {industries.map((industry) => (
                                  <SelectItem key={industry} value={industry}>
                                    {industry}
                                  </SelectItem>
                                ))}
                                <SelectItem value="sector-agnostic">Sector Agnostic</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="portfolioSize">Portfolio Size</Label>
                            <Select onValueChange={(value) => handleInputChange('portfolioSize', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Portfolio size" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1-5">1-5 investments</SelectItem>
                                <SelectItem value="6-15">6-15 investments</SelectItem>
                                <SelectItem value="16-30">16-30 investments</SelectItem>
                                <SelectItem value="31-50">31-50 investments</SelectItem>
                                <SelectItem value="over-50">Over 50 investments</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            placeholder="https://yourfund.com"
                            value={formData.website}
                            onChange={(e) => handleInputChange('website', e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" required />
                      <Label htmlFor="terms" className="text-sm">
                        I agree to the{' '}
                        <Button variant="link" className="p-0 h-auto text-sm">
                          Terms of Service
                        </Button>
                        {' '}and{' '}
                        <Button variant="link" className="p-0 h-auto text-sm">
                          Privacy Policy
                        </Button>
                      </Label>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </TabsContent>
                </form>
              </Tabs>

              {/* Social Auth Options */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Button variant="outline" type="button">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" type="button">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
