
export interface MedicalEntity {
  text: string;
  category: string;
  confidence: number;
  startIndex?: number;
  endIndex?: number;
}

export interface ExtractedEntities {
  conditions: MedicalEntity[];
  medications: MedicalEntity[];
  procedures: MedicalEntity[];
  dates: MedicalEntity[];
  providers: MedicalEntity[];
  measurements: MedicalEntity[];
}

export class MedicalEntityExtractor {
  private static readonly MEDICAL_CONDITIONS = [
    'diabetes', 'hypertension', 'high blood pressure', 'cholesterol', 'hyperlipidemia',
    'asthma', 'copd', 'pneumonia', 'bronchitis', 'allergies', 'migraine',
    'arthritis', 'osteoporosis', 'depression', 'anxiety', 'hypothyroidism'
  ];
  
  private static readonly MEDICATIONS = [
    'lisinopril', 'metformin', 'atorvastatin', 'amlodipine', 'omeprazole',
    'levothyroxine', 'simvastatin', 'losartan', 'gabapentin', 'sertraline',
    'aspirin', 'ibuprofen', 'acetaminophen', 'prednisone', 'albuterol'
  ];
  
  private static readonly PROCEDURES = [
    'x-ray', 'xray', 'ct scan', 'mri', 'ultrasound', 'ekg', 'ecg', 'blood test',
    'urine test', 'biopsy', 'colonoscopy', 'endoscopy', 'mammography',
    'bone density', 'stress test', 'holter monitor'
  ];
  
  static extractEntities(text: string): ExtractedEntities {
    const lowercaseText = text.toLowerCase();
    
    return {
      conditions: this.extractConditions(lowercaseText, text),
      medications: this.extractMedications(lowercaseText, text),
      procedures: this.extractProcedures(lowercaseText, text),
      dates: this.extractDates(text),
      providers: this.extractProviders(text),
      measurements: this.extractMeasurements(text)
    };
  }
  
  private static extractConditions(lowercaseText: string, originalText: string): MedicalEntity[] {
    const conditions: MedicalEntity[] = [];
    
    this.MEDICAL_CONDITIONS.forEach(condition => {
      if (lowercaseText.includes(condition)) {
        conditions.push({
          text: condition,
          category: 'medical_condition',
          confidence: 0.85
        });
      }
    });
    
    return conditions;
  }
  
  private static extractMedications(lowercaseText: string, originalText: string): MedicalEntity[] {
    const medications: MedicalEntity[] = [];
    
    this.MEDICATIONS.forEach(medication => {
      const regex = new RegExp(`\\b${medication}\\b`, 'gi');
      const matches = originalText.match(regex);
      if (matches) {
        matches.forEach(match => {
          medications.push({
            text: match,
            category: 'medication',
            confidence: 0.90
          });
        });
      }
    });
    
    return medications;
  }
  
  private static extractProcedures(lowercaseText: string, originalText: string): MedicalEntity[] {
    const procedures: MedicalEntity[] = [];
    
    this.PROCEDURES.forEach(procedure => {
      if (lowercaseText.includes(procedure)) {
        procedures.push({
          text: procedure,
          category: 'medical_procedure',
          confidence: 0.88
        });
      }
    });
    
    return procedures;
  }
  
  private static extractDates(text: string): MedicalEntity[] {
    const dates: MedicalEntity[] = [];
    const datePatterns = [
      /\d{1,2}\/\d{1,2}\/\d{4}/g,
      /\d{4}-\d{2}-\d{2}/g,
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/gi
    ];
    
    datePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          dates.push({
            text: match,
            category: 'date',
            confidence: 0.95
          });
        });
      }
    });
    
    return dates;
  }
  
  private static extractProviders(text: string): MedicalEntity[] {
    const providers: MedicalEntity[] = [];
    const providerPattern = /Dr\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:,?\s*M\.?D\.?)?/g;
    const matches = text.match(providerPattern);
    
    if (matches) {
      matches.forEach(match => {
        providers.push({
          text: match,
          category: 'healthcare_provider',
          confidence: 0.92
        });
      });
    }
    
    return providers;
  }
  
  private static extractMeasurements(text: string): MedicalEntity[] {
    const measurements: MedicalEntity[] = [];
    const measurementPatterns = [
      /\d+\.?\d*\s*(?:mg\/dL|g\/dL|μL|mL|mmHg|bpm|°F|°C|kg|lbs|cm|ft|in)/gi,
      /\d+\.?\d*\/\d+\.?\d*\s*mmHg/gi, // Blood pressure
      /\d+\.?\d*%/g // Percentages
    ];
    
    measurementPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          measurements.push({
            text: match,
            category: 'measurement',
            confidence: 0.85
          });
        });
      }
    });
    
    return measurements;
  }
}
