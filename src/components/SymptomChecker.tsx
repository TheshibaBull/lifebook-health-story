import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Bot, AlertTriangle, Info, CheckCircle, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SymptomAnalysis {
  severity: 'mild' | 'moderate' | 'severe' | 'emergency';
  possibleConditions: Array<{ name: string; probability: number; description: string }>;
  recommendations: string[];
  urgencyLevel: string;
  disclaimer: string;
}

interface Message {
  type: 'user' | 'bot';
  message: string;
  analysis?: SymptomAnalysis;
  timestamp: Date;
}

const SymptomChecker = () => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Message[]>([
    {
      type: 'bot',
      message: "Hi! I'm your AI health assistant. Describe your symptoms and I'll provide medical insights based on current guidelines. Remember, this is for informational purposes only and doesn't replace professional medical advice.",
      timestamp: new Date()
    }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeSymptoms = async (symptoms: string): Promise<SymptomAnalysis> => {
    // Simulate AI medical analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    const lowerSymptoms = symptoms.toLowerCase();
    
    // Basic symptom analysis logic
    if (lowerSymptoms.includes('chest pain') || lowerSymptoms.includes('heart attack') || lowerSymptoms.includes('difficulty breathing')) {
      return {
        severity: 'emergency',
        possibleConditions: [
          { name: 'Acute Coronary Syndrome', probability: 65, description: 'Heart-related chest pain requiring immediate attention' },
          { name: 'Pulmonary Embolism', probability: 25, description: 'Blood clot in lung arteries' },
          { name: 'Anxiety Attack', probability: 10, description: 'Stress-induced chest discomfort' }
        ],
        recommendations: [
          'SEEK IMMEDIATE EMERGENCY CARE',
          'Call 911 or go to nearest emergency room',
          'Do not drive yourself',
          'Chew aspirin if not allergic (unless told otherwise)'
        ],
        urgencyLevel: 'EMERGENCY - Immediate medical attention required',
        disclaimer: 'This could be life-threatening. Seek emergency care immediately.'
      };
    }

    if (lowerSymptoms.includes('headache') || lowerSymptoms.includes('migraine')) {
      return {
        severity: 'moderate',
        possibleConditions: [
          { name: 'Tension Headache', probability: 70, description: 'Most common type of headache, often stress-related' },
          { name: 'Migraine', probability: 20, description: 'Severe headache often with nausea and light sensitivity' },
          { name: 'Sinus Headache', probability: 10, description: 'Related to sinus congestion or infection' }
        ],
        recommendations: [
          'Rest in a quiet, dark room',
          'Apply cold or warm compress to head/neck',
          'Stay hydrated',
          'Consider over-the-counter pain relief',
          'Track triggers (food, stress, sleep patterns)'
        ],
        urgencyLevel: 'Monitor symptoms - see doctor if persistent or severe',
        disclaimer: 'Seek immediate care if headache is sudden, severe, or accompanied by fever, confusion, or vision changes.'
      };
    }

    if (lowerSymptoms.includes('fatigue') || lowerSymptoms.includes('tired') || lowerSymptoms.includes('exhausted')) {
      return {
        severity: 'mild',
        possibleConditions: [
          { name: 'Sleep Deprivation', probability: 40, description: 'Insufficient or poor quality sleep' },
          { name: 'Stress/Anxiety', probability: 30, description: 'Mental fatigue from psychological stress' },
          { name: 'Anemia', probability: 15, description: 'Low iron or other nutritional deficiencies' },
          { name: 'Thyroid Dysfunction', probability: 15, description: 'Underactive thyroid affecting energy levels' }
        ],
        recommendations: [
          'Ensure 7-9 hours of quality sleep',
          'Maintain regular sleep schedule',
          'Exercise regularly but not close to bedtime',
          'Eat balanced meals with iron-rich foods',
          'Manage stress through relaxation techniques',
          'Consider blood work to check for deficiencies'
        ],
        urgencyLevel: 'Schedule routine appointment if symptoms persist > 2 weeks',
        disclaimer: 'Sudden severe fatigue or fatigue with other concerning symptoms warrants prompt medical evaluation.'
      };
    }

    if (lowerSymptoms.includes('fever') || lowerSymptoms.includes('temperature')) {
      const hasCough = lowerSymptoms.includes('cough');
      const hasSoreThroat = lowerSymptoms.includes('sore throat') || lowerSymptoms.includes('throat');
      
      return {
        severity: 'moderate',
        possibleConditions: [
          { name: 'Viral Upper Respiratory Infection', probability: 60, description: 'Common cold or flu-like illness' },
          { name: 'Bacterial Infection', probability: 25, description: 'May require antibiotic treatment' },
          { name: 'COVID-19', probability: 15, description: 'SARS-CoV-2 viral infection' }
        ],
        recommendations: [
          'Rest and stay hydrated',
          'Monitor temperature regularly',
          'Isolate from others until fever-free for 24 hours',
          'Consider COVID-19 testing',
          'Use acetaminophen or ibuprofen for comfort',
          'Seek care if fever >101.3°F (38.5°C) persists >3 days'
        ],
        urgencyLevel: 'Monitor closely - contact healthcare provider if worsening',
        disclaimer: 'Seek immediate care for high fever (>103°F), difficulty breathing, or severe symptoms.'
      };
    }

    // Default analysis for other symptoms
    return {
      severity: 'mild',
      possibleConditions: [
        { name: 'Common Minor Condition', probability: 80, description: 'Most symptoms resolve with rest and self-care' },
        { name: 'Stress-Related Symptoms', probability: 15, description: 'Physical manifestation of psychological stress' },
        { name: 'Other Medical Condition', probability: 5, description: 'May require further evaluation' }
      ],
      recommendations: [
        'Monitor symptoms for changes or worsening',
        'Rest and maintain good hydration',
        'Practice stress management techniques',
        'Contact healthcare provider if symptoms persist or worsen',
        'Keep a symptom diary to track patterns'
      ],
      urgencyLevel: 'Low priority - monitor and consider routine care if persistent',
      disclaimer: 'This analysis is for informational purposes only. Always consult healthcare professionals for persistent or concerning symptoms.'
    };
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    
    const userMessage: Message = { 
      type: 'user', 
      message: message.trim(),
      timestamp: new Date()
    };
    
    setConversation(prev => [...prev, userMessage]);
    setMessage('');
    setIsAnalyzing(true);

    try {
      const analysis = await analyzeSymptoms(message);
      
      const botResponse: Message = {
        type: 'bot',
        message: `I've analyzed your symptoms. Here's what I found:`,
        analysis,
        timestamp: new Date()
      };

      setConversation(prev => [...prev, botResponse]);
      
      if (analysis.severity === 'emergency') {
        toast({
          title: "EMERGENCY ALERT",
          description: "Your symptoms may require immediate medical attention!",
          variant: "destructive"
        });
      }
    } catch (error) {
      setConversation(prev => [...prev, {
        type: 'bot',
        message: 'Sorry, I encountered an error analyzing your symptoms. Please try again or consult a healthcare provider.',
        timestamp: new Date()
      }]);
      
      toast({
        title: "Analysis Error",
        description: "Unable to analyze symptoms. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const quickSymptoms = [
    'Headache and nausea',
    'Chest pain and shortness of breath',
    'Fatigue and dizziness',
    'Fever and cough',
    'Stomach pain and nausea'
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency': return 'text-red-600 bg-red-50 border-red-200';
      case 'severe': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'moderate': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'emergency': return AlertTriangle;
      case 'severe': return AlertTriangle;
      case 'moderate': return Info;
      default: return CheckCircle;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="text-blue-500" />
          AI Symptom Analyzer
          {isAnalyzing && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4 h-96 overflow-y-auto">
          {conversation.map((msg, index) => (
            <div key={index} className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.type === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
              )}
              <div className={`max-w-xs lg:max-w-md rounded-lg text-sm ${
                msg.type === 'user' 
                  ? 'bg-blue-500 text-white p-3' 
                  : 'bg-gray-100 text-gray-800 p-3'
              }`}>
                <p className="mb-2">{msg.message}</p>
                <span className="text-xs opacity-70">
                  {msg.timestamp.toLocaleTimeString()}
                </span>

                {msg.analysis && (
                  <div className="mt-3 space-y-3">
                    {/* Severity Alert */}
                    <div className={`p-3 rounded-lg border-2 ${getSeverityColor(msg.analysis.severity)}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {React.createElement(getSeverityIcon(msg.analysis.severity), { 
                          className: "w-4 h-4" 
                        })}
                        <span className="font-semibold text-sm">
                          {msg.analysis.urgencyLevel}
                        </span>
                      </div>
                    </div>

                    {/* Possible Conditions */}
                    <div>
                      <h5 className="font-semibold text-xs mb-2 text-gray-700">Possible Conditions:</h5>
                      {msg.analysis.possibleConditions.map((condition, i) => (
                        <div key={i} className="mb-2 p-2 bg-white rounded border">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-xs">{condition.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {condition.probability}%
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">{condition.description}</p>
                        </div>
                      ))}
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h5 className="font-semibold text-xs mb-2 text-gray-700">Recommendations:</h5>
                      <ul className="space-y-1">
                        {msg.analysis.recommendations.map((rec, i) => (
                          <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                            <span className="text-blue-500 mt-1">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Disclaimer */}
                    <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                      <strong>Disclaimer:</strong> {msg.analysis.disclaimer}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        Book Appointment
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs">
                        Call Doctor
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Describe your symptoms in detail..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isAnalyzing && handleSend()}
            disabled={isAnalyzing}
          />
          <Button size="sm" onClick={handleSend} disabled={isAnalyzing || !message.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-gray-600">Quick symptom examples:</p>
          <div className="flex flex-wrap gap-2">
            {quickSymptoms.map((symptom, index) => (
              <Badge 
                key={index}
                variant="outline" 
                className="text-xs cursor-pointer hover:bg-gray-100" 
                onClick={() => setMessage(symptom)}
              >
                {symptom}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { SymptomChecker };
