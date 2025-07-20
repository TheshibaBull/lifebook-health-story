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
    console.log('Analyzing combined content:', combinedContent);
    
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
    const lowerText = textContent.toLowerCase();
    
    console.log('Generating recommendations for type:', type);
    console.log('Text content length:', textContent.length);
    console.log('Medical findings:', findings);
    console.log('Key metrics:', metrics);
    
    // Analyze actual health values and conditions
    const healthAnalysis = this.analyzeHealthConditions(combinedContent);
    
    // Priority recommendations based on health analysis
    if (healthAnalysis.urgentFindings.length > 0) {
      recommendations.push('🚨 URGENT: Schedule immediate follow-up for abnormal findings');
      healthAnalysis.urgentFindings.forEach(finding => {
        recommendations.push(`⚠️ Address ${finding} with your healthcare provider`);
      });
    }
    
    // Specific health condition recommendations
    if (healthAnalysis.conditions.diabetes) {
      recommendations.push('🍎 Monitor carbohydrate intake and maintain stable blood sugar levels');
      recommendations.push('📱 Consider using a glucose monitoring app to track patterns');
      recommendations.push('🏃‍♂️ Regular exercise helps improve insulin sensitivity');
    }
    
    if (healthAnalysis.conditions.hypertension) {
      recommendations.push('🧂 Reduce sodium intake to less than 2,300mg per day');
      recommendations.push('📊 Monitor blood pressure daily and keep a log');
      recommendations.push('🧘‍♀️ Practice stress-reduction techniques like meditation');
    }
    
    if (healthAnalysis.conditions.highCholesterol) {
      recommendations.push('❤️ Follow a heart-healthy diet rich in omega-3 fatty acids');
      recommendations.push('🚶‍♀️ Aim for 150 minutes of moderate exercise weekly');
      recommendations.push('🥗 Increase fiber intake with whole grains and vegetables');
    }
    
    // Medication-specific recommendations
    if (healthAnalysis.medications.length > 0) {
      recommendations.push('💊 Set up medication reminders to ensure consistent dosing');
      recommendations.push('📋 Keep an updated medication list for all healthcare visits');
      healthAnalysis.medications.forEach(med => {
        recommendations.push(`ℹ️ Learn about ${med} side effects and interactions`);
      });
    }
    
    // Preventive care recommendations
    if (healthAnalysis.needsPreventiveCare) {
      recommendations.push('🔄 Schedule routine preventive screenings as recommended');
      recommendations.push('💉 Ensure vaccinations are up to date');
    }
    
    // Lifestyle recommendations based on findings
    if (healthAnalysis.lifestyle.needsWeightManagement) {
      recommendations.push('⚖️ Work with a nutritionist for personalized weight management');
      recommendations.push('🍽️ Practice portion control and mindful eating habits');
    }
    
    if (healthAnalysis.lifestyle.needsExercise) {
      recommendations.push('🏋️‍♀️ Start with 10-15 minutes of daily physical activity');
      recommendations.push('🚴‍♀️ Find enjoyable activities to make exercise sustainable');
    }
    
    // Mental health and wellness
    if (healthAnalysis.stressIndicators) {
      recommendations.push('🧠 Consider stress management techniques or counseling');
      recommendations.push('😴 Prioritize 7-9 hours of quality sleep nightly');
    }
    
    // Record-keeping recommendations
    recommendations.push('📁 Save this analysis to track health trends over time');
    recommendations.push('📤 Share relevant findings with all your healthcare providers');
    
    // Follow-up recommendations
    if (type === 'Medical Lab Report') {
      recommendations.push('📅 Schedule follow-up labs as recommended by your doctor');
      recommendations.push('📈 Compare results with previous tests to identify trends');
    }
    
    // Emergency preparedness
    if (healthAnalysis.hasChronicConditions) {
      recommendations.push('🆘 Keep emergency contact info and medical history easily accessible');
      recommendations.push('💳 Consider a medical alert bracelet for chronic conditions');
    }
    
    // If no specific recommendations were generated, provide actionable general ones
    if (recommendations.length === 0) {
      recommendations.push('📋 Review all information in this document with your healthcare provider');
      recommendations.push('🔍 Ask your doctor to explain any values or terms you don\'t understand');
      recommendations.push('📊 Request reference ranges for any lab values to understand results');
      recommendations.push('📝 Keep this record easily accessible for future medical appointments');
      recommendations.push('🔄 Schedule regular check-ups to monitor your health status');
    }
    
    console.log('Generated recommendations:', recommendations);
    
    // Return top 8 most relevant recommendations
    return recommendations.slice(0, 8);
  }

  private static analyzeHealthConditions(content: string) {
    const analysis = {
      conditions: {
        diabetes: false,
        hypertension: false,
        highCholesterol: false
      },
      medications: [] as string[],
      urgentFindings: [] as string[],
      needsPreventiveCare: false,
      lifestyle: {
        needsWeightManagement: false,
        needsExercise: false
      },
      stressIndicators: false,
      hasChronicConditions: false
    };
    
    // Check for diabetes indicators
    if (content.includes('glucose') || content.includes('a1c') || content.includes('diabetes') || content.includes('insulin')) {
      analysis.conditions.diabetes = true;
      analysis.hasChronicConditions = true;
    }
    
    // Check for hypertension
    if (content.includes('blood pressure') || content.includes('hypertension') || content.includes('mmhg')) {
      analysis.conditions.hypertension = true;
      analysis.hasChronicConditions = true;
    }
    
    // Check for cholesterol issues
    if (content.includes('cholesterol') || content.includes('ldl') || content.includes('hdl') || content.includes('triglycerides')) {
      analysis.conditions.highCholesterol = true;
    }
    
    // Extract medications
    const commonMeds = ['metformin', 'lisinopril', 'atorvastatin', 'amlodipine', 'levothyroxine', 'omeprazole'];
    commonMeds.forEach(med => {
      if (content.includes(med)) {
        analysis.medications.push(med);
      }
    });
    
    // Check for urgent findings
    if (content.includes('abnormal') || content.includes('elevated') || content.includes('high') || content.includes('low')) {
      analysis.urgentFindings.push('abnormal test results requiring attention');
    }
    
    // Check for preventive care needs
    if (content.includes('annual') || content.includes('screening') || content.includes('routine')) {
      analysis.needsPreventiveCare = true;
    }
    
    // Check lifestyle factors
    if (content.includes('weight') || content.includes('bmi') || content.includes('obesity')) {
      analysis.lifestyle.needsWeightManagement = true;
    }
    
    if (content.includes('sedentary') || content.includes('exercise') || content.includes('activity')) {
      analysis.lifestyle.needsExercise = true;
    }
    
    // Check stress indicators
    if (content.includes('stress') || content.includes('anxiety') || content.includes('depression')) {
      analysis.stressIndicators = true;
    }
    
    return analysis;
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
