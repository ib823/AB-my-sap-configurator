export interface Resource {
  id: string;
  name: string;
  role: string;
  region: string;
  allocation: number;
  hourlyRate: number;
  includeOPE?: boolean;
}

export interface Phase {
  id: string;
  name: string;
  phaseKey?: string;
  status: 'idle' | 'active' | 'completed' | 'blocked';
  startBusinessDay: number;
  workingDays: number;
  color: string;
  description: string;
  skipHolidays: boolean;
  resources: Resource[];
  category?: string;
  dependencies?: string[];
  sapPackageId?: string;
}

export interface Holiday {
  id: number;
  date: string;
  name: string;
}

export interface ClientProfile {
  companyName: string;
  industry: string;
  region: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  complexity: 'low' | 'standard' | 'high' | 'extreme';
  timeline: 'relaxed' | 'normal' | 'aggressive';
  employees: number;
  annualRevenueMYR: number;
}

export interface SAPPackage {
  id: string;
  name: string;
  description: string;
  mandays: number;
  category: string;
}

export interface CurrencyMeta {
  code: string;
  symbol: string;
  decimals: number;
  symbolPos: 'before' | 'after';
  sep: string;
}

export interface ExchangeRates {
  [fromCurrency: string]: {
    [toCurrency: string]: number;
  };
}
