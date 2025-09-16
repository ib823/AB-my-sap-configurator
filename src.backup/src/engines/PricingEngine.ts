import { ResourceRate, SAPPackage, Region } from '../schemas/types';

export class PricingEngine {
  private currencyRates: Map<string, number>;
  private resourceRates: Map<string, ResourceRate>;
  
  constructor(currencies: Array<{code: string, rateToBase: number}>, resources: ResourceRate[]) {
    this.currencyRates = new Map(currencies.map(c => [c.code, c.rateToBase]));
    this.resourceRates = new Map(resources.map(r => [r.id, r]));
  }

  calculateBaseCost(packages: SAPPackage[], targetCurrency: string = "SGD"): number {
    return packages.reduce((total, pkg) => {
      const packageEffort = pkg.modules
        .filter(m => m.selected)
        .reduce((sum, m) => sum + m.effort_pd, 0) || pkg.total_effort_pd || 0;
      
      const avgDayRate = this.getBlendedDayRate(pkg.category, targetCurrency);
      return total + (packageEffort * avgDayRate);
    }, 0);
  }

  convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return amount;
    
    const fromRate = this.currencyRates.get(fromCurrency) || 1;
    const toRate = this.currencyRates.get(toCurrency) || 1;
    
    const baseAmount = amount / fromRate;
    return baseAmount * toRate;
  }

  private getBlendedDayRate(category: string, targetCurrency: string): number {
    const blendedRates: Record<string, number> = {
      "Finance Base": 2800,
      "Customer Experience": 3400,
      "SCM": 3100,
      "Default": 3000
    };
    
    const sgdRate = blendedRates[category] || blendedRates["Default"];
    return this.convertCurrency(sgdRate, "SGD", targetCurrency);
  }
}

  // AI-enhanced estimation method
  async estimateWithAI(packages: SAPPackage[], profile: ClientProfile) {
    try {
      const { aiAdapter } = await import('../adapters/ai/AIAdapter');
      return await aiAdapter.estimateProject({
        packages: packages.map(p => p.id),
        clientProfile: profile
      });
    } catch (error) {
      console.warn('AI estimation failed, using rule-based fallback:', error);
      return this.calculateTotalPrice(packages, profile.currency);
    }
  }
