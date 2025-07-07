
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Heart, 
  AlertTriangle, 
  Clock, 
  Target, 
  Zap,
  Shield,
  CheckCircle,
  Info,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { HealthRecordsService } from '@/services/healthRecordsService';
import { HealthMetricsService } from '@/services/healthMetricsService';
import { FamilyMembersService } from '@/services/familyMembersService';
import { useToast } from '@/hooks/use-toast';

interface ExerciseRecommendation {
  id: string;
  title: string;
  description: string;
  duration: string;
  intensity: 'Low' | 'Moderate' | 'High';
  benefits: string[];
  precautions?: string[];
  allergenConsiderations?: string[];
  category: 'Cardio' | 'Strength' | 'Flexibility' | 'Balance' | 'Recovery';
  equipment?: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
}

interface HealthProfile {
  conditions: string[];
  allergies: string[];
  medications: string[];
  age: number;
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  goals: string[];
}

const ExerciseRecommendations = () => {
  const [recommendations, setRecommendations] = useState<ExerciseRecommendation[]>([]);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const categories = ['All', 'Cardio', 'Strength', 'Flexibility', 'Balance', 'Recovery'];

  const generateRecommendations = (profile: HealthProfile): ExerciseRecommendation[] => {
    const baseRecommendations: ExerciseRecommendation[] = [
      {
        id: '1',
        title: 'Indoor Walking Program',
        description: 'Low-impact cardiovascular exercise perfect for daily routine. Ideal for those with joint concerns or allergies to outdoor pollens.',
        duration: '30 minutes',
        intensity: 'Low',
        benefits: ['Improves cardiovascular health', 'Low joint impact', 'Mood enhancement', 'Weight management'],
        allergenConsiderations: ['Indoor environment reduces pollen exposure', 'Use air-filtered spaces'],
        precautions: profile.conditions.includes('arthritis') ? ['Wear supportive shoes', 'Start with 10 minutes'] : [],
        category: 'Cardio',
        equipment: ['Comfortable walking shoes'],
        difficulty: 1
      },
      {
        id: '2',
        title: 'Resistance Band Training',
        description: 'Strength training using resistance bands, adaptable for all fitness levels and safe for most health conditions.',
        duration: '25 minutes',
        intensity: 'Moderate',
        benefits: ['Builds muscle strength', 'Improves bone density', 'Enhances mobility', 'Portable equipment'],
        precautions: profile.conditions.includes('hypertension') ? ['Monitor heart rate', 'Avoid breath holding'] : [],
        allergenConsiderations: ['Latex-free bands recommended for latex allergies'],
        category: 'Strength',
        equipment: ['Resistance bands', 'Anchoring point'],
        difficulty: 2
      },
      {
        id: '3',
        title: 'Gentle Yoga Flow',
        description: 'Flexibility and mindfulness practice combining stretching, breathing, and meditation techniques.',
        duration: '20 minutes',
        intensity: 'Low',
        benefits: ['Increases flexibility', 'Reduces stress', 'Improves balance', 'Better sleep quality'],
        allergenConsiderations: ['Use hypoallergenic yoga mats', 'Practice in well-ventilated areas'],
        precautions: profile.age > 65 ? ['Use props for support', 'Avoid deep twists'] : [],
        category: 'Flexibility',
        equipment: ['Yoga mat', 'Blocks (optional)'],
        difficulty: 1
      },
      {
        id: '4',
        title: 'Swimming Pool Exercises',
        description: 'Water-based exercises providing full-body workout with minimal joint stress.',
        duration: '45 minutes',
        intensity: 'Moderate',
        benefits: ['Full-body workout', 'Joint-friendly', 'Builds endurance', 'Cooling effect'],
        allergenConsiderations: ['May trigger chlorine sensitivities', 'Consider saltwater pools'],
        precautions: profile.conditions.includes('asthma') ? ['Monitor breathing', 'Have inhaler nearby'] : [],
        category: 'Cardio',
        equipment: ['Access to pool', 'Swim cap'],
        difficulty: 3
      },
      {
        id: '5',
        title: 'Balance & Stability Training',
        description: 'Targeted exercises to improve balance, coordination, and fall prevention.',
        duration: '15 minutes',
        intensity: 'Low',
        benefits: ['Prevents falls', 'Improves coordination', 'Enhances core strength', 'Builds confidence'],
        precautions: ['Practice near wall or stable surface', 'Start with eyes open'],
        category: 'Balance',
        equipment: ['Stable chair for support'],
        difficulty: 2
      },
      {
        id: '6',
        title: 'High-Intensity Interval Training (HIIT)',
        description: 'Short bursts of intense activity followed by recovery periods for maximum efficiency.',
        duration: '20 minutes',
        intensity: 'High',
        benefits: ['Burns calories efficiently', 'Improves cardiovascular fitness', 'Time-effective', 'Boosts metabolism'],
        precautions: profile.conditions.includes('heart disease') ? ['Get medical clearance', 'Monitor heart rate closely'] : ['Warm up thoroughly', 'Stay hydrated'],
        allergenConsiderations: ['Indoor workouts reduce allergen exposure'],
        category: 'Cardio',
        equipment: ['Timer', 'Water bottle'],
        difficulty: 4
      }
    ];

    // Filter recommendations based on health profile
    return baseRecommendations.filter(rec => {
      // Remove high-intensity if certain conditions exist
      if (rec.intensity === 'High' && (
        profile.conditions.includes('heart disease') ||
        profile.conditions.includes('uncontrolled hypertension') ||
        profile.age > 70
      )) {
        return false;
      }

      // Remove pool exercises if chlorine allergy
      if (rec.id === '4' && profile.allergies.some(allergy => 
        allergy.toLowerCase().includes('chlorine')
      )) {
        return false;
      }

      return true;
    });
  };

  const loadHealthProfile = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Get user profile data
      const familyMembers = await FamilyMembersService.getFamilyMembers(user.id);
      const userMember = familyMembers.find(member => member.name === 'You') || familyMembers[0];

      // Get health records for analysis
      const healthRecords = await HealthRecordsService.getRecords(user.id);
      
      // Get recent health metrics
      const healthMetrics = await HealthMetricsService.getLatestMetrics(user.id);

      // Analyze health data to create profile
      const conditions = userMember?.medical_conditions || [];
      const allergies = userMember?.allergies || [];
      const medications = userMember?.medications || [];
      const age = userMember?.date_of_birth ? 
        new Date().getFullYear() - new Date(userMember.date_of_birth).getFullYear() : 35;

      // Determine fitness level based on metrics
      let fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';
      if (healthMetrics.steps && healthMetrics.steps.value > 8000) {
        fitnessLevel = 'Intermediate';
      }
      if (healthMetrics.exercise_minutes && healthMetrics.exercise_minutes.value > 150) {
        fitnessLevel = 'Advanced';
      }

      const profile: HealthProfile = {
        conditions,
        allergies,
        medications,
        age,
        fitnessLevel,
        goals: ['Improve fitness', 'Maintain health', 'Manage conditions']
      };

      setHealthProfile(profile);
      const recs = generateRecommendations(profile);
      setRecommendations(recs);

      // Calculate weekly progress (mock data)
      const exerciseMinutes = healthMetrics.exercise_minutes?.value || 0;
      const weeklyTarget = 150; // WHO recommendation
      setWeeklyProgress(Math.min(100, (exerciseMinutes * 7 / weeklyTarget) * 100));

    } catch (error) {
      console.error('Error loading health profile:', error);
      toast({
        title: "Error Loading Profile",
        description: "Could not load your health profile. Using default recommendations.",
        variant: "destructive"
      });
      
      // Use default profile
      const defaultProfile: HealthProfile = {
        conditions: [],
        allergies: [],
        medications: [],
        age: 35,
        fitnessLevel: 'Beginner',
        goals: ['Improve fitness']
      };
      
      setHealthProfile(defaultProfile);
      setRecommendations(generateRecommendations(defaultProfile));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadHealthProfile();
    }
  }, [user?.id]);

  const filteredRecommendations = selectedCategory === 'All' 
    ? recommendations 
    : recommendations.filter(rec => rec.category === selectedCategory);

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyStars = (difficulty: number) => {
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-500" />
              Personalized Exercise Recommendations
            </CardTitle>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {healthProfile?.fitnessLevel} Level
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Weekly Progress</span>
              </div>
              <Progress value={weeklyProgress} className="h-2" />
              <p className="text-xs text-gray-600">{Math.round(weeklyProgress)}% of WHO recommended 150 min/week</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium">Health Considerations</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {healthProfile?.conditions.slice(0, 2).map((condition, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {condition}
                  </Badge>
                ))}
                {healthProfile?.conditions.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{healthProfile.conditions.length - 2} more
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">Allergen Awareness</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {healthProfile?.allergies.slice(0, 2).map((allergy, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-amber-50">
                    {allergy}
                  </Badge>
                ))}
                {healthProfile?.allergies.length > 2 && (
                  <Badge variant="outline" className="text-xs bg-amber-50">
                    +{healthProfile.allergies.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="text-xs"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Exercise Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRecommendations.map((recommendation) => (
          <Card key={recommendation.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getIntensityColor(recommendation.intensity)}>
                      {recommendation.intensity}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {recommendation.category}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {getDifficultyStars(recommendation.difficulty)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {recommendation.duration}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700">{recommendation.description}</p>
              
              {/* Benefits */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  Benefits
                </h4>
                <div className="grid grid-cols-1 gap-1">
                  {recommendation.benefits.slice(0, 3).map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              {recommendation.equipment && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Equipment Needed</h4>
                  <div className="flex flex-wrap gap-1">
                    {recommendation.equipment.map((item, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Allergen Considerations */}
              {recommendation.allergenConsiderations && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1 text-amber-800">
                    <Shield className="w-3 h-3" />
                    Allergen Considerations
                  </h4>
                  {recommendation.allergenConsiderations.map((consideration, index) => (
                    <p key={index} className="text-xs text-amber-700">• {consideration}</p>
                  ))}
                </div>
              )}

              {/* Precautions */}
              {recommendation.precautions && recommendation.precautions.length > 0 && (
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1 text-orange-800">
                    <AlertTriangle className="w-3 h-3" />
                    Precautions
                  </h4>
                  {recommendation.precautions.map((precaution, index) => (
                    <p key={index} className="text-xs text-orange-700">• {precaution}</p>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1">
                  <Zap className="w-3 h-3 mr-1" />
                  Start Exercise
                </Button>
                <Button size="sm" variant="outline">
                  <Info className="w-3 h-3 mr-1" />
                  View Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecommendations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Recommendations Available</h3>
            <p className="text-gray-600 mb-4">
              No exercise recommendations match the selected category for your health profile.
            </p>
            <Button onClick={() => setSelectedCategory('All')}>
              View All Recommendations
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { ExerciseRecommendations };
