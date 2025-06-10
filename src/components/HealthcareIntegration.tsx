
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Hospital, Pill, Shield, FlaskConical, Calendar, Phone, MapPin, Clock, CheckCircle, AlertCircle, Wifi, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HealthcareProvider {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'pharmacy' | 'lab' | 'insurance';
  address: string;
  phone: string;
  status: 'connected' | 'pending' | 'disconnected';
  lastSync: Date;
  dataTypes: string[];
  integrationMethod: 'api' | 'hl7' | 'fhir' | 'manual';
}

interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  prescribedDate: string;
  pharmacy: string;
  status: 'active' | 'completed' | 'refill_needed' | 'discontinued';
  refillsRemaining: number;
  lastFilled: string;
  cost: number;
  insurance: string;
}

interface LabResult {
  id: string;
  testName: string;
  result: string;
  referenceRange: string;
  status: 'normal' | 'abnormal' | 'critical';
  orderedBy: string;
  labName: string;
  collectionDate: string;
  resultDate: string;
  category: 'blood' | 'urine' | 'imaging' | 'other';
}

interface InsuranceClaim {
  id: string;
  provider: string;
  serviceDate: string;
  description: string;
  amount: number;
  covered: number;
  patientResponsibility: number;
  status: 'approved' | 'pending' | 'denied' | 'processing';
  claimNumber: string;
}

