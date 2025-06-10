
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, FileText, Users, Shield, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalConditions: string[];
  allergies: string[];
  medications: string[];
  healthGoals: string;
  privacyLevel: 'strict' | 'moderate' | 'open';
}

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalConditions: [],
    allergies: [],
    medications: [],
    healthGoals: '',
    privacyLevel: 'moderate'
  });
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Lifebook Health',
      description: 'Your lifelong health companion',
      icon: Heart
    },
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Tell us about yourself',
      icon: FileText
    },
    {
      id: 'medical',
      title: 'Medical History',
      description: 'Share your health background',
      icon: Heart
    },
    {
      id: 'privacy',
      title: 'Privacy Settings',
      description: 'Control your data sharing',
      icon: Shield
    },
    {
      id: 'complete',
      title: 'All Set!',
      description: 'Welcome to your health journey',
      icon: Check
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    const currentStepId = steps[currentStep].id;
    if (!completedSteps.includes(currentStepId)) {
      setCompletedSteps([...completedSteps, currentStepId]);
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('user-profile', JSON.stringify(profile));
    localStorage.setItem('onboarding-completed', 'true');
    
    toast({
      title: "Welcome to Lifebook Health!",
      description: "Your profile has been created successfully.",
    });
    
    navigate('/dashboard');
  };

  const addCondition = (condition: string, type: 'medicalConditions' | 'allergies' | 'medications') => {
    if (condition.trim()) {
      setProfile(prev => ({
        ...prev,
        [type]: [...prev[type], condition.trim()]
      }));
    }
  };

  const removeCondition = (index: number, type: 'medicalConditions' | 'allergies' | 'medications') => {
    setProfile(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    const Icon = step.icon;

    switch (step.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <Icon className="w-10 h-10 text-red-500" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Lifebook Health</h2>
              <p className="text-gray-600 mb-4">Your comprehensive health record management system</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-500 mb-2" />
                  <h3 className="font-medium">Smart Records</h3>
                  <p className="text-gray-600">AI-powered organization</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <Users className="w-6 h-6 text-green-500 mb-2" />
                  <h3 className="font-medium">Family Vault</h3>
                  <p className="text-gray-600">Manage family health</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'personal':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter your first name"
                  required
                  aria-label="First Name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter your last name"
                  required
                  aria-label="Last Name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={profile.dateOfBirth}
                onChange={(e) => setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                required
                aria-label="Date of Birth"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your.email@example.com"
                required
                aria-label="Email Address"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
                aria-label="Phone Number"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={profile.emergencyContact}
                  onChange={(e) => setProfile(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  placeholder="Contact name"
                  aria-label="Emergency Contact Name"
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={profile.emergencyPhone}
                  onChange={(e) => setProfile(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                  aria-label="Emergency Contact Phone"
                />
              </div>
            </div>
          </div>
        );

      case 'medical':
        return (
          <div className="space-y-6">
            <div>
              <Label>Medical Conditions</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Enter a medical condition"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addCondition((e.target as HTMLInputElement).value, 'medicalConditions');
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  aria-label="Add Medical Condition"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addCondition(input.value, 'medicalConditions');
                    input.value = '';
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.medicalConditions.map((condition, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeCondition(index, 'medicalConditions')}>
                    {condition} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Allergies</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Enter an allergy"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addCondition((e.target as HTMLInputElement).value, 'allergies');
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  aria-label="Add Allergy"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addCondition(input.value, 'allergies');
                    input.value = '';
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.allergies.map((allergy, index) => (
                  <Badge key={index} variant="destructive" className="cursor-pointer" onClick={() => removeCondition(index, 'allergies')}>
                    {allergy} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Current Medications</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Enter a medication"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addCondition((e.target as HTMLInputElement).value, 'medications');
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  aria-label="Add Medication"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addCondition(input.value, 'medications');
                    input.value = '';
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.medications.map((medication, index) => (
                  <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => removeCondition(index, 'medications')}>
                    {medication} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="healthGoals">Health Goals</Label>
              <Textarea
                id="healthGoals"
                value={profile.healthGoals}
                onChange={(e) => setProfile(prev => ({ ...prev, healthGoals: e.target.value }))}
                placeholder="What are your health goals? (e.g., lose weight, manage diabetes, improve fitness)"
                rows={3}
                aria-label="Health Goals"
              />
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Choose Your Privacy Level</h3>
              <div className="space-y-4">
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${profile.privacyLevel === 'strict' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  onClick={() => setProfile(prev => ({ ...prev, privacyLevel: 'strict' }))}
                  role="radio"
                  aria-checked={profile.privacyLevel === 'strict'}
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setProfile(prev => ({ ...prev, privacyLevel: 'strict' }));
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${profile.privacyLevel === 'strict' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                      {profile.privacyLevel === 'strict' && <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5"></div>}
                    </div>
                    <div>
                      <h4 className="font-medium">Strict Privacy</h4>
                      <p className="text-sm text-gray-600">Maximum privacy, minimal data sharing</p>
                    </div>
                  </div>
                </div>

                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${profile.privacyLevel === 'moderate' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  onClick={() => setProfile(prev => ({ ...prev, privacyLevel: 'moderate' }))}
                  role="radio"
                  aria-checked={profile.privacyLevel === 'moderate'}
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setProfile(prev => ({ ...prev, privacyLevel: 'moderate' }));
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${profile.privacyLevel === 'moderate' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                      {profile.privacyLevel === 'moderate' && <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5"></div>}
                    </div>
                    <div>
                      <h4 className="font-medium">Moderate Privacy (Recommended)</h4>
                      <p className="text-sm text-gray-600">Balanced privacy with family sharing</p>
                    </div>
                  </div>
                </div>

                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${profile.privacyLevel === 'open' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  onClick={() => setProfile(prev => ({ ...prev, privacyLevel: 'open' }))}
                  role="radio"
                  aria-checked={profile.privacyLevel === 'open'}
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setProfile(prev => ({ ...prev, privacyLevel: 'open' }));
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${profile.privacyLevel === 'open' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                      {profile.privacyLevel === 'open' && <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5"></div>}
                    </div>
                    <div>
                      <h4 className="font-medium">Open Sharing</h4>
                      <p className="text-sm text-gray-600">Share with healthcare providers and family</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">HIPAA Compliance</h4>
              <p className="text-sm text-green-700">All your data is encrypted and HIPAA compliant regardless of your privacy level choice.</p>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Your Health Journey!</h2>
              <p className="text-gray-600 mb-4">Your profile has been created successfully</p>
              <div className="space-y-2 text-sm text-left bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium">Next Steps:</h3>
                <ul className="space-y-1 text-gray-600">
                  <li>• Upload your first health record</li>
                  <li>• Add family members to your vault</li>
                  <li>• Set up emergency contacts</li>
                  <li>• Explore AI health insights</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (steps[currentStep].id) {
      case 'personal':
        return profile.firstName && profile.lastName && profile.dateOfBirth && profile.email;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Setup Your Health Profile</CardTitle>
              <Badge variant="outline">{currentStep + 1} of {steps.length}</Badge>
            </div>
            <Progress value={progress} className="w-full" aria-label={`Progress: ${Math.round(progress)}% complete`} />
          </CardHeader>
          <CardContent>
            {renderStepContent()}
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              {currentStep === steps.length - 1 ? (
                <Button onClick={handleComplete} className="flex items-center gap-2">
                  Complete Setup
                  <Check className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { Onboarding };
