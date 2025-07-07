
import { OCRService } from './ocrService';
import { MedicalEntityExtractor } from './medicalEntityExtractor';

export interface DocumentAnalysis {
  category: string;
  tags: string[];
  extractedText: string;
  confidence: number;
  medicalEntities: {
    conditions: string[];
    medications: string[];
    procedures: string[];
    dates: string[];
    providers: string[];
    measurements: string[];
  };
}

export class EnhancedAIDocumentProcessor {
  static async analyzeDocument(file: File): Promise<DocumentAnalysis> {
    console.log('Analyzing document with enhanced AI:', file.name);
    
    // Step 1: Extract text using OCR
    const ocrResult = await OCRService.extractText(file);
    
    // Step 2: Extract medical entities
    const entities = MedicalEntityExtractor.extractEntities(ocrResult.text);
    
    // Step 3: Categorize document
    const category = this.categorizeDocument(file.name, ocrResult.text, entities);
    
    // Step 4: Generate tags
    const tags = this.generateTags(file.name, ocrResult.text, entities);
    
    // Step 5: Calculate overall confidence
    const overallConfidence = this.calculateConfidence(ocrResult.confidence, entities);
    
    return {
      category,
      tags,
      extractedText: ocrResult.text,
      confidence: overallConfidence,
      medicalEntities: {
        conditions: entities.conditions.map(e => e.text),
        medications: entities.medications.map(e => e.text),
        procedures: entities.procedures.map(e => e.text),
        dates: entities.dates.map(e => e.text),
        providers: entities.providers.map(e => e.text),
        measurements: entities.measurements.map(e => e.text)
      }
    };
  }
  
  private static categorizeDocument(fileName: string, content: string, entities: any): string {
    const text = (fileName + ' ' + content).toLowerCase();
    
    // Advanced categorization logic
    if (entities.medications.length > 0 && (text.includes('prescription') || text.includes('rx'))) {
      return 'Prescriptions';
    }
    
    if (entities.measurements.length > 2 && (text.includes('blood') || text.includes('lab') || text.includes('test'))) {
      return 'Lab Results';
    }
    
    if (entities.procedures.some((p: any) => ['x-ray', 'ct', 'mri', 'ultrasound'].some(proc => p.text.toLowerCase().includes(proc)))) {
      return 'Imaging';
    }
    
    if (text.includes('visit') || text.includes('consultation') || text.includes('appointment')) {
      return 'Visit Notes';
    }
    
    if (text.includes('vaccination') || text.includes('vaccine') || text.includes('immunization')) {
      return 'Vaccinations';
    }
    
    if (text.includes('surgery') || text.includes('procedure') || text.includes('operation')) {
      return 'Procedures';
    }
    
    if (text.includes('insurance') || text.includes('claim') || text.includes('coverage')) {
      return 'Insurance';
    }
    
    return 'General';
  }
  
  private static generateTags(fileName: string, content: string, entities: any): string[] {
    const tags = new Set<string>();
    
    // Add condition-based tags
    entities.conditions.forEach((condition: any) => {
      if (condition.text.includes('diabetes')) tags.add('Diabetes');
      if (condition.text.includes('hypertension') || condition.text.includes('blood pressure')) tags.add('Hypertension');
      if (condition.text.includes('cholesterol')) tags.add('Cholesterol');
      if (condition.text.includes('asthma')) tags.add('Respiratory');
    });
    
    // Add procedure-based tags
    entities.procedures.forEach((procedure: any) => {
      if (procedure.text.includes('cardio') || procedure.text.includes('heart')) tags.add('Cardiology');
      if (procedure.text.includes('x-ray') || procedure.text.includes('scan')) tags.add('Imaging');
    });
    
    // Add urgency tags
    const text = (fileName + ' ' + content).toLowerCase();
    if (text.includes('urgent') || text.includes('emergency') || text.includes('stat')) {
      tags.add('Urgent');
    }
    if (text.includes('annual') || text.includes('routine') || text.includes('regular')) {
      tags.add('Routine');
    }
    if (text.includes('follow') || text.includes('followup')) {
      tags.add('Follow-up');
    }
    
    return Array.from(tags);
  }
  
  private static calculateConfidence(ocrConfidence: number, entities: any): number {
    let confidence = ocrConfidence;
    
    // Boost confidence if we found medical entities
    const entityCount = entities.conditions.length + entities.medications.length + 
                       entities.procedures.length + entities.providers.length;
    
    if (entityCount > 0) {
      confidence = Math.min(confidence + (entityCount * 0.02), 0.98);
    }
    
    return confidence;
  }
}
