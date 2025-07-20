
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FileUploadService } from '@/services/fileUploadService';
import { HealthRecordsService } from '@/services/healthRecordsService';
import { EnhancedPushNotificationService } from '@/services/enhancedPushNotificationService';
import { OfflineDataSyncService } from '@/services/offlineDataSyncService';
import { useToast } from '@/hooks/use-toast';

interface UploadProgress {
  percentage: number;
  stage: string;
  isComplete: boolean;
  error?: string;
}

export const useEnhancedUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    percentage: 0,
    stage: 'idle',
    isComplete: false
  });
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadFile = useCallback(async (file: File, metadata: any = {}) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsUploading(true);
    try {
      setUploadProgress({ percentage: 10, stage: 'Uploading file...', isComplete: false });
      
      // Upload file to storage
      const uploadResult = await FileUploadService.uploadFile(
        file,
        user.id,
        (progress) => {
          setUploadProgress({
            percentage: 10 + (progress.percentage * 0.4),
            stage: 'Uploading file...',
            isComplete: false
          });
        }
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      setUploadProgress({ percentage: 60, stage: 'Creating health record...', isComplete: false });

      // Create health record with proper field mapping
      const recordData = {
        user_id: user.id,
        title: metadata.title || file.name,
        category: metadata.category || 'General',
        tags: metadata.tags || [],
        file_name: file.name,
        file_path: uploadResult.data?.path,
        file_size: file.size,
        file_type: file.type,
        description: metadata.description || '',
        date_of_record: metadata.date_of_record || new Date().toISOString().split('T')[0],
        provider_name: metadata.provider_name || null
      };

      if (navigator.onLine) {
        await HealthRecordsService.createRecord(recordData);
      } else {
        await OfflineDataSyncService.storeOfflineData({
          type: 'health_record',
          data: recordData,
          operation: 'CREATE'
        });
      }

      setUploadProgress({ percentage: 100, stage: 'Complete!', isComplete: true });

      toast({
        title: "Upload Successful",
        description: `${file.name} has been saved to your health records`,
      });

      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadProgress({
        percentage: 0,
        stage: 'error',
        isComplete: false,
        error: errorMessage
      });

      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [user, toast]);

  const uploadDocument = useCallback(async (file: File, processingResult: any) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setUploadProgress({ percentage: 10, stage: 'Uploading file...', isComplete: false });
      
      // Upload file to storage
      const uploadResult = await FileUploadService.uploadFile(
        file,
        user.id,
        (progress) => {
          setUploadProgress({
            percentage: 10 + (progress.percentage * 0.4),
            stage: 'Uploading file...',
            isComplete: false
          });
        }
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      setUploadProgress({ percentage: 60, stage: 'Creating health record...', isComplete: false });

      // Create health record with AI processing results
      const recordData = {
        user_id: user.id,
        title: file.name,
        category: processingResult.category,
        tags: processingResult.tags,
        file_name: file.name,
        file_path: uploadResult.data?.path,
        file_size: file.size,
        file_type: file.type,
        extracted_text: processingResult.text,
        medical_entities: processingResult.entities,
        ai_analysis: {
          confidence: processingResult.confidence,
          category: processingResult.category,
          tags: processingResult.tags
        },
        date_of_record: new Date().toISOString().split('T')[0],
        provider_name: null,
        description: `AI-processed document with ${Math.round(processingResult.confidence * 100)}% confidence`
      };

      if (navigator.onLine) {
        await HealthRecordsService.createRecord(recordData);
      } else {
        await OfflineDataSyncService.storeOfflineData({
          type: 'health_record',
          data: recordData,
          operation: 'CREATE'
        });
      }

      setUploadProgress({ percentage: 90, stage: 'Finalizing...', isComplete: false });

      await EnhancedPushNotificationService.notifyDocumentProcessed(file.name, processingResult.category);

      setUploadProgress({ percentage: 100, stage: 'Complete!', isComplete: true });

      toast({
        title: "Upload Successful",
        description: `${file.name} has been saved to your health records`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadProgress({
        percentage: 0,
        stage: 'error',
        isComplete: false,
        error: errorMessage
      });

      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    }
  }, [user, toast]);

  const resetProgress = useCallback(() => {
    setUploadProgress({
      percentage: 0,
      stage: 'idle',
      isComplete: false
    });
    setIsUploading(false);
  }, []);

  return {
    uploadProgress,
    uploadDocument,
    uploadFile,
    isUploading,
    resetProgress
  };
};
