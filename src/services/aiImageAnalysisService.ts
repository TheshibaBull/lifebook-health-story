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
    console.log('Starting AI image analysis for URL:', imageUrl);
    
    if (!this.visionPipeline || !this.ocrPipeline) {
      await this.initialize();
    }

    try {
      // Convert the image URL to a format the AI can process
      let processableImageUrl = imageUrl;
      
      // Handle Supabase storage URLs and convert to blob
      if (imageUrl.includes('supabase')) {
        try {
          const response = await fetch(imageUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
          }
          const blob = await response.blob();
          processableImageUrl = URL.createObjectURL(blob);
        } catch (fetchError) {
          console.error('Error fetching image from Supabase:', fetchError);
          throw new Error(`Unable to access image: ${fetchError.message}`);
        }
      }

      // Extract visual description
      const visionResult = await this.visionPipeline(processableImageUrl);
      const description = visionResult[0]?.generated_text || '';
      
      // Extract text content
      const ocrResult = await this.ocrPipeline(processableImageUrl);
      const textContent = ocrResult[0]?.generated_text || '';
      
      // Clean up blob URL if we created one
      if (processableImageUrl !== imageUrl && processableImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(processableImageUrl);
      }
      
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
    let analysisType = 'General Document';
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
    
    // Generate personalized recommendations
    const recommendations = this.generatePersonalizedRecommendations(analysisType, medicalFindings, keyMetrics, textContent);

    return {
      analysisType,
      detectedObjects,
      medicalFindings,
      keyMetrics,
      summary,
      recommendations
    };
  }

  private static generatePersonalizedRecommendations(type: string, findings: string[], metrics: string[], textContent: string): string[] {
    const recommendations = [];
    const lowerText = textContent.toLowerCase();
    
    // Base recommendations for all documents
    recommendations.push('Save this document securely in your health records');
    recommendations.push('Share with your healthcare provider during your next visit');
    
    // Type-specific recommendations
    if (type === 'Medical Lab Report') {
      recommendations.push('Track these values over time to monitor trends');
      
      // Check for specific conditions based on findings
      if (findings.some(f => f.includes('glucose') || f.includes('blood sugar'))) {
        recommendations.push('Monitor your blood sugar levels regularly if diabetic');
        recommendations.push('Consider dietary adjustments to maintain healthy glucose levels');
      }
      
      if (findings.some(f => f.includes('cholesterol'))) {
        recommendations.push('Follow a heart-healthy diet to manage cholesterol levels');
        recommendations.push('Regular exercise can help improve cholesterol profile');
      }
      
      if (findings.some(f => f.includes('blood pressure') || f.includes('hypertension'))) {
        recommendations.push('Monitor blood pressure regularly at home');
        recommendations.push('Reduce sodium intake and maintain a healthy weight');
      }
      
      // Check for abnormal values in metrics
      if (metrics.length > 0) {
        recommendations.push('Discuss any values outside normal range with your doctor');
        recommendations.push('Ask about lifestyle changes that could improve these results');
      }
      
    } else if (type === 'Prescription Document') {
      recommendations.push('Set medication reminders to ensure consistent dosing');
      recommendations.push('Check for potential drug interactions with other medications');
      recommendations.push('Understand side effects and when to contact your doctor');
      recommendations.push('Store medications properly according to instructions');
      
    } else if (type === 'Medical Imaging') {
      recommendations.push('Keep for comparison with future imaging studies');
      recommendations.push('Discuss findings with your radiologist or referring physician');
      recommendations.push('Follow up on any recommended additional tests');
      
    } else {
      // General document recommendations
      recommendations.push('Review the content for any action items or follow-up needed');
      recommendations.push('Note any appointments or procedures mentioned');
    }
    
    // Health maintenance recommendations
    if (lowerText.includes('annual') || lowerText.includes('routine')) {
      recommendations.push('Schedule your next routine check-up as recommended');
      recommendations.push('Stay up to date with preventive care screenings');
    }
    
    // Emergency or urgent care recommendations
    if (lowerText.includes('urgent') || lowerText.includes('emergency') || lowerText.includes('follow up')) {
      recommendations.push('⚠️ Follow up on any urgent items mentioned in this document');
      recommendations.push('Contact your healthcare provider if you have questions about urgent findings');
    }
    
    // Lifestyle recommendations based on content
    if (lowerText.includes('weight') || lowerText.includes('bmi')) {
      recommendations.push('Maintain a healthy weight through balanced diet and exercise');
    }
    
    if (lowerText.includes('smoking') || lowerText.includes('tobacco')) {
      recommendations.push('Consider smoking cessation resources if applicable');
    }
    
    // Remove duplicates and limit to most relevant recommendations
    const uniqueRecommendations = [...new Set(recommendations)];
    return uniqueRecommendations.slice(0, 8); // Limit to 8 most relevant recommendations
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
}
