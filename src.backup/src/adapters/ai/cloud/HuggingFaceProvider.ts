// src/adapters/ai/cloud/HuggingFaceProvider.ts  
export class HuggingFaceProvider implements AIProvider {
  name = 'HuggingFace Inference';
  type = 'cloud-huggingface' as const;
  
  private apiKey: string | null = null;
  private baseUrl = 'https://api-inference.huggingface.co';
  private modelId = 'microsoft/DialoGPT-large'; // Can be customized

  async isAvailable(): Promise<boolean> {
    this.apiKey = process.env.HUGGINGFACE_API_KEY || 
                  (typeof window !== 'undefined' ? localStorage.getItem('hf_api_key') : null);
    
    if (!this.apiKey) {
      console.warn('HuggingFace API key not found');
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/models/${this.modelId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async initialize(): Promise<void> {
    if (!this.apiKey) {
      throw new Error('HuggingFace API key not available');
    }
    console.log('🤗 HuggingFace Provider initialized');
  }

  async estimateEffort(request: EstimationRequest): Promise<EstimationResult> {
    const prompt = this.buildStructuredPrompt(request);
    
    try {
      const response = await fetch(`${this.baseUrl}/models/${this.modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.3,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseHuggingFaceResponse(data, request);
    } catch (error) {
      console.error('HuggingFace estimation failed:', error);
      throw error;
    }
  }

  private buildStructuredPrompt(request: EstimationRequest): string {
    return `
SAP Implementation Effort Estimation:

Client: ${request.clientProfile.companySize} ${request.clientProfile.industry} company in ${request.clientProfile.region}
Packages: ${request.packages.join(', ')}
Integrations: ${(request.integrations || []).length} integrations
Experience: ${request.clientProfile.hasExistingSAP ? 'Has existing SAP' : 'New to SAP'}

Based on industry standards, estimate:
1. Total effort in person-days
2. Risk factors
3. Key recommendations
    `;
  }

  private parseHuggingFaceResponse(data: any, request: EstimationRequest): EstimationResult {
    // Parse HuggingFace response and convert to structured result
    const responseText = data[0]?.generated_text || '';
    
    // Extract numerical estimates from text using regex
    const effortMatch = responseText.match(/(\d+)\s*person.?days?/i);
    const totalEffort = effortMatch ? parseInt(effortMatch[1]) : this.fallbackEffortEstimate(request);

    // Generate breakdown based on packages
    const breakdown = request.packages.map(packageId => ({
      packageId,
      effort: totalEffort / request.packages.length,
      reasoning: `HuggingFace analysis: Standard implementation for ${packageId}`,
      riskFactors: this.extractRisksFromText(responseText)
    }));

    const recommendations = this.generateBasicRecommendations(request);

    return {
      totalEffort,
      confidence: 0.75, // Medium confidence for text parsing
      breakdown,
      recommendations
    };
  }

  private fallbackEffortEstimate(request: EstimationRequest): number {
    // Simple rule-based fallback
    const baseEffort = request.packages.length * 25; // 25 days per package
    const integrationEffort = (request.integrations || []).reduce((sum, int) => {
      const complexityMultiplier = int.complexity === 'Complex' ? 15 : 
                                 int.complexity === 'Medium' ? 8 : 3;
      return sum + (complexityMultiplier * int.count);
    }, 0);
    
    return baseEffort + integrationEffort;
  }

  private extractRisksFromText(text: string): string[] {
    const risks = [];
    if (text.includes('complex') || text.includes('difficult')) {
      risks.push('Implementation complexity detected');
    }
    if (text.includes('integration')) {
      risks.push('Integration challenges possible');
    }
    return risks.length ? risks : ['Standard implementation risks'];
  }

  private generateBasicRecommendations(request: EstimationRequest): EstimationResult['recommendations'] {
    const recommendations = [];

    if (request.packages.length > 5) {
      recommendations.push({
        type: 'optimization' as const,
        message: 'Consider phased implementation due to large number of packages',
        priority: 'medium' as const
      });
    }

    if (!request.clientProfile.hasExistingSAP) {
      recommendations.push({
        type: 'risk' as const,
        message: 'Additional change management recommended for first SAP implementation',
        priority: 'high' as const
      });
    }

    return recommendations;
  }
}