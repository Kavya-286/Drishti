import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import {
  CheckCircle,
  DollarSign,
  Calendar,
  User,
  Building2,
  FileText,
  Send,
  ArrowLeft,
  Star,
  TrendingUp,
  Users
} from 'lucide-react';

export default function InvestorAcknowledgment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [startup, setStartup] = useState(null);
  const [investmentData, setInvestmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acknowledgmentData, setAcknowledgmentData] = useState({
    investorNotes: '',
    expectedTimeline: '2-4 weeks',
    dueDiligenceItems: [],
    nextSteps: '',
    contactPreference: 'email'
  });

  useEffect(() => {
    const loadData = () => {
      try {
        // Get startup data
        const publicIdeas = JSON.parse(localStorage.getItem('publicStartupIdeas') || '[]');
        const foundStartup = publicIdeas.find((idea) => idea.id === id);
        
        // Get investment data from location state
        const invData = location.state?.investmentData;
        
        if (!foundStartup || !invData) {
          navigate('/investor-dashboard');
          return;
        }

        setStartup(foundStartup);
        setInvestmentData(invData);
      } catch (error) {
        console.error('Failed to load data:', error);
        navigate('/investor-dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate, location.state]);

  const handleInputChange = (field, value) => {
    setAcknowledgmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDueDiligenceToggle = (item) => {
    setAcknowledgmentData(prev => ({
      ...prev,
      dueDiligenceItems: prev.dueDiligenceItems.includes(item)
        ? prev.dueDiligenceItems.filter(i => i !== item)
        : [...prev.dueDiligenceItems, item]
    }));
  };

  const handleSubmitAcknowledgment = async () => {
    setIsSubmitting(true);
    
    try {
      const currentInvestor = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Create investment acknowledgment record
      const acknowledgment = {
        id: `ack_${Date.now()}`,
        startupId: startup.id,
        startupName: startup.ideaName,
        investorId: currentInvestor.id,
        investorName: `${currentInvestor.firstName || ''} ${currentInvestor.lastName || ''}`.trim() || currentInvestor.email,
        investorEmail: currentInvestor.email,
        investorPhone: currentInvestor.phone || '',
        originalInvestment: investmentData,
        acknowledgmentData,
        status: 'acknowledged',
        submittedAt: new Date().toISOString()
      };

      // Store investment acknowledgment
      const existingAcknowledgments = JSON.parse(localStorage.getItem('investmentAcknowledgments') || '[]');
      existingAcknowledgments.push(acknowledgment);
      localStorage.setItem('investmentAcknowledgments', JSON.stringify(existingAcknowledgments));

      // Create notification for the startup founder
      const notification = {
        id: `notif_${Date.now()}`,
        recipientId: startup.founder?.id || startup.founder?.email,
        startupId: startup.id,
        type: 'investment_interest',
        title: '🎉 New Investment Interest!',
        message: `${acknowledgment.investorName} has expressed serious investment interest in "${startup.ideaName}". They are ready to proceed with due diligence and want to move forward with the investment process.`,
        data: {
          investmentAmount: investmentData.investmentAmount,
          investmentType: investmentData.investmentType,
          timeline: acknowledgmentData.expectedTimeline,
          investorName: acknowledgment.investorName,
          investorEmail: acknowledgment.investorEmail,
          investorPhone: acknowledgment.investorPhone,
          acknowledgmentId: acknowledgment.id,
          contactPreference: acknowledgmentData.contactPreference,
          dueDiligenceItems: acknowledgmentData.dueDiligenceItems,
          investorNotes: acknowledgmentData.investorNotes,
          nextSteps: acknowledgmentData.nextSteps
        },
        read: false,
        createdAt: new Date().toISOString()
      };

      // Get existing notifications and add the new one
      const existingNotifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
      existingNotifications.unshift(notification); // Add to beginning
      localStorage.setItem('userNotifications', JSON.stringify(existingNotifications));

      // Also create a record in investor's investment history
      const investorRecord = {
        id: `inv_${Date.now()}`,
        startupId: startup.id,
        startupName: startup.ideaName,
        investmentAmount: investmentData.investmentAmount,
        investmentType: investmentData.investmentType,
        status: 'interested',
        acknowledgedAt: new Date().toISOString(),
        investorId: currentInvestor.id
      };

      const existingInvestorRecords = JSON.parse(localStorage.getItem('investorRecords') || '[]');
      existingInvestorRecords.push(investorRecord);
      localStorage.setItem('investorRecords', JSON.stringify(existingInvestorRecords));

      // Success message with contact details
      const founderContact = startup.founder?.contactDetails;
      let contactInfo = '';