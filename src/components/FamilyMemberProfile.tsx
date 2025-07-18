import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { User, FileText, Calendar, Shield, Edit3, Phone, Mail, Plus, X } from 'lucide-react';
import { AllergiesSelector } from '@/components/AllergiesSelector';

import type { Tables } from '@/integrations/supabase/types';

type FamilyMember = Tables<'family_members'>;

interface FamilyMemberProfileProps {
  member: FamilyMember;
  onUpdateMember: (member: FamilyMember) => Promise<void>;
  onClose: () => void;
}

const FamilyMemberProfile = ({ member, onUpdateMember, onClose }: FamilyMemberProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMember, setEditedMember] = useState<FamilyMember>(member);
  const [newCondition, setNewCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      await onUpdateMember(editedMember);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Family member profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update family member profile.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setEditedMember(member);
    setIsEditing(false);
  };

  const addMedicalCondition = () => {
    if (newCondition.trim()) {
      setEditedMember(prev => ({
        ...prev,
        medical_conditions: [...(prev.medical_conditions || []), newCondition.trim()]
      }));
      setNewCondition('');
    }
  };

  const removeMedicalCondition = (index: number) => {
    setEditedMember(prev => ({
      ...prev,
      medical_conditions: prev.medical_conditions?.filter((_, i) => i !== index)
    }));
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setEditedMember(prev => ({
        ...prev,
        allergies: [...(prev.allergies || []), newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    setEditedMember(prev => ({
      ...prev,
      allergies: prev.allergies?.filter((_, i) => i !== index)
    }));
  };

  const addMedication = () => {
    if (newMedication.trim()) {
      setEditedMember(prev => ({
        ...prev,
        medications: [...(prev.medications || []), newMedication.trim()]
      }));
      setNewMedication('');
    }
  };

  const removeMedication = (index: number) => {
    setEditedMember(prev => ({
      ...prev,
      medications: prev.medications?.filter((_, i) => i !== index)
    }));
  };

  const recentRecords = [
    { id: '1', type: 'Lab Report', date: '2024-01-15', doctor: 'Dr. Smith' },
    { id: '2', type: 'Prescription', date: '2024-01-10', doctor: 'Dr. Johnson' },
    { id: '3', type: 'Checkup', date: '2024-01-05', doctor: 'Dr. Wilson' }
  ];

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'full': return 'bg-green-100 text-green-800';
      case 'limited': return 'bg-yellow-100 text-yellow-800';
      case 'view-only': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-blue-500 text-white text-xl">
                  {member.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{member.name}</h2>
                <p className="text-gray-600">{member.relation}</p>
                <Badge className={getAccessLevelColor(member.access_level || 'view-only')}>
                  {(member.access_level || 'view-only').replace('-', ' ')} access
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} size="sm">
                    Save Changes
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="access">Access</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Name</Label>
                  {isEditing ? (
                    <Input
                      value={editedMember.name}
                      onChange={(e) => setEditedMember(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm mt-1">{member.name}</p>
                  )}
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Relation</Label>
                  {isEditing ? (
                    <Input
                      value={editedMember.relation}
                      onChange={(e) => setEditedMember(prev => ({ ...prev, relation: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm mt-1">{member.relation}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Date of Birth</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editedMember.date_of_birth || ''}
                      onChange={(e) => setEditedMember(prev => ({ ...prev, date_of_birth: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm mt-1">{member.date_of_birth || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Blood Group</Label>
                  {isEditing ? (
                    <select
                      value={editedMember.blood_group || ''}
                      onChange={(e) => setEditedMember(prev => ({ ...prev, blood_group: e.target.value }))}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="">Select blood group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  ) : (
                    <p className="text-sm mt-1">{member.blood_group || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editedMember.email || ''}
                      onChange={(e) => setEditedMember(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4" />
                      {member.email || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone</Label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={editedMember.phone || ''}
                      onChange={(e) => setEditedMember(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4" />
                      {member.phone || 'Not provided'}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emergency"
                    checked={editedMember.emergency_contact}
                    onCheckedChange={(checked) => setEditedMember(prev => ({ 
                      ...prev, 
                      emergency_contact: checked as boolean 
                    }))}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="emergency" className="text-sm">Emergency Contact</Label>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Medical Conditions</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {editedMember.medical_conditions?.map((condition, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <Badge variant="outline">{condition}</Badge>
                        {isEditing && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeMedicalCondition(index)}
                            className="h-4 w-4 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {(!editedMember.medical_conditions?.length && !isEditing) && (
                      <span className="text-sm text-gray-500">None recorded</span>
                    )}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newCondition}
                        onChange={(e) => setNewCondition(e.target.value)}
                        placeholder="Add condition"
                        className="text-sm"
                      />
                      <Button size="sm" onClick={addMedicalCondition}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <AllergiesSelector
                    value={editedMember.allergies || []}
                    onChange={(allergies) => setEditedMember(prev => ({ ...prev, allergies }))}
                    label="Allergies"
                  />
                ) : (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Allergies</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {editedMember.allergies?.map((allergy, index) => (
                        <Badge key={index} variant="destructive">{allergy}</Badge>
                      ))}
                      {!editedMember.allergies?.length && (
                        <span className="text-sm text-gray-500">None recorded</span>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium text-gray-600">Current Medications</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {editedMember.medications?.map((medication, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <Badge variant="secondary">{medication}</Badge>
                        {isEditing && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeMedication(index)}
                            className="h-4 w-4 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {(!editedMember.medications?.length && !isEditing) && (
                      <span className="text-sm text-gray-500">None recorded</span>
                    )}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newMedication}
                        onChange={(e) => setNewMedication(e.target.value)}
                        placeholder="Add medication"
                        className="text-sm"
                      />
                      <Button size="sm" onClick={addMedication}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Health Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{record.type}</p>
                        <p className="text-sm text-gray-600">{record.doctor}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{record.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Access Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Access Level</Label>
                <RadioGroup
                  value={editedMember.access_level || 'view-only'}
                  onValueChange={(value) => setEditedMember(prev => ({ 
                    ...prev, 
                    access_level: value as 'full' | 'limited' | 'view-only' 
                  }))}
                  disabled={!isEditing}
                  className="mt-2"
                >
                  {['full', 'limited', 'view-only'].map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <RadioGroupItem value={level} id={level} />
                      <Label htmlFor={level} className="text-sm capitalize">
                        {level.replace('-', ' ')} Access
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Emergency Medical Information</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Blood Type:</strong> {member.blood_group || 'Not provided'}</p>
                  <p><strong>Known Allergies:</strong> {member.allergies?.join(', ') || 'None'}</p>
                  <p><strong>Emergency Medications:</strong> {member.medications?.join(', ') || 'None'}</p>
                  <p><strong>Emergency Contact:</strong> {member.phone || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { FamilyMemberProfile };