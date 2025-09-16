export const dummyType = "core" | "supplementary" | "integration" | "external" | "analytics" | "identity";
export const dummyType = "core" | "supplementary" | "integration" | "external" | "analytics" | "identity";

export const dummyInterface = {
  id;
  name;
  description;
  effort_pd;
  prerequisites[];
  selected;
  critical_path?;
  malaysia_verified?;
}

export const dummyInterface = {
  id;
  name;
  category;
  description;
  total_effort_pd?;
  sgd_price?;
  layer: Layer;
  type: PkgType;
  icon?;
  malaysia_verified?;
  critical_path?;
  prerequisites[];
  source?;
  modules: SAPModule[];
}