const HealthcareIntegration = () => {
  const [providers, setProviders] = useState<HealthcareProvider[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const { toast } = useToast();

  const generateMockProviders = (): HealthcareProvider[] => {
    return [
      {
        id: '1',
        name: 'City General Hospital',
        type: 'hospital',
        address: '123 Medical Center Dr, City, ST 12345',
        phone: '(555) 123-4567',
        status: 'connected',
        lastSync: new Date(Date.now() - 3600000),
        dataTypes: ['Medical Records', 'Lab Results', 'Imaging', 'Discharge Summaries'],
        integrationMethod: 'fhir'
      },
      {
        id: '2',
        name: 'HealthPlus Pharmacy',
        type: 'pharmacy',
        address: '456 Main St, City, ST 12345',
        phone: '(555) 234-5678',
        status: 'connected',
        lastSync: new Date(Date.now() - 1800000),
        dataTypes: ['Prescriptions', 'Refill History', 'Drug Interactions'],
        integrationMethod: 'api'
      },
      {
        id: '3',
        name: 'Premier Insurance Group',
        type: 'insurance',
        address: '789 Insurance Blvd, City, ST 12345',
        phone: '(555) 345-6789',
        status: 'connected',
        lastSync: new Date(Date.now() - 7200000),
        dataTypes: ['Claims', 'Coverage Details', 'Deductibles', 'Pre-authorizations'],
        integrationMethod: 'api'
      },
      {
        id: '4',
        name: 'MedLab Diagnostics',
        type: 'lab',
        address: '321 Lab Way, City, ST 12345',
        phone: '(555) 456-7890',
        status: 'pending',
        lastSync: new Date(Date.now() - 86400000),
        dataTypes: ['Blood Tests', 'Urine Analysis', 'Pathology Reports'],
        integrationMethod: 'hl7'
      }
    ];
  };

  const generateMockPrescriptions = (): Prescription[] => {
    return [
      {
        id: '1',
        medication: 'Lisinopril 10mg',
        dosage: '10mg',
        frequency: 'Once daily',
        prescribedDate: '2024-01-15',
        pharmacy: 'HealthPlus Pharmacy',
        status: 'active',
        refillsRemaining: 4,
        lastFilled: '2024-01-15',
        cost: 25.50,
        insurance: 'Premier Insurance Group'
      },
      {
        id: '2',
        medication: 'Metformin 500mg',
        dosage: '500mg',
        frequency: 'Twice daily',
        prescribedDate: '2024-01-10',
        pharmacy: 'HealthPlus Pharmacy',
        status: 'refill_needed',
        refillsRemaining: 1,
        lastFilled: '2024-01-10',
        cost: 15.75,
        insurance: 'Premier Insurance Group'
      },
      {
        id: '3',
        medication: 'Ibuprofen 400mg',
        dosage: '400mg',
        frequency: 'As needed',
        prescribedDate: '2024-01-05',
        pharmacy: 'HealthPlus Pharmacy',
        status: 'completed',
        refillsRemaining: 0,
        lastFilled: '2024-01-05',
        cost: 8.25,
        insurance: 'Premier Insurance Group'
      }
    ];
  };

  const generateMockLabResults = (): LabResult[] => {
    return [
      {
        id: '1',
        testName: 'Complete Blood Count (CBC)',
        result: 'WBC: 6.8, RBC: 4.5, Hemoglobin: 14.2, Hematocrit: 42%',
        referenceRange: 'WBC: 4.0-11.0, RBC: 4.2-5.4, Hgb: 12.0-16.0, Hct: 36-46%',
        status: 'normal',
        orderedBy: 'Dr. Sarah Johnson',
        labName: 'MedLab Diagnostics',
        collectionDate: '2024-01-20',
        resultDate: '2024-01-21',
        category: 'blood'
      },
      {
        id: '2',
        testName: 'Lipid Panel',
        result: 'Total Cholesterol: 205, LDL: 130, HDL: 45, Triglycerides: 150',
        referenceRange: 'TC: <200, LDL: <100, HDL: >40, TG: <150',
        status: 'abnormal',
        orderedBy: 'Dr. Michael Smith',
        labName: 'MedLab Diagnostics',
        collectionDate: '2024-01-18',
        resultDate: '2024-01-19',
        category: 'blood'
      },
      {
        id: '3',
        testName: 'Thyroid Function (TSH)',
        result: 'TSH: 2.1 mIU/L',
        referenceRange: '0.4-4.0 mIU/L',
        status: 'normal',
        orderedBy: 'Dr. Sarah Johnson',
        labName: 'MedLab Diagnostics',
        collectionDate: '2024-01-15',
        resultDate: '2024-01-16',
        category: 'blood'
      }
    ];
  };

  const generateMockClaims = (): InsuranceClaim[] => {
    return [
      {
        id: '1',
        provider: 'City General Hospital',
        serviceDate: '2024-01-15',
        description: 'Annual Physical Examination',
        amount: 350.00,
        covered: 280.00,
        patientResponsibility: 70.00,
        status: 'approved',
        claimNumber: 'CLM-2024-001234'
      },
      {
        id: '2',
        provider: 'MedLab Diagnostics',
        serviceDate: '2024-01-20',
        description: 'Blood Work - CBC and Lipid Panel',
        amount: 125.00,
        covered: 100.00,
        patientResponsibility: 25.00,
        status: 'processing',
        claimNumber: 'CLM-2024-001567'
      },
      {
        id: '3',
        provider: 'HealthPlus Pharmacy',
        serviceDate: '2024-01-15',
        description: 'Prescription Medications',
        amount: 89.50,
        covered: 71.60,
        patientResponsibility: 17.90,
        status: 'approved',
        claimNumber: 'CLM-2024-001890'
      }
    ];
  };

  const connectProvider = async (providerId: string) => {
    setIsConnecting(true);
    try {
      // Simulate API connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setProviders(prev => prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, status: 'connected', lastSync: new Date() }
          : provider
      ));

      toast({
        title: "Provider Connected",
        description: "Successfully connected to healthcare provider",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to provider. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const syncProviderData = async (providerId: string) => {
    try {
      // Simulate data sync
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setProviders(prev => prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, lastSync: new Date() }
          : provider
      ));

      toast({
        title: "Data Synced",
        description: "Latest health data has been synchronized",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Unable to sync data. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    setProviders(generateMockProviders());
    setPrescriptions(generateMockPrescriptions());
    setLabResults(generateMockLabResults());
    setClaims(generateMockClaims());
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-50 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'approved': return 'bg-green-50 text-green-700 border-green-200';
      case 'processing': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'refill_needed': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'normal': return 'bg-green-50 text-green-700 border-green-200';
      case 'abnormal': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'hospital': return Hospital;
      case 'pharmacy': return Pill;
      case 'insurance': return Shield;
      case 'lab': return FlaskConical;
      default: return Hospital;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="providers" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="labs">Lab Results</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="text-blue-500" />
                Healthcare Provider Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers.map((provider) => {
                  const IconComponent = getProviderIcon(provider.type);
                  return (
                    <div key={provider.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-8 h-8 text-blue-500" />
                          <div>
                            <h3 className="font-semibold">{provider.name}</h3>
                            <p className="text-sm text-gray-600 capitalize">{provider.type}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(provider.status)}>
                          {provider.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {provider.address}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {provider.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Last sync: {provider.lastSync.toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-1">Data Types:</p>
                        <div className="flex flex-wrap gap-1">
                          {provider.dataTypes.map((type, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        {provider.status === 'connected' ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => syncProviderData(provider.id)}
                          >
                            Sync Data
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => connectProvider(provider.id)}
                            disabled={isConnecting}
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="text-green-500" />
                Prescription Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{prescription.medication}</h3>
                        <p className="text-sm text-gray-600">
                          {prescription.dosage} - {prescription.frequency}
                        </p>
                      </div>
                      <Badge className={getStatusColor(prescription.status)}>
                        {prescription.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Prescribed</p>
                        <p className="text-gray-600">{prescription.prescribedDate}</p>
                      </div>
                      <div>
                        <p className="font-medium">Pharmacy</p>
                        <p className="text-gray-600">{prescription.pharmacy}</p>
                      </div>
                      <div>
                        <p className="font-medium">Refills Left</p>
                        <p className="text-gray-600">{prescription.refillsRemaining}</p>
                      </div>
                      <div>
                        <p className="font-medium">Cost</p>
                        <p className="text-gray-600">${prescription.cost}</p>
                      </div>
                    </div>
                    
                    {prescription.status === 'refill_needed' && (
                      <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded">
                        <p className="text-sm text-amber-800">Refill needed - Contact pharmacy</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="text-purple-500" />
                Laboratory Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {labResults.map((result) => (
                  <div key={result.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{result.testName}</h3>
                        <p className="text-sm text-gray-600">Ordered by {result.orderedBy}</p>
                      </div>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="font-medium">Results:</p>
                        <p className="text-gray-700">{result.result}</p>
                      </div>
                      <div>
                        <p className="font-medium">Reference Range:</p>
                        <p className="text-gray-600">{result.referenceRange}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium">Collection Date</p>
                          <p className="text-gray-600">{result.collectionDate}</p>
                        </div>
                        <div>
                          <p className="font-medium">Lab</p>
                          <p className="text-gray-600">{result.labName}</p>
                        </div>
                      </div>
                    </div>
                    
                    {result.status === 'abnormal' && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-800">Abnormal result - Follow up with your doctor</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insurance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="text-blue-500" />
                Insurance Claims & Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {claims.map((claim) => (
                  <div key={claim.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{claim.description}</h3>
                        <p className="text-sm text-gray-600">{claim.provider}</p>
                      </div>
                      <Badge className={getStatusColor(claim.status)}>
                        {claim.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Service Date</p>
                        <p className="text-gray-600">{claim.serviceDate}</p>
                      </div>
                      <div>
                        <p className="font-medium">Total Amount</p>
                        <p className="text-gray-600">${claim.amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="font-medium">Insurance Covered</p>
                        <p className="text-green-600">${claim.covered.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="font-medium">Your Responsibility</p>
                        <p className="text-red-600">${claim.patientResponsibility.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      Claim Number: {claim.claimNumber}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { HealthcareIntegration };
