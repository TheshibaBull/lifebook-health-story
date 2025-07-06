
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, TestTube, Clock, MapPin, User, Phone, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AppLayout } from '@/components/AppLayout';
import { toast } from '@/hooks/use-toast';

interface LabTest {
  id: string;
  name: string;
  description: string;
  price: number;
  fasting: boolean;
  duration: string;
  category: string;
}

const BookTest = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientAge, setPatientAge] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const labTests: LabTest[] = [
    {
      id: '1',
      name: 'Complete Blood Count (CBC)',
      description: 'Comprehensive blood analysis including RBC, WBC, platelets',
      price: 45,
      fasting: false,
      duration: '2-4 hours',
      category: 'Blood Tests'
    },
    {
      id: '2',
      name: 'Lipid Profile',
      description: 'Cholesterol and triglyceride levels',
      price: 60,
      fasting: true,
      duration: '4-6 hours',
      category: 'Blood Tests'
    },
    {
      id: '3',
      name: 'Thyroid Function Test (TSH, T3, T4)',
      description: 'Complete thyroid hormone analysis',
      price: 85,
      fasting: false,
      duration: '6-8 hours',
      category: 'Hormone Tests'
    },
    {
      id: '4',
      name: 'HbA1c (Diabetes)',
      description: 'Average blood sugar levels over 3 months',
      price: 40,
      fasting: false,
      duration: '2-4 hours',
      category: 'Diabetes'
    },
    {
      id: '5',
      name: 'Liver Function Test (LFT)',
      description: 'Complete liver enzyme and function analysis',
      price: 55,
      fasting: true,
      duration: '4-6 hours',
      category: 'Organ Function'
    },
    {
      id: '6',
      name: 'Kidney Function Test (KFT)',
      description: 'Creatinine, BUN, and kidney health markers',
      price: 50,
      fasting: false,
      duration: '4-6 hours',
      category: 'Organ Function'
    },
    {
      id: '7',
      name: 'Vitamin D Test',
      description: 'Vitamin D3 levels assessment',
      price: 70,
      fasting: false,
      duration: '24-48 hours',
      category: 'Vitamins'
    },
    {
      id: '8',
      name: 'Full Body Checkup',
      description: 'Comprehensive health screening package',
      price: 250,
      fasting: true,
      duration: '24-48 hours',
      category: 'Packages'
    }
  ];

  const locations = [
    'LifeLab - Downtown Medical Center',
    'HealthCheck Labs - Mall Road',
    'Diagnostic Plus - City Hospital',
    'MedTest Center - Park Avenue',
    'QuickLab - Main Street',
  ];

  const timeSlots = [
    '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM',
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  ];

  const handleTestSelection = (testId: string, checked: boolean) => {
    if (checked) {
      setSelectedTests([...selectedTests, testId]);
    } else {
      setSelectedTests(selectedTests.filter(id => id !== testId));
    }
  };

  const calculateTotal = () => {
    return selectedTests
      .map(testId => labTests.find(test => test.id === testId)?.price || 0)
      .reduce((total, price) => total + price, 0);
  };

  const getSelectedTestsDetails = () => {
    return selectedTests.map(testId => labTests.find(test => test.id === testId)).filter(Boolean);
  };

  const requiresFasting = () => {
    return getSelectedTestsDetails().some(test => test?.fasting);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !selectedLocation || selectedTests.length === 0 || !patientName || !patientPhone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select at least one test.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Test Booking Confirmed!",
        description: `Your lab tests have been scheduled for ${format(selectedDate, 'PPP')} at ${selectedTime}.`,
      });

      // Reset form
      setSelectedDate(undefined);
      setSelectedTime('');
      setSelectedLocation('');
      setSelectedTests([]);
      setPatientName('');
      setPatientPhone('');
      setPatientAge('');
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to book tests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupedTests = labTests.reduce((acc, test) => {
    if (!acc[test.category]) {
      acc[test.category] = [];
    }
    acc[test.category].push(test);
    return acc;
  }, {} as Record<string, LabTest[]>);

  return (
    <AppLayout title="Book Lab Tests">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Book Lab Tests</h1>
          <p className="text-gray-600 mt-2">Schedule your diagnostic tests with ease</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Test Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5" />
                  Select Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(groupedTests).map(([category, tests]) => (
                    <div key={category}>
                      <h3 className="font-semibold text-lg mb-3 text-blue-700">{category}</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {tests.map((test) => (
                          <div
                            key={test.id}
                            className={cn(
                              "border rounded-lg p-4 cursor-pointer transition-colors",
                              selectedTests.includes(test.id)
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            )}
                            onClick={() => handleTestSelection(test.id, !selectedTests.includes(test.id))}
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={selectedTests.includes(test.id)}
                                onChange={(checked) => handleTestSelection(test.id, checked)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium">{test.name}</h4>
                                  <span className="font-semibold text-green-600">${test.price}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                                <div className="flex flex-wrap gap-2">
                                  {test.fasting && (
                                    <Badge variant="secondary" className="text-xs">
                                      Fasting Required
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {test.duration}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Patient Information */}
                  <div className="space-y-2">
                    <Label htmlFor="patientName" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Patient Name *
                    </Label>
                    <Input
                      id="patientName"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Enter patient name"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="patientPhone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone *
                      </Label>
                      <Input
                        id="patientPhone"
                        type="tel"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="Phone number"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="patientAge">Age</Label>
                      <Input
                        id="patientAge"
                        type="number"
                        value={patientAge}
                        onChange={(e) => setPatientAge(e.target.value)}
                        placeholder="Age"
                      />
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-2">
                    <Label>Test Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date() || date.getDay() === 0}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time Selection */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Time Slot *
                    </Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location Selection */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Lab Location *
                    </Label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Special Instructions */}
                  {requiresFasting() && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800 font-medium">
                        ⚠️ Fasting Required
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Please fast for 8-12 hours before your test
                      </p>
                    </div>
                  )}

                  {/* Order Summary */}
                  {selectedTests.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Selected Tests:</h4>
                      <div className="space-y-1 mb-3">
                        {getSelectedTestsDetails().map((test) => (
                          test && (
                            <div key={test.id} className="flex justify-between text-sm">
                              <span>{test.name}</span>
                              <span>${test.price}</span>
                            </div>
                          )
                        ))}
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span className="text-green-600">${calculateTotal()}</span>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting || selectedTests.length === 0}
                  >
                    {isSubmitting ? 'Booking...' : `Book Tests ($${calculateTotal()})`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default BookTest;
