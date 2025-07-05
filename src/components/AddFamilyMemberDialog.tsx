
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddFamilyMemberDialogProps {
  onAddMember: (member: any) => void;
}

const AddFamilyMemberDialog = ({ onAddMember }: AddFamilyMemberDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    relation: '',
    email: '',
    dateOfBirth: '',
    emergencyContact: false
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.relation) {
      toast({
        title: "Missing Information",
        description: "Please fill in the required fields (Name and Relationship).",
        variant: "destructive",
      });
      return;
    }

    const newMember = {
      id: Date.now().toString(),
      name: formData.name,
      relation: formData.relation,
      email: formData.email,
      dateOfBirth: formData.dateOfBirth,
      avatar: formData.name.charAt(0).toUpperCase(),
      status: 'Active',
      lastUpdate: 'Just added',
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
      dateOfBirth: '',
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
            <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
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
