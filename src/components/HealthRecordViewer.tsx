
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Edit, Save, X, Download, Calendar, Tag, User } from 'lucide-react';
import { StoredFile, FileStorageService } from '@/services/fileStorageService';
import { useToast } from '@/hooks/use-toast';

interface HealthRecordViewerProps {
  fileId: string | null;
  onClose: () => void;
}

export const HealthRecordViewer = ({ fileId, onClose }: HealthRecordViewerProps) => {
  const [file, setFile] = useState<StoredFile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTags, setEditedTags] = useState<string>('');
  const [editedNotes, setEditedNotes] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (fileId) {
      const loadedFile = FileStorageService.getFileById(fileId);
      if (loadedFile) {
        setFile(loadedFile);
        setEditedTags(loadedFile.tags.join(', '));
        setEditedNotes(loadedFile.extractedText);
      }
    }
  }, [fileId]);

  const handleSaveChanges = () => {
    if (!file) return;

    const newTags = editedTags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const success = FileStorageService.updateFile(file.id, {
      tags: newTags,
      extractedText: editedNotes
    });

    if (success) {
      const updatedFile = FileStorageService.getFileById(file.id);
      if (updatedFile) {
        setFile(updatedFile);
      }
      setIsEditing(false);
      toast({
        title: "Record Updated",
        description: "Your health record has been updated successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update the record.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!file) return;

    try {
      // Convert base64 to blob and download
      const base64Data = file.data.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.type });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "File Downloaded",
        description: `${file.name} has been downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the file.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!fileId || !file) {
    return null;
  }

  return (
    <Dialog open={!!fileId} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {file.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="preview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <Button 
                  onClick={() => setIsEditing(!isEditing)} 
                  variant="outline" 
                  size="sm"
                >
                  {isEditing ? <X className="w-4 h-4 mr-1" /> : <Edit className="w-4 h-4 mr-1" />}
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
                {isEditing && (
                  <Button onClick={handleSaveChanges} size="sm">
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                )}
              </div>
              <Badge variant="secondary">{file.category}</Badge>
            </div>

            {/* File Preview */}
            <Card>
              <CardHeader>
                <CardTitle>File Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {file.type.startsWith('image/') ? (
                  <img 
                    src={file.data} 
                    alt={file.name}
                    className="max-w-full h-auto rounded-lg border"
                  />
                ) : (
                  <div className="p-6 bg-gray-50 rounded-lg text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                      {file.type === 'application/pdf' ? 'PDF Document' : 'Document'} - {formatFileSize(file.size)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Use the download button to view the full document
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Extracted Text/Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Content & Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    placeholder="Add your notes or edit extracted content..."
                    className="min-h-[200px]"
                  />
                ) : (
                  <div className="min-h-[200px] p-3 bg-gray-50 rounded border">
                    <pre className="whitespace-pre-wrap text-sm">
                      {file.extractedText || 'No content extracted'}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    File Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-600">File Name</p>
                    <p>{file.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">File Type</p>
                    <p>{file.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">File Size</p>
                    <p>{formatFileSize(file.size)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Upload Date</p>
                    <p>{file.uploadDate.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Category</p>
                    <Badge variant="outline">{file.category}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags & Organization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Tags</p>
                    {isEditing ? (
                      <Textarea
                        value={editedTags}
                        onChange={(e) => setEditedTags(e.target.value)}
                        placeholder="Enter tags separated by commas..."
                        className="min-h-[100px]"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {file.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            {file.medicalEntities && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Medical Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {file.medicalEntities.conditions?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Conditions</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {file.medicalEntities.conditions.map((condition: string, index: number) => (
                            <Badge key={index} variant="destructive">{condition}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {file.medicalEntities.medications?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Medications</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {file.medicalEntities.medications.map((medication: string, index: number) => (
                            <Badge key={index} variant="default">{medication}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {file.medicalEntities.procedures?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Procedures</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {file.medicalEntities.procedures.map((procedure: string, index: number) => (
                            <Badge key={index} variant="outline">{procedure}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Extracted Data</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {file.medicalEntities.dates?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Important Dates</p>
                        <ul className="text-sm list-disc list-inside">
                          {file.medicalEntities.dates.map((date: string, index: number) => (
                            <li key={index}>{date}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {file.medicalEntities.providers?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Healthcare Providers</p>
                        <ul className="text-sm list-disc list-inside">
                          {file.medicalEntities.providers.map((provider: string, index: number) => (
                            <li key={index}>{provider}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
