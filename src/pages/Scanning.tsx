
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Scanning = () => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Scanning document...');
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => navigate('/dashboard'), 1000);
          return 100;
        }
        
        // Update stage based on progress
        if (prev < 30) {
          setStage('Scanning document...');
        } else if (prev < 60) {
          setStage('Analyzing content...');
        } else if (prev < 90) {
          setStage('Extracting information...');
        } else {
          setStage('Finalizing...');
        }
        
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-red-500" />
            <CardTitle className="text-2xl">Scanning & Labeling</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-medium mb-2">{stage}</p>
              <p className="text-sm text-gray-600">
                Analyzing your document...
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {progress >= 100 && (
              <div className="text-center text-green-600">
                <p className="font-medium">Complete!</p>
                <p className="text-sm">Redirecting to your dashboard...</p>
              </div>
            )}

            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')} 
              className="w-full"
              disabled={progress < 100}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Scanning;
