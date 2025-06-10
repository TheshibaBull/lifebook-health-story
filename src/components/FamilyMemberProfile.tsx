
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, FileText, Calendar, Shield, Edit3, Phone, Mail } from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  avatar: string;
  status: string;
  lastUpdate: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  emergencyContact?: boolean;
  medicalConditions?: string[];
  allergies?: string[];
  medications?: string[];
  accessLevel: 'full' | 'limited' | 'view-only';
}

interface FamilyMemberProfileProps {
  member: FamilyMember;
  onUpdateMember: (member: FamilyMember) => void;
  onClose: () => void;
}

const FamilyMemberProfile = ({ member, onUpdateMember, onClose }: FamilyMemberProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMember, setEditedMember] = useState<FamilyMember>(member);

  const handleSave = () => {
    onUpdateMember(editedMember);
    setIsEditing(false);
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
                  {member.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{member.name}</h2>
                <p className="text-gray-600">{member.relation}</p>
                <Badge className={getAccessLevelColor(member.accessLevel)}>
                  {member.accessLevel.replace('-', ' ')} access
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
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
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                  <p className="text-sm">{member.dateOfBirth || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {member.email || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-sm flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {member.phone || 'Not provided'}
                  </p>
                </div>
                {member.emergencyContact && (
                  <Badge variant="destructive">Emergency Contact</Badge>
                )}
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Medical Conditions</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {member.medicalConditions?.length ? (
                      member.medicalConditions.map((condition, index) => (
                        <Badge key={index} variant="outline">{condition}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">None recorded</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Allergies</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {member.allergies?.length ? (
                      member.allergies.map((allergy, index) => (
                        <Badge key={index} variant="destructive">{allergy}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">None recorded</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Current Medications</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {member.medications?.length ? (
                      member.medications.map((medication, index) => (
                        <Badge key={index} variant="secondary">{medication}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">None recorded</span>
                    )}
                  </div>
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
                <label className="text-sm font-medium">Access Level</label>
                <div className="mt-2 space-y-2">
                  {['full', 'limited', 'view-only'].map((level) => (
                    <div key={level} className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={level}
                        name="access"
                        checked={editedMember.accessLevel === level}
                        onChange={() => setEditedMember({
                          ...editedMember,
                          accessLevel: level as 'full' | 'limited' | 'view-only'
                        })}
                        disabled={!isEditing}
                      />
                      <label htmlFor={level} className="text-sm capitalize">
                        {level.replace('-', ' ')} Access
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {isEditing && (
                <Button onClick={handleSave}>Save Changes</Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Emergency Contact</span>
                <input
                  type="checkbox"
                  checked={editedMember.emergencyContact}
                  onChange={(e) => setEditedMember({
                    ...editedMember,
                    emergencyContact: e.target.checked
                  })}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Emergency Medical Information</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Blood Type:</strong> O+</p>
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
