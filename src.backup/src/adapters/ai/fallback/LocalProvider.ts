import type { AIProvider, EstimationRequest, EstimationResult } from '../types';

export class LocalProvider implements AIProvider {
  name = 'Rule-based Estimation';
  type = 'fallback-rules' as const;

  private packageEfforts: Record<string, number> = {
    'financial_master_data': 45,
    'general_ledger': 35,
    'accounts_payable': 40,
    'accounts_receivable': 40,
    'asset_accounting': 35,
    'cost_center_accounting': 30,
    'profit_center_accounting': 25,
    'internal_order_accounting': 20,
    'overhead_cost_accounting': 50,
    'lease_accounting': 35,
    'collections_management': 15,
    'cash_management': 25,
    'bank_account_management': 20,
    'Finance_1': 45,
    'Finance_2': 65,
    'Finance_21': 85,
    'SCM_3': 55,
    'SCM_4': 75,
    'HXM_Base': 40,
    'HXM_Premium': 60,
    'BTP_Base': 30,
    'BTP_Premium': 50,
  };

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async initialize(): Promise<void> {
    console.log('📋 Rule-based provider initialized');
  }

  async estimateEffort(request: EstimationRequest): Promise<EstimationResult> {
    const breakdown = request.packages.map(packageId => {
      const baseEffort = this.packageEfforts[packageId] || 30;
      let effort = baseEffort;

      const sizeMultiplier = this.getSizeMultiplier(request.clientProfile?.company_size);
      effort *= sizeMultiplier;

      const industryMultiplier = this.getIndustryMultiplier(request.clientProfile?.industry);
      effort *= industryMultiplier;

      return {
        packageId,
        effort: Math.round(effort * 100) / 100,
        reasoning: `Base: ${baseEffort}d × Size: ${sizeMultiplier}x × Industry: ${industryMultiplier}x`,
        riskFactors: this.getRiskFactors(packageId, request.clientProfile)
      };
    });

    const totalEffort = breakdown.reduce((sum, item) => sum + item.effort, 0);

    return {
      totalEffort,
      confidence: 0.85,
      breakdown,
      recommendations: this.generateRecommendations(request, breakdown),
      alternativeScenarios: this.generateScenarios(totalEffort)
    };
  }

  private getSizeMultiplier(size: string | undefined): number {
    switch (size) {
      case 'sme': return 0.8;
      case 'mid_market': return 1.0;
      case 'large': return 1.3;
      case 'enterprise': return 1.7;
      default: return 1.0;
    }
  }

  private getIndustryMultiplier(industry: string | undefined): number {
    switch (industry) {
      case 'manufacturing': return 1.2;
      case 'financial_services': return 1.4;
      case 'retail': return 1.0;
      case 'government': return 1.3;
      case 'services': return 1.0;
      default: return 1.0;
    }
  }

  private getRiskFactors(packageId: string, profile: any): string[] {
    const risks = [];
    
    if (profile?.system_landscape === 'brownfield' || profile?.system_landscape === 'hybrid') {
      risks.push('Legacy system integration complexity');
    }
    
    if (profile?.client_maturity === 'sap_naive') {
      risks.push('Limited SAP experience may require additional training');
    }
    
    if (packageId.includes('financial') || packageId.includes('Finance')) {
      risks.push('Financial process complexity');
    }

    return risks;
  }

  private generateRecommendations(request: EstimationRequest, breakdown: any[]): any[] {
    const recommendations = [];
    
    if (request.packages.length > 5) {
      recommendations.push({
        type: 'optimization',
        message: 'Consider phased implementation due to large scope',
        priority: 'medium'
      });
    }

    const highEffortPackages = breakdown.filter(item => item.effort > 60);
    if (highEffortPackages.length > 0) {
      recommendations.push({
        type: 'risk',
        message: `High-effort packages detected: ${highEffortPackages.map(p => p.packageId).join(', ')}`,
        priority: 'high'
      });
    }

    if (request.clientProfile?.client_maturity === 'sap_naive') {
      recommendations.push({
        type: 'risk',
        message: 'Client has limited SAP experience. Recommend additional change management and training.',
        priority: 'high'
      });
    }

    return recommendations;
  }

  private generateScenarios(baseEffort: number): any[] {
    return [
      {
        scenario: 'MVP Implementation',
        effort: Math.round(baseEffort * 0.6),
        tradeoffs: ['Reduced scope', 'Faster delivery', 'Additional phases needed']
      },
      {
        scenario: 'Standard Implementation',
        effort: baseEffort,
        tradeoffs: ['Full scope', 'Standard timeline', 'Complete functionality']
      },
      {
        scenario: 'Premium Implementation',
        effort: Math.round(baseEffort * 1.3),
        tradeoffs: ['Enhanced features', 'Extended timeline', 'Advanced capabilities']
      }
    ];
  }
}
