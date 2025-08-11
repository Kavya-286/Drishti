// API Service for StartupValidator ML Backend
export interface ValidationData {
  // Problem & Solution
  problemStatement: string;
  solutionDescription: string;
  uniqueValueProposition: string;
  
  // Market
  targetMarket: string;
  marketSize: string;
  customerSegments: string;
  
  // Business Model
  revenueModel: string;
  pricingStrategy: string;
  keyMetrics: string;
  
  // Competition
  directCompetitors: string;
  indirectCompetitors: string;
  competitiveAdvantage: string;
  
  // Team
  teamSize: string;
  foundersExperience: string;
  keySkills: string;
  
  // Traction
  currentStage: string;
  existingTraction: string;
  fundingNeeds: string;
}

export interface ValidationScore {
  category: string;
  score: number;
  feedback: string;
  suggestions: string[];
}

export interface ValidationResult {
  success: boolean;
  overall_score: number;
  viability_level: string;
  scores: ValidationScore[];
  investor_readiness_score: number;
  founder_readiness_score: number;
  clarity_score: number;
  error?: string;
  timestamp: string;
}

export interface PitchContent {
  executiveSummary: string;
  problemStatement: string;
  solutionOverview: string;
  marketOpportunity: string;
  businessModel: string;
  competitiveAdvantage: string;
  fundingRequirements: string;
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface FounderAssessment {
  overall_score: number;
  categories: {
    entrepreneurial_mindset: number;
    technical_skills: number;
    business_acumen: number;
    leadership_ability: number;
    financial_management: number;
    network_connections: number;
  };
  strengths: string[];
  improvement_areas: string[];
  recommendations: string[];
}

export interface MarketData {
  market_size: {
    tam: string;
    sam: string;
    som: string;
  };
  customer_segments: {
    primary: string;
    secondary: string;
    tertiary: string;
    other: string;
  };
  competitive_landscape: {
    direct_competitors: number;
    indirect_competitors: number;
    market_leader_share: string;
    competitive_intensity: string;
  };
  market_trends: string[];
  growth_projections: {
    year_1: string;
    year_2: string;
    year_3: string;
    year_5: string;
  };
}

class StartupValidatorAPI {
  private baseURL: string;
  
