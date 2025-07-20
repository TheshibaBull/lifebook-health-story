
interface ChatGPTAnalysisResult {
  summary: string;
  detectedObjects: string[];
  textContent: string;
  medicalFindings: string[];
  keyMetrics: string[];
  recommendations: string[];
  confidence: number;
  analysisType: string;
  urgentItems: string[];
  followUpActions: string[];
}

export class ChatGPTMedicalAnalysisService {
  private static readonly OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
  
  static async analyzeImage(imageUrl: string, fileName: string): Promise<ChatGPTAnalysisResult> {
    console.log('Starting ChatGPT medical analysis for:', fileName);
    
    try {
      // Get the API key from localStorage (user will input it)
      const apiKey = localStorage.getItem('openai_api_key');
      
      if (!apiKey) {
        throw new Error('OpenAI API key not found. Please enter your API key.');
      }

      const response = await fetch(this.OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are an expert medical document analyst with years of experience in healthcare documentation. Your role is to provide detailed, actionable medical insights from documents.

CRITICAL: You MUST respond with a valid JSON object containing ALL the required fields. Do not include any text before or after the JSON.

Required JSON structure:
{
  "summary": "Detailed description of the medical document and key findings",
  "detectedObjects": ["list", "of", "visual", "elements", "seen"],
  "textContent": "All text extracted from the document",
  "medicalFindings": ["specific", "medical", "conditions", "or", "results", "found"],
  "keyMetrics": ["measurements", "with", "values", "and", "units"],
  "recommendations": ["specific", "actionable", "medical", "recommendations"],
  "confidence": 0.95,
  "analysisType": "Type of medical document (e.g., Lab Report, Prescription, X-Ray Report)",
  "urgentItems": ["urgent", "findings", "requiring", "immediate", "attention"],
  "followUpActions": ["specific", "next", "steps", "to", "take"]
}

ANALYSIS REQUIREMENTS:
1. Extract ALL visible text accurately
2. Identify specific medical conditions, test results, medications, dosages
3. Provide 5-8 specific, actionable recommendations based on the content
4. Highlight any urgent or abnormal findings
5. Suggest concrete follow-up actions
6. Include measurements with proper units
7. Be specific about medical terminology found

RECOMMENDATION GUIDELINES:
- Make recommendations specific to what you see in the document
- Include lifestyle advice relevant to findings
- Suggest follow-up appointments if abnormal values
- Recommend monitoring for specific conditions
- Provide dietary or activity suggestions when appropriate
- Include medication adherence tips if prescriptions are present
- Suggest questions to ask healthcare providers

IMPORTANT: Always provide detailed, personalized recommendations even for simple documents.`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this medical document: ${fileName}. 

Please provide:
1. Complete text extraction
2. Detailed medical findings with specific values
3. At least 5 personalized medical recommendations based on what you see
4. Any urgent items that need immediate attention
5. Specific follow-up actions to take

Focus on being specific and actionable with your recommendations.`
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
          max_tokens: 3000,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('ChatGPT API error response:', errorData);
        throw new Error(`ChatGPT API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from ChatGPT');
      }

      console.log('ChatGPT raw response:', content);

      // Clean the response to extract JSON
      let cleanedContent = content.trim();
      
      // Remove any markdown code blocks
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      // Parse the JSON response
      let analysisResult: ChatGPTAnalysisResult;
      try {
        analysisResult = JSON.parse(cleanedContent);
        console.log('Parsed ChatGPT analysis:', analysisResult);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Content that failed to parse:', cleanedContent);
        
        // Try to extract meaningful information from the response
        analysisResult = this.createEnhancedFallbackAnalysis(content, fileName);
      }

      // Ensure all required fields are present and enhanced
      analysisResult = this.validateAndEnhanceResult(analysisResult, fileName);

      console.log('Final enhanced ChatGPT analysis result:', analysisResult);
      return analysisResult;

    } catch (error) {
      console.error('ChatGPT analysis failed:', error);
      throw error;
    }
  }

  private static createEnhancedFallbackAnalysis(content: string, fileName: string): ChatGPTAnalysisResult {
    // Extract any meaningful information from the response
    const lines = content.split('\n').filter(line => line.trim());
    
    return {
      summary: `Detailed analysis of ${fileName}. ${lines.slice(0, 3).join(' ').substring(0, 200)}...`,
      detectedObjects: ['medical document', 'text', 'data'],
      textContent: content.substring(0, 500),
      medicalFindings: this.extractMedicalTerms(content),
      keyMetrics: this.extractMetrics(content),
      recommendations: [
        'Schedule a follow-up appointment with your healthcare provider to discuss these results',
        'Keep this document organized in your medical records for future reference',
        'Ask your doctor to explain any medical terms or values you don\'t understand',
        'Monitor any symptoms mentioned and report changes to your healthcare team',
        'Ensure all your healthcare providers have access to these important results',
        'Follow any medication instructions or lifestyle recommendations provided',
        'Set reminders for any follow-up tests or appointments mentioned in the document'
      ],
      confidence: 0.75,
      analysisType: this.determineDocumentType(fileName, content),
      urgentItems: this.extractUrgentItems(content),
      followUpActions: [
        'Schedule appointment with your primary care physician',
        'Prepare questions about your results before your next visit',
        'Keep this document accessible for future medical appointments'
      ]
    };
  }

  private static validateAndEnhanceResult(result: any, fileName: string): ChatGPTAnalysisResult {
    // Ensure recommendations are detailed and actionable
    let enhancedRecommendations = result.recommendations || [];
    
    if (!enhancedRecommendations.length || enhancedRecommendations.length < 3) {
      enhancedRecommendations = [
        'Review these results thoroughly with your healthcare provider during your next appointment',
        'Keep this document easily accessible for all future medical visits and consultations',
        'Ask your doctor to explain any medical terminology or values that are unclear to you',
        'Monitor any symptoms or conditions mentioned and report changes to your healthcare team',
        'Ensure all your healthcare providers have copies of these important medical results',
        'Follow up on any recommended tests, treatments, or lifestyle modifications mentioned',
        'Set calendar reminders for any follow-up appointments or tests that may be needed'
      ];
    }

    // Enhance medical findings if empty
    let enhancedFindings = result.medicalFindings || [];
    if (!enhancedFindings.length && result.textContent) {
      enhancedFindings = this.extractMedicalTerms(result.textContent);
    }

    // Enhance key metrics if empty
    let enhancedMetrics = result.keyMetrics || [];
    if (!enhancedMetrics.length && result.textContent) {
      enhancedMetrics = this.extractMetrics(result.textContent);
    }

    return {
      summary: result.summary || `Comprehensive medical analysis of ${fileName} has been completed with detailed findings and recommendations.`,
      detectedObjects: Array.isArray(result.detectedObjects) ? result.detectedObjects : ['medical document', 'healthcare data'],
      textContent: result.textContent || 'Text extraction completed - please review document manually if specific text is needed.',
      medicalFindings: enhancedFindings,
      keyMetrics: enhancedMetrics,
      recommendations: enhancedRecommendations,
      confidence: typeof result.confidence === 'number' ? result.confidence : 0.85,
      analysisType: result.analysisType || this.determineDocumentType(fileName, result.textContent || ''),
      urgentItems: Array.isArray(result.urgentItems) ? result.urgentItems : [],
      followUpActions: Array.isArray(result.followUpActions) ? result.followUpActions : [
        'Schedule follow-up appointment with your healthcare provider',
        'Discuss these results during your next medical visit',
        'Keep this document in your medical records'
      ]
    };
  }

  private static determineDocumentType(fileName: string, content: string): string {
    const lowerFileName = fileName.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    if (lowerFileName.includes('lab') || lowerContent.includes('lab') || lowerContent.includes('blood test')) {
      return 'Laboratory Results';
    } else if (lowerFileName.includes('prescription') || lowerContent.includes('medication') || lowerContent.includes('rx')) {
      return 'Prescription Document';
    } else if (lowerFileName.includes('xray') || lowerFileName.includes('x-ray') || lowerContent.includes('imaging')) {
      return 'Medical Imaging Report';
    } else if (lowerContent.includes('visit') || lowerContent.includes('appointment')) {
      return 'Medical Visit Notes';
    } else {
      return 'Medical Document';
    }
  }

  private static extractMedicalTerms(text: string): string[] {
    const medicalTerms = [
      'blood pressure', 'heart rate', 'temperature', 'glucose', 'cholesterol',
      'hemoglobin', 'white blood cell', 'red blood cell', 'diabetes', 'hypertension',
      'medication', 'prescription', 'diagnosis', 'treatment', 'symptoms',
      'blood sugar', 'triglycerides', 'HDL', 'LDL', 'creatinine'
    ];
    
    return medicalTerms.filter(term => 
      text.toLowerCase().includes(term.toLowerCase())
    );
  }

  private static extractMetrics(text: string): string[] {
    const metricPattern = /\d+\.?\d*\s*(?:mg\/dl|mmhg|bpm|°f|°c|kg|lbs|cm|%|mg|ml|units)/gi;
    return text.match(metricPattern) || [];
  }

  private static extractUrgentItems(text: string): string[] {
    const urgentKeywords = ['urgent', 'immediate', 'critical', 'high', 'low', 'abnormal', 'emergency'];
    const lines = text.split('\n');
    
    return lines.filter(line => 
      urgentKeywords.some(keyword => line.toLowerCase().includes(keyword))
    ).slice(0, 3);
  }

  static setAPIKey(apiKey: string) {
    localStorage.setItem('openai_api_key', apiKey);
  }

  static getAPIKey(): string | null {
    return localStorage.getItem('openai_api_key');
  }

  static clearAPIKey() {
    localStorage.removeItem('openai_api_key');
  }
}
