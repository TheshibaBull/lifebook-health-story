import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Lightbulb, 
  ArrowRight,
  Download
} from 'lucide-react';
import type { ScanResult } from '@/services/documentScanningService';

interface DocumentScanResultsProps {
  result: ScanResult;
  fileName: string;
  onSave: () => void;
  onRescan: () => void;
}

export const DocumentScanResults = ({ 
  result, 
  fileName, 
  onSave, 
  onRescan 
}: DocumentScanResultsProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const confidenceColor = result.confidence > 0.9 ? 'text-green-600' : 
                          result.confidence > 0.7 ? 'text-amber-600' : 
                          'text-red-600';
  
  const confidencePercentage = Math.round(result.confidence * 100);
  
  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Brain className="w-5 h-5 text-blue-600" />
            AI Scan Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{fileName}</span>
            </div>
            <Badge className={`${confidenceColor} bg-white`}>
              {confidencePercentage}% Confidence
            </Badge>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Document Summary</h3>
              <p className="text-blue-900 bg-white p-3 rounded-md border border-blue-200">
                {result.summary}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Key Findings</h3>
              <ul className="space-y-2">
                {result.keyFindings.map((finding, index) => (
                  <li key={index} className="flex items-start gap-2 bg-white p-2 rounded-md border border-blue-200">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span className="text-blue-900">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {Object.keys(result.criticalValues).length > 0 && (
              <div>
                <h3 className="font-medium text-blue-800 mb-2">Critical Values</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(result.criticalValues).map(([key, value], index) => (
                    <div key={index} className="bg-white p-2 rounded-md border border-blue-200">
                      <p className="text-sm text-blue-600">{key}</p>
                      <p className="font-medium text-blue-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {expanded && (
              <div>
                <h3 className="font-medium text-blue-800 mb-2">Recommendations</h3>
                <ul className="space-y-2">
                  {result.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2 bg-white p-2 rounded-md border border-blue-200">
                      <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5" />
                      <span className="text-blue-900">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <Button 
              variant="link" 
              onClick={() => setExpanded(!expanded)}
              className="text-blue-600 p-0"
            >
              {expanded ? 'Show Less' : 'Show More'}
              <ArrowRight className={`w-4 h-4 ml-1 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex gap-3">
        <Button onClick={onSave} className="flex-1">
          <CheckCircle className="w-4 h-4 mr-2" />
          Save Record
        </Button>
        <Button variant="outline" onClick={onRescan} className="flex-1">
          <Brain className="w-4 h-4 mr-2" />
          Rescan Document
        </Button>
      </div>
    </div>
  );
};