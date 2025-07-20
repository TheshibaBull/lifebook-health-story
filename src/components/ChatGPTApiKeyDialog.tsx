
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ChatGPTMedicalAnalysisService } from '@/services/chatGPTMedicalAnalysisService';

interface ChatGPTApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKeySet: () => void;
}

export const ChatGPTApiKeyDialog = ({ open, onOpenChange, onKeySet }: ChatGPTApiKeyDialogProps) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter your OpenAI API key",
        variant: "destructive"
      });
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      toast({
        title: "Invalid API Key",
        description: "OpenAI API keys should start with 'sk-'",
        variant: "destructive"
      });
      return;
    }

    ChatGPTMedicalAnalysisService.setAPIKey(apiKey);
    toast({
      title: "API Key Saved",
      description: "Your OpenAI API key has been saved securely in your browser",
    });
    
    onKeySet();
    onOpenChange(false);
    setApiKey('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600" />
            OpenAI API Key Required
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">
            To get detailed medical analysis with ChatGPT, please enter your OpenAI API key. 
            Your key is stored securely in your browser and never sent to our servers.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="apiKey">OpenAI API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <p className="font-medium text-blue-900 mb-1">How to get your API key:</p>
            <ol className="text-blue-800 space-y-1 list-decimal list-inside">
              <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com/api-keys</a></li>
              <li>Click "Create new secret key"</li>
              <li>Copy and paste it here</li>
            </ol>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save API Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
