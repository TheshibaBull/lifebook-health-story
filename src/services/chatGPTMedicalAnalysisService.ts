
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
              content: `You are a medical document analysis expert. Analyze the provided medical document and respond with ONLY a valid JSON object containing the following structure. Do NOT include any text before or after the JSON.

{
  "summary": "Brief description of the document and key findings",
  "detectedObjects": ["visual elements detected in the image"],
  "textContent": "All text visible in the document",
  "medicalFindings": ["specific medical conditions, test results, or diagnoses found"],
  "keyMetrics": ["numerical values with units like blood pressure, glucose levels, etc."],
  "recommendations": [
    "Based on what I see in this document, I recommend scheduling a follow-up appointment with your healthcare provider",
    "Keep this document accessible for future medical visits and consultations",
    "Ask your doctor to explain any medical terms or abnormal values shown",
    "Monitor any symptoms mentioned in the document and report changes",
    "Ensure all your healthcare providers have copies of these results",
    "Follow any medication instructions or treatment plans outlined",
    "Set reminders for any follow-up tests or appointments mentioned"
  ],
  "confidence": 0.9,
  "analysisType": "Lab Results/Prescription/Medical Report/etc",
  "urgentItems": ["any urgent findings that need immediate attention"],
  "followUpActions": ["specific next steps to take based on the document"]
}

IMPORTANT: 
- Always provide at least 5-7 specific recommendations based on the actual content
- Make recommendations actionable and relevant to what you see
- Include specific medical advice when appropriate
- Mention any abnormal values or concerning findings
- Suggest lifestyle changes if relevant to the findings`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Please analyze this medical document: ${fileName}. 

Provide detailed medical analysis including:
1. All visible text content
2. Medical findings and test results
3. At least 5 specific, actionable recommendations based on what you see
4. Any urgent items requiring attention
5. Follow-up actions needed

