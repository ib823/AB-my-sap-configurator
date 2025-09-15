import type { AICapabilities, EstimationRequest, EstimationResult, ModelType, AIProvider } from './types';

export class AIAdapterManager {
  private providers: Map<ModelType, AIProvider> = new Map();
  private currentProvider: AIProvider | null = null;
  private capabilities: AICapabilities | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    await this.registerProviders();
    await this.detectCapabilities();
    await this.selectOptimalProvider();
  }

  private async registerProviders(): Promise<void> {
    try {
      const { LocalProvider } = await import('./fallback/LocalProvider');
      this.providers.set('fallback-rules', new LocalProvider());
      console.log('📋 AI Providers registered: fallback-rules');
    } catch (error) {
      console.warn('AI provider registration failed:', error);
    }
  }

  private async detectCapabilities(): Promise<void> {
    const webGPUAvailable = false;
    const cloudProviders: string[] = [];
    const modelTypes: ModelType[] = ['fallback-rules'];

    this.capabilities = {
      webGPUAvailable,
      cloudProviders,
      modelTypes,
      maxRequestSize: 25,
      estimatedLatency: 100
    };
  }

  private async selectOptimalProvider(): Promise<void> {
    const provider = this.providers.get('fallback-rules');
    if (provider && await provider.isAvailable()) {
      try {
        await provider.initialize();
        this.currentProvider = provider;
        console.log('✅ AI Provider selected: Rule-based fallback');
        return;
      } catch (error) {
        console.warn('Provider initialization failed:', error);
      }
    }
    throw new Error('No AI provider available');
  }

  async estimateProject(request: EstimationRequest): Promise<EstimationResult> {
    if (!this.currentProvider) {
      throw new Error('No AI provider initialized');
    }

    try {
      const result = await this.currentProvider.estimateEffort(request);
      return this.enhanceEstimation(result, request);
    } catch (error) {
      console.error('AI estimation failed:', error);
      throw error;
    }
  }

  private enhanceEstimation(result: EstimationResult, request: EstimationRequest): EstimationResult {
    const enhanced = { ...result };
    
    if (request.clientProfile?.region === 'Malaysia') {
      enhanced.breakdown = enhanced.breakdown.map(item => ({
        ...item,
        effort: item.effort * 1.15,
        reasoning: `${item.reasoning}\n+ Malaysian localization overhead (15%)`
      }));
      enhanced.totalEffort = enhanced.breakdown.reduce((sum, item) => sum + item.effort, 0);
    }

    return enhanced;
  }

  getCapabilities(): AICapabilities | null {
    return this.capabilities;
  }

  async switchProvider(type: ModelType): Promise<void> {
    console.log(`Provider switch requested: ${type} (only fallback available)`);
  }
}

export const aiAdapter = new AIAdapterManager();
