
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Folder, Heart, Smile, Eye, Brain, Stethoscope, Search, FileText, Plus, TestTube, Syringe } from 'lucide-react';
import { FileStorageService, StoredFile } from '@/services/fileStorageService';
import { HealthRecordViewer } from '@/components/HealthRecordViewer';

interface FolderCategory {
  name: string;
  count: number;
  icon: any;
  color: string;
  bgColor: string;
  files: StoredFile[];
}

const SmartFolders = () => {
  const [folders, setFolders] = useState<FolderCategory[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FolderCategory | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState<StoredFile[]>([]);

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    if (selectedFolder && searchQuery) {
      const filtered = selectedFolder.files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.extractedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredFiles(filtered);
    } else if (selectedFolder) {
      setFilteredFiles(selectedFolder.files);
    }
  }, [selectedFolder, searchQuery]);

  const loadFolders = () => {
    const allFiles = FileStorageService.getAllFiles();
    
    // Group files by category
    const categoryGroups: { [key: string]: StoredFile[] } = {};
    allFiles.forEach(file => {
      if (!categoryGroups[file.category]) {
        categoryGroups[file.category] = [];
      }
      categoryGroups[file.category].push(file);
    });

    // Create folder structure
    const folderData: FolderCategory[] = [
      { 
        name: 'Lab Results', 
        count: categoryGroups['Lab Results']?.length || 0, 
        icon: TestTube, 
        color: 'text-purple-500', 
        bgColor: 'bg-purple-50',
        files: categoryGroups['Lab Results'] || []
      },
      { 
        name: 'Prescriptions', 
        count: categoryGroups['Prescriptions']?.length || 0, 
        icon: Heart, 
        color: 'text-red-500', 
        bgColor: 'bg-red-50',
        files: categoryGroups['Prescriptions'] || []
      },
      { 
        name: 'Imaging', 
        count: categoryGroups['Imaging']?.length || 0, 
        icon: Eye, 
        color: 'text-green-500', 
        bgColor: 'bg-green-50',
        files: categoryGroups['Imaging'] || []
      },
      { 
        name: 'Visit Notes', 
        count: categoryGroups['Visit Notes']?.length || 0, 
        icon: Stethoscope, 
        color: 'text-blue-500', 
        bgColor: 'bg-blue-50',
        files: categoryGroups['Visit Notes'] || []
      },
      { 
        name: 'Vaccinations', 
        count: categoryGroups['Vaccinations']?.length || 0, 
        icon: Syringe, 
        color: 'text-teal-500', 
        bgColor: 'bg-teal-50',
        files: categoryGroups['Vaccinations'] || []
      },
      { 
        name: 'General', 
        count: categoryGroups['General']?.length || 0, 
        icon: FileText, 
        color: 'text-gray-500', 
        bgColor: 'bg-gray-50',
        files: categoryGroups['General'] || []
      },
    ];

    // Add any other categories that might exist
    Object.keys(categoryGroups).forEach(category => {
      if (!folderData.some(folder => folder.name === category)) {
        folderData.push({
          name: category,
          count: categoryGroups[category].length,
          icon: FileText,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          files: categoryGroups[category]
        });
      }
    });

    setFolders(folderData);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFolderClick = (folder: FolderCategory) => {
    if (folder.count > 0) {
      setSelectedFolder(folder);
      setSearchQuery('');
    }
  };

  const handleFileClick = (fileId: string) => {
    setSelectedFileId(fileId);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="text-blue-500" />
            Smart Folders
            <Badge variant="secondary" className="ml-auto">
              {folders.reduce((sum, folder) => sum + folder.count, 0)} total files
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {folders.map((folder) => {
              const Icon = folder.icon;
              return (
                <div
                  key={folder.name}
                  className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                    folder.bgColor
                  } ${folder.count === 0 ? 'opacity-50' : 'hover:scale-105'}`}
                  onClick={() => handleFolderClick(folder)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${folder.color}`} />
                    <div>
                      <p className="font-medium text-sm">{folder.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {folder.count} record{folder.count !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadFolders}
              className="text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Refresh Categories
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Folder Contents Dialog */}
      <Dialog open={!!selectedFolder} onOpenChange={() => setSelectedFolder(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedFolder && (
                <>
                  <selectedFolder.icon className={`w-5 h-5 ${selectedFolder.color}`} />
                  {selectedFolder.name} ({selectedFolder.count} files)
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedFolder && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder={`Search in ${selectedFolder.name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredFiles.length > 0 ? (
                  filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleFileClick(file.id)}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)} • {file.uploadDate.toLocaleDateString()}
                            </p>
                            {file.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {file.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{file.tags.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery ? 'No files found matching your search.' : 'No files in this category yet.'}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Health Record Viewer */}
      <HealthRecordViewer
        fileId={selectedFileId}
        onClose={() => setSelectedFileId(null)}
      />
    </>
  );
};

export { SmartFolders };
