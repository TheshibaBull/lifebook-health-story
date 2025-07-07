
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Users, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AllergiesSelector } from '@/components/AllergiesSelector';

interface AddFamilyMemberDialogProps {
  onAddMember: (member: any) => void;
}

const AddFamilyMemberDialog = ({ onAddMember }: AddFamilyMemberDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    relation: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    bloodGroup: '',
    medicalConditions: [],
    allergies: [],
    medications: [],
    emergencyContact: false
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.relation || !formData.phone || !formData.dateOfBirth) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Name, Relationship, Phone, and Date of Birth).",
        variant: "destructive",
      });
      return;
    }

    const newMember = {
      name: formData.name,
      relation: formData.relation,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      blood_group: formData.bloodGroup,
      medical_conditions: formData.medicalConditions,
      allergies: formData.allergies,
      medications: formData.medications,
      emergencyContact: formData.emergencyContact
    };

    onAddMember(newMember);
    
    toast({
      title: "Family Member Added",
      description: `${formData.name} has been added to your family vault.`,
    });

    setFormData({
      name: '',
      relation: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      bloodGroup: '',
      medicalConditions: [],
      allergies: [],
      medications: [],
      emergencyContact: false
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Family Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-500" />
            Add Family Member
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="relation">Relationship *</Label>
            <Select value={formData.relation} onValueChange={(value) => setFormData({ ...formData, relation: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Spouse">Spouse</SelectItem>
                <SelectItem value="Partner">Partner</SelectItem>
                <SelectItem value="Child">Child</SelectItem>
                <SelectItem value="Parent">Parent</SelectItem>
                <SelectItem value="Sibling">Sibling</SelectItem>
                <SelectItem value="Grandparent">Grandparent</SelectItem>
                <SelectItem value="Grandchild">Grandchild</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloodGroup">Blood Group (Optional)</Label>
            <Select value={formData.bloodGroup} onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalConditions">Medical Conditions (Optional)</Label>
            <Textarea
              id="medicalConditions"
              value={formData.medicalConditions.join(', ')}
              onChange={(e) => setFormData({ 
                ...formData, 
                medicalConditions: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
              })}
              placeholder="Enter medical conditions separated by commas"
              rows={2}
            />
          </div>

          <AllergiesSelector
            value={formData.allergies}
            onChange={(allergies) => setFormData({ ...formData, allergies })}
            label="Allergies (Optional)"
          />

          <div className="space-y-2">
            <Label htmlFor="medications">Current Medications (Optional)</Label>
            <Textarea
              id="medications"
              value={formData.medications.join(', ')}
              onChange={(e) => setFormData({ 
                ...formData, 
                medications: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
              })}
              placeholder="Enter current medications separated by commas"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="emergencyContact"
              checked={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="emergencyContact" className="text-sm">
              Set as emergency contact
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Member
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { AddFamilyMemberDialog };
