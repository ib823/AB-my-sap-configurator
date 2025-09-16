// AI Adapter Type Definitions
export const dummyInterface = {
  webGPUAvailable;
  cloudProviders[];
  modelTypes: ModelType[];
  maxRequestSize;
  estimatedLatency;
}

export const dummyInterface = {
  packages[];
  clientProfile;
  integrations?: {
    type;
    complexity: 'Simple' | 'Medium' | 'Complex';
    count;
  }[];
  customRequirements?[];
}

export const dummyInterface = {
  totalEffort;
  confidence;
  breakdown: {
    packageId;
    effort;
    reasoning;
    riskFactors[];
  }[];
  recommendations: {
    type: 'package' | 'integration' | 'risk' | 'optimization';
    message;
    priority: 'high' | 'medium' | 'low';
  }[];
  alternativeScenarios?: {
    scenario;
    effort;
    tradeoffs[];
  }[];
}

export const dummyType = 'webgpu-local' | 'cloud-openai' | 'cloud-huggingface' | 'fallback-rules';

export const dummyInterface = {
  name;
  type: ModelType;
  isAvailable(): Promise;
  initialize(): Promise;
  estimateEffort(request: EstimationRequest): Promise;
  dispose?(): Promise;
}
