
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Brain, FileText, User, Calendar, Pill, Stethoscope, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExtractedData {
  patientName?: string;
  doctorName?: string;
  date?: string;
  diagnosis?: string[];
  medications?: Array<{ name: string; dosage: string; frequency: string }>;
  labValues?: Array<{ test: string; value: string; reference: string }>;
  recommendations?: string[];
  documentType: string;
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
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock extracted data based on file name
    const mockData: ExtractedData = {
      patientName: "John Doe",
      doctorName: "Dr. Sarah Wilson",
      date: "2024-06-08",
      documentType: "Lab Report",
      diagnosis: ["Hypertension", "Pre-diabetes"],
      medications: [
        { name: "Lisinopril", dosage: "10mg", frequency: "Once daily" },
        { name: "Metformin", dosage: "500mg", frequency: "Twice daily" }
      ],
      labValues: [
        { test: "Blood Pressure", value: "145/92", reference: "<120/80" },
        { test: "Glucose", value: "115", reference: "70-100 mg/dL" },
        { test: "HbA1c", value: "6.2%", reference: "<5.7%" }
      ],
      recommendations: [
        "Continue current medication regimen",
        "Follow up in 3 months",
        "Monitor blood pressure daily",
        "Maintain low-sodium diet"
      ]
    };

    if (fileName.toLowerCase().includes('prescription')) {
      mockData.documentType = "Prescription";
      mockData.labValues = [];
    } else if (fileName.toLowerCase().includes('x-ray') || fileName.toLowerCase().includes('scan')) {
      mockData.documentType = "Imaging Report";
      mockData.medications = [];
      mockData.labValues = [];
      mockData.diagnosis = ["Normal chest X-ray", "No acute findings"];
    }

    return mockData;
  };

  const handleProcessDocument = async () => {
    setIsProcessing(true);
    try {
      const data = await simulateAIExtraction();
      setExtractedData(data);
      toast({
        title: "Document Processed",
        description: "AI has successfully extracted information from your document",
      });
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "Failed to extract information from document",
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
        title: "Data Added",
        description: "Extracted information has been added to your health records",
      });
    }
  };

  if (isConfirmed) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Successfully Added!</h3>
          <p className="text-gray-600 mb-4">
            The extracted information has been added to your health records.
          </p>
          <Button onClick={onClose}>Continue</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="text-purple-500" />
            AI Document Reader
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
            <p className="text-sm text-gray-600">Ready for AI analysis</p>
          </div>
        </div>

        {!extractedData && !isProcessing && (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Our AI will automatically extract key information from your document including:
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-6">
              <div>• Patient information</div>
              <div>• Doctor details</div>
              <div>• Diagnosis & conditions</div>
              <div>• Medications & dosages</div>
              <div>• Lab values & results</div>
              <div>• Recommendations</div>
            </div>
            <Button onClick={handleProcessDocument} className="w-full">
              <Brain className="w-4 h-4 mr-2" />
              Process Document with AI
            </Button>
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Processing Document...</h3>
            <p className="text-gray-600">AI is analyzing and extracting information</p>
          </div>
        )}

        {extractedData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Extracted Information</h3>
              <Badge variant="outline">{extractedData.documentType}</Badge>
            </div>

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
                    <p className="text-sm text-gray-600">Doctor</p>
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

            {extractedData.diagnosis && extractedData.diagnosis.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Diagnosis</h4>
                <div className="flex flex-wrap gap-2">
                  {extractedData.diagnosis.map((diagnosis, index) => (
                    <Badge key={index} variant="secondary">{diagnosis}</Badge>
                  ))}
                </div>
              </div>
            )}

            {extractedData.medications && extractedData.medications.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  Medications
                </h4>
                <div className="space-y-2">
                  {extractedData.medications.map((med, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">{med.name}</p>
                      <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {extractedData.labValues && extractedData.labValues.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Lab Results</h4>
                <div className="space-y-2">
                  {extractedData.labValues.map((lab, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{lab.test}</span>
                      <div className="text-right">
                        <p className="font-medium">{lab.value}</p>
                        <p className="text-xs text-gray-600">Ref: {lab.reference}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {extractedData.recommendations && extractedData.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Recommendations</h4>
                <ul className="space-y-1">
                  {extractedData.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Separator />

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setExtractedData(null)} className="flex-1">
                Re-process
              </Button>
              <Button onClick={handleConfirmData} className="flex-1">
                Add to Records
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { AIDocumentReader };
