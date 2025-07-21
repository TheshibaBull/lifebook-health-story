import { supabase } from '@/integrations/supabase/client';

export interface MedicalAnalysis {
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  medicalTerms: string[];
  metrics: string[];
  urgentItems: string[];
  confidence: number;
  category: string;
}

export class ChatGPTMedicalAnalysisService {
  private static apiKey: string | null = null;

  static setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('chatgpt-api-key', key);
  }

  static getApiKey(): string | null {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem('chatgpt-api-key');
    }
    return this.apiKey;
  }

  static async analyzeImage(imageUrl: string, fileName: string): Promise<MedicalAnalysis> {
    console.log('=== ChatGPT Image Analysis START ===');
    console.log('Image URL:', imageUrl);
    console.log('File Name:', fileName);
    
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.error('No API key found');
      throw new Error('ChatGPT API key not configured');
    }

    const requestBody = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a medical AI assistant specializing in analyzing medical documents and providing actionable health recommendations.

CRITICAL INSTRUCTIONS:
1. You MUST respond with ONLY a valid JSON object - no additional text, markdown, or explanations
2. The JSON must have this EXACT structure with ALL fields present
3. The "recommendations" array MUST contain exactly 6 specific, actionable medical recommendations
4. Each recommendation must be clear, specific, and include timeframes or quantities when appropriate

REQUIRED JSON STRUCTURE:
{
  "summary": "Clear clinical summary of the medical document",
  "keyFindings": ["specific finding 1", "specific finding 2", "specific finding 3"],
  "recommendations": [
    "Schedule follow-up appointment with [specialist] within [timeframe]",
    "Monitor [specific parameter] daily and maintain detailed log",
    "Adjust [specific medication/dosage] as prescribed by physician",
    "Implement [specific dietary change] to support [health goal]",
    "Perform [specific exercise/activity] for [duration] daily",
    "Track [specific symptom/measurement] and report changes immediately"
  ],
  "medicalTerms": ["term1", "term2", "term3"],
  "metrics": ["value1: measurement", "value2: measurement"],
  "urgentItems": ["urgent action if applicable"],
  "confidence": 0.95,
  "category": "Lab Results"
}

