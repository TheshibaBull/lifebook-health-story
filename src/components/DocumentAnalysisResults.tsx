
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Heart, 
  Pill, 
  Calendar, 
  Ruler, 
  User, 
  AlertCircle, 
  CheckCircle,
  Lightbulb
} from 'lucide-react';

interface ProcessingResult {
  text: string;
  confidence: number;
  entities: {
    medications: string[];
    conditions: string[];
    dates: string[];
    measurements: string[];
    providers: string[];
  };
  category: string;
  tags: string[];
}

interface DocumentAnalysisResultsProps {
  result: ProcessingResult;
  fileName: string;
}

export const DocumentAnalysisResults = ({ result, fileName }: DocumentAnalysisResultsProps) => {
  const generateSummary = () => {
    const { entities, category, text } = result;
    let summary = `This ${category.toLowerCase()} document`;
    
    if (entities.medications.length > 0) {
      summary += ` mentions ${entities.medications.length} medication${entities.medications.length > 1 ? 's' : ''}`;
    }
    
    if (entities.conditions.length > 0) {
      summary += ` and references ${entities.conditions.length} medical condition${entities.conditions.length > 1 ? 's' : ''}`;
    }
    
    if (entities.measurements.length > 0) {
      summary += ` with ${entities.measurements.length} measurement${entities.measurements.length > 1 ? 's' : ''} recorded`;
    }
    
    summary += '.';
    return summary;
  };

  const generateSuggestions = () => {
    const suggestions = [];
    const { entities, category } = result;
    
    if (category === 'Lab Results' && entities.measurements.length > 0) {
      suggestions.push('Track these values over time to monitor trends');
      suggestions.push('Discuss any abnormal values with your healthcare provider');
    }
    
    if (entities.medications.length > 0) {
      suggestions.push('Add medications to your medication tracker');
      suggestions.push('Set reminders for medication schedules');
    }
    
    if (entities.conditions.length > 0) {
      suggestions.push('Update your medical history with new conditions');
      suggestions.push('Research reliable information about your conditions');
    }
    
    if (category === 'Visit Notes') {
      suggestions.push('Schedule follow-up appointments as recommended');
      suggestions.push('Share this information with family members if needed');
    }
    
    suggestions.push('Store this document in the appropriate category');
    suggestions.push('Share with other healthcare providers when relevant');
    
    return suggestions;
  };

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Document Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">File:</span>
              <span className="font-medium">{fileName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Category:</span>
              <Badge variant="outline">{result.category}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Confidence:</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{Math.round(result.confidence * 100)}%</span>
              </div>
            </div>
            <Separator />
            <p className="text-gray-700">{generateSummary()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Extracted Information */}
      <Card>
        <CardHeader>
          <CardTitle>Extracted Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.entities.medications.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-orange-600" />
                  <span className="font-medium">Medications</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {result.entities.medications.map((med, index) => (
                    <Badge key={index} variant="secondary">{med}</Badge>
                  ))}
                </div>
              </div>
            )}

            {result.entities.conditions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-600" />
                  <span className="font-medium">Conditions</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {result.entities.conditions.map((condition, index) => (
                    <Badge key={index} variant="secondary">{condition}</Badge>
                  ))}
                </div>
              </div>
            )}

            {result.entities.measurements.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Measurements</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {result.entities.measurements.map((measurement, index) => (
                    <Badge key={index} variant="secondary">{measurement}</Badge>
                  ))}
                </div>
              </div>
            )}

            {result.entities.dates.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Dates</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {result.entities.dates.map((date, index) => (
                    <Badge key={index} variant="secondary">{date}</Badge>
                  ))}
                </div>
              </div>
            )}

            {result.entities.providers.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">Healthcare Providers</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {result.entities.providers.map((provider, index) => (
                    <Badge key={index} variant="secondary">{provider}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {result.tags.length > 0 && (
            <div className="mt-6 space-y-2">
              <span className="font-medium">Tags</span>
              <div className="flex flex-wrap gap-1">
                {result.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            AI Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {generateSuggestions().map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{suggestion}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Extracted Text (if available) */}
      {result.text && (
        <Card>
          <CardHeader>
            <CardTitle>Extracted Text</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{result.text}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
