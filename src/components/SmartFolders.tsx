
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Folder, Heart, Teeth, Eye, Brain, Stethoscope } from 'lucide-react';

const SmartFolders = () => {
  const folders = [
    { name: 'Cardiology', count: 15, icon: Heart, color: 'text-red-500', bgColor: 'bg-red-50' },
    { name: 'Dental', count: 8, icon: Teeth, color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { name: 'Ophthalmology', count: 5, icon: Eye, color: 'text-green-500', bgColor: 'bg-green-50' },
    { name: 'Neurology', count: 3, icon: Brain, color: 'text-purple-500', bgColor: 'bg-purple-50' },
    { name: 'General', count: 12, icon: Stethoscope, color: 'text-gray-500', bgColor: 'bg-gray-50' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Folder className="text-blue-500" />
          Smart Folders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {folders.map((folder) => {
            const Icon = folder.icon;
            return (
              <div
                key={folder.name}
                className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${folder.bgColor}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-6 h-6 ${folder.color}`} />
                  <div>
                    <p className="font-medium text-sm">{folder.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {folder.count} records
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export { SmartFolders };
