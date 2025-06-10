
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, TrendingUp, AlertTriangle, Calendar, Target } from 'lucide-react';

const FamilyHealthAnalytics = () => {
  const familyHealthScore = {
    overall: 82,
    members: [
      { name: 'You', score: 87, trend: 'up' },
      { name: 'Mle', score: 85, trend: 'stable' },
      { name: 'Swapnil', score: 75, trend: 'down' }
    ]
  };

  const healthTrends = [
    { month: 'Jan', family: 78, you: 82, mle: 80, swapnil: 70 },
    { month: 'Feb', family: 80, you: 84, mle: 82, swapnil: 72 },
    { month: 'Mar', family: 82, you: 87, mle: 85, swapnil: 75 },
  ];

  const riskFactors = [
    { member: 'You', factor: 'Blood Pressure', level: 'Medium', value: 65 },
    { member: 'Mle', factor: 'Cholesterol', level: 'Low', value: 25 },
    { member: 'Swapnil', factor: 'Diabetes Risk', level: 'High', value: 85 }
  ];

  const upcomingReminders = [
    { member: 'You', task: 'Annual Checkup', dueIn: '2 weeks', priority: 'medium' },
    { member: 'Mle', task: 'Dental Cleaning', dueIn: '1 month', priority: 'low' },
    { member: 'Swapnil', task: 'Blood Sugar Test', dueIn: '3 days', priority: 'high' }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Family Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-blue-500" />
              Family Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{familyHealthScore.overall}</div>
              <div className="text-sm text-gray-600">Overall Family Health</div>
              <div className="mt-4 space-y-2">
                {familyHealthScore.members.map((member, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{member.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.score}</span>
                      <TrendingUp className={`w-3 h-3 ${
                        member.trend === 'up' ? 'text-green-500' : 
                        member.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-green-500" />
              Health Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Annual Checkups</span>
                  <span>2/3</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Preventive Screenings</span>
                  <span>4/6</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Vaccination Updates</span>
                  <span>3/3</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Health Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-2 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm font-medium text-red-800">High Priority</p>
                <p className="text-xs text-red-600">Swapnil's blood sugar test overdue</p>
              </div>
              <div className="p-2 rounded-lg bg-yellow-50 border border-yellow-200">
                <p className="text-sm font-medium text-yellow-800">Medium Priority</p>
                <p className="text-xs text-yellow-600">Your annual checkup due soon</p>
              </div>
              <div className="text-center pt-2">
                <span className="text-xs text-green-600">All other health metrics normal</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Family Health Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={healthTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[60, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="family" stroke="#3b82f6" strokeWidth={3} name="Family Average" />
              <Line type="monotone" dataKey="you" stroke="#10b981" strokeWidth={2} name="You" />
              <Line type="monotone" dataKey="mle" stroke="#8b5cf6" strokeWidth={2} name="Mle" />
              <Line type="monotone" dataKey="swapnil" stroke="#f59e0b" strokeWidth={2} name="Swapnil" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk Factors and Upcoming Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Factors Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskFactors.map((risk, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{risk.member}</p>
                      <p className="text-sm text-gray-600">{risk.factor}</p>
                    </div>
                    <Badge className={getRiskColor(risk.level)}>
                      {risk.level} Risk
                    </Badge>
                  </div>
                  <Progress value={risk.value} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Health Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingReminders.map((reminder, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{reminder.member}</p>
                    <p className="text-sm text-gray-600">{reminder.task}</p>
                    <p className="text-xs text-gray-500">Due in {reminder.dueIn}</p>
                  </div>
                  <Badge className={getPriorityColor(reminder.priority)}>
                    {reminder.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { FamilyHealthAnalytics };
