import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Brain, FileText, User, Calendar, Pill, Stethoscope, CheckCircle, X, AlertTriangle, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MedicalInsight {
  type: 'critical' | 'warning' | 'info' | 'positive';
  title: string;
  description: string;
  recommendation?: string;
}

interface ExtractedData {
  patientName?: string;
  doctorName?: string;
  date?: string;
  diagnosis?: string[];
  medications?: Array<{ name: string; dosage: string; frequency: string; interactions?: string[] }>;
  labValues?: Array<{ test: string; value: string; reference: string; status: 'normal' | 'abnormal' | 'critical' }>;
  recommendations?: string[];
  documentType: string;
  medicalInsights?: MedicalInsight[];
  riskFactors?: string[];
  followUpRequired?: boolean;
}

interface AIDocumentReaderProps {
  fileName: string;
  onExtractedData: (data: ExtractedData) => void;
  onClose: () => void;
}

const AIDocumentReader = ({ fileName, onExtractedData, onClose }: AIDocumentReaderProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { toast } = useToast();

  const simulateAIExtraction = async (): Promise<ExtractedData> => {
    // Simulate comprehensive AI medical analysis
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    const mockData: ExtractedData = {
      patientName: "John Doe",
      doctorName: "Dr. Sarah Wilson, MD",
      date: "2024-06-08",
      documentType: "Comprehensive Lab Report",
      diagnosis: ["Hypertension Stage 1", "Pre-diabetes", "Vitamin D Deficiency"],
      medications: [
        { 
          name: "Lisinopril", 
          dosage: "10mg", 
          frequency: "Once daily",
          interactions: ["Avoid NSAIDs", "Monitor potassium levels"]
        },
        { 
          name: "Metformin", 
          dosage: "500mg", 
          frequency: "Twice daily with meals",
          interactions: ["Take with food", "Monitor kidney function"]
        }
      ],
      labValues: [
        { test: "Systolic BP", value: "145", reference: "<120", status: "abnormal" },
        { test: "Diastolic BP", value: "92", reference: "<80", status: "abnormal" },
        { test: "Fasting Glucose", value: "115", reference: "70-100 mg/dL", status: "abnormal" },
        { test: "HbA1c", value: "6.2%", reference: "<5.7%", status: "abnormal" },
        { test: "Total Cholesterol", value: "220", reference: "<200 mg/dL", status: "abnormal" },
        { test: "HDL Cholesterol", value: "38", reference: ">40 mg/dL", status: "abnormal" },
        { test: "LDL Cholesterol", value: "155", reference: "<100 mg/dL", status: "abnormal" },
        { test: "Vitamin D", value: "18", reference: "30-100 ng/mL", status: "critical" },
        { test: "Creatinine", value: "1.1", reference: "0.7-1.3 mg/dL", status: "normal" }
      ],
      recommendations: [
        "Increase Lisinopril to 20mg daily if BP remains elevated",
        "Continue Metformin, monitor for GI side effects",
        "Start Vitamin D3 supplementation 2000 IU daily",
        "Lifestyle modifications: low-sodium diet, regular exercise",
        "Follow up in 3 months for medication adjustment",
        "Consider statin therapy for cholesterol management"
      ],
      medicalInsights: [
        {
          type: "critical",
          title: "Severe Vitamin D Deficiency",
          description: "Level of 18 ng/mL indicates severe deficiency, associated with bone health risks and immune dysfunction.",
          recommendation: "Immediate high-dose supplementation required"
        },
        {
          type: "warning",
          title: "Cardiovascular Risk Cluster",
          description: "Combination of hypertension, pre-diabetes, and dyslipidemia significantly increases cardiovascular risk.",
          recommendation: "Aggressive lifestyle modification and possible additional medications"
        },
        {
          type: "warning",
          title: "Diabetes Progression Risk",
          description: "HbA1c of 6.2% indicates high risk of progression to Type 2 diabetes within 2 years.",
          recommendation: "Enhanced dietary counseling and weight management"
        },
        {
          type: "info",
          title: "Medication Effectiveness",
          description: "Current Metformin dose appears appropriate for glucose control, but BP medication may need adjustment.",
          recommendation: "Monitor for side effects and efficacy"
        },
        {
          type: "positive",
          title: "Kidney Function Preserved",
          description: "Normal creatinine levels indicate good kidney function despite diabetes risk factors.",
          recommendation: "Continue current monitoring schedule"
        }
      ],
      riskFactors: [
        "Family history of diabetes and heart disease",
        "Sedentary lifestyle",
        "High-sodium diet",
        "Stress-related eating patterns",
        "Insufficient vitamin D exposure"
      ],
      followUpRequired: true
    };

    // Adjust data based on filename
    if (fileName.toLowerCase().includes('prescription')) {
      mockData.documentType = "Prescription Analysis";
      mockData.labValues = [];
      mockData.medicalInsights = [
        {
          type: "info",
          title: "Drug Interaction Check",
          description: "No significant interactions detected between prescribed medications.",
          recommendation: "Continue as prescribed"
        }
      ];
    } else if (fileName.toLowerCase().includes('x-ray') || fileName.toLowerCase().includes('scan')) {
      mockData.documentType = "Imaging Report Analysis";
      mockData.medications = [];
      mockData.labValues = [];
      mockData.diagnosis = ["Normal chest X-ray", "No acute cardiopulmonary findings"];
      mockData.medicalInsights = [
        {
          type: "positive",
          title: "Clear Imaging Results",
          description: "No evidence of pneumonia, fluid accumulation, or structural abnormalities.",
          recommendation: "Routine follow-up as clinically indicated"
        }
      ];
    }

    return mockData;
  };

  const handleProcessDocument = async () => {
    setIsProcessing(true);
    try {
      const data = await simulateAIExtraction();
      setExtractedData(data);
      toast({
        title: "Advanced Analysis Complete",
        description: "AI has performed comprehensive medical analysis of your document",
      });
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "Failed to extract and analyze medical information",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmData = () => {
    if (extractedData) {
      onExtractedData(extractedData);
      setIsConfirmed(true);
      toast({
        title: "Medical Data Added",
        description: "Comprehensive analysis has been added to your health records with AI insights",
      });
    }
  };

  if (isConfirmed) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analysis Complete!</h3>
          <p className="text-gray-600 mb-4">
            Medical information and AI insights have been added to your health records.
          </p>
          <Button onClick={onClose}>Continue</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="text-purple-500" />
            AI Medical Document Analyzer
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <FileText className="w-5 h-5 text-blue-500" />
          <div>
            <p className="font-medium">{fileName}</p>
            <p className="text-sm text-gray-600">Ready for comprehensive AI medical analysis</p>
          </div>
        </div>

        {!extractedData && !isProcessing && (
          <div className="text-center">
            <div className="mb-6">
              <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Advanced Medical Analysis</h3>
              <p className="text-gray-600 mb-4">
                Our AI will perform comprehensive medical analysis including:
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
              <div className="space-y-2">
                <div>• Medical information extraction</div>
                <div>• Drug interaction analysis</div>
                <div>• Lab value interpretation</div>
                <div>• Risk factor identification</div>
              </div>
              <div className="space-y-2">
                <div>• Clinical insights generation</div>
                <div>• Trend analysis</div>
                <div>• Recommendation synthesis</div>
                <div>• Follow-up guidance</div>
              </div>
            </div>
            <Button onClick={handleProcessDocument} className="w-full">
              <Brain className="w-4 h-4 mr-2" />
              Start Comprehensive Analysis
            </Button>
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Analyzing Medical Document...</h3>
            <p className="text-gray-600">AI is performing comprehensive medical analysis</p>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p>• Extracting medical information...</p>
              <p>• Analyzing lab values and trends...</p>
              <p>• Checking drug interactions...</p>
              <p>• Generating clinical insights...</p>
            </div>
          </div>
        )}

        {extractedData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Medical Analysis Results</h3>
              <Badge variant="outline">{extractedData.documentType}</Badge>
            </div>

            {/* AI Medical Insights */}
            {extractedData.medicalInsights && extractedData.medicalInsights.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI Medical Insights
                </h4>
                <div className="space-y-3">
                  {extractedData.medicalInsights.map((insight, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${
                      insight.type === 'critical' ? 'border-red-500 bg-red-50' :
                      insight.type === 'warning' ? 'border-amber-500 bg-amber-50' :
                      insight.type === 'positive' ? 'border-green-500 bg-green-50' :
                      'border-blue-500 bg-blue-50'
                    }`}>
                      <div className="flex items-start gap-3">
                        {insight.type === 'critical' && <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />}
                        {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />}
                        {insight.type === 'positive' && <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />}
                        {insight.type === 'info' && <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5" />}
                        <div className="flex-1">
                          <h5 className="font-medium text-sm mb-1">{insight.title}</h5>
                          <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                          {insight.recommendation && (
                            <p className="text-sm font-medium text-gray-800">
                              Recommendation: {insight.recommendation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Patient Information */}
            <div className="grid gap-4">
              {extractedData.patientName && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Patient</p>
                    <p className="font-medium">{extractedData.patientName}</p>
                  </div>
                </div>
              )}

              {extractedData.doctorName && (
                <div className="flex items-center gap-3">
                  <Stethoscope className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Healthcare Provider</p>
                    <p className="font-medium">{extractedData.doctorName}</p>
                  </div>
                </div>
              )}

              {extractedData.date && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">{new Date(extractedData.date).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Diagnosis */}
            {extractedData.diagnosis && extractedData.diagnosis.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Medical Conditions</h4>
                <div className="flex flex-wrap gap-2">
                  {extractedData.diagnosis.map((diagnosis, index) => (
                    <Badge key={index} variant="secondary">{diagnosis}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Lab Results with Status */}
            {extractedData.labValues && extractedData.labValues.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Laboratory Results</h4>
                <div className="space-y-2">
                  {extractedData.labValues.map((lab, index) => (
                    <div key={index} className={`flex justify-between items-center p-3 rounded-lg border ${
                      lab.status === 'critical' ? 'border-red-200 bg-red-50' :
                      lab.status === 'abnormal' ? 'border-amber-200 bg-amber-50' :
                      'border-green-200 bg-green-50'
                    }`}>
                      <span className="font-medium">{lab.test}</span>
                      <div className="text-right flex items-center gap-2">
                        <div>
                          <p className="font-medium">{lab.value}</p>
                          <p className="text-xs text-gray-600">Ref: {lab.reference}</p>
                        </div>
                        <Badge variant={
                          lab.status === 'critical' ? 'destructive' :
                          lab.status === 'abnormal' ? 'default' :
                          'secondary'
                        } className="text-xs">
                          {lab.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Medications with Interactions */}
            {extractedData.medications && extractedData.medications.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  Medications & Interactions
                </h4>
                <div className="space-y-3">
                  {extractedData.medications.map((med, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{med.name}</p>
                          <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
                        </div>
                      </div>
                      {med.interactions && med.interactions.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-700 mb-1">Important Notes:</p>
                          <div className="flex flex-wrap gap-1">
                            {med.interactions.map((interaction, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {interaction}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Factors */}
            {extractedData.riskFactors && extractedData.riskFactors.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Identified Risk Factors</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {extractedData.riskFactors.map((risk, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-amber-50 rounded border border-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="text-sm">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {extractedData.recommendations && extractedData.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Clinical Recommendations</h4>
                <ul className="space-y-2">
                  {extractedData.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2 p-2 bg-blue-50 rounded">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Follow-up Alert */}
            {extractedData.followUpRequired && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <span className="font-medium text-amber-800">Follow-up Required</span>
                </div>
                <p className="text-sm text-amber-700">
                  Based on the analysis, follow-up care is recommended. Please schedule appropriate appointments.
                </p>
              </div>
            )}

            <Separator />

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setExtractedData(null)} className="flex-1">
                Re-analyze Document
              </Button>
              <Button onClick={handleConfirmData} className="flex-1">
                Add to Health Records
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { AIDocumentReader };
