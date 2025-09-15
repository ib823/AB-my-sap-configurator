// AI Adapter Type Definitions
export interface AICapabilities {
  webGPUAvailable: boolean;
  cloudProviders: string[];
  modelTypes: ModelType[];
  maxRequestSize: number;
  estimatedLatency: number;
}

export interface EstimationRequest {
  packages: string[];
  clientProfile: any;
  integrations?: {
    type: string;
    complexity: 'Simple' | 'Medium' | 'Complex';
    count: number;
  }[];
  customRequirements?: string[];
}

export interface EstimationResult {
  totalEffort: number;
  confidence: number;
  breakdown: {
    packageId: string;
    effort: number;
    reasoning: string;
    riskFactors: string[];
  }[];
  recommendations: {
    type: 'package' | 'integration' | 'risk' | 'optimization';
    message: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  alternativeScenarios?: {
    scenario: string;
    effort: number;
    tradeoffs: string[];
  }[];
}

export type ModelType = 'webgpu-local' | 'cloud-openai' | 'cloud-huggingface' | 'fallback-rules';

export interface AIProvider {
  name: string;
  type: ModelType;
  isAvailable(): Promise<boolean>;
  initialize(): Promise<void>;
  estimateEffort(request: EstimationRequest): Promise<EstimationResult>;
  dispose?(): Promise<void>;
}
