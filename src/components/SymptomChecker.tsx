
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Bot } from 'lucide-react';

const SymptomChecker = () => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([
    {
      type: 'bot',
      message: "Hi! I'm your AI health assistant. Describe any symptoms you're experiencing, and I'll help you understand what they might mean based on your medical history."
    }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    const newConversation = [
      ...conversation,
      { type: 'user', message },
      { 
        type: 'bot', 
        message: "Based on your symptoms and medical history, here are some suggestions: Consider rest and hydration. If symptoms persist for more than 24 hours, book an appointment with Dr. Johnson. Would you like me to help you schedule one?"
      }
    ];
    
    setConversation(newConversation);
    setMessage('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="text-blue-500" />
          AI Symptom Checker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4 h-40 overflow-y-auto">
          {conversation.map((msg, index) => (
            <div key={index} className={`flex gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.type === 'bot' && (
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="w-3 h-3 text-blue-600" />
                </div>
              )}
              <div className={`max-w-xs p-2 rounded-lg text-sm ${
                msg.type === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {msg.message}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Describe your symptoms..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button size="sm" onClick={handleSend}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className="text-xs cursor-pointer">Headache</Badge>
          <Badge variant="outline" className="text-xs cursor-pointer">Fatigue</Badge>
          <Badge variant="outline" className="text-xs cursor-pointer">Chest pain</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export { SymptomChecker };