Make the recommendations specific to this document's content, not generic advice.`
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
          max_tokens: 4000,
          temperature: 0.1
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

      // Clean and parse the response
      let cleanedContent = content.trim();
      
      // Remove markdown code blocks if present
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      // Try to extract JSON if there's extra text
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[0];
      }

      let analysisResult: ChatGPTAnalysisResult;
      try {
        analysisResult = JSON.parse(cleanedContent);
        console.log('Successfully parsed ChatGPT analysis:', analysisResult);
        
        // Validate that we have actual recommendations from ChatGPT
        if (!analysisResult.recommendations || analysisResult.recommendations.length === 0) {
          console.warn('No recommendations received from ChatGPT, using fallback');
          analysisResult.recommendations = this.getEnhancedFallbackRecommendations(fileName);
        } else {
          console.log('ChatGPT provided recommendations:', analysisResult.recommendations);
        }
        
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Content that failed to parse:', cleanedContent);
        
        // Create fallback analysis with better recommendations
        analysisResult = this.createDetailedFallbackAnalysis(content, fileName);
      }

      // Ensure all required fields are present
      analysisResult = this.validateAndCleanResult(analysisResult, fileName);

      console.log('Final ChatGPT analysis result:', analysisResult);
      return analysisResult;

    } catch (error) {
      console.error('ChatGPT analysis failed:', error);
      throw error;
    }
  }

  private static createDetailedFallbackAnalysis(content: string, fileName: string): ChatGPTAnalysisResult {
    console.log('Creating detailed fallback analysis for:', fileName);
    
    return {
      summary: `Medical document analysis for ${fileName}. The document has been processed and contains important health information that should be reviewed with your healthcare provider.`,
      detectedObjects: ['medical document', 'text content', 'healthcare data'],
      textContent: content.substring(0, 1000),
      medicalFindings: this.extractMedicalTermsFromContent(content),
      keyMetrics: this.extractMetricsFromContent(content),
      recommendations: this.getEnhancedFallbackRecommendations(fileName),
      confidence: 0.75,
      analysisType: this.determineDocumentTypeFromName(fileName),
      urgentItems: this.extractUrgentItemsFromContent(content),
      followUpActions: [
        'Schedule an appointment with your primary care physician to discuss these results',
        'Prepare a list of questions about your results before your next medical visit',
        'Keep this document organized and accessible for future healthcare appointments',
        'Share these results with all relevant healthcare providers in your care team'
      ]
    };
  }

  private static getEnhancedFallbackRecommendations(fileName: string): string[] {
    const fileType = fileName.toLowerCase();
    let specificRecommendations: string[] = [];

    if (fileType.includes('lab') || fileType.includes('blood') || fileType.includes('test')) {
      specificRecommendations = [
        'Review your lab results thoroughly with your doctor during your next appointment',
        'Ask your healthcare provider to explain any values that are outside the normal range',
        'Discuss how these results compare to your previous lab work and health trends',
        'Inquire about any lifestyle changes that could improve your lab values',
        'Schedule follow-up testing if recommended by your healthcare provider',
        'Keep a copy of these results for your personal medical records',
        'Consider discussing preventive measures based on your lab findings'
      ];
    } else if (fileType.includes('prescription') || fileType.includes('medication') || fileType.includes('rx')) {
      specificRecommendations = [
        'Take medications exactly as prescribed by your healthcare provider',
        'Discuss any side effects or concerns with your doctor or pharmacist',
        'Set up reminders to ensure you take medications on time consistently',
        'Keep an updated list of all medications to share with healthcare providers',
        'Ask about potential drug interactions if you take multiple medications',
        'Store medications properly and check expiration dates regularly',
        'Never stop or change medication dosages without consulting your doctor first'
      ];
    } else {
      specificRecommendations = [
        'Schedule a follow-up appointment with your healthcare provider to discuss this document',
        'Keep this important medical document easily accessible for future reference',
        'Ask your doctor to explain any medical terminology or findings you don\'t understand',
        'Share this information with all healthcare providers involved in your care',
        'Monitor any symptoms or conditions mentioned and report changes promptly',
        'Follow any treatment recommendations or instructions provided in the document',
        'Consider asking about preventive measures related to your health findings'
      ];
    }

    return specificRecommendations;
  }

  private static validateAndCleanResult(result: any, fileName: string): ChatGPTAnalysisResult {
    return {
      summary: result.summary || `Medical analysis completed for ${fileName}`,
      detectedObjects: Array.isArray(result.detectedObjects) ? result.detectedObjects : ['medical document'],
      textContent: result.textContent || 'Text extraction completed',
      medicalFindings: Array.isArray(result.medicalFindings) ? result.medicalFindings : [],
      keyMetrics: Array.isArray(result.keyMetrics) ? result.keyMetrics : [],
      recommendations: Array.isArray(result.recommendations) && result.recommendations.length > 0 
        ? result.recommendations 
        : this.getEnhancedFallbackRecommendations(fileName),
      confidence: typeof result.confidence === 'number' ? result.confidence : 0.85,
      analysisType: result.analysisType || this.determineDocumentTypeFromName(fileName),
      urgentItems: Array.isArray(result.urgentItems) ? result.urgentItems : [],
      followUpActions: Array.isArray(result.followUpActions) ? result.followUpActions : [
        'Schedule follow-up with healthcare provider',
        'Keep document accessible for medical visits',
        'Discuss findings during next appointment'
      ]
    };
  }

  private static determineDocumentTypeFromName(fileName: string): string {
    const name = fileName.toLowerCase();
    if (name.includes('lab') || name.includes('blood')) return 'Laboratory Results';
    if (name.includes('prescription') || name.includes('rx')) return 'Prescription Document';
    if (name.includes('xray') || name.includes('imaging')) return 'Medical Imaging';
    if (name.includes('visit') || name.includes('appointment')) return 'Visit Notes';
    return 'Medical Document';
  }

  private static extractMedicalTermsFromContent(content: string): string[] {
    const medicalKeywords = [
      'blood pressure', 'cholesterol', 'glucose', 'hemoglobin', 'diabetes',
      'hypertension', 'medication', 'prescription', 'diagnosis', 'treatment'
    ];
    
    return medicalKeywords.filter(term => 
      content.toLowerCase().includes(term.toLowerCase())
    );
  }

  private static extractMetricsFromContent(content: string): string[] {
    const metricPattern = /\d+\.?\d*\s*(?:mg\/dl|mmhg|bpm|°f|°c|kg|lbs|%)/gi;
    return content.match(metricPattern) || [];
  }

  private static extractUrgentItemsFromContent(content: string): string[] {
    const urgentTerms = ['urgent', 'critical', 'high', 'low', 'abnormal', 'immediate'];
    const lines = content.split('\n');
    
    return lines.filter(line => 
      urgentTerms.some(term => line.toLowerCase().includes(term))
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