  constructor() {
    // In development, use the Vite proxy to the Express server which proxies to Python
    this.baseURL = '/api';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async validateStartup(data: ValidationData): Promise<ValidationResult> {
    try {
      const result = await this.request<any>('/validate', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!result.success) {
        throw new Error(result.error || 'Validation failed');
      }

      // Transform the Python response to match our TypeScript interface
      const transformedResult: ValidationResult = {
        success: true,
        overall_score: result.overall_score || 0,
        viability_level: result.viability_level || 'Low',
        scores: result.category_scores?.map((score: any) => ({
          category: score.category,
          score: score.score,
          feedback: score.feedback,
          suggestions: score.suggestions || []
        })) || [],
        investor_readiness_score: result.investor_readiness_score || 0,
        founder_readiness_score: result.founder_readiness_score || 0,
        clarity_score: result.clarity_score || 0,
        timestamp: result.timestamp || new Date().toISOString()
      };

      return transformedResult;
    } catch (error) {
      console.error('Validation API error:', error);
      return {
        success: false,
        overall_score: 0,
        viability_level: 'Low',
        scores: [],
        investor_readiness_score: 0,
        founder_readiness_score: 0,
        clarity_score: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  async generatePitch(data: Partial<ValidationData>): Promise<{ success: boolean; pitch_content?: PitchContent; error?: string }> {
    try {
      const result = await this.request<any>('/generate-pitch', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return result;
    } catch (error) {
      console.error('Pitch generation API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async generateSWOT(data: Partial<ValidationData>): Promise<{ success: boolean; swot_analysis?: SWOTAnalysis; error?: string }> {
    try {
      const result = await this.request<any>('/generate-swot', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return result;
    } catch (error) {
      console.error('SWOT analysis API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async checkFounderReadiness(data: Partial<ValidationData>): Promise<{ success: boolean; assessment?: FounderAssessment; error?: string }> {
    try {
      const result = await this.request<any>('/founder-readiness', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return result;
    } catch (error) {
      console.error('Founder readiness API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async generateMarketResearch(data: Partial<ValidationData>): Promise<{ success: boolean; market_data?: MarketData; error?: string }> {
    try {
      const result = await this.request<any>('/market-research', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return result;
    } catch (error) {
      console.error('Market research API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string; ml_validator: string }> {
    try {
      const result = await this.request<any>('/health');
      return result;
    } catch (error) {
      console.error('Health check API error:', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        ml_validator: 'unavailable'
      };
    }
  }
}

// Create a singleton instance
export const apiService = new StartupValidatorAPI();

// Helper functions for common operations
export const validateStartupIdea = (data: ValidationData) => apiService.validateStartup(data);
export const generateAIPitch = (data: Partial<ValidationData>) => apiService.generatePitch(data);
export const generateSWOTAnalysis = (data: Partial<ValidationData>) => apiService.generateSWOT(data);
export const checkFounderReadiness = (data: Partial<ValidationData>) => apiService.checkFounderReadiness(data);
export const generateMarketResearch = (data: Partial<ValidationData>) => apiService.generateMarketResearch(data);

// Utility functions
export const getViabilityLevel = (score: number): string => {
  if (score >= 80) return 'High';
  if (score >= 60) return 'Moderate';
  return 'Low';
};

export const getInvestorReadinessLevel = (score: number): { level: string; color: string; bg: string; border: string } => {
  if (score >= 80) return { level: 'Investor Ready', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
  if (score >= 65) return { level: 'Angel Ready', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
  if (score >= 50) return { level: 'Accelerator Ready', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
  return { level: 'Bootstrap Stage', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
};

export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-red-600 bg-red-50 border-red-200';
};

// Mock data generators for development/testing
export const generateMockValidationResult = (inputData: ValidationData): ValidationResult => {
  // Generate realistic scores based on input quality
  const problemScore = Math.min(95, 60 + (inputData.problemStatement?.length || 0) * 0.3);
  const marketScore = Math.min(90, 50 + (inputData.targetMarket?.length || 0) * 0.4);
  const businessScore = Math.min(85, 55 + (inputData.revenueModel ? 25 : 0));
  const competitionScore = Math.min(80, 45 + (inputData.competitiveAdvantage?.length || 0) * 0.5);
  const teamScore = Math.min(75, 40 + (inputData.foundersExperience?.length || 0) * 0.4);
  const tractionScore = Math.min(90, 35 + (inputData.existingTraction?.length || 0) * 0.6);

  const scores = [
    {
      category: 'Problem-Solution Fit',
      score: Math.round(problemScore),
      feedback: problemScore > 75 ? 'Strong problem identification with clear solution approach.' : 'Good foundation, but needs more specific problem definition.',
      suggestions: [
        'Conduct customer interviews to validate problem severity',
        'Quantify the problem impact with market research',
        'Test solution assumptions with early prototypes'
      ]
    },
    {
      category: 'Market Opportunity',
      score: Math.round(marketScore),
      feedback: marketScore > 70 ? 'Good market understanding with clear target segments.' : 'Market opportunity needs more detailed analysis.',
      suggestions: [
        'Define specific customer personas',
        'Research total addressable market (TAM)',
        'Analyze market growth trends'
      ]
    },
    {
      category: 'Business Model',
      score: Math.round(businessScore),
      feedback: businessScore > 70 ? 'Solid revenue model with clear monetization strategy.' : 'Business model needs refinement and validation.',
      suggestions: [
        'Test pricing with potential customers',
        'Consider multiple revenue streams',
        'Plan customer acquisition strategy'
      ]
    },
    {
      category: 'Competitive Advantage',
      score: Math.round(competitionScore),
      feedback: competitionScore > 65 ? 'Good competitive analysis with clear differentiation.' : 'Need stronger competitive positioning.',
      suggestions: [
        'Strengthen unique value proposition',
        'Identify sustainable competitive moats',
        'Monitor competitor strategies'
      ]
    },
    {
      category: 'Team Strength',
      score: Math.round(teamScore),
      feedback: teamScore > 60 ? 'Good team foundation with relevant experience.' : 'Team needs strengthening in key areas.',
      suggestions: [
        'Consider technical co-founder',
        'Build advisory board',
        'Plan key hiring priorities'
      ]
    },
    {
      category: 'Execution Readiness',
      score: Math.round(tractionScore),
      feedback: tractionScore > 70 ? 'Good execution plan with realistic milestones.' : 'Execution strategy needs more detail.',
      suggestions: [
        'Create detailed development roadmap',
        'Establish key performance indicators',
        'Plan for regulatory requirements'
      ]
    }
  ];

  const overallScore = Math.round(scores.reduce((sum, score) => sum + score.score, 0) / scores.length);
  const founderScore = Math.min(90, 50 + (inputData.foundersExperience?.length || 0) * 0.5);
  const clarityScore = Math.min(95, 60 + ((inputData.problemStatement?.length || 0) + (inputData.solutionDescription?.length || 0)) * 0.2);
  const investorReadinessScore = Math.round((overallScore + founderScore + clarityScore) / 3);

  return {
    success: true,
    overall_score: overallScore,
    viability_level: getViabilityLevel(overallScore),
    scores,
    investor_readiness_score: investorReadinessScore,
    founder_readiness_score: Math.round(founderScore),
    clarity_score: Math.round(clarityScore),
    timestamp: new Date().toISOString()
  };
};
