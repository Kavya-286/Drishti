import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
  Linkedin,
  Shield,
  CheckCircle,
} from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState("signin");
  const [userType, setUserType] = useState("entrepreneur");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
    // Entrepreneur specific
    experience: "",
    interests: "",
    // Investor specific
    investorType: "",
    fundName: "",
    investmentStage: "",
    industryFocus: "",
    checkSize: "",
    portfolioSize: "",
    website: "",
    linkedIn: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    return otp;
  };

  const sendOTP = async (phoneNumber) => {
    try {
      setIsLoading(true);
      const otp = generateOTP();

      // Simulate OTP sending (in real app, this would call an SMS service)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // For demo purposes, show the OTP in an alert
      alert(
        `📱 OTP sent to ${phoneNumber}\n\n🔐 Your OTP: ${otp}\n\n(In production, this would be sent via SMS)`,
      );

      setOtpSent(true);
      setOtpStep(true);
      return true;
    } catch (error) {
      console.error("Failed to send OTP:", error);
      alert("Failed to send OTP. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = () => {
    if (otpCode === generatedOtp) {
      return true;
    }
    alert("Invalid OTP. Please check and try again.");
    return false;
  };

  const handlePhoneSignup = async () => {
    if (!formData.phone) {
      alert("Please enter your phone number");
      return;
    }

    // Phone validation
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert("Please enter a valid phone number");
      return;
    }

    const otpSentSuccess = await sendOTP(formData.phone);
    if (!otpSentSuccess) {
      return;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For signup with phone verification
      if (authMode === "signup" && formData.phone && !otpStep) {
        await handlePhoneSignup();
        return;
      }

      // OTP verification step
      if (authMode === "signup" && otpStep) {
        if (!verifyOTP()) {
          setIsLoading(false);
          return;
        }
      }

      // Basic validation
      if (authMode === "signup") {
        if (
          !formData.email ||
          !formData.password ||
          !formData.firstName ||
          !formData.lastName
        ) {
          alert("Please fill in all required fields");
          setIsLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          alert("Passwords do not match");
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          alert("Password must be at least 6 characters long");
          setIsLoading(false);
          return;
        }

        // Additional validation for investor type
        if (userType === "investor" && !formData.investorType) {
          alert("Please select your investor type");
          setIsLoading(false);
          return;
        }
      }

      if (!formData.email || !formData.password) {
        alert("Please enter your email and password");
        setIsLoading(false);
        return;
      }

      // Clear any existing user data first (especially for new signups)
      if (authMode === "signup") {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("validationResults");
        localStorage.removeItem("validationData");
        localStorage.removeItem("validationUsedFallback");
        localStorage.removeItem("publicStartupIdeas");
        localStorage.removeItem("investorWatchlist");
        localStorage.removeItem("investmentRecords");
      }

      // Simulate authentication
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Store user data in localStorage (in a real app, this would be handled by your auth system)
      const userData = {
        ...formData,
        userType,
        id: `user_${Date.now()}`,
        joinDate: new Date().toISOString(),
        planType: "Free",
        isAuthenticated: true,
        authProvider: "email",
        phoneVerified: authMode === "signup" && formData.phone ? true : false,
      };

      localStorage.setItem("currentUser", JSON.stringify(userData));
      localStorage.setItem("isAuthenticated", "true");

      // Show success message
      if (authMode === "signup") {
        const verificationStatus = formData.phone
          ? " Your phone number has been verified!"
          : "";
        alert(
          `Account created successfully!${verificationStatus} Welcome to Drishti.`,
        );
      } else {
        alert("Welcome back!");
      }

      // Reset OTP state
      setOtpStep(false);
      setOtpCode("");
      setGeneratedOtp("");

      // Redirect based on user type
      if (userType === "investor") {
        navigate("/investor-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      alert("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);

    try {
      // Clear any existing user data first
      localStorage.removeItem("currentUser");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("validationResults");
      localStorage.removeItem("validationData");
      localStorage.removeItem("validationUsedFallback");
      localStorage.removeItem("publicStartupIdeas");
      localStorage.removeItem("investorWatchlist");
      localStorage.removeItem("investmentRecords");

      // In a real application, this would redirect to the actual OAuth providers
      // For demo purposes, we'll simulate the OAuth flow with user input

      if (provider === "google") {
        // Simulate Google OAuth with user data collection
        const email =
          prompt(
            `🔗 Connecting to Google...\n\nFor demo purposes, enter your email:`,
          ) || `user${Date.now()}@gmail.com`;
        const firstName = prompt("Enter your first name:") || "Google";
        const lastName = prompt("Enter your last name:") || "User";

        if (!email || !firstName || !lastName) {
          setIsLoading(false);
          return;
        }

        // Create realistic user data
        const userData = {
          email: email,
          firstName: firstName,
          lastName: lastName,
          userType,
          id: `google_${Date.now()}`,
          joinDate: new Date().toISOString(),
          planType: "Free",
          isAuthenticated: true,
          authProvider: "google",
          phoneVerified: false,
          // Add user type specific fields
          ...(userType === "investor"
            ? {
                investorType: "Individual",
                fundName: "",
                investmentStage: "seed",
                checkSizeMin: "10000",
                checkSizeMax: "100000",
                industry: "Technology",
              }
            : {
                experience: "First-time entrepreneur",
                interests: "Technology",
              }),
        };

        localStorage.setItem("currentUser", JSON.stringify(userData));
        localStorage.setItem("isAuthenticated", "true");

        alert(
          `✅ Successfully signed in with Google!\nWelcome ${firstName} ${lastName}!`,
        );
      } else if (provider === "linkedin") {
        // Simulate LinkedIn OAuth with professional data collection
        const email =
          prompt(
            `🔗 Connecting to LinkedIn...\n\nFor demo purposes, enter your professional email:`,
          ) || `user${Date.now()}@company.com`;
        const firstName = prompt("Enter your first name:") || "LinkedIn";
        const lastName = prompt("Enter your last name:") || "Professional";
        const company =
          prompt("Enter your company/organization:") || "Tech Company";

        if (!email || !firstName || !lastName) {
          setIsLoading(false);
          return;
        }

        // Create realistic professional user data
        const userData = {
          email: email,
          firstName: firstName,
          lastName: lastName,
          company: company,
          userType,
          id: `linkedin_${Date.now()}`,
          joinDate: new Date().toISOString(),
          planType: "Free",
          isAuthenticated: true,
          authProvider: "linkedin",
          phoneVerified: false,
          // Add user type specific fields
          ...(userType === "investor"
            ? {
                investorType: "Angel Investor",
                fundName: company,
                investmentStage: "seed",
                checkSizeMin: "25000",
                checkSizeMax: "250000",
                industry: "Technology",
              }
            : {
                experience: "3-5 years experience",
                interests: "B2B Technology",
                company: company,
              }),
        };

        localStorage.setItem("currentUser", JSON.stringify(userData));
        localStorage.setItem("isAuthenticated", "true");

        alert(
          `✅ Successfully signed in with LinkedIn!\nWelcome ${firstName} from ${company}!`,
        );
      }

      // Redirect based on user type
      if (userType === "investor") {
        navigate("/investor-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Social login error:", error);
      alert("Social login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "E-commerce",
    "Food & Beverage",
    "Travel & Tourism",
    "Real Estate",
    "Manufacturing",
    "Entertainment",
    "Fashion",
    "Transportation",
    "Energy",
    "Agriculture",
    "Other",
  ];

  const experienceLevels = [
    "First-time entrepreneur",
    "1-2 years experience",
    "3-5 years experience",
    "5-10 years experience",
    "10+ years experience",
    "Serial entrepreneur",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {authMode === "signin"
                ? "Welcome Back to Drishti"
                : "Join the Drishti Community"}
            </h1>
            <p className="text-muted-foreground">
              {authMode === "signin"
                ? "Sign in to continue your startup intelligence journey"
                : "Start your journey with AI-powered startup intelligence"}
            </p>
          </div>

          {/* User Type Selection */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  userType === "entrepreneur"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setUserType("entrepreneur")}
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
                  userType === "investor"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setUserType("investor")}
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
                    {userType === "entrepreneur" ? (
                      <User className="w-5 h-5" />
                    ) : (
                      <DollarSign className="w-5 h-5" />
                    )}
                    <span>
                      {authMode === "signin" ? "Sign In" : "Create Account"} as{" "}
                      {userType === "entrepreneur"
                        ? "Aspiring Entrepreneur"
                        : "Investor"}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {authMode === "signin"
                      ? "Enter your credentials to access your account"
                      : otpStep
                        ? "Enter the OTP sent to your phone number"
                        : "Fill in your details to create your account"}
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {userType === "entrepreneur" ? "Entrepreneur" : "Investor"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {!otpStep ? (
                <Tabs
                  value={authMode}
                  onValueChange={(value) => setAuthMode(value)}
                >
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
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
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
                            onChange={(e) =>
                              handleInputChange("password", e.target.value)
                            }
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

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Signing in..." : "Sign In"}
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
                            onChange={(e) =>
                              handleInputChange("firstName", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            placeholder="Enter last name"
                            value={formData.lastName}
                            onChange={(e) =>
                              handleInputChange("lastName", e.target.value)
                            }
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
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>

                      {/* Phone Number with OTP */}
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <div className="flex space-x-2">
                          <div className="relative flex-1">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="phone"
                              placeholder="+91 98765 43210"
                              className="pl-10"
                              value={formData.phone}
                              onChange={(e) =>
                                handleInputChange("phone", e.target.value)
                              }
                              required
                            />
                          </div>
                          {formData.phone && !otpSent && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handlePhoneSignup}
                              disabled={isLoading}
                            >
                              {isLoading ? "Sending..." : "Send OTP"}
                            </Button>
                          )}
                          {otpSent && (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              <span className="text-sm">OTP Sent</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          We'll send an OTP to verify your phone number
                        </p>
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
                              onChange={(e) =>
                                handleInputChange("password", e.target.value)
                              }
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
                          <Label htmlFor="confirmPassword">
                            Confirm Password *
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              handleInputChange(
                                "confirmPassword",
                                e.target.value,
                              )
                            }
                            required
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
                            onChange={(e) =>
                              handleInputChange("location", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      {/* User Type Specific Fields */}
                      {userType === "entrepreneur" ? (
                        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-semibold text-sm flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Entrepreneur Details
                          </h4>

                          <div className="space-y-2">
                            <Label htmlFor="experience">Experience Level</Label>
                            <Select
                              onValueChange={(value) =>
                                handleInputChange("experience", value)
                              }
                            >
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
                            <Label htmlFor="interests">
                              Industry Interests
                            </Label>
                            <Input
                              id="interests"
                              placeholder="e.g., Technology, Healthcare, Finance"
                              value={formData.interests}
                              onChange={(e) =>
                                handleInputChange("interests", e.target.value)
                              }
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
                              <Label htmlFor="investorType">
                                Investor Type *
                              </Label>
                              <Select
                                onValueChange={(value) =>
                                  handleInputChange("investorType", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select investor type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="angel">
                                    Angel Investor
                                  </SelectItem>
                                  <SelectItem value="vc">
                                    Venture Capitalist
                                  </SelectItem>
                                  <SelectItem value="corporate">
                                    Corporate Investor
                                  </SelectItem>
                                  <SelectItem value="family-office">
                                    Family Office
                                  </SelectItem>
                                  <SelectItem value="fund">
                                    Investment Fund
                                  </SelectItem>
                                  <SelectItem value="individual">
                                    Individual Investor
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="fundName">
                                Fund/Organization Name
                              </Label>
                              <Input
                                id="fundName"
                                placeholder="Your fund or organization name"
                                value={formData.fundName}
                                onChange={(e) =>
                                  handleInputChange("fundName", e.target.value)
                                }
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="investmentStage">
                                Investment Stage Focus
                              </Label>
                              <Select
                                onValueChange={(value) =>
                                  handleInputChange("investmentStage", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select stage focus" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pre-seed">
                                    Pre-Seed
                                  </SelectItem>
                                  <SelectItem value="seed">Seed</SelectItem>
                                  <SelectItem value="series-a">
                                    Series A
                                  </SelectItem>
                                  <SelectItem value="series-b">
                                    Series B
                                  </SelectItem>
                                  <SelectItem value="growth">
                                    Growth Stage
                                  </SelectItem>
                                  <SelectItem value="all-stages">
                                    All Stages
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="checkSize">
                                Check Size Range
                              </Label>
                              <Select
                                onValueChange={(value) =>
                                  handleInputChange("checkSize", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select check size" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="under-25k">
                                    Under $25K
                                  </SelectItem>
                                  <SelectItem value="25k-100k">
                                    $25K - $100K
                                  </SelectItem>
                                  <SelectItem value="100k-500k">
                                    $100K - $500K
                                  </SelectItem>
                                  <SelectItem value="500k-1m">
                                    $500K - $1M
                                  </SelectItem>
                                  <SelectItem value="1m-5m">
                                    $1M - $5M
                                  </SelectItem>
                                  <SelectItem value="over-5m">
                                    Over $5M
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="industryFocus">
                              Industry Focus
                            </Label>
                            <Select
                              onValueChange={(value) =>
                                handleInputChange("industryFocus", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select industry focus" />
                              </SelectTrigger>
                              <SelectContent>
                                {industries.map((industry) => (
                                  <SelectItem key={industry} value={industry}>
                                    {industry}
                                  </SelectItem>
                                ))}
                                <SelectItem value="sector-agnostic">
                                  Sector Agnostic
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Checkbox id="terms" required />
                        <Label htmlFor="terms" className="text-sm">
                          I agree to the{" "}
                          <Button variant="link" className="p-0 h-auto text-sm">
                            Terms of Service
                          </Button>{" "}
                          and{" "}
                          <Button variant="link" className="p-0 h-auto text-sm">
                            Privacy Policy
                          </Button>
                        </Label>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating Account..." : "Create Account"}
                      </Button>
                    </TabsContent>
                  </form>
                </Tabs>
              ) : (
                // OTP Verification Step
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="text-center">
                    <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Verify Your Phone Number
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      We've sent a 6-digit code to {formData.phone}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter 6-digit OTP</Label>
                    <Input
                      id="otp"
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      maxLength={6}
                      className="text-center text-lg tracking-widest"
                      required
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setOtpStep(false);
                        setOtpCode("");
                        setOtpSent(false);
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isLoading || otpCode.length !== 6}
                    >
                      {isLoading ? "Verifying..." : "Verify & Complete"}
                    </Button>
                  </div>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm"
                      onClick={() => sendOTP(formData.phone)}
                      disabled={isLoading}
                    >
                      Resend OTP
                    </Button>
                  </div>
                </form>
              )}

              {/* Social Auth Options */}
              {!otpStep && (
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
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => handleSocialLogin("google")}
                      disabled={isLoading}
                    >
                      <Chrome className="w-4 h-4 mr-2" />
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => handleSocialLogin("linkedin")}
                      disabled={isLoading}
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
