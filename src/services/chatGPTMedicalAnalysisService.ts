
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
              content: `You are an expert medical document analyst. Analyze medical documents and provide detailed, actionable insights. 

Your response must be a valid JSON object with this exact structure:
{
  "summary": "Brief description of what this document contains",
  "detectedObjects": ["list", "of", "detected", "objects"],
  "textContent": "extracted text from the document",
  "medicalFindings": ["specific", "medical", "findings"],
  "keyMetrics": ["measurements", "values", "with", "units"],
  "recommendations": ["specific", "actionable", "medical", "recommendations"],
  "confidence": 0.95,
  "analysisType": "type of medical document",
  "urgentItems": ["urgent", "items", "requiring", "immediate", "attention"],
  "followUpActions": ["specific", "follow", "up", "actions", "needed"]
}

Focus on:
1. Extracting all visible text accurately
2. Identifying medical conditions, medications, test results
3. Providing specific, actionable recommendations based on the content
4. Highlighting urgent items that need immediate attention
5. Suggesting appropriate follow-up actions
6. Being specific about measurements and values found

Make recommendations practical and personalized to what you see in the document.`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Please analyze this medical document image: ${fileName}. Provide detailed medical analysis including extracted text, findings, measurements, and specific actionable recommendations.`
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
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`ChatGPT API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from ChatGPT');
      }

      console.log('ChatGPT raw response:', content);

      // Parse the JSON response
      let analysisResult: ChatGPTAnalysisResult;
      try {
        analysisResult = JSON.parse(content);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        // Fallback if JSON parsing fails
        analysisResult = this.createFallbackAnalysis(content, fileName);
      }

      // Ensure all required fields are present
      analysisResult = this.validateAndEnhanceResult(analysisResult);

      console.log('Final ChatGPT analysis result:', analysisResult);
      return analysisResult;

    } catch (error) {
      console.error('ChatGPT analysis failed:', error);
      throw error;
    }
  }

  private static createFallbackAnalysis(content: string, fileName: string): ChatGPTAnalysisResult {
    return {
      summary: `Analysis of ${fileName} completed. ${content.substring(0, 200)}...`,
      detectedObjects: ['medical document', 'text'],
      textContent: content,
      medicalFindings: this.extractMedicalTerms(content),
      keyMetrics: this.extractMetrics(content),
      recommendations: [
        'Review this analysis with your healthcare provider',
        'Keep this document for your medical records',
        'Follow up on any abnormal findings mentioned'
      ],
      confidence: 0.75,
      analysisType: 'Medical Document',
      urgentItems: [],
      followUpActions: ['Schedule appointment with healthcare provider']
    };
  }

  private static validateAndEnhanceResult(result: any): ChatGPTAnalysisResult {
    return {
      summary: result.summary || 'Medical document analysis completed',
      detectedObjects: Array.isArray(result.detectedObjects) ? result.detectedObjects : ['document'],
      textContent: result.textContent || '',
      medicalFindings: Array.isArray(result.medicalFindings) ? result.medicalFindings : [],
      keyMetrics: Array.isArray(result.keyMetrics) ? result.keyMetrics : [],
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [
        'Consult with your healthcare provider about these results',
        'Keep this record for future medical appointments'
      ],
      confidence: typeof result.confidence === 'number' ? result.confidence : 0.85,
      analysisType: result.analysisType || 'Medical Document',
      urgentItems: Array.isArray(result.urgentItems) ? result.urgentItems : [],
      followUpActions: Array.isArray(result.followUpActions) ? result.followUpActions : []
    };
  }

  private static extractMedicalTerms(text: string): string[] {
    const medicalTerms = [
      'blood pressure', 'heart rate', 'temperature', 'glucose', 'cholesterol',
      'hemoglobin', 'white blood cell', 'red blood cell', 'diabetes', 'hypertension'
    ];
    
    return medicalTerms.filter(term => 
      text.toLowerCase().includes(term.toLowerCase())
    );
  }

  private static extractMetrics(text: string): string[] {
    const metricPattern = /\d+\.?\d*\s*(?:mg\/dl|mmhg|bpm|°f|°c|kg|lbs|cm|%)/gi;
    return text.match(metricPattern) || [];
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
