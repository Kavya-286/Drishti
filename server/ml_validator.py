import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from textblob import TextBlob
import pickle
import json
import re
from datetime import datetime

class StartupMLValidator:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.market_keywords = {
            'b2b': ['business', 'enterprise', 'company', 'corporate', 'organization', 'professional'],
            'b2c': ['consumer', 'customer', 'user', 'people', 'individual', 'personal'],
            'marketplace': ['platform', 'marketplace', 'connect', 'network', 'community'],
            'saas': ['software', 'service', 'cloud', 'subscription', 'platform'],
            'ecommerce': ['store', 'shop', 'buy', 'sell', 'product', 'retail'],
            'mobile': ['mobile', 'app', 'smartphone', 'ios', 'android'],
            'ai': ['artificial intelligence', 'machine learning', 'ai', 'automation', 'smart'],
            'fintech': ['finance', 'payment', 'banking', 'financial', 'money', 'crypto'],
            'healthtech': ['health', 'medical', 'healthcare', 'wellness', 'fitness'],
            'edtech': ['education', 'learning', 'teaching', 'training', 'course']
        }
        
        self.successful_patterns = [
            {
                'problem_clarity': 0.9,
                'solution_uniqueness': 0.8,
                'market_size': 0.85,
                'team_experience': 0.75,
                'business_model_strength': 0.8,
                'competitive_advantage': 0.7,
                'success_score': 92
            },
            {
                'problem_clarity': 0.85,
                'solution_uniqueness': 0.9,
                'market_size': 0.7,
                'team_experience': 0.8,
                'business_model_strength': 0.85,
                'competitive_advantage': 0.8,
                'success_score': 88
            },
            # Add more patterns based on successful startups
        ]
    
    def preprocess_text(self, text):
        """Clean and preprocess text for analysis"""
        if not text:
            return ""
        
        # Remove special characters and convert to lowercase
        text = re.sub(r'[^a-zA-Z0-9\s]', '', str(text).lower())
        return text.strip()
    
    def calculate_text_quality(self, text):
        """Calculate quality metrics for text input"""
        if not text:
            return 0
        
        blob = TextBlob(text)
        
        # Length factor (optimal length between 50-300 characters)
        length_score = min(len(text) / 200, 1.0) if len(text) > 20 else len(text) / 20
        
        # Sentiment analysis (neutral to positive is better)
        sentiment = blob.sentiment.polarity
        sentiment_score = (sentiment + 1) / 2  # Convert to 0-1 range
        
        # Word diversity
        words = text.split()
        unique_words = len(set(words))
        diversity_score = min(unique_words / len(words), 1.0) if words else 0
        
        return (length_score * 0.4 + sentiment_score * 0.3 + diversity_score * 0.3)
    
    def analyze_problem_solution_fit(self, problem_statement, solution_description, value_proposition):
        """Analyze problem-solution fit using ML"""
        
        # Text quality scores
        problem_quality = self.calculate_text_quality(problem_statement)
        solution_quality = self.calculate_text_quality(solution_description)
        value_prop_quality = self.calculate_text_quality(value_proposition)
        
        # Problem clarity analysis
        problem_keywords = ['problem', 'issue', 'challenge', 'pain', 'difficulty', 'struggle']
        problem_clarity = sum(1 for word in problem_keywords if word in problem_statement.lower()) / len(problem_keywords)
        
        # Solution-problem alignment
        problem_words = set(self.preprocess_text(problem_statement).split())
        solution_words = set(self.preprocess_text(solution_description).split())
        alignment = len(problem_words.intersection(solution_words)) / max(len(problem_words), 1)
        
        # Value proposition strength
        value_keywords = ['unique', 'better', 'faster', 'cheaper', 'innovative', 'first', 'only']
        value_strength = sum(1 for word in value_keywords if word in value_proposition.lower()) / len(value_keywords)
        
        score = (problem_quality * 0.3 + solution_quality * 0.3 + value_prop_quality * 0.2 + 
                problem_clarity * 0.1 + alignment * 0.05 + value_strength * 0.05) * 100
        
        return min(score, 100)
    
    def analyze_market_opportunity(self, target_market, market_size, customer_segments):
        """Analyze market opportunity"""
        
        # Market size scoring
        size_scores = {
            'local': 0.3,
            'national': 0.6,
            'international': 0.8,
            'global': 1.0
        }
        size_score = size_scores.get(market_size, 0.5)
        
        # Target market clarity
        market_quality = self.calculate_text_quality(target_market)
        
        # Customer segment analysis
        segments_quality = self.calculate_text_quality(customer_segments)
        
        # Market type detection
        market_type_scores = []
        for market_type, keywords in self.market_keywords.items():
            overlap = sum(1 for keyword in keywords if keyword in target_market.lower())
            market_type_scores.append(overlap / len(keywords))
        
        market_focus = max(market_type_scores) if market_type_scores else 0
        
        score = (size_score * 0.3 + market_quality * 0.3 + segments_quality * 0.3 + market_focus * 0.1) * 100
        return min(score, 100)
    
    def analyze_business_model(self, revenue_model, pricing_strategy, key_metrics):
        """Analyze business model strength"""
        
        # Revenue model scoring
        model_scores = {
            'subscription': 0.9,
            'marketplace': 0.8,
            'freemium': 0.7,
            'one-time': 0.6,
            'advertising': 0.5,
            'licensing': 0.7,
            'other': 0.4
        }
        model_score = model_scores.get(revenue_model, 0.5)
        
        # Pricing strategy quality
        pricing_quality = self.calculate_text_quality(pricing_strategy)
        
        # Metrics definition quality
        metrics_quality = self.calculate_text_quality(key_metrics) if key_metrics else 0.3
        
        score = (model_score * 0.4 + pricing_quality * 0.4 + metrics_quality * 0.2) * 100
        return min(score, 100)
    
    def analyze_competition(self, direct_competitors, indirect_competitors, competitive_advantage):
        """Analyze competitive landscape"""
        
        # Competitive awareness (having identified competitors is good)
        comp_awareness = 0.7 if direct_competitors else 0.3
        comp_awareness += 0.2 if indirect_competitors else 0
        
        # Competitive advantage quality
        advantage_quality = self.calculate_text_quality(competitive_advantage)
        
        # Differentiation keywords
        diff_keywords = ['unique', 'different', 'better', 'faster', 'cheaper', 'innovative', 'proprietary']
        diff_score = sum(1 for word in diff_keywords if word in competitive_advantage.lower()) / len(diff_keywords)
        
        score = (comp_awareness * 0.3 + advantage_quality * 0.5 + diff_score * 0.2) * 100
        return min(score, 100)
    
    def analyze_team_strength(self, team_size, founders_experience, key_skills):
        """Analyze team strength"""
        
        # Team size scoring
        size_scores = {
            'solo': 0.5,
            '2-3': 0.8,
            '4-6': 1.0,
            '7-10': 0.9,
            '10+': 0.7
        }
        size_score = size_scores.get(team_size, 0.6)
        
        # Experience quality
        experience_quality = self.calculate_text_quality(founders_experience)
        
        # Skills analysis
        skills_quality = self.calculate_text_quality(key_skills) if key_skills else 0.4
        
        # Technical skills detection
        tech_keywords = ['technical', 'engineering', 'development', 'programming', 'software']
        tech_score = sum(1 for word in tech_keywords if word in (founders_experience + ' ' + (key_skills or '')).lower())
        tech_score = min(tech_score / 3, 1.0)
        
        score = (size_score * 0.25 + experience_quality * 0.4 + skills_quality * 0.25 + tech_score * 0.1) * 100
        return min(score, 100)
    
    def analyze_traction_readiness(self, current_stage, existing_traction, funding_needs):
        """Analyze execution readiness and traction"""
        
        # Stage scoring
        stage_scores = {
            'idea': 0.3,
            'prototype': 0.6,
            'beta': 0.8,
            'early-revenue': 0.9,
            'growth': 1.0
        }
        stage_score = stage_scores.get(current_stage, 0.4)
        
        # Traction quality
        traction_quality = self.calculate_text_quality(existing_traction) if existing_traction else 0.2
        
        # Funding clarity
        funding_quality = self.calculate_text_quality(funding_needs) if funding_needs else 0.5
        
        score = (stage_score * 0.4 + traction_quality * 0.4 + funding_quality * 0.2) * 100
        return min(score, 100)
    
    def calculate_investor_readiness(self, scores):
        """Calculate investor readiness based on all scores"""
        
        # Weight different factors for investor appeal
        weights = {
            'problem_solution': 0.25,
            'market': 0.2,
            'business_model': 0.2,
            'competition': 0.15,
            'team': 0.15,
            'traction': 0.05
        }
        
        weighted_score = sum(scores[key] * weights[key] for key in weights.keys())
        
        # Founder readiness simulation (based on team and traction)
        founder_readiness = (scores['team'] * 0.6 + scores['traction'] * 0.4)
        
        # Idea clarity (based on problem-solution fit and market)
        idea_clarity = (scores['problem_solution'] * 0.6 + scores['market'] * 0.4)
        
        # Overall investor readiness
        investor_score = (weighted_score * 0.5 + founder_readiness * 0.25 + idea_clarity * 0.25)
        
        return {
            'score': round(investor_score),
            'founder_readiness': round(founder_readiness),
            'idea_clarity': round(idea_clarity),
            'viability_score': round(weighted_score)
        }
    
    def get_recommendations(self, scores, data):
        """Generate AI-powered recommendations"""
        
        recommendations = []
        
        if scores['problem_solution'] < 70:
            recommendations.append({
                'category': 'Problem-Solution Fit',
                'priority': 'high',
                'suggestion': 'Conduct customer interviews to better validate the problem and refine your solution.',
                'action': 'Interview 20-30 potential customers about the problem severity'
            })
        
        if scores['market'] < 60:
            recommendations.append({
                'category': 'Market Opportunity',
                'priority': 'high',
                'suggestion': 'Better define your target market and customer segments with specific demographics.',
                'action': 'Create detailed customer personas and market sizing analysis'
            })
        
        if scores['team'] < 65:
            recommendations.append({
                'category': 'Team Strength',
                'priority': 'medium',
                'suggestion': 'Consider adding team members with complementary skills or industry experience.',
                'action': 'Identify key skill gaps and recruit advisors or co-founders'
            })
        
        if scores['competition'] < 70:
            recommendations.append({
                'category': 'Competitive Advantage',
                'priority': 'medium',
                'suggestion': 'Strengthen your unique value proposition and competitive differentiation.',
                'action': 'Analyze competitors more thoroughly and identify sustainable advantages'
            })
        
        return recommendations
    
    def validate_startup_idea(self, data):
        """Main validation function using ML analysis"""
        
        try:
            # Extract and clean data
            problem_statement = data.get('problemStatement', '')
            solution_description = data.get('solutionDescription', '')
            value_proposition = data.get('uniqueValueProposition', '')
            target_market = data.get('targetMarket', '')
            market_size = data.get('marketSize', '')
            customer_segments = data.get('customerSegments', '')
            revenue_model = data.get('revenueModel', '')
            pricing_strategy = data.get('pricingStrategy', '')
            key_metrics = data.get('keyMetrics', '')
            direct_competitors = data.get('directCompetitors', '')
            indirect_competitors = data.get('indirectCompetitors', '')
            competitive_advantage = data.get('competitiveAdvantage', '')
            team_size = data.get('teamSize', '')
            founders_experience = data.get('foundersExperience', '')
            key_skills = data.get('keySkills', '')
            current_stage = data.get('currentStage', '')
            existing_traction = data.get('existingTraction', '')
            funding_needs = data.get('fundingNeeds', '')
            
            # Calculate individual scores
            scores = {
                'problem_solution': self.analyze_problem_solution_fit(
                    problem_statement, solution_description, value_proposition
                ),
                'market': self.analyze_market_opportunity(
                    target_market, market_size, customer_segments
                ),
                'business_model': self.analyze_business_model(
                    revenue_model, pricing_strategy, key_metrics
                ),
                'competition': self.analyze_competition(
                    direct_competitors, indirect_competitors, competitive_advantage
                ),
                'team': self.analyze_team_strength(
                    team_size, founders_experience, key_skills
                ),
                'traction': self.analyze_traction_readiness(
                    current_stage, existing_traction, funding_needs
                )
            }
            
            # Calculate overall score
            overall_score = sum(scores.values()) / len(scores)
            
            # Get investor readiness metrics
            investor_metrics = self.calculate_investor_readiness(scores)
            
            # Generate recommendations
            recommendations = self.get_recommendations(scores, data)
            
            # Determine viability level
            if overall_score >= 75:
                viability_level = 'High'
            elif overall_score >= 55:
                viability_level = 'Moderate'
            else:
                viability_level = 'Low'
            
            return {
                'success': True,
                'overall_score': round(overall_score),
                'viability_level': viability_level,
                'category_scores': {k: round(v) for k, v in scores.items()},
                'investor_readiness': investor_metrics,
                'recommendations': recommendations,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

# Global validator instance
ml_validator = StartupMLValidator()
