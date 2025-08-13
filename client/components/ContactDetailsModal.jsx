import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Calendar,
  Globe,
  Linkedin,
  CheckCircle
} from 'lucide-react';

export default function ContactDetailsModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  initialData = {} 
}) {
  const [contactData, setContactData] = useState({
    // Personal Information
    fullName: initialData.fullName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    alternatePhone: initialData.alternatePhone || '',
    
    // Professional Information
    title: initialData.title || '',
    company: initialData.company || '',
    website: initialData.website || '',
    linkedIn: initialData.linkedIn || '',
    
    // Location
    city: initialData.city || '',
    state: initialData.state || '',
    country: initialData.country || 'India',
    
    // Availability
    availability: initialData.availability || 'business-hours',
    preferredContact: initialData.preferredContact || 'email',
    timezone: initialData.timezone || 'Asia/Kolkata',
    
    // Investment Details
    fundingStage: initialData.fundingStage || '',
    fundingAmount: initialData.fundingAmount || '',
    timeframe: initialData.timeframe || '',
    additionalNotes: initialData.additionalNotes || '',
    
    // Privacy
    shareDetails: initialData.shareDetails !== false, // Default to true
    marketingConsent: initialData.marketingConsent || false,
    
    ...initialData
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setContactData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!contactData.fullName || !contactData.email || !contactData.phone) {
      alert('Please fill in all required fields (Name, Email, and Phone).');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactData.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Phone validation (basic)
    const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(contactData.phone)) {
      alert('Please enter a valid phone number.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(contactData);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to submit contact details:', error);
      alert('Failed to save contact details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availabilityOptions = [
    { value: 'business-hours', label: 'Business Hours (9 AM - 6 PM)' },
    { value: 'extended', label: 'Extended Hours (8 AM - 8 PM)' },
    { value: 'flexible', label: 'Flexible (Any reasonable time)' },
    { value: 'scheduled', label: 'Scheduled meetings only' }
  ];

  const contactPreferences = [
    { value: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
    { value: 'phone', label: 'Phone Call', icon: <Phone className="w-4 h-4" /> },
    { value: 'whatsapp', label: 'WhatsApp', icon: <Phone className="w-4 h-4" /> },
    { value: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="w-4 h-4" /> }
  ];

  const countries = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Singapore', 'Other'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-6 h-6 text-primary" />
            <span>Contact Details for Investors</span>
          </DialogTitle>
          <DialogDescription>
            Provide your contact information so investors can reach out to you directly. This information will be shared with serious investors who express interest in your startup.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <User className="w-5 h-5 text-primary" />
              <span>Personal Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Your full name"
                  value={contactData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Professional Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Founder & CEO, Co-founder"
                  value={contactData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="pl-10"
                    value={contactData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="+91 98765 43210"
                    className="pl-10"
                    value={contactData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alternatePhone">Alternate Phone (Optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="alternatePhone"
                  placeholder="Alternate contact number"
                  className="pl-10"
                  value={contactData.alternatePhone}
                  onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span>Professional Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company/Startup Name</Label>
                <Input
                  id="company"
                  placeholder="Your company name"
                  value={contactData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    placeholder="https://yourwebsite.com"
                    className="pl-10"
                    value={contactData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedIn">LinkedIn Profile</Label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="linkedIn"
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="pl-10"
                  value={contactData.linkedIn}
                  onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span>Location</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Your city"
                  value={contactData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  placeholder="Your state"
                  value={contactData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={contactData.country} onValueChange={(value) => handleInputChange('country', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>Contact Preferences</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Select value={contactData.availability} onValueChange={(value) => handleInputChange('availability', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferredContact">Preferred Contact Method</Label>
                <Select value={contactData.preferredContact} onValueChange={(value) => handleInputChange('preferredContact', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred method" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactPreferences.map((pref) => (
                      <SelectItem key={pref.value} value={pref.value}>
                        <div className="flex items-center space-x-2">
                          {pref.icon}
                          <span>{pref.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Investment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span>Investment Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fundingStage">Current Funding Stage</Label>
                <Select value={contactData.fundingStage} onValueChange={(value) => handleInputChange('fundingStage', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="idea">Idea Stage</SelectItem>
                    <SelectItem value="mvp">MVP/Prototype</SelectItem>
                    <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                    <SelectItem value="seed">Seed</SelectItem>
                    <SelectItem value="series-a">Series A</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fundingAmount">Target Funding Amount</Label>
                <Input
                  id="fundingAmount"
                  placeholder="e.g., $100K, $1M"
                  value={contactData.fundingAmount}
                  onChange={(e) => handleInputChange('fundingAmount', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeframe">Investment Timeframe</Label>
                <Select value={contactData.timeframe} onValueChange={(value) => handleInputChange('timeframe', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate (1-3 months)</SelectItem>
                    <SelectItem value="short">Short-term (3-6 months)</SelectItem>
                    <SelectItem value="medium">Medium-term (6-12 months)</SelectItem>
                    <SelectItem value="long">Long-term (12+ months)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes for Investors</Label>
              <Textarea
                id="additionalNotes"
                placeholder="Any additional information you'd like to share with potential investors..."
                rows={3}
                value={contactData.additionalNotes}
                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              />
            </div>
          </div>

          {/* Privacy & Consent */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h3 className="text-lg font-semibold">Privacy & Consent</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="shareDetails" 
                  checked={contactData.shareDetails}
                  onCheckedChange={(checked) => handleInputChange('shareDetails', checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="shareDetails" className="text-sm font-medium">
                    Share contact details with interested investors *
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Your contact information will only be shared with verified investors who express serious interest in your startup.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="marketingConsent" 
                  checked={contactData.marketingConsent}
                  onCheckedChange={(checked) => handleInputChange('marketingConsent', checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="marketingConsent" className="text-sm font-medium">
                    Receive updates about investment opportunities
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified about relevant investors, funding opportunities, and startup resources.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !contactData.shareDetails}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Details
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
