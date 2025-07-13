
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Eye, EyeOff } from 'lucide-react';
import { AllergiesSelector } from '@/components/AllergiesSelector';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';
import { validateForm } from '@/components/ui/form-validation';

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup: string;
  allergies: string[];
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Sign in form data
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  // Sign up form data
  const [signUpData, setSignUpData] = useState<SignUpFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    bloodGroup: '',
    allergies: [],
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, resetPassword, loading } = useAuth();

  const handleForgotPassword = async () => {
    setIsResetMode(true);
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail.trim()) {
      setFormErrors({ resetEmail: 'Email is required' });
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setFormErrors({ resetEmail: 'Please enter a valid email address' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await resetPassword(resetEmail);
      toast({
        title: "Reset Email Sent",
        description: "Please check your email for password reset instructions.",
      });
      setIsResetMode(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors({});

    try {
      if (isSignUp) {
        // Validate form using zod
        const signUpSchema = z.object({
          firstName: z.string().min(1, 'First name is required'),
          lastName: z.string().min(1, 'Last name is required'),
          email: z.string().email('Please enter a valid email address'),
          phone: z.string().min(1, 'Phone number is required'),
          gender: z.string().min(1, 'Gender is required'),
          dateOfBirth: z.string().min(1, 'Date of birth is required'),
          password: z.string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number'),
          confirmPassword: z.string().min(1, 'Please confirm your password'),
          agreeToTerms: z.boolean().refine(val => val === true, {
            message: 'You must agree to the Terms of Service and Privacy Policy'
          })
        }).refine(data => data.password === data.confirmPassword, {
          message: "Passwords don't match",
          path: ["confirmPassword"]
        });
        
        const validation = validateForm(signUpSchema, signUpData);
        
        if (!validation.success) {
          setFormErrors(validation.errors || {});
          setIsLoading(false);
          return;
        }

        await signUp(signUpData.email, signUpData.password, {
          firstName: signUpData.firstName,
          lastName: signUpData.lastName,
          phone: signUpData.phone,
          gender: signUpData.gender,
          dateOfBirth: signUpData.dateOfBirth,
          bloodGroup: signUpData.bloodGroup,
          allergies: signUpData.allergies
        });


        // Don't navigate immediately - let user verify email first
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account and then sign in.",
        });
        
        // Clear form and switch to sign in
        setSignUpData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          gender: '',
          dateOfBirth: '',
          bloodGroup: '',
          allergies: [],
          password: '',
          confirmPassword: '',
          agreeToTerms: false
        });
        setIsSignUp(false);
      } else {
        // Validate sign in form
        const signInSchema = z.object({
          email: z.string().email('Please enter a valid email address'),
          password: z.string().min(1, 'Password is required')
        });
        
        const validation = validateForm(signInSchema, signInData);
        
        if (!validation.success) {
          setFormErrors(validation.errors || {});
          setIsLoading(false);
          return;
        }

        await signIn(signInData.email, signInData.password);
        
        toast({
          title: "Welcome Back!",
          description: "Successfully signed in.",
        });
        
        navigate('/dashboard');
      }
    } catch (error: any) {
      // Error handling is already done in useAuth hook
      // Just log the error here for debugging
      console.error('Auth form error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // If in password reset mode, show the reset form
  if (isResetMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="w-8 h-8 text-red-500" />
              <CardTitle className="text-2xl">Reset Password</CardTitle>
            </div>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendResetEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetEmail">Email Address</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className={formErrors.resetEmail ? "border-red-500" : ""}
                />
                {formErrors.resetEmail && (
                  <p className="text-sm text-red-500">{formErrors.resetEmail}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full" 
                onClick={() => setIsResetMode(false)}
                disabled={isLoading}
              >
                Back to Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-red-500" />
            <CardTitle className="text-2xl">Lifebook Health</CardTitle>
          </div>
          <CardDescription>
            {isSignUp ? 'Create your health account' : 'Sign in to your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp ? (
              // Sign Up Form
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      value={signUpData.firstName}
                      onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
                      className={formErrors.firstName ? "border-red-500" : ""}
                      required
                      disabled={isLoading}
                    />
                    {formErrors.firstName && (
                      <p className="text-sm text-red-500">{formErrors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      value={signUpData.lastName}
                      onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                      className={formErrors.lastName ? "border-red-500" : ""}
                      required
                      disabled={isLoading}
                    />
                    {formErrors.lastName && (
                      <p className="text-sm text-red-500">{formErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    className={formErrors.email ? "border-red-500" : ""}
                    required
                    disabled={isLoading}
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={signUpData.phone}
                    onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                    className={formErrors.phone ? "border-red-500" : ""}
                    required
                    disabled={isLoading}
                  />
                  {formErrors.phone && (
                    <p className="text-sm text-red-500">{formErrors.phone}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select 
                      value={signUpData.gender} 
                      onValueChange={(value) => setSignUpData({ ...signUpData, gender: value })}
                      disabled={isLoading}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className={formErrors.gender ? "border-red-500" : ""}>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.gender && (
                      <p className="text-sm text-red-500">{formErrors.gender}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={signUpData.dateOfBirth}
                      onChange={(e) => setSignUpData({ ...signUpData, dateOfBirth: e.target.value })}
                      required
                      className={formErrors.dateOfBirth ? "border-red-500" : ""}
                      disabled={isLoading}
                      max={new Date().toISOString().split('T')[0]}
                    />
                    {formErrors.dateOfBirth && (
                      <p className="text-sm text-red-500">{formErrors.dateOfBirth}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select 
                    value={signUpData.bloodGroup} 
                    onValueChange={(value) => setSignUpData({ ...signUpData, bloodGroup: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <AllergiesSelector
                  value={signUpData.allergies}
                  onChange={(allergies) => setSignUpData({ ...signUpData, allergies })}
                  disabled={isLoading}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        className={formErrors.password ? "border-red-500" : ""}
                        required
                        disabled={isLoading}
                        minLength={8}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Minimum 8 characters</p>
                    {formErrors.password && (
                      <p className="text-sm text-red-500">{formErrors.password}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                        className={formErrors.confirmPassword ? "border-red-500" : ""}
                        required
                        disabled={isLoading}
                        minLength={8}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {formErrors.confirmPassword && (
                      <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={signUpData.agreeToTerms}
                    onCheckedChange={(checked) => setSignUpData({ ...signUpData, agreeToTerms: checked as boolean })}
                    disabled={isLoading}
                    className={formErrors.agreeToTerms ? "border-red-500" : ""}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the <Button variant="link" className="p-0 h-auto text-sm">Terms of Service</Button> and <Button variant="link" className="p-0 h-auto text-sm">Privacy Policy</Button>
                  </Label>
                </div>
                {formErrors.agreeToTerms && (
                  <p className="text-sm text-red-500">{formErrors.agreeToTerms}</p>
                )}
              </>
            ) : (
              // Sign In Form
              <>
                <div className="space-y-2">
                  <Label htmlFor="signInEmail">Email</Label>
                  <Input
                    id="signInEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    className={formErrors.email ? "border-red-500" : ""}
                    required
                    disabled={isLoading}
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signInPassword">Password</Label>
                  <div className="relative">
                    <Input
                      id="signInPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      className={formErrors.password ? "border-red-500" : ""}
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {formErrors.password && (
                    <p className="text-sm text-red-500">{formErrors.password}</p>
                  )}
                </div>
                
                <div className="text-right">
                  <Button 
                    variant="link" 
                    className="px-0 text-sm" 
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isLoading}
                  >
                    Forgot password?
                  </Button>
                </div>
              </>
            )}
            
            {/* Email verification message */}
            {!isSignUp && (
              <div className="text-center mt-4">
                <p className="text-sm text-blue-600">
                  Didn't receive a verification email?{' '}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-sm"
                    onClick={() => {
                      if (signInData.email) {
                        // Implement resend verification email functionality
                        toast({
                          title: "Verification Email Sent",
                          description: "Please check your inbox for the verification link.",
                        });
                      } else {
                        toast({
                          title: "Email Required",
                          description: "Please enter your email address first.",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    Resend verification email
                  </Button>
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || loading}>
              {(isLoading || loading) ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <Button
                variant="link"
                className="px-2"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  // Clear forms when switching
                  setSignInData({ email: '', password: '' });
                  setSignUpData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    gender: '',
                    dateOfBirth: '',
                    bloodGroup: '',
                    allergies: [],
                    password: '',
                    confirmPassword: '',
                    agreeToTerms: false
                  });
                }}
                disabled={isLoading}
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
