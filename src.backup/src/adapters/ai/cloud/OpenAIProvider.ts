// src/adapters/ai/cloud/OpenAIProvider.ts
import type { AIProvider, EstimationRequest, EstimationResult } from '../AIAdapter';

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI GPT-4';
  type = 'cloud-openai' as const;
  
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1';

  async isAvailable(): Promise<boolean> {
    // Check for API key in environment or local storage
    this.apiKey = process.env.OPENAI_API_KEY || 
                  (typeof window !== 'undefined' ? localStorage.getItem('openai_api_key') : null);
    
    if (!this.apiKey) {
      console.warn('OpenAI API key not found');
      return false;
    }

    try {
      // Test API connectivity
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async initialize(): Promise<void> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not available');
    }
    console.log('🤖 OpenAI Provider initialized');
  }

  async estimateEffort(request: EstimationRequest): Promise<EstimationResult> {
    const prompt = this.buildEstimationPrompt(request);
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an expert SAP implementation consultant specializing in effort estimation for ABeam Consulting. Provide detailed, accurate estimates based on industry best practices.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      
      return this.parseEstimationResult(result, request);
    } catch (error) {
      console.error('OpenAI estimation failed:', error);
      throw error;
    }
  }

  private buildEstimationPrompt(request: EstimationRequest): string {
    return `
Please estimate the implementation effort for this SAP project and respond in JSON format.

Client Profile:
- Company Size: ${request.clientProfile.companySize || 'Unknown'}
- Industry: ${request.clientProfile.industry || 'Unknown'}  
- Region: ${request.clientProfile.region || 'Unknown'}
- Employee Count: ${request.clientProfile.employeeCount || 'Unknown'}
- Existing SAP: ${request.clientProfile.hasExistingSAP ? 'Yes' : 'No'}
- Cloud Readiness: ${request.clientProfile.cloudReadiness || 'Unknown'}
- IT Maturity: ${request.clientProfile.itMaturity || 'Unknown'}/10

Selected SAP Packages:
${request.packages.map(pkg => `- ${pkg}`).join('\n')}

Integrations:
${(request.integrations || []).map(int => 
  `- ${int.type} (${int.complexity} complexity, ${int.count} instances)`
).join('\n')}

Custom Requirements:
${(request.customRequirements || []).map(req => `- ${req}`).join('\n')}

Please provide a JSON response with this exact structure:
{
  "totalEffort": number,
  "confidence": number (0-1),
  "breakdown": [
    {
      "packageId": "string",
      "effort": number,
      "reasoning": "string",
      "riskFactors": ["string"]
    }
  ],
  "recommendations": [
    {
      "type": "package|integration|risk|optimization",
      "message": "string", 
      "priority": "high|medium|low"
    }
  ],
  "alternativeScenarios": [
    {
      "scenario": "string",
      "effort": number,
      "tradeoffs": ["string"]
    }
  ]
}

Consider ABeam's methodology and Malaysian market specifics in your estimation.
    `;
  }

  private parseEstimationResult(result: any, request: EstimationRequest): EstimationResult {
    return {
      totalEffort: result.totalEffort || 0,
      confidence: Math.min(Math.max(result.confidence || 0.7, 0), 1),
      breakdown: result.breakdown || [],
      recommendations: result.recommendations || [],
      alternativeScenarios: result.alternativeScenarios
    };
  }
}