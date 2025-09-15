export type Layer = "core" | "supplementary" | "integration" | "external" | "analytics" | "identity";
export type PkgType = "core" | "supplementary" | "integration" | "external" | "analytics" | "identity";

export interface SAPModule {
  id: string;
  name: string;
  description: string;
  effort_pd: number;
  prerequisites: string[];
  selected: boolean;
  critical_path?: boolean;
  malaysia_verified?: boolean;
}

export interface SAPPackage {
  id: string;
  name: string;
  category: string;
  description: string;
  total_effort_pd?: number;
  sgd_price?: number;
  layer: Layer;
  type: PkgType;
  icon?: string;
  malaysia_verified?: boolean;
  critical_path?: boolean;
  prerequisites: string[];
  source?: string;
  modules: SAPModule[];
}
