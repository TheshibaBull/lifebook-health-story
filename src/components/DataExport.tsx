
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Database, Calendar, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DataExport = () => {
  const [exportFormat, setExportFormat] = useState<string>('');
  const [exportType, setExportType] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportOptions = [
    { value: 'complete', label: 'Complete Health History', description: 'All records, timeline, and family data' },
    { value: 'timeline', label: 'Health Timeline Only', description: 'Chronological health events' },
    { value: 'records', label: 'Medical Records Only', description: 'Uploaded documents and reports' },
    { value: 'family', label: 'Family Health Data', description: 'Family member health information' },
    { value: 'emergency', label: 'Emergency Information', description: 'Critical health data for emergencies' }
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document', icon: FileText, description: 'Formatted document ready for printing' },
    { value: 'csv', label: 'CSV Spreadsheet', icon: Database, description: 'Data in spreadsheet format' },
    { value: 'json', label: 'JSON Data', icon: FileText, description: 'Raw data for developers' }
  ];

  const handleExport = async () => {
    if (!exportFormat || !exportType) {
      toast({
        title: "Missing Selection",
        description: "Please select both export type and format",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create mock data based on selection
      const mockData = generateMockData(exportType, exportFormat);
      
      if (exportFormat === 'pdf') {
        downloadPDF(mockData, exportType);
      } else if (exportFormat === 'csv') {
        downloadCSV(mockData, exportType);
      } else {
        downloadJSON(mockData, exportType);
      }
      
      toast({
        title: "Export Successful",
        description: `Your ${exportType} data has been exported as ${exportFormat.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const generateMockData = (type: string, format: string) => {
    const baseData = {
      exportDate: new Date().toISOString(),
      patientName: "John Doe",
      patientId: "LB001",
      exportType: type,
      format: format
    };

    switch (type) {
      case 'complete':
        return {
          ...baseData,
          timeline: [
            { date: '2024-04-15', event: 'Hypertension Diagnosis', type: 'diagnosis' },
            { date: '2024-04-10', event: 'Knee Surgery', type: 'surgery' }
          ],
          records: [
            { name: 'Blood Test Report', date: '2024-01-15', type: 'Lab Report' },
            { name: 'X-Ray Chest', date: '2024-01-05', type: 'Imaging' }
          ],
          family: [
            { name: 'Jane Doe', relation: 'Spouse', healthStatus: 'Good' }
          ]
        };
      case 'timeline':
        return {
          ...baseData,
          events: [
            { date: '2024-04-15', event: 'Hypertension Diagnosis', type: 'diagnosis' },
            { date: '2024-04-10', event: 'Knee Surgery', type: 'surgery' }
          ]
        };
      default:
        return baseData;
    }
  };

  const downloadPDF = (data: any, type: string) => {
    const content = `
      LIFEBOOK HEALTH EXPORT
      =====================
      
      Patient: ${data.patientName}
      Export Date: ${new Date(data.exportDate).toLocaleDateString()}
      Export Type: ${type}
      
      ${JSON.stringify(data, null, 2)}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifebook-${type}-export.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = (data: any, type: string) => {
    let csvContent = '';
    
    if (type === 'timeline' && data.events) {
      csvContent = 'Date,Event,Type\n';
      data.events.forEach((event: any) => {
        csvContent += `${event.date},${event.event},${event.type}\n`;
      });
    } else {
      csvContent = 'Field,Value\n';
      Object.entries(data).forEach(([key, value]) => {
        csvContent += `${key},${typeof value === 'object' ? JSON.stringify(value) : value}\n`;
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifebook-${type}-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = (data: any, type: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifebook-${type}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="text-blue-500" />
          Export Health Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">What would you like to export?</label>
          <Select value={exportType} onValueChange={setExportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select data to export" />
            </SelectTrigger>
            <SelectContent>
              {exportOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Export Format</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {formatOptions.map((format) => {
              const Icon = format.icon;
              return (
                <div
                  key={format.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    exportFormat === format.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setExportFormat(format.value)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{format.label}</span>
                  </div>
                  <p className="text-xs text-gray-600">{format.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Badge variant="outline">HIPAA Compliant</Badge>
            <Badge variant="outline">Encrypted</Badge>
          </div>
          <Button 
            onClick={handleExport} 
            disabled={!exportFormat || !exportType || isExporting}
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Data
              </>
            )}
          </Button>
        </div>

        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <strong>Note:</strong> Exported data includes all selected health information and is suitable for sharing with healthcare providers, insurance companies, or for personal backup purposes.
        </div>
      </CardContent>
    </Card>
  );
};

export { DataExport };
