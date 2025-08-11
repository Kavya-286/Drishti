// Demo script to add a sample public startup idea
// This can be run in the browser console to test the investor dashboard functionality

const demoStartupIdea = {
  id: 'demo_startup_001',
  ideaName: 'EcoDelivery - Sustainable Last-Mile Delivery',
  description: 'Revolutionary electric bike delivery network reducing carbon footprint by 90% while providing faster urban deliveries',
  problemStatement: 'Traditional delivery services contribute significantly to urban pollution and traffic congestion, while customers demand faster delivery times. Current solutions are neither environmentally sustainable nor cost-effective for last-mile delivery.',
  solutionDescription: 'EcoDelivery uses a network of electric bikes and smart routing algorithms to provide carbon-neutral delivery services. Our platform optimizes routes in real-time, reducing delivery times by 40% while eliminating emissions.',
  targetMarket: 'Urban consumers, e-commerce businesses, local restaurants, and environmentally conscious customers in metropolitan areas',
  revenueModel: 'Commission-based model (15% per delivery) + Premium subscriptions for priority delivery',
  fundingNeeds: '$2.5M Series A',
  industry: 'Logistics & Sustainability',
  stage: 'MVP/Prototype',
  validationScore: 87,
  viabilityLevel: 'High',
  createdAt: new Date().toISOString(),
  founder: {
    firstName: 'Alex',
    lastName: 'Green',
    email: 'alex@ecodelivery.com'
  },
  validationData: {
    customerSegments: 'Urban millennials, eco-conscious consumers, local businesses',
    competitiveAdvantage: 'First-mover in electric bike delivery with proprietary routing technology',
    currentStage: 'MVP/Prototype',
    fundingNeeds: '$2.5M for fleet expansion and technology development'
  },
  validationResults: {
    overall_score: 87,
    viability_level: 'High',
    scores: [
      { category: 'Problem-Solution Fit', score: 92 },
      { category: 'Market Opportunity', score: 85 },
      { category: 'Business Model', score: 88 }
    ]
  }
};

// To use this demo data, run this in browser console:
// localStorage.setItem('publicStartupIdeas', JSON.stringify([demoStartupIdea]));
// Then refresh the investor dashboard

console.log('Demo startup idea created:', demoStartupIdea);
