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

      console.log('Processing image with AI models...');

      // Extract visual description
      const visionResult = await this.visionPipeline(processableImageUrl);
      const description = visionResult[0]?.generated_text || '';
      console.log('Vision analysis result:', description);
      
      // Extract text content
      const ocrResult = await this.ocrPipeline(processableImageUrl);
      const textContent = ocrResult[0]?.generated_text || '';
      console.log('OCR extraction result:', textContent);
      
      // Clean up blob URL if we created one
      if (processableImageUrl !== imageUrl && processableImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(processableImageUrl);
      }
      
      // Analyze the content
      const analysis = this.generateAnalysis(description, textContent);
      console.log('Generated analysis:', analysis);
      
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
      
      // Provide fallback analysis with debugging info
      return {
        summary: `AI analysis encountered an issue: ${error.message}. The system attempted to process the image but may need manual review.`,
        detectedObjects: ['document', 'text'],
        textContent: 'Text extraction failed - please ensure image is clear and text is readable',
        medicalFindings: [],
        keyMetrics: [],
        recommendations: [
          '📸 Try uploading a clearer, high-resolution image',
          '🔍 Ensure all text in the document is clearly visible',
          '💡 Consider cropping the image to focus on the main content',
          '🖨️ If possible, scan the document instead of taking a photo',
          '👨‍⚕️ Manually review the document and share key findings with your healthcare provider',
          '📱 Try uploading from a different device or browser',
          '🔄 Refresh the page and try the analysis again'
        ],
        confidence: 0.3,
        analysisType: 'Error Recovery'
      };
    }
  }

  private static generateAnalysis(description: string, textContent: string) {
    const combinedContent = (description + ' ' + textContent).toLowerCase();
    console.log('Analyzing combined content:', combinedContent);
    
    // If we have very little content, provide specific guidance
    if (combinedContent.length < 20) {
      return {
        analysisType: 'Limited Content',
        detectedObjects: ['document'],
        medicalFindings: [],
        keyMetrics: [],
        summary: 'Limited content was extracted from this image. The document may need better image quality for comprehensive analysis.',
        recommendations: [
          '📸 Upload a higher resolution image for better text extraction',
          '🔍 Ensure the document is well-lit and all text is clearly visible',
          '📱 Try taking the photo from directly above the document',
          '🖨️ Consider scanning the document instead of photographing it',
          '✂️ Crop the image to focus only on the relevant document content',
          '👨‍⚕️ Manually review the document with your healthcare provider',
          '📋 Keep this record for your medical history even if AI analysis is limited'
        ]
      };
    }

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
    const summary = this.generateSummary(analysisType, detectedObjects, medicalFindings, keyMetrics, combinedContent);
    
    // Generate comprehensive personalized recommendations
    const recommendations = this.generateComprehensiveRecommendations(analysisType, medicalFindings, keyMetrics, textContent, combinedContent);

    return {
      analysisType,
      detectedObjects,
      medicalFindings,
      keyMetrics,
      summary,
      recommendations
    };
  }

  private static generateComprehensiveRecommendations(type: string, findings: string[], metrics: string[], textContent: string, combinedContent: string): string[] {
    const recommendations = [];
    
    console.log('Generating recommendations for type:', type);
    console.log('Combined content for analysis:', combinedContent);
    
    // Always provide actionable recommendations based on document type
    if (type === 'Medical Lab Report' || combinedContent.includes('lab') || combinedContent.includes('test') || combinedContent.includes('result')) {
      recommendations.push('📊 Compare these results with previous lab work to track trends');
      recommendations.push('📅 Schedule a follow-up appointment to discuss results with your doctor');
      recommendations.push('📋 Ask your healthcare provider to explain any values outside normal ranges');
      recommendations.push('💾 Keep this report easily accessible for future medical visits');
    }
    
    if (type === 'Prescription Document' || combinedContent.includes('medication') || combinedContent.includes('prescription')) {
      recommendations.push('💊 Set up medication reminders to ensure consistent dosing');
      recommendations.push('📝 Keep an updated list of all medications for healthcare visits');
      recommendations.push('⚠️ Review potential side effects and drug interactions');
      recommendations.push('💰 Check if generic alternatives are available to reduce costs');
    }
    
    // Health-specific recommendations based on content
    if (combinedContent.includes('cholesterol') || combinedContent.includes('lipid')) {
      recommendations.push('❤️ Follow a heart-healthy diet with omega-3 rich foods');
      recommendations.push('🏃‍♂️ Aim for 150 minutes of moderate exercise weekly');
      recommendations.push('🥗 Increase fiber intake with whole grains and vegetables');
    }
    
    if (combinedContent.includes('glucose') || combinedContent.includes('sugar') || combinedContent.includes('diabetes')) {
      recommendations.push('🍎 Monitor carbohydrate intake and maintain stable blood sugar');
      recommendations.push('📱 Consider using a glucose monitoring app');
      recommendations.push('🏃‍♂️ Regular exercise helps improve insulin sensitivity');
    }
    
    if (combinedContent.includes('blood pressure') || combinedContent.includes('hypertension')) {
      recommendations.push('🧂 Reduce sodium intake to less than 2,300mg per day');
      recommendations.push('📊 Monitor blood pressure daily and keep a log');
      recommendations.push('🧘‍♀️ Practice stress-reduction techniques like meditation');
    }
    
    // General health recommendations
    if (combinedContent.includes('weight') || combinedContent.includes('bmi')) {
      recommendations.push('⚖️ Work with a nutritionist for personalized weight management');
      recommendations.push('🍽️ Practice portion control and mindful eating habits');
    }
    
    // Emergency and follow-up recommendations
    if (combinedContent.includes('abnormal') || combinedContent.includes('elevated') || combinedContent.includes('high') || combinedContent.includes('low')) {
      recommendations.push('🚨 Schedule immediate follow-up for any abnormal findings');
      recommendations.push('⚠️ Don\'t ignore unusual results - discuss with your healthcare provider');
    }
    
    // Always include these essential recommendations
    recommendations.push('📁 Save this document to track your health journey over time');
    recommendations.push('📤 Share relevant findings with all your healthcare providers');
    recommendations.push('🔄 Schedule regular check-ups to monitor your health status');
    
    // If no specific recommendations were generated, provide comprehensive general ones
    if (recommendations.length === 0) {
      recommendations.push('📋 Review this document thoroughly with your healthcare provider');
      recommendations.push('❓ Ask your doctor to explain any medical terms you don\'t understand');
      recommendations.push('📊 Request reference ranges for any test values to understand results');
      recommendations.push('📝 Keep this record organized and easily accessible');
      recommendations.push('🔄 Follow up as recommended by your healthcare team');
      recommendations.push('💡 Consider keeping a health journal to track patterns');
      recommendations.push('🏥 Ensure all your healthcare providers have copies of important results');
      recommendations.push('📱 Use health apps to track and monitor relevant metrics');
    }
    
    console.log('Generated recommendations:', recommendations);
    
    // Return top 8 most relevant recommendations
    return recommendations.slice(0, 8);
  }

  private static extractObjects(description: string): string[] {
    const objects = [];
    const commonObjects = ['person', 'document', 'paper', 'text', 'chart', 'graph', 'table', 'image', 'photo'];
    
    commonObjects.forEach(obj => {
      if (description.toLowerCase().includes(obj)) {
        objects.push(obj);
      }
    });

    return objects.length > 0 ? objects : ['document', 'text'];
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

  private static generateSummary(type: string, objects: string[], findings: string[], metrics: string[], content: string): string {
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
    
    // Add content quality assessment
    if (content.length < 50) {
      summary += ' Limited content was extracted - consider uploading a clearer image for more detailed analysis.';
    }

    return summary;
  }
}
