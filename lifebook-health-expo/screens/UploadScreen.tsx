import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export function UploadScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  
  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsScanning(false);
            // Navigate to results or show results
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };
  
  return (
    <SafeAreaView style={styles.screenContainer}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Upload Medical Records</Text>
      </View>
      
      {isScanning ? (
        <View style={styles.scanningContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.scanningText}>Scanning document with AI...</Text>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                {width: `${scanProgress}%`}
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{scanProgress}% complete</Text>
        </View>
      ) : (
        <View style={styles.uploadContainer}>
          <View style={styles.uploadBox}>
            <Ionicons name="scan" size={60} color="#3b82f6" />
            <Text style={styles.uploadTitle}>Document Scanning & Analysis</Text>
            <Text style={styles.uploadText}>
              Scan your medical documents to extract key information and get a summary
            </Text>
            
            <View style={styles.featuresGrid}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.featureText}>Advanced OCR Text Extraction</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.featureText}>Medical Entity Recognition</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.featureText}>Intelligent Auto-Categorization</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.featureText}>Confidence Scoring</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={startScan}
            >
              <Ionicons name="scan" size={20} color="white" style={{marginRight: 8}} />
              <Text style={styles.scanButtonText}>Scan Document with AI</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.supportedFormatsText}>
            Supported formats: PDF, JPG, PNG, DOC, DOCX
          </Text>
          <Text style={styles.supportedFormatsText}>
            Maximum file size: 10MB per file
          </Text>
        </View>
      )}
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  screenHeader: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  uploadContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  uploadBox: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 280,
  },
  featuresGrid: {
    width: '100%',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 8,
  },
  scanButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  supportedFormatsText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  // Scanning Screen
  scanningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scanningText: {
    fontSize: 16,
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 24,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
  }
});