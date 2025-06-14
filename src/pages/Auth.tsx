
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      if (isSignUp) {
        // Store user data for sign up
        const userData = {
          email,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          hasCompletedProfile: false
        };
        
        localStorage.setItem('user-authenticated', 'true');
        localStorage.setItem('user-data', JSON.stringify(userData));
        
        toast({
          title: "Account Created",
          description: "Welcome to Lifebook Health! Please complete your profile.",
        });
        
        navigate('/create-profile');
      } else {
        // For sign in, check if user has existing data
        const existingUserData = localStorage.getItem('user-data');
        const hasCompletedProfile = localStorage.getItem('user-profile');
        
        if (!existingUserData) {
          // New user signing in - create basic data
          const userData = {
            email,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            hasCompletedProfile: !!hasCompletedProfile
          };
          localStorage.setItem('user-data', JSON.stringify(userData));
        }
        
        localStorage.setItem('user-authenticated', 'true');
        
        toast({
          title: "Welcome Back",
          description: "Successfully signed in to your account.",
        });
        
        // Navigate based on profile completion status
        if (hasCompletedProfile) {
          navigate('/dashboard');
        } else {
          navigate('/create-profile');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-red-500" />
            <CardTitle className="text-2xl">Lifebook Health</CardTitle>
          </div>
          <CardDescription>
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            {!isSignUp && (
              <div className="text-right">
                <Button variant="link" className="px-0 text-sm" type="button">
                  Forgot password?
                </Button>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <Button
                variant="link"
                className="px-2"
                onClick={() => setIsSignUp(!isSignUp)}
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
