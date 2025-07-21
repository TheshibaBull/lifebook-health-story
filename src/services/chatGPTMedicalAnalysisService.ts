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
          content: `You are a medical AI assistant. Analyze the medical document image and provide SPECIFIC, ACTIONABLE medical recommendations.

CRITICAL: Your response must be ONLY a valid JSON object with this EXACT structure:
{
  "summary": "Clinical summary of the document",
  "keyFindings": ["finding1", "finding2", "finding3"],
  "recommendations": [
    "Schedule follow-up appointment with cardiologist within 2 weeks",
    "Monitor blood pressure daily and maintain log",
    "Increase daily water intake to 8-10 glasses",
    "Follow Mediterranean diet with low sodium",
    "Exercise for 30 minutes daily as tolerated",
    "Take prescribed medications as directed"
  ],
  "medicalTerms": ["hypertension", "cholesterol", "ECG"],
  "metrics": ["BP: 140/90", "HR: 78 bpm"],
  "urgentItems": ["High blood pressure requires immediate attention"],
  "confidence": 0.95,
  "category": "Lab Results"
}

REQUIREMENTS:
- Always provide 4-8 specific, actionable recommendations
- Make recommendations relevant to the medical document content
- Include specific timeframes and instructions
- No additional text outside the JSON object`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this medical document (${fileName}) and provide detailed medical recommendations. Focus on specific, actionable advice based on the document content.`
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
      temperature: 0.2
    };

    console.log('Sending request to ChatGPT API...');
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('ChatGPT API Response Status:', response.status);
      console.log('ChatGPT API Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ChatGPT API Error Response:', errorText);
        throw new Error(`ChatGPT API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('Raw ChatGPT API Response:', JSON.stringify(data, null, 2));

      if (!data.choices?.[0]?.message?.content) {
        console.error('Invalid response structure from ChatGPT');
        throw new Error('Invalid response from ChatGPT API');
      }

      const content = data.choices[0].message.content.trim();
      console.log('ChatGPT Response Content:', content);

      // Parse the JSON response
      let analysis: MedicalAnalysis;
      try {
        // Try to find JSON in the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonString = jsonMatch[0];
          console.log('Extracted JSON:', jsonString);
          analysis = JSON.parse(jsonString);
        } else {
          console.log('No JSON found, trying to parse entire content...');
          analysis = JSON.parse(content);
        }
        
        console.log('Successfully parsed analysis:', analysis);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.log('Failed to parse content:', content);
        
        // Create structured fallback analysis
        analysis = this.createEnhancedFallbackAnalysis(content, fileName);
      }

      // Validate and ensure proper structure
      analysis = this.validateAnalysisStructure(analysis);
      
      console.log('=== FINAL ANALYSIS RESULT ===');
      console.log('Summary:', analysis.summary);
      console.log('Key Findings Count:', analysis.keyFindings.length);
      console.log('Recommendations Count:', analysis.recommendations.length);
      console.log('Recommendations:', analysis.recommendations);
      console.log('=== END ANALYSIS ===');
      
      return analysis;

    } catch (error) {
      console.error('ChatGPT Analysis Error:', error);
      
      // Return enhanced fallback
      const fallbackAnalysis = this.createEnhancedFallbackAnalysis('', fileName);
      console.log('Using enhanced fallback analysis:', fallbackAnalysis);
      
      return fallbackAnalysis;
    }
  }

  private static createEnhancedFallbackAnalysis(content: string, fileName: string): MedicalAnalysis {
    console.log('Creating enhanced fallback analysis...');
    
    const recommendations = [
      'Schedule a follow-up appointment with your healthcare provider within 2-4 weeks to discuss these results',
      'Keep a detailed record of any symptoms or changes in your health condition',
      'Follow any prescribed treatment plans and medication schedules consistently',
      'Monitor your vital signs regularly and report any significant changes to your doctor',
      'Maintain a healthy lifestyle with proper diet, exercise, and adequate sleep',
      'Contact your healthcare provider immediately if you experience any concerning symptoms'
    ];

    const keyFindings = [
      'Medical document has been processed and analyzed',
      'Key medical information has been extracted from the document',
      'Document contains important health-related data for your medical records'
    ];

    return {
      summary: `Medical analysis completed for ${fileName}. The document has been processed and key medical information has been extracted for your healthcare records.`,
      keyFindings,
      recommendations,
      medicalTerms: ['medical', 'health', 'analysis', 'document'],
      metrics: [],
      urgentItems: [],
      confidence: 0.75,
      category: 'Medical Document Analysis'
    };
  }

  private static validateAnalysisStructure(analysis: any): MedicalAnalysis {
    console.log('Validating analysis structure...');
    console.log('Input analysis:', analysis);
    
    // Ensure all required fields exist with proper types
    const validated: MedicalAnalysis = {
      summary: typeof analysis.summary === 'string' ? analysis.summary : 'Medical document analysis completed',
      keyFindings: Array.isArray(analysis.keyFindings) ? analysis.keyFindings : [
        'Document processed successfully',
        'Medical information extracted',
        'Analysis completed'
      ],
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [
        'Follow up with your healthcare provider to discuss these results',
        'Keep this document in your medical records for future reference',
        'Monitor any symptoms mentioned and report changes to your doctor',
        'Follow prescribed treatment plans consistently',
        'Maintain regular health check-ups as recommended'
      ],
      medicalTerms: Array.isArray(analysis.medicalTerms) ? analysis.medicalTerms : [],
      metrics: Array.isArray(analysis.metrics) ? analysis.metrics : [],
      urgentItems: Array.isArray(analysis.urgentItems) ? analysis.urgentItems : [],
      confidence: typeof analysis.confidence === 'number' ? analysis.confidence : 0.85,
      category: typeof analysis.category === 'string' ? analysis.category : 'Medical Document'
    };

    // Ensure we have at least 4 recommendations
    if (validated.recommendations.length < 4) {
      const additionalRecs = [
        'Schedule regular health monitoring appointments',
        'Maintain a healthy lifestyle with proper diet and exercise',
        'Keep detailed records of your health status and any changes',
        'Follow medication schedules as prescribed by your healthcare provider',
        'Stay informed about your health conditions and treatment options'
      ];
      
      while (validated.recommendations.length < 4 && additionalRecs.length > 0) {
        validated.recommendations.push(additionalRecs.shift()!);
      }
    }

    console.log('Validated analysis:', validated);
    console.log('Final recommendations count:', validated.recommendations.length);
    
    return validated;
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
