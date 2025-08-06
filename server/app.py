from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sys
import json
from datetime import datetime

# Add the server directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ml_validator import ml_validator

app = Flask(__name__, static_folder='../client', static_url_path='')
CORS(app)

@app.route('/')
def serve_index():
    """Serve the main HTML file"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files"""
    return send_from_directory(app.static_folder, path)

@app.route('/api/validate', methods=['POST'])
def validate_startup():
    """Main validation endpoint using ML"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Validate using ML
        result = ml_validator.validate_startup_idea(data)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Validation failed: {str(e)}'
        }), 500

@app.route('/api/generate-pitch', methods=['POST'])
def generate_pitch():
    """Generate AI pitch content"""
    try:
        data = request.get_json()
        
        # Extract key information
        problem = data.get('problemStatement', '')
        solution = data.get('solutionDescription', '')
        market = data.get('targetMarket', '')
        revenue_model = data.get('revenueModel', '')
        stage = data.get('currentStage', '')
        
        # Generate contextual pitch content
        pitch_content = {
            'executiveSummary': f"Our startup addresses a critical market need by providing {solution.lower()[:100]}... We're targeting {market.lower()[:50]} with a proven {revenue_model} business model.",
            
            'problemStatement': f"The market faces a significant challenge: {problem[:200]}... This problem affects thousands of potential customers daily, creating a substantial opportunity for disruption.",
            
            'solutionOverview': f"Our innovative solution: {solution[:200]}... We've designed this to be scalable, user-friendly, and directly address the core pain points identified in our market research.",
            
            'marketOpportunity': f"We're targeting {market[:100]}... The total addressable market is estimated at $2-5 billion, with strong growth indicators and limited direct competition in our specific niche.",
            
            'businessModel': f"Our {revenue_model} model ensures sustainable revenue growth. We've validated our pricing strategy through market research and early customer feedback, projecting strong unit economics.",
            
            'competitiveAdvantage': f"Our key differentiators include proprietary technology, first-mover advantage in our segment, and deep domain expertise. We've built sustainable moats through {solution[:50]}...",
            
            'fundingRequirements': f"Currently in {stage} stage, we're seeking $500K-2M to accelerate growth, expand our team, and scale our proven solution. Funds will be allocated primarily to product development and customer acquisition."
        }
        
        return jsonify({
            'success': True,
            'pitch_content': pitch_content,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Pitch generation failed: {str(e)}'
        }), 500

@app.route('/api/generate-swot', methods=['POST'])
def generate_swot():
    """Generate SWOT analysis"""
    try:
        data = request.get_json()
        
        swot_analysis = {
            'strengths': [
                'Strong problem-solution fit validated through user research',
                'Experienced founding team with relevant domain expertise',
                'Clear competitive advantages and unique value proposition',
                'Scalable business model with multiple revenue streams'
            ],
            'weaknesses': [
                'Limited initial funding and resource constraints',
                'Need to build brand awareness in competitive market',
                'Potential technical challenges in scaling infrastructure',
                'Dependence on key team members and knowledge retention'
            ],
            'opportunities': [
                'Large and growing total addressable market',
                'Emerging technology trends supporting our solution',
                'Potential for strategic partnerships and collaborations',
                'International expansion possibilities'
            ],
            'threats': [
                'Well-funded competitors entering the market',
                'Rapid technological changes requiring constant adaptation',
                'Economic uncertainties affecting customer spending',
                'Regulatory changes that could impact our business model'
            ]
        }
        
        return jsonify({
            'success': True,
            'swot_analysis': swot_analysis,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'SWOT generation failed: {str(e)}'
        }), 500

@app.route('/api/founder-readiness', methods=['POST'])
def check_founder_readiness():
    """Assess founder readiness"""
    try:
        data = request.get_json()
        
        # Simulate comprehensive founder assessment
        assessment = {
            'overall_score': 73,
            'categories': {
                'entrepreneurial_mindset': 85,
                'technical_skills': 72,
                'business_acumen': 78,
                'leadership_ability': 80,
                'financial_management': 65,
                'network_connections': 60
            },
            'strengths': [
                'Strong entrepreneurial drive and vision',
                'Good technical understanding of the solution',
                'Clear communication and leadership skills'
            ],
            'improvement_areas': [
                'Strengthen financial planning and management skills',
                'Expand professional network and industry connections',
                'Develop more comprehensive business strategy'
            ],
            'recommendations': [
                'Consider taking a business finance course',
                'Join entrepreneur communities and accelerator programs',
                'Seek mentorship from experienced entrepreneurs',
                'Build advisory board with complementary expertise'
            ]
        }
        
        return jsonify({
            'success': True,
            'assessment': assessment,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Assessment failed: {str(e)}'
        }), 500

@app.route('/api/market-research', methods=['POST'])
def generate_market_research():
    """Generate market research report"""
    try:
        data = request.get_json()
        
        market_data = {
            'market_size': {
                'tam': '$2.4B',
                'sam': '$450M',
                'som': '$45M'
            },
            'customer_segments': {
                'primary': 'Early-stage entrepreneurs (40%)',
                'secondary': 'Student entrepreneurs (25%)',
                'tertiary': 'Corporate innovators (20%)',
                'other': 'Consultants and advisors (15%)'
            },
            'competitive_landscape': {
                'direct_competitors': 3,
                'indirect_competitors': 8,
                'market_leader_share': '25%',
                'competitive_intensity': 'Medium-High'
            },
            'market_trends': [
                'Growing startup ecosystem (+15% YoY)',
                'Increased focus on validation (+22% search volume)',
                'AI adoption in business tools (+45% growth)',
                'Remote entrepreneurship trend (+30% increase)'
            ],
            'growth_projections': {
                'year_1': '$500K ARR',
                'year_2': '$2M ARR',
                'year_3': '$8M ARR',
                'year_5': '$25M ARR'
            }
        }
        
        return jsonify({
            'success': True,
            'market_data': market_data,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Market research failed: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'ml_validator': 'ready'
    })

if __name__ == '__main__':
    # Install required packages if not available
    try:
        import pandas
        import numpy
        import sklearn
        import nltk
        import textblob
    except ImportError as e:
        print(f"Missing required package: {e}")
        print("Please install required packages:")
        print("pip install pandas numpy scikit-learn nltk textblob flask flask-cors")
        sys.exit(1)
    
    # Download required NLTK data
    try:
        import nltk
        nltk.data.find('tokenizers/punkt')
    except LookupError:
        nltk.download('punkt')
    
    try:
        nltk.data.find('corpora/stopwords')
    except LookupError:
        nltk.download('stopwords')
    
    print("🚀 Starting StartupValidator ML Backend...")
    print("📊 ML Validation Engine: Ready")
    print("🌐 Server running on http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
