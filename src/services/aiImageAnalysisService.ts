
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

export interface ImageAnalysisResult {
  summary: string;
  detectedObjects: string[];
  textContent: string;
  medicalFindings: string[];
  keyMetrics: string[];
  recommendations: string[];
  confidence: number;
  analysisType: string;
}

export class AIImageAnalysisService {
  private static visionPipeline: any = null;
  private static ocrPipeline: any = null;

  static async initialize() {
    console.log('Initializing AI image analysis service...');
    
    try {
      // Initialize vision pipeline for image analysis
      this.visionPipeline = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning');
      
      // Initialize OCR pipeline for text extraction
      this.ocrPipeline = await pipeline('image-to-text', 'Xenova/trocr-base-printed');
      
      console.log('AI image analysis service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI image analysis service:', error);
      throw error;
    }
  }

  static async analyzeImage(imageUrl: string): Promise<ImageAnalysisResult> {
    console.log('Starting AI image analysis...');
    
    if (!this.visionPipeline || !this.ocrPipeline) {
      await this.initialize();
    }

    try {
      // Extract visual description
      const visionResult = await this.visionPipeline(imageUrl);
      const description = visionResult[0]?.generated_text || '';
      
      // Extract text content
      const ocrResult = await this.ocrPipeline(imageUrl);
      const textContent = ocrResult[0]?.generated_text || '';
      
      // Analyze the content
      const analysis = this.generateAnalysis(description, textContent);
      
      return {
        summary: analysis.summary,
        detectedObjects: analysis.detectedObjects,
        textContent: textContent,
        medicalFindings: analysis.medicalFindings,
        keyMetrics: analysis.keyMetrics,
        recommendations: analysis.recommendations,
        confidence: 0.85,
        analysisType: analysis.analysisType
      };
    } catch (error) {
      console.error('AI image analysis failed:', error);
      throw new Error(`Image analysis failed: ${error.message}`);
    }
  }

  private static generateAnalysis(description: string, textContent: string) {
    const combinedContent = (description + ' ' + textContent).toLowerCase();
    
    // Determine analysis type
    let analysisType = 'General Image';
    if (combinedContent.includes('blood') || combinedContent.includes('lab') || combinedContent.includes('test')) {
      analysisType = 'Medical Lab Report';
    } else if (combinedContent.includes('x-ray') || combinedContent.includes('scan') || combinedContent.includes('mri')) {
      analysisType = 'Medical Imaging';
    } else if (combinedContent.includes('prescription') || combinedContent.includes('medication')) {
      analysisType = 'Prescription Document';
    } else if (combinedContent.includes('chart') || combinedContent.includes('graph') || combinedContent.includes('data')) {
      analysisType = 'Data Visualization';
    }

    // Extract detected objects
    const detectedObjects = this.extractObjects(description);
    
    // Extract medical findings
    const medicalFindings = this.extractMedicalFindings(textContent);
    
    // Extract key metrics
    const keyMetrics = this.extractMetrics(textContent);
    
    // Generate summary
    const summary = this.generateSummary(analysisType, detectedObjects, medicalFindings, keyMetrics);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(analysisType, medicalFindings);

    return {
      analysisType,
      detectedObjects,
      medicalFindings,
      keyMetrics,
      summary,
      recommendations
    };
  }

  private static extractObjects(description: string): string[] {
    const objects = [];
    const commonObjects = ['person', 'document', 'paper', 'text', 'chart', 'graph', 'table', 'image', 'photo'];
    
    commonObjects.forEach(obj => {
      if (description.toLowerCase().includes(obj)) {
        objects.push(obj);
      }
    });

    return objects;
  }

  private static extractMedicalFindings(text: string): string[] {
    const findings = [];
    const medicalTerms = [
      'blood pressure', 'heart rate', 'temperature', 'glucose', 'cholesterol',
      'hemoglobin', 'white blood cell', 'red blood cell', 'platelet',
      'creatinine', 'urea', 'sodium', 'potassium', 'diabetes', 'hypertension'
    ];

    medicalTerms.forEach(term => {
      if (text.toLowerCase().includes(term)) {
        findings.push(term);
      }
    });

    return findings;
  }

  private static extractMetrics(text: string): string[] {
    const metrics = [];
    
    // Extract numbers with units
    const numberPattern = /\d+\.?\d*\s*(?:mg\/dl|mmhg|bpm|°f|°c|kg|lbs|cm|%)/gi;
    const matches = text.match(numberPattern);
    
    if (matches) {
      metrics.push(...matches);
    }

    return metrics;
  }

  private static generateSummary(type: string, objects: string[], findings: string[], metrics: string[]): string {
    let summary = `This appears to be a ${type.toLowerCase()}.`;
    
    if (objects.length > 0) {
      summary += ` The image contains: ${objects.join(', ')}.`;
    }
    
    if (findings.length > 0) {
      summary += ` Medical findings include: ${findings.join(', ')}.`;
    }
    
    if (metrics.length > 0) {
      summary += ` Key measurements: ${metrics.slice(0, 3).join(', ')}.`;
    }

    return summary;
  }

  private static generateRecommendations(type: string, findings: string[]): string[] {
    const recommendations = [];
    
    if (type === 'Medical Lab Report') {
      recommendations.push('Review results with your healthcare provider');
      recommendations.push('Track values over time for trends');
      recommendations.push('Store securely in your health records');
    } else if (type === 'Prescription Document') {
      recommendations.push('Verify medication details with pharmacist');
      recommendations.push('Set medication reminders');
      recommendations.push('Check for drug interactions');
    } else if (type === 'Medical Imaging') {
      recommendations.push('Discuss findings with radiologist or doctor');
      recommendations.push('Keep for future medical reference');
      recommendations.push('Share with specialists if needed');
    } else {
      recommendations.push('Save to appropriate category');
      recommendations.push('Add relevant tags for easy searching');
      recommendations.push('Share with healthcare team if relevant');
    }

    return recommendations;
  }
}
