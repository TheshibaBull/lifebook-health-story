
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
  };
}

export class AIDocumentProcessor {
  static async analyzeDocument(file: File): Promise<DocumentAnalysis> {
    console.log('Analyzing document:', file.name);
    
    // Simulate AI analysis with realistic processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const fileName = file.name.toLowerCase();
    const fileType = file.type;
    
    // Simulate OCR and content extraction
    const extractedText = await this.performOCR(file);
    
    // Analyze content for categorization
    const category = this.determineCategory(fileName, extractedText);
    const tags = this.generateTags(fileName, extractedText);
    const medicalEntities = this.extractMedicalEntities(extractedText);
    
    return {
      category,
      tags,
      extractedText,
      confidence: Math.random() * 0.3 + 0.7, // 70-100%
      medicalEntities
    };
  }
  
  private static async performOCR(file: File): Promise<string> {
    // Simulate OCR processing
    const fileName = file.name.toLowerCase();
    
    if (fileName.includes('blood') || fileName.includes('test')) {
      return 'Blood Test Results\nPatient: John Doe\nDate: 2024-01-15\nHemoglobin: 14.2 g/dL\nWhite Blood Cells: 6,800/μL\nPlatelet Count: 250,000/μL\nGlucose: 95 mg/dL\nCholesterol: 180 mg/dL\nTriglycerides: 120 mg/dL';
    } else if (fileName.includes('prescription') || fileName.includes('rx')) {
      return 'Prescription\nPatient: John Doe\nProvider: Dr. Smith\nDate: 2024-01-20\nMedication: Lisinopril 10mg\nQuantity: 30 tablets\nRefills: 2\nInstructions: Take once daily with food';
    } else if (fileName.includes('scan') || fileName.includes('xray')) {
      return 'X-Ray Report\nPatient: John Doe\nExam: Chest X-Ray\nDate: 2024-01-10\nFindings: No acute abnormalities\nImpression: Normal chest radiograph';
    } else {
      return 'Medical Document\nPatient information and clinical notes extracted via OCR processing.';
    }
  }
  
  private static determineCategory(fileName: string, content: string): string {
    const text = (fileName + ' ' + content).toLowerCase();
    
    if (text.includes('blood') || text.includes('lab') || text.includes('test')) return 'Lab Results';
    if (text.includes('prescription') || text.includes('medication') || text.includes('rx')) return 'Prescriptions';
    if (text.includes('scan') || text.includes('xray') || text.includes('mri') || text.includes('ct')) return 'Imaging';
    if (text.includes('visit') || text.includes('appointment') || text.includes('consultation')) return 'Visit Notes';
    if (text.includes('vaccination') || text.includes('vaccine') || text.includes('immunization')) return 'Vaccinations';
    if (text.includes('surgery') || text.includes('procedure') || text.includes('operation')) return 'Procedures';
    if (text.includes('insurance') || text.includes('claim') || text.includes('coverage')) return 'Insurance';
    
    return 'General';
  }
  
  private static generateTags(fileName: string, content: string): string[] {
    const text = (fileName + ' ' + content).toLowerCase();
    const tags = [];
    
    // Medical specialties
    if (text.includes('cardio') || text.includes('heart')) tags.push('Cardiology');
    if (text.includes('dental') || text.includes('tooth')) tags.push('Dental');
    if (text.includes('eye') || text.includes('vision')) tags.push('Ophthalmology');
    if (text.includes('brain') || text.includes('neuro')) tags.push('Neurology');
    
    // Document types
    if (text.includes('urgent') || text.includes('emergency')) tags.push('Urgent');
    if (text.includes('annual') || text.includes('routine')) tags.push('Routine');
    if (text.includes('follow') || text.includes('followup')) tags.push('Follow-up');
    
    // Conditions
    if (text.includes('diabetes')) tags.push('Diabetes');
    if (text.includes('hypertension') || text.includes('blood pressure')) tags.push('Hypertension');
    if (text.includes('cholesterol')) tags.push('Cholesterol');
    
    return tags.length > 0 ? tags : ['Medical Record'];
  }
  
  private static extractMedicalEntities(content: string): DocumentAnalysis['medicalEntities'] {
    const text = content.toLowerCase();
    
    return {
      conditions: this.extractConditions(text),
      medications: this.extractMedications(text),
      procedures: this.extractProcedures(text),
      dates: this.extractDates(content),
      providers: this.extractProviders(content)
    };
  }
  
  private static extractConditions(text: string): string[] {
    const conditions = [];
    if (text.includes('diabetes')) conditions.push('Diabetes');
    if (text.includes('hypertension')) conditions.push('Hypertension');
    if (text.includes('high blood pressure')) conditions.push('High Blood Pressure');
    if (text.includes('cholesterol')) conditions.push('High Cholesterol');
    return conditions;
  }
  
  private static extractMedications(text: string): string[] {
    const medications = [];
    if (text.includes('lisinopril')) medications.push('Lisinopril');
    if (text.includes('metformin')) medications.push('Metformin');
    if (text.includes('atorvastatin')) medications.push('Atorvastatin');
    return medications;
  }
  
  private static extractProcedures(text: string): string[] {
    const procedures = [];
    if (text.includes('x-ray') || text.includes('xray')) procedures.push('X-Ray');
    if (text.includes('blood test')) procedures.push('Blood Test');
    if (text.includes('mri')) procedures.push('MRI Scan');
    return procedures;
  }
  
  private static extractDates(content: string): string[] {
    const dateRegex = /\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}/g;
    return content.match(dateRegex) || [];
  }
  
  private static extractProviders(content: string): string[] {
    const providerRegex = /Dr\.\s+[A-Z][a-z]+/g;
    return content.match(providerRegex) || [];
  }
}
