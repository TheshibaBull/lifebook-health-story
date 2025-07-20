
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
  const { user } = useAuth();
  const { toast } = useToast();

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

      // Create health record
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
        date_of_record: new Date().toISOString().split('T')[0]
      };

      if (navigator.onLine) {
        // Online - save directly
        await HealthRecordsService.createRecord(recordData);
      } else {
        // Offline - store for later sync
        await OfflineDataSyncService.storeOfflineData({
          type: 'health_record',
          data: recordData,
          operation: 'CREATE'
        });
      }

      setUploadProgress({ percentage: 90, stage: 'Finalizing...', isComplete: false });

      // Send notification
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
  }, []);

  return {
    uploadProgress,
    uploadDocument,
    resetProgress
  };
};
