
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, TrendingUp, Calendar, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HealthGoal {
  id: string;
  title: string;
  category: 'fitness' | 'nutrition' | 'mental' | 'preventive' | 'chronic';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  progress: number;
  status: 'active' | 'completed' | 'paused';
  milestones: { value: number; date: string; achieved: boolean }[];
  aiRecommendations: string[];
}

const HealthGoals = () => {
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    category: 'fitness' as const,
    targetValue: 0,
    unit: '',
    deadline: '',
    priority: 'medium' as const
  });
  const { toast } = useToast();

  const generateMockGoals = (): HealthGoal[] => {
    return [
      {
        id: '1',
        title: 'Daily Steps Goal',
        category: 'fitness',
        targetValue: 10000,
        currentValue: 7500,
        unit: 'steps',
        deadline: '2024-12-31',
        priority: 'high',
        progress: 75,
        status: 'active',
        milestones: [
          { value: 5000, date: '2024-01-15', achieved: true },
          { value: 7500, date: '2024-02-01', achieved: true },
          { value: 10000, date: '2024-03-01', achieved: false }
        ],
        aiRecommendations: [
          'Increase walking during lunch breaks',
          'Take stairs instead of elevator',
          'Park further from destinations'
        ]
      },
      {
        id: '2',
        title: 'Blood Pressure Control',
        category: 'chronic',
        targetValue: 120,
        currentValue: 135,
        unit: 'mmHg systolic',
        deadline: '2024-06-30',
        priority: 'high',
        progress: 60,
        status: 'active',
        milestones: [
          { value: 140, date: '2024-01-01', achieved: true },
          { value: 130, date: '2024-02-15', achieved: true },
          { value: 120, date: '2024-06-30', achieved: false }
        ],
        aiRecommendations: [
          'Reduce sodium intake to <2300mg/day',
          'Increase potassium-rich foods',
          'Practice stress management techniques'
        ]
      },
      {
        id: '3',
        title: 'Weight Loss',
        category: 'fitness',
        targetValue: 70,
        currentValue: 78,
        unit: 'kg',
        deadline: '2024-08-01',
        priority: 'medium',
        progress: 40,
        status: 'active',
        milestones: [
          { value: 80, date: '2024-01-01', achieved: true },
          { value: 75, date: '2024-04-01', achieved: true },
          { value: 70, date: '2024-08-01', achieved: false }
        ],
        aiRecommendations: [
          'Maintain caloric deficit of 500 cal/day',
          'Increase protein intake to 1.2g/kg body weight',
          'Add 2 strength training sessions per week'
        ]
      }
    ];
  };

  const addGoal = () => {
    if (!newGoal.title || !newGoal.targetValue || !newGoal.unit || !newGoal.deadline) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const goal: HealthGoal = {
      id: Date.now().toString(),
      ...newGoal,
      currentValue: 0,
      progress: 0,
      status: 'active',
      milestones: [],
      aiRecommendations: [
        'Start with small, achievable daily targets',
        'Track progress consistently',
        'Celebrate milestone achievements'
      ]
    };

    setGoals(prev => [...prev, goal]);
    setNewGoal({
      title: '',
      category: 'fitness',
      targetValue: 0,
      unit: '',
      deadline: '',
      priority: 'medium'
    });
    setIsAddingGoal(false);

    toast({
      title: "Goal Added",
      description: `New health goal "${goal.title}" has been created`,
    });
  };

  const updateGoalProgress = (goalId: string, newValue: number) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const progress = Math.min((newValue / goal.targetValue) * 100, 100);
        const status = progress >= 100 ? 'completed' : 'active';
        return { ...goal, currentValue: newValue, progress, status };
      }
      return goal;
    }));
  };

  useEffect(() => {
    setGoals(generateMockGoals());
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'active': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="text-blue-500" />
              Health Goals Tracking
            </CardTitle>
            <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Health Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Goal Title</Label>
                    <Input
                      id="title"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Daily Exercise Goal"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newGoal.category} onValueChange={(value: any) => setNewGoal(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="nutrition">Nutrition</SelectItem>
                        <SelectItem value="mental">Mental Health</SelectItem>
                        <SelectItem value="preventive">Preventive Care</SelectItem>
                        <SelectItem value="chronic">Chronic Condition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="target">Target Value</Label>
                      <Input
                        id="target"
                        type="number"
                        value={newGoal.targetValue}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, targetValue: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Input
                        id="unit"
                        value={newGoal.unit}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, unit: e.target.value }))}
                        placeholder="e.g., steps, kg, minutes"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="deadline">Target Date</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newGoal.priority} onValueChange={(value: any) => setNewGoal(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={addGoal} className="w-full">Create Goal</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{goal.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getPriorityColor(goal.priority)} className="text-xs">
                        {goal.priority} priority
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(goal.status)}`}>
                        {goal.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </p>
                    <p className="text-sm text-gray-600">Due: {goal.deadline}</p>
                  </div>
                </div>
                
                <Progress value={goal.progress} className="mb-3" />
                
                <div className="text-sm text-gray-600 mb-3">
                  <p className="font-medium">AI Recommendations:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {goal.aiRecommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Update progress"
                    className="w-32"
                    onBlur={(e) => {
                      const value = Number(e.target.value);
                      if (value > 0) updateGoalProgress(goal.id, value);
                    }}
                  />
                  <span className="text-sm text-gray-600">{goal.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { HealthGoals };
