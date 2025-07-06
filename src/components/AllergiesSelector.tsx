import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface AllergiesSelectorProps {
  value: string[];
  onChange: (allergies: string[]) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

const PREDEFINED_ALLERGIES = [
  'Pollen Allergy (Hay Fever)',
  'Dust Mite Allergy',
  'Food Allergy - Cow\'s Milk',
  'Food Allergy - Nuts',
  'Pet Allergy (Animal Dander)',
];

export const AllergiesSelector = ({ 
  value = [], 
  onChange, 
  disabled = false, 
  label = "Allergies (Optional)",
  placeholder = "Select or add allergies"
}: AllergiesSelectorProps) => {
  const [selectedAllergy, setSelectedAllergy] = useState('');
  const [customAllergy, setCustomAllergy] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const addAllergy = (allergy: string) => {
    if (allergy && !value.includes(allergy)) {
      onChange([...value, allergy]);
    }
  };

  const removeAllergy = (allergyToRemove: string) => {
    onChange(value.filter(allergy => allergy !== allergyToRemove));
  };

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === 'others') {
      setShowCustomInput(true);
      setSelectedAllergy('');
    } else {
      addAllergy(selectedValue);
      setSelectedAllergy('');
    }
  };

  const handleCustomAdd = () => {
    if (customAllergy.trim()) {
      addAllergy(customAllergy.trim());
      setCustomAllergy('');
      setShowCustomInput(false);
    }
  };

  const handleCustomKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomAdd();
    }
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {/* Dropdown for predefined allergies */}
      <Select 
        value={selectedAllergy} 
        onValueChange={handleSelectChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {PREDEFINED_ALLERGIES.map((allergy) => (
            <SelectItem 
              key={allergy} 
              value={allergy}
              disabled={value.includes(allergy)}
            >
              {allergy}
            </SelectItem>
          ))}
          <SelectItem value="others">Others (Please specify)</SelectItem>
        </SelectContent>
      </Select>

      {/* Custom allergy input */}
      {showCustomInput && (
        <div className="flex gap-2">
          <Input
            placeholder="Enter custom allergy"
            value={customAllergy}
            onChange={(e) => setCustomAllergy(e.target.value)}
            onKeyPress={handleCustomKeyPress}
            disabled={disabled}
            className="flex-1"
          />
          <Button 
            type="button"
            onClick={handleCustomAdd}
            disabled={disabled || !customAllergy.trim()}
            size="sm"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button 
            type="button"
            variant="outline"
            onClick={() => {
              setShowCustomInput(false);
              setCustomAllergy('');
            }}
            disabled={disabled}
            size="sm"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Selected allergies display */}
      {value.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selected Allergies:</Label>
          <div className="flex flex-wrap gap-2">
            {value.map((allergy, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="flex items-center gap-1 pr-1"
              >
                <span className="text-xs">{allergy}</span>
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAllergy(allergy)}
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Select from common allergies or add your own custom allergies
      </p>
    </div>
  );
};