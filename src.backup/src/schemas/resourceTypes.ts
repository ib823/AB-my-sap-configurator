export type Region = "ABMY" | "ABSG" | "ABID" | "TH" | "VN";
export type Seniority = "Jr" | "Mid" | "Sr" | "Lead" | "Architect";

export interface ResourceRate {
  id: string;
  region: Region;
  role: string;
  currency: string;
  dayRate: number;
  seniority?: Seniority;
  notes?: string;
  effectiveDate?: string;
}
