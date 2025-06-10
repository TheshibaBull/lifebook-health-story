
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HelpCircle, 
  Search, 
  FileText, 
  Users, 
  Shield, 
  Heart, 
  Upload, 
  Play,
  ExternalLink,
  MessageCircle,
  Mail,
  ChevronRight
} from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  steps: string[];
  category: string;
}

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const articles: HelpArticle[] = [
    {
      id: '1',
      title: 'Getting Started with Lifebook Health',
      category: 'basics',
      content: 'Welcome to Lifebook Health! This guide will help you get started with managing your health records. First, complete your profile setup by providing basic information...',
      tags: ['onboarding', 'setup', 'profile'],
      difficulty: 'beginner'
    },
    {
      id: '2',
      title: 'Uploading Your First Health Record',
      category: 'records',
      content: 'To upload a health record, navigate to the Upload page and drag & drop your file or click to browse. Supported formats include PDF, JPG, PNG, and DICOM...',
      tags: ['upload', 'documents', 'files'],
      difficulty: 'beginner'
    },
    {
      id: '3',
      title: 'Managing Family Members',
      category: 'family',
      content: 'The Family Vault allows you to manage health records for your entire family. To add a family member, go to the Family tab and click "Add Family Member"...',
      tags: ['family', 'sharing', 'access'],
      difficulty: 'intermediate'
    },
    {
      id: '4',
      title: 'Understanding Privacy Controls',
      category: 'privacy',
      content: 'Your privacy is important to us. Lifebook Health provides comprehensive privacy controls that let you decide who can access your health information...',
      tags: ['privacy', 'security', 'sharing'],
      difficulty: 'intermediate'
    },
    {
      id: '5',
      title: 'Using Emergency QR Codes',
      category: 'emergency',
      content: 'Emergency QR codes provide quick access to critical health information in emergencies. You can generate and print QR codes that contain essential medical data...',
      tags: ['emergency', 'qr-code', 'medical-id'],
      difficulty: 'advanced'
    },
    {
      id: '6',
      title: 'AI Health Insights and Summaries',
      category: 'ai',
      content: 'Our AI-powered features help you understand your health data better. The AI Health Summarizer can analyze your medical documents and provide key insights...',
      tags: ['ai', 'insights', 'analysis'],
      difficulty: 'intermediate'
    }
  ];

  const tutorials: Tutorial[] = [
    {
      id: '1',
      title: 'Complete Setup Tutorial',
      description: 'Learn how to set up your profile and upload your first health record',
      duration: '5 minutes',
      category: 'basics',
      steps: [
        'Complete your profile information',
        'Set up privacy preferences',
        'Upload your first health document',
        'Add an emergency contact',
        'Explore the dashboard'
      ]
    },
    {
      id: '2',
      title: 'Family Health Management',
      description: 'Set up and manage health records for your family members',
      duration: '8 minutes',
      category: 'family',
      steps: [
        'Add your first family member',
        'Set access permissions',
        'Upload family health records',
        'Review family health analytics',
        'Set up emergency sharing'
      ]
    },
    {
      id: '3',
      title: 'Privacy and Security Setup',
      description: 'Configure privacy settings and understand security features',
      duration: '6 minutes',
      category: 'privacy',
      steps: [
        'Review privacy settings',
        'Set up data encryption',
        'Configure sharing preferences',
        'Enable audit logging',
        'Export your data'
      ]
    }
  ];

  const categories = [
    { id: 'all', name: 'All Topics', count: articles.length },
    { id: 'basics', name: 'Getting Started', count: articles.filter(a => a.category === 'basics').length },
    { id: 'records', name: 'Health Records', count: articles.filter(a => a.category === 'records').length },
    { id: 'family', name: 'Family Features', count: articles.filter(a => a.category === 'family').length },
    { id: 'privacy', name: 'Privacy & Security', count: articles.filter(a => a.category === 'privacy').length },
    { id: 'emergency', name: 'Emergency Features', count: articles.filter(a => a.category === 'emergency').length },
    { id: 'ai', name: 'AI Features', count: articles.filter(a => a.category === 'ai').length }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="text-blue-500" />
          Help Center
        </CardTitle>
        <div className="flex gap-4 mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search help articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                aria-label="Search help articles"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="articles" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="articles">Help Articles</TabsTrigger>
            <TabsTrigger value="tutorials">Video Tutorials</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">Categories</h3>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      selectedCategory === category.id 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    aria-label={`Filter by ${category.name}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{category.name}</span>
                      <Badge variant="secondary" className="text-xs">{category.count}</Badge>
                    </div>
                  </button>
                ))}
              </div>

              <div className="md:col-span-3 space-y-4">
                {filteredArticles.map((article) => (
                  <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-lg">{article.title}</h3>
                        <Badge className={getDifficultyColor(article.difficulty)}>
                          {article.difficulty}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{article.content}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex flex-wrap gap-1">
                          {article.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                          Read More
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tutorials" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTutorials.map((tutorial) => (
                <Card key={tutorial.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Play className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{tutorial.title}</h3>
                        <p className="text-sm text-gray-600">{tutorial.duration}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{tutorial.description}</p>
                    <div className="space-y-2 mb-4">
                      <h4 className="text-xs font-medium text-gray-700">What you'll learn:</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {tutorial.steps.slice(0, 3).map((step, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            {step}
                          </li>
                        ))}
                        {tutorial.steps.length > 3 && (
                          <li className="text-blue-600">+{tutorial.steps.length - 3} more steps</li>
                        )}
                      </ul>
                    </div>
                    <Button className="w-full" variant="outline">
                      <Play className="w-4 h-4 mr-2" />
                      Start Tutorial
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="faq" className="space-y-4">
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">How secure is my health data?</h3>
                  <p className="text-gray-600 text-sm">Your health data is encrypted using AES-256 encryption and stored securely. We are HIPAA compliant and follow industry best practices for data security.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Can I share my health records with my doctor?</h3>
                  <p className="text-gray-600 text-sm">Yes! You can easily share your health records with healthcare providers through secure links or by exporting your data in various formats.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">What file formats are supported?</h3>
                  <p className="text-gray-600 text-sm">We support PDF, JPEG, PNG, TIFF, and DICOM files. Our AI can also read and extract information from scanned documents.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">How do I add family members?</h3>
                  <p className="text-gray-600 text-sm">Go to the Family Vault section and click "Add Family Member". You can set different access levels and permissions for each family member.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Can I use Lifebook Health offline?</h3>
                  <p className="text-gray-600 text-sm">Yes! Many features work offline, and your data will sync automatically when you're back online.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-500" />
                    Live Chat Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Get instant help from our support team</p>
                  <p className="text-sm text-gray-500 mb-4">Available: Mon-Fri, 9AM-6PM PST</p>
                  <Button className="w-full">
                    Start Chat
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-green-500" />
                    Email Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Send us a detailed message</p>
                  <p className="text-sm text-gray-500 mb-4">Response time: Within 24 hours</p>
                  <Button variant="outline" className="w-full">
                    Send Email
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Community Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      User Forum
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Facebook Group
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Knowledge Base
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export { HelpCenter };
