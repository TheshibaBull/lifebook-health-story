
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UnifiedUpload } from '@/components/UnifiedUpload';

const UploadRecord = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="absolute left-4 top-4 flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Button>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-red-500" />
            <CardTitle className="text-2xl">Upload Medical Records</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <UnifiedUpload />
          
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex-1">
              Skip for now
            </Button>
            <Button onClick={() => navigate('/dashboard')} className="flex-1">
              View Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadRecord;
