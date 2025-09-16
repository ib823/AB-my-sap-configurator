// src/adapters/ai/webgpu/WebGPUProvider
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgpu';
import type { AIProvider, EstimationRequest, EstimationResult } from '../AIAdapter';

export class WebGPUProvider implements AIProvider {
  name = 'WebGPU Local AI';
  type = 'webgpu-local' as const;
  
  private model: tf.LayersModel | null = null;
  private isInitialized = false;
  private device: GPUDevice | null = null;

  async isAvailable(): Promise {
    // Check WebGPU support
    if (typeof navigator === 'undefined' || !navigator.gpu) {
      return false;
    }

    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) return false;

      // Check TensorFlow.js WebGPU backend
      await tf.setBackend('webgpu');
      return tf.getBackend() === 'webgpu';
    } catch {
      return false;
    }
  }

  async initialize(): Promise {
    if (this.isInitialized) return;

    try {
      // Initialize WebGPU device
      const adapter = await navigator.gpu!.requestAdapter();
      this.device = await adapter!.requestDevice();

      // Set TensorFlow.js backend to WebGPU
      await tf.setBackend('webgpu');
      await tf.ready();

      // Load or create the estimation model
      await this.loadOrCreateModel();

      this.isInitialized = true;
      console.log('🚀 WebGPU AI Provider initialized successfully');
    } catch (error) {
      console.error('WebGPU Provider initialization failed:', error);
      throw error;
    }
  }

  private async loadOrCreateModel(): Promise {
    try {
      // Try to load pre-trained model first
      this.model = await tf.loadLayersModel('/models/sap-estimator.json');
      console.log('📦 Loaded pre-trained SAP estimation model');
    } catch {
      // If no pre-trained model, create a new one
      console.log('🔧 Creating new SAP estimation model...');
      this.model = this.createEstimationModel();
    }
  }

  private createEstimationModel(): tf.LayersModel {
    // Neural network for SAP implementation effort estimation
    const model = tf.sequential({
      layers: [
        // Input layer: features from client profile + package selections
        tf.layers.dense({
          inputShape: [50], // Feature vector size
          units: 128,
          activation: 'relu',
          name: 'input_features'
        }),
        
        // Hidden layers for pattern recognition
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 256, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        
        // Output layer: effort estimation + confidence
        tf.layers.dense({ 
          units: 2, 
          activation: 'linear', // [effort, confidence] 
          name: 'estimation_output'
        })
      ]
    });

    // Compile model with appropriate loss function
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae', 'mse']
    });

    return model;
  }

  async estimateEffort(request: EstimationRequest): Promise {
    if (!this.model || !this.isInitialized) {
      throw new Error('WebGPU provider not initialized');
    }

    try {
      // Convert request to feature vector
      const features = this.requestToFeatureVector(request);
      const inputTensor = tf.tensor2d([features]);

      // Run inference
      const prediction = this.model.predict(inputTensor) as tf.Tensor;
      const predictionData = await prediction.data();
      
      // Clean up tensors
      inputTensor.dispose();
      prediction.dispose();

      const [totalEffort, confidence] = predictionData;

      // Generate detailed breakdown using pattern analysis
      const breakdown = await this.generateBreakdown(request, totalEffort);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(request, breakdown);

      return {
        totalEffort: Math.max(totalEffort, 10), // Minimum 10 person-days
        confidence: Math.min(Math.max(confidence, 0), 1),
        breakdown,
        recommendations
      };

    } catch (error) {
      console.error('WebGPU estimation failed:', error);
      throw error;
    }
  }

  private requestToFeatureVector(request: EstimationRequest)[] {
    const features = new Array(50).fill(0);
    let index = 0;

    // Client profile features (0-19)
    const profile = request.clientProfile;
    features[index++] = profile.companySize === 'Enterprise' ? 1 : profile.companySize === 'Large' ? 0.7 : profile.companySize === 'Medium' ? 0.4 : 0.2;
    features[index++] = profile.industry === 'Manufacturing' ? 1 : profile.industry === 'Financial Services' ? 0.8 : 0.5;
    features[index++] = profile.region === 'Malaysia' ? 1 : profile.region === 'Singapore' ? 0.8 : 0.6;
    features[index++] = (profile.employeeCount || 100) / 10000; // Normalized
    features[index++] = profile.hasExistingSAP ? 1 : 0;
    features[index++] = profile.cloudReadiness === 'High' ? 1 : profile.cloudReadiness === 'Medium' ? 0.6 : 0.3;
    features[index++] = (profile.itMaturity || 5) / 10; // Normalized to 0-1
    features[index++] = profile.complianceRequirements?.length || 0;
    
    // Package complexity features (20-39)
    const packageComplexity = this.calculatePackageComplexity(request.packages);
    for (let i = 0; i < 20; i++) {
      features[index++] = packageComplexity[i] || 0;
    }

    // Integration features (40-49)
    const integrations = request.integrations || [];
    features[index++] = integrations.length / 10; // Normalized
    features[index++] = integrations.filter(i => i.complexity === 'Complex').length / 5;
    features[index++] = integrations.filter(i => i.complexity === 'Medium').length / 10;
    features[index++] = integrations.filter(i => i.complexity === 'Simple').length / 15;
    
    // Custom requirements
    features[index++] = (request.customRequirements?.length || 0) / 10;

    // Fill remaining with zeros
    while (index < 50) {
      features[index++] = 0;
    }

    return features;
  }

  private calculatePackageComplexity(packages[])[] {
    // Simplified package complexity mapping
    const complexityMap: Record<string, number> = {
      'Finance_1': 0.6, 'Finance_2': 0.8, 'Finance_21': 0.9,
      'SCM_3': 0.7, 'SCM_4': 0.9,
      'HXM_Base': 0.5, 'HXM_Premium': 0.8,
      'BTP_Base': 0.4, 'BTP_Premium': 0.7
    };

    const complexity = new Array(20).fill(0);
    packages.forEach((pkg, idx) => {
      if (idx < 20) {
        complexity[idx] = complexityMap[pkg] || 0.5;
      }
    });

    return complexity;
  }

  private async generateBreakdown(request: EstimationRequest, totalEffort): Promise<EstimationResult['breakdown']> {
    const breakdown = [];
    const packageEffortRatio = totalEffort * 0.7; // 70% for packages
    const integrationEffortRatio = totalEffort * 0.3; // 30% for integrations

    // Package breakdown
    for (const packageId of request.packages) {
      const baseEffort = packageEffortRatio / request.packages.length;
      const packageMultiplier = this.getPackageMultiplier(packageId);
      
      breakdown.push({
        packageId,
        effort: baseEffort * packageMultiplier,
        reasoning: `WebGPU AI analysis: ${this.getPackageReasoning(packageId)}`,
        riskFactors: this.getPackageRisks(packageId, request.clientProfile)
      });
    }

    // Integration breakdown
    if (request.integrations?.length) {
      const integrationEffort = integrationEffortRatio / request.integrations.length;
      request.integrations.forEach((integration, idx) => {
        const complexityMultiplier = integration.complexity === 'Complex' ? 2.0 : 
                                   integration.complexity === 'Medium' ? 1.3 : 0.7;
        
        breakdown.push({
          packageId: `integration_${idx}`,
          effort: integrationEffort * complexityMultiplier * integration.count,
          reasoning: `${integration.type} integration (${integration.complexity} complexity)`,
          riskFactors: [`Integration complexity: ${integration.complexity}`]
        });
      });
    }

    return breakdown;
  }

  private getPackageMultiplier(packageId) {
    const multipliers: Record<string, number> = {
      'Finance_1': 1.0, 'Finance_2': 1.4, 'Finance_21': 1.8,
      'SCM_3': 1.2, 'SCM_4': 1.6,
      'HXM_Base': 0.8, 'HXM_Premium': 1.3,
      'BTP_Base': 0.6, 'BTP_Premium': 1.1
    };
    return multipliers[packageId] || 1.0;
  }

  private getPackageReasoning(packageId) {
    const reasoning: Record<string, string> = {
      'Finance_1': 'Core finance module with standard complexity',
      'Finance_2': 'Advanced finance features requiring additional configuration',
      'Finance_21': 'Premium finance package with extensive customization needs',
      'SCM_3': 'Supply chain module with moderate integration requirements',
      'SCM_4': 'Advanced SCM with complex workflow configurations'
    };
    return reasoning[packageId] || 'Standard SAP package implementation';
  }

  private getPackageRisks(packageId, profile: Partial)[] {
    const risks = [];
    
    if (profile.hasExistingSAP) {
      risks.push('Data migration complexity from legacy SAP');
    }
    
    if (profile.region === 'Malaysia') {
      risks.push('Local compliance and regulatory requirements');
    }
    
    if (profile.cloudReadiness === 'Low') {
      risks.push('Client cloud adoption readiness concerns');
    }

    return risks;
  }

  private generateRecommendations(request: EstimationRequest, breakdown: EstimationResult['breakdown']): EstimationResult['recommendations'] {
    const recommendations = [];

    // High-effort package recommendations
    const highEffortPackages = breakdown.filter(item => item.effort > 50);
    if (highEffortPackages.length > 0) {
      recommendations.push({
        type: 'optimization' as const,
        message: `Consider phased implementation for high-effort packages: ${highEffortPackages.map(p => p.packageId).join(', ')}`,
        priority: 'high' as const
      });
    }

    // Integration complexity recommendations
    if (request.integrations?.some(i => i.complexity === 'Complex')) {
      recommendations.push({
        type: 'integration' as const,
        message: 'Complex integrations identified. Recommend detailed technical assessment and proof-of-concept development.',
        priority: 'high' as const
      });
    }

    // Client readiness recommendations
    if (request.clientProfile.cloudReadiness === 'Low') {
      recommendations.push({
        type: 'risk' as const,
        message: 'Low cloud readiness detected. Consider additional change management and training activities.',
        priority: 'medium' as const
      });
    }

    return recommendations;
  }

  async dispose(): Promise {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    
    if (this.device) {
      this.device.destroy();
      this.device = null;
    }

    this.isInitialized = false;
    console.log('🧹 WebGPU Provider disposed');
  }
}