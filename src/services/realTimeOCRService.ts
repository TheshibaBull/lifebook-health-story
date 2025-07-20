
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

export interface RealTimeOCRResult {
  text: string;
  confidence: number;
  language: string;
  entities: {
    medications: string[];
    conditions: string[];
    dates: string[];
    measurements: string[];
    providers: string[];
  };
}

export class RealTimeOCRService {
  private static ocrPipeline: any = null;
  private static nerPipeline: any = null;

  static async initialize() {
    console.log('Initializing real-time OCR service...');
    
    try {
      // Initialize OCR pipeline for text extraction
      this.ocrPipeline = await pipeline('image-to-text', 'Xenova/trocr-base-printed');
      
      // Initialize NER pipeline for medical entity extraction
      this.nerPipeline = await pipeline('token-classification', 'Xenova/bert-base-NER');
      
      console.log('OCR service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OCR service:', error);
      throw error;
    }
  }

  static async extractText(file: File): Promise<RealTimeOCRResult> {
    console.log('Extracting text from file:', file.name);
    
    if (!this.ocrPipeline) {
      await this.initialize();
    }

    try {
      // Convert file to base64 URL for the pipeline
      const imageUrl = await this.fileToBase64(file);
      
      // Extract text using OCR
      const ocrResult = await this.ocrPipeline(imageUrl);
      const extractedText = ocrResult[0]?.generated_text || '';
      
      // Extract medical entities
      const entities = await this.extractMedicalEntities(extractedText);
      
      return {
        text: extractedText,
        confidence: 0.85, // Default confidence
        language: 'en',
        entities
      };
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error(`OCR processing failed: ${error.message}`);
    }
  }

  private static async extractMedicalEntities(text: string) {
    if (!this.nerPipeline || !text.trim()) {
      return {
        medications: [],
        conditions: [],
        dates: [],
        measurements: [],
        providers: []
      };
    }

    try {
      const nerResult = await this.nerPipeline(text);
      
      return {
        medications: this.filterEntities(nerResult, ['medication', 'drug']),
        conditions: this.filterEntities(nerResult, ['condition', 'disease']),
        dates: this.extractDates(text),
        measurements: this.extractMeasurements(text),
        providers: this.extractProviders(text)
      };
    } catch (error) {
      console.error('NER extraction failed:', error);
      return {
        medications: [],
        conditions: [],
        dates: [],
        measurements: [],
        providers: []
      };
    }
  }

  private static filterEntities(nerResult: any[], categories: string[]): string[] {
    return nerResult
      .filter(entity => categories.some(cat => entity.entity.toLowerCase().includes(cat)))
      .map(entity => entity.word)
      .filter(Boolean);
  }

  private static extractDates(text: string): string[] {
    const dateRegex = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}\b|\b\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\b/g;
    return text.match(dateRegex) || [];
  }

  private static extractMeasurements(text: string): string[] {
    const measurementRegex = /\d+\.?\d*\s*(?:mg|g|ml|mmHg|bpm|°F|°C|kg|lbs|cm|ft|in|%)/gi;
    return text.match(measurementRegex) || [];
  }

  private static extractProviders(text: string): string[] {
    const providerRegex = /Dr\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:,?\s*M\.?D\.?)?/g;
    return text.match(providerRegex) || [];
  }

  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