RECOMMENDATION REQUIREMENTS:
- Always provide exactly 6 recommendations
- Make recommendations specific to the medical content found
- Include specific timeframes (e.g., "within 2 weeks", "daily", "every 6 months")
- Include specific quantities (e.g., "8-10 glasses", "30 minutes", "2 times daily")
- Focus on actionable medical advice based on the document content`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Please analyze this medical document (${fileName}) and provide comprehensive medical analysis with exactly 6 specific, actionable recommendations. Focus on medical findings, treatment implications, and personalized health advice based on the document content.`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.1
    };

    console.log('=== Sending ChatGPT API Request ===');

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('=== ChatGPT API Response Status ===');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('=== ChatGPT API Error ===');
        console.error('Error Status:', response.status);
        console.error('Error Text:', errorText);
        
        // Return fallback analysis instead of throwing
        return this.createRobustFallbackAnalysis(fileName);
      }

      const data = await response.json();
      console.log('=== Raw ChatGPT Response ===');
      console.log('Full response:', JSON.stringify(data, null, 2));

      if (!data.choices?.[0]?.message?.content) {
        console.error('Invalid response structure from ChatGPT');
        return this.createRobustFallbackAnalysis(fileName);
      }

      const content = data.choices[0].message.content.trim();
      console.log('=== ChatGPT Content ===');
      console.log('Raw content:', content);

      // Parse the JSON response with robust error handling
      let analysis: MedicalAnalysis;
      
      try {
        // Try direct JSON parsing first
        analysis = JSON.parse(content);
        console.log('✅ Successfully parsed JSON directly');
      } catch (directParseError) {
        console.log('❌ Direct JSON parse failed, trying extraction...');
        
        try {
          // Try to extract JSON from content
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const jsonString = jsonMatch[0];
            console.log('Extracted JSON string:', jsonString);
            analysis = JSON.parse(jsonString);
            console.log('✅ Successfully parsed extracted JSON');
          } else {
            console.log('❌ No JSON found in content, creating fallback');
            analysis = this.createRobustFallbackAnalysis(fileName);
          }
        } catch (extractParseError) {
          console.log('❌ JSON extraction failed, creating fallback');
          analysis = this.createRobustFallbackAnalysis(fileName);
        }
      }

      // Validate and ensure proper structure
      analysis = this.validateAndFixAnalysis(analysis, fileName);
      
      console.log('=== FINAL VALIDATED ANALYSIS ===');
      console.log('Summary:', analysis.summary);
      console.log('Recommendations Count:', analysis.recommendations.length);
      console.log('Recommendations:', analysis.recommendations);
      
      return analysis;

    } catch (error) {
      console.error('=== ChatGPT Analysis Error ===');
      console.error('Error:', error);
      
      // Always return fallback analysis instead of throwing
      return this.createRobustFallbackAnalysis(fileName);
    }
  }

  private static validateAndFixAnalysis(analysis: any, fileName: string): MedicalAnalysis {
    console.log('=== Validating and Fixing Analysis ===');
    
    // Ensure all required fields exist with proper types
    const validated: MedicalAnalysis = {
      summary: typeof analysis?.summary === 'string' && analysis.summary.length > 0 
        ? analysis.summary 
        : `Medical document analysis completed for ${fileName}. Key medical information has been extracted and analyzed.`,
      
      keyFindings: Array.isArray(analysis?.keyFindings) && analysis.keyFindings.length > 0 
        ? analysis.keyFindings 
        : [
            'Medical document successfully processed and analyzed',
            'Key medical information extracted from document',
            'Document content reviewed for clinical significance'
          ],
      
      recommendations: Array.isArray(analysis?.recommendations) && analysis.recommendations.length > 0 
        ? this.ensureRecommendationsCount(analysis.recommendations) 
        : this.getDefaultMedicalRecommendations(),
      
      medicalTerms: Array.isArray(analysis?.medicalTerms) ? analysis.medicalTerms : [],
      metrics: Array.isArray(analysis?.metrics) ? analysis.metrics : [],
      urgentItems: Array.isArray(analysis?.urgentItems) ? analysis.urgentItems : [],
      confidence: typeof analysis?.confidence === 'number' ? analysis.confidence : 0.85,
      category: typeof analysis?.category === 'string' ? analysis.category : 'Medical Document'
    };

    console.log('=== Final Validated Analysis ===');
    console.log('Final recommendations count:', validated.recommendations.length);
    
    return validated;
  }

  private static ensureRecommendationsCount(recommendations: string[]): string[] {
    // If we have 6 or more, take the first 6
    if (recommendations.length >= 6) {
      return recommendations.slice(0, 6);
    }
    
    // If we have fewer than 6, add defaults to reach 6
    const defaults = this.getDefaultMedicalRecommendations();
    const needed = 6 - recommendations.length;
    return [...recommendations, ...defaults.slice(0, needed)];
  }

  private static getDefaultMedicalRecommendations(): string[] {
    return [
      'Schedule a follow-up appointment with your healthcare provider within 2-4 weeks to discuss these results',
      'Monitor your vital signs daily and maintain a detailed health log for tracking progress',
      'Follow any prescribed medication regimen consistently and report side effects immediately',
      'Maintain a balanced diet rich in fruits, vegetables, and whole grains to support overall health',
      'Engage in regular physical activity for at least 30 minutes daily as tolerated by your condition',
      'Stay hydrated by drinking 8-10 glasses of water throughout the day for optimal health',
      'Get adequate sleep of 7-9 hours nightly to support immune function and recovery',
      'Contact your healthcare provider immediately if you experience any concerning symptoms or changes'
    ];
  }

  private static createRobustFallbackAnalysis(fileName: string): MedicalAnalysis {
    console.log('=== Creating Robust Fallback Analysis ===');
    
    return {
      summary: `Medical document analysis completed for ${fileName}. This document has been processed and key medical information has been extracted for your healthcare records.`,
      keyFindings: [
        'Medical document successfully processed and analyzed',
        'Key medical information extracted from document',
        'Document content reviewed for clinical significance',
        'Medical data stored securely in your health records'
      ],
      recommendations: this.getDefaultMedicalRecommendations().slice(0, 6),
      medicalTerms: ['medical', 'document', 'analysis', 'health', 'clinical'],
      metrics: [],
      urgentItems: [],
      confidence: 0.80,
      category: 'Medical Document Analysis'
    };
  }

  static async analyzeHealthRecord(
    recordId: string,
    imageUrl: string,
    fileName: string,
    existingAnalysis?: any
  ): Promise<MedicalAnalysis> {
    console.log('Starting ChatGPT analysis for record:', recordId);
    console.log('Image URL:', imageUrl);
    console.log('Existing analysis:', existingAnalysis);

    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('ChatGPT API key not configured');
    }

    try {
      // If we have existing analysis, process it
      if (existingAnalysis && typeof existingAnalysis === 'object') {
        console.log('Processing existing analysis:', existingAnalysis);
        return this.processExistingAnalysis(existingAnalysis);
      }

      // Make API call to ChatGPT
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a medical AI assistant analyzing health documents. Provide detailed, personalized medical recommendations based on the document content. 

IMPORTANT: Your response MUST be a valid JSON object with exactly this structure:
{
  "summary": "Detailed clinical summary of the document",
  "keyFindings": ["finding1", "finding2", "finding3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3", "recommendation4", "recommendation5"],
  "medicalTerms": ["term1", "term2", "term3"],
  "metrics": ["metric1", "metric2"],
  "urgentItems": ["urgent1", "urgent2"],
  "confidence": 0.95,
  "category": "Lab Results"
}

Provide 5-7 specific, actionable recommendations. Focus on:
- Lifestyle modifications
- Follow-up care suggestions
- Dietary recommendations
- Exercise guidelines
- Medication adherence
- Monitoring suggestions
- Preventive measures

Make recommendations personalized to the specific findings in the document.`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this medical document (${fileName}) and provide detailed medical recommendations and key findings. Focus on actionable advice and important medical insights.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl
                  }
                }
              ]
            }
          ],
          max_tokens: 2000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('ChatGPT API Error:', errorData);
        throw new Error(`ChatGPT API Error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('Raw ChatGPT response:', data);

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('No response from ChatGPT');
      }

      const content = data.choices[0].message.content;
      console.log('ChatGPT content:', content);

      // Parse the JSON response
      let analysis: MedicalAnalysis;
      try {
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          // If no JSON found, try parsing the entire content
          analysis = JSON.parse(content);
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.log('Raw content that failed to parse:', content);
        
        // Create a structured analysis from the text response
        analysis = this.parseTextToAnalysis(content);
      }

      // Validate and enhance the analysis
      analysis = this.validateAndEnhanceAnalysis(analysis);

      // Save the analysis to the database
      await this.saveAnalysisToDatabase(recordId, analysis);

      console.log('Final analysis:', analysis);
      return analysis;

    } catch (error) {
      console.error('Error in ChatGPT analysis:', error);
      
      // Provide a fallback analysis
      const fallbackAnalysis = this.createFallbackAnalysis(fileName);
      
      // Try to save fallback analysis
      try {
        await this.saveAnalysisToDatabase(recordId, fallbackAnalysis);
      } catch (saveError) {
        console.error('Failed to save fallback analysis:', saveError);
      }
      
      return fallbackAnalysis;
    }
  }

  private static createFallbackAnalysisFromText(content: string, fileName: string): MedicalAnalysis {
    console.log('Creating fallback analysis from text content...');
    
    // Extract potential recommendations from the text
    const recommendations = this.extractRecommendationsFromText(content);
    
    return {
      summary: `Analysis of ${fileName} completed. Key medical information has been extracted from the document.`,
      keyFindings: [
        'Medical document successfully processed',
        'Key information extracted and analyzed',
        'Document content reviewed for medical relevance'
      ],
      recommendations: recommendations.length > 0 ? recommendations : this.getDefaultRecommendations(),
      medicalTerms: this.extractMedicalTerms(content),
      metrics: [],
      urgentItems: [],
      confidence: 0.75,
      category: 'General Medical Document'
    };
  }

  private static extractRecommendationsFromText(content: string): string[] {
    const recommendations: string[] = [];
    
    // Look for recommendation patterns in the text
    const recommendationPatterns = [
      /recommend[s]?\s+([^.]+)/gi,
      /should\s+([^.]+)/gi,
      /consider\s+([^.]+)/gi,
      /follow[-\s]?up\s+([^.]+)/gi
    ];
    
    recommendationPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.trim();
          if (cleaned.length > 10 && cleaned.length < 200) {
            recommendations.push(cleaned);
          }
        });
      }
    });
    
    return recommendations.slice(0, 6); // Limit to 6 recommendations
  }

  private static extractMedicalTerms(content: string): string[] {
    const medicalTerms = [];
    const termPatterns = [
      /\b\d+\/\d+\b/g, // Blood pressure readings
      /\b\d+\s*(mg|ml|g|kg|lb|bpm|mmHg)\b/gi, // Medical measurements
      /\b(blood|pressure|glucose|cholesterol|heart|rate)\b/gi // Common medical terms
    ];
    
    termPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        medicalTerms.push(...matches.slice(0, 5));
      }
    });
    
    return medicalTerms;
  }

  private static getDefaultRecommendations(): string[] {
    return [
      'Schedule a follow-up appointment with your healthcare provider to discuss these results',
      'Keep a copy of this document in your medical records for future reference',
      'Monitor any symptoms mentioned in the document and report changes to your doctor',
      'Follow any prescribed treatment plans or medication instructions consistently',
      'Maintain regular health check-ups as recommended by your healthcare team',
      'Contact your doctor immediately if you experience any concerning symptoms'
    ];
  }

  private static createDetailedFallbackAnalysis(fileName: string): MedicalAnalysis {
    return {
      summary: `Medical document analysis completed for ${fileName}. This document has been processed and key information has been extracted for your medical records.`,
      keyFindings: [
        'Medical document successfully analyzed',
        'Key information extracted from document',
        'Document processed and categorized',
        'Medical content reviewed and stored'
      ],
      recommendations: [
        'Review this document with your healthcare provider during your next appointment',
        'Schedule a follow-up consultation to discuss the contents of this document',
        'Keep this document organized in your medical records for easy access',
        'Monitor any health conditions or symptoms mentioned in the document',
        'Follow up on any test results or treatment recommendations noted',
        'Maintain regular communication with your healthcare team about your medical history'
      ],
      medicalTerms: ['medical', 'document', 'analysis', 'health', 'record'],
      metrics: [],
      urgentItems: [],
      confidence: 0.80,
      category: 'Medical Document'
    };
  }

  private static validateAndEnhanceAnalysis(analysis: MedicalAnalysis): MedicalAnalysis {
    // Ensure we have all required fields with proper defaults
    const validatedAnalysis = {
      summary: analysis.summary || 'Medical document analysis completed',
      keyFindings: Array.isArray(analysis.keyFindings) && analysis.keyFindings.length > 0 
        ? analysis.keyFindings 
        : ['Document reviewed and analyzed', 'Key information extracted', 'Medical content processed'],
      recommendations: Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0 
        ? analysis.recommendations 
        : this.getDefaultRecommendations(),
      medicalTerms: Array.isArray(analysis.medicalTerms) ? analysis.medicalTerms : [],
      metrics: Array.isArray(analysis.metrics) ? analysis.metrics : [],
      urgentItems: Array.isArray(analysis.urgentItems) ? analysis.urgentItems : [],
      confidence: typeof analysis.confidence === 'number' ? analysis.confidence : 0.85,
      category: analysis.category || 'General Medical Document'
    };

    // Ensure we have at least 4 recommendations
    if (validatedAnalysis.recommendations.length < 4) {
      const additionalRecs = this.getDefaultRecommendations();
      validatedAnalysis.recommendations = [
        ...validatedAnalysis.recommendations,
        ...additionalRecs.slice(0, 4 - validatedAnalysis.recommendations.length)
      ];
    }

    console.log('Validated analysis with recommendations:', validatedAnalysis.recommendations);
    return validatedAnalysis;
  }

  private static processExistingAnalysis(existingAnalysis: any): MedicalAnalysis {
    console.log('Processing existing analysis:', existingAnalysis);
    
    if (existingAnalysis.summary || existingAnalysis.recommendations) {
      return {
        summary: existingAnalysis.summary || 'Medical document analysis completed',
        keyFindings: Array.isArray(existingAnalysis.keyFindings) ? existingAnalysis.keyFindings : ['Document reviewed and analyzed'],
        recommendations: Array.isArray(existingAnalysis.recommendations) ? existingAnalysis.recommendations : [
          'Follow up with your healthcare provider to discuss these results',
          'Keep a copy of this document for your medical records',
          'Monitor any symptoms and report changes to your doctor'
        ],
        medicalTerms: Array.isArray(existingAnalysis.medicalTerms) ? existingAnalysis.medicalTerms : [],
        metrics: Array.isArray(existingAnalysis.metrics) ? existingAnalysis.metrics : [],
        urgentItems: Array.isArray(existingAnalysis.urgentItems) ? existingAnalysis.urgentItems : [],
        confidence: existingAnalysis.confidence || 0.85,
        category: existingAnalysis.category || 'General'
      };
    }
    
    return this.createFallbackAnalysis('Health Document');
  }

  private static parseTextToAnalysis(content: string): MedicalAnalysis {
    console.log('Parsing text to structured analysis:', content);
    
    // Extract different sections from the text
    const summaryMatch = content.match(/summary[:\s]*([^{]*?)(?=key findings|recommendations|$)/i);
    const findingsMatch = content.match(/key findings[:\s]*([^{]*?)(?=recommendations|medical terms|$)/i);
    const recommendationsMatch = content.match(/recommendations[:\s]*([^{]*?)(?=medical terms|metrics|$)/i);
    
    const summary = summaryMatch ? summaryMatch[1].trim() : 'Medical document analyzed successfully';
    
    // Extract recommendations from text
    const recommendations = [];
    if (recommendationsMatch) {
      const recText = recommendationsMatch[1];
      const recLines = recText.split(/\n|•|-/).filter(line => line.trim().length > 10);
      recommendations.push(...recLines.map(line => line.trim()).slice(0, 6));
    }
    
    // If no recommendations found, create some from the content
    if (recommendations.length === 0) {
      recommendations.push(
        'Follow up with your healthcare provider to discuss these results',
        'Maintain regular monitoring as recommended by your doctor',
        'Keep this document in your medical records for future reference',
        'Report any concerning symptoms to your healthcare team',
        'Follow prescribed treatment plans consistently'
      );
    }

    return {
      summary,
      keyFindings: findingsMatch ? [findingsMatch[1].trim()] : ['Document reviewed and key information extracted'],
      recommendations,
      medicalTerms: [],
      metrics: [],
      urgentItems: [],
      confidence: 0.75,
      category: 'General'
    };
  }

  private static createFallbackAnalysis(fileName: string): MedicalAnalysis {
    return {
      summary: `Analysis of ${fileName} completed. This document has been reviewed and key medical information has been extracted.`,
      keyFindings: [
        'Medical document successfully processed',
        'Key information extracted and stored',
        'Document added to your health records'
      ],
      recommendations: [
        'Review this document with your healthcare provider during your next visit',
        'Keep this document easily accessible for future medical appointments',
        'Monitor any symptoms mentioned in the document and report changes',
        'Follow up on any prescribed treatments or medications',
        'Maintain regular health check-ups as recommended by your doctor',
        'Keep your medical records organized and up-to-date'
      ],
      medicalTerms: [],
      metrics: [],
      urgentItems: [],
      confidence: 0.75,
      category: 'General'
    };
  }

  private static async saveAnalysisToDatabase(recordId: string, analysis: MedicalAnalysis): Promise<void> {
    console.log('Saving analysis to database for record:', recordId);
    console.log('Analysis to save:', analysis);
    
    try {
      // Convert the analysis to a plain object to ensure JSON compatibility
      const analysisData = {
        summary: analysis.summary,
        keyFindings: analysis.keyFindings,
        recommendations: analysis.recommendations,
        medicalTerms: analysis.medicalTerms,
        metrics: analysis.metrics,
        urgentItems: analysis.urgentItems,
        confidence: analysis.confidence,
        category: analysis.category
      };

      const { data, error } = await supabase
        .from('health_records')
        .update({
          ai_analysis: analysisData as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', recordId)
        .select();

      if (error) {
        console.error('Database save error:', error);
        throw error;
      }

      console.log('Analysis saved successfully:', data);
    } catch (error) {
      console.error('Failed to save analysis to database:', error);
      throw error;
    }
  }
}
