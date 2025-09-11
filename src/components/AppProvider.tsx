import React, { useState, useContext, createContext, useCallback, useEffect, useMemo } from "react";

// Copy all your interfaces from the original file here
interface SAPModule {
  id: string;
  name: string;
  description: string;
  effort_pd: number;
  prerequisites: string[];
  selected: boolean;
  critical_path?: boolean;
  malaysia_verified?: boolean;
}

type Layer = "core" | "supplementary" | "integration" | "external" | "analytics";
type PkgType = "core" | "supplementary" | "integration" | "external" | "analytics" | "identity";

interface SAPPackage {
  id: string;
  name: string;
  category: string;
  description: string;
  total_effort_pd: number;
  sgd_price: number;
  layer: Layer;
  type: PkgType;
  icon: string;
  malaysia_verified: boolean;
  critical_path: boolean;
  modules: SAPModule[];
  expanded: boolean;
  selected: boolean;
  prerequisites: string[];
  source: string;
  compliance_critical?: boolean;
  statutory_included?: string[];
  bank_formats_included?: number;
}

type IntegrationType = "API" | "File Transfer" | "Real-time" | "Batch" | "Event-driven" | "Database Direct";
type IntegrationComplexity = "Simple" | "Medium" | "Complex";

interface Integration {
  id: string;
  system_name: string;
  integration_type: IntegrationType;
  complexity: IntegrationComplexity;
  effort_pd: number;
  description: string;
}

type MFCategory = "Statutory" | "Banking" | "HR" | "Finance" | "Compliance" | "Sales" | "Procurement" | "Logistics";

interface MalaysiaForm {
  id: string;
  form_name: string;
  category: MFCategory | "Procurement" | "Sales" | "Logistics" | "Finance";
  mandatory: boolean;
  effort_pd: number;
  description: string;
  regulatory_body: string;
  selected: boolean;
  sap_module: string;
}

type ServiceCategory = "Project Management" | "Cutover & Migration" | "Training" | "Basis & Infrastructure" | "Support";

interface ProjectService {
  id: string;
  service_name: string;
  category: ServiceCategory;
  effort_pd: number;
  description: string;
  mandatory: boolean;
  selected: boolean;
}

type Industry = "services" | "manufacturing" | "financial_services" | "government" | "retail";
type CompanySize = "sme" | "mid_market" | "large" | "enterprise";
type Landscape = "greenfield" | "brownfield" | "hybrid" | "complex_hybrid";
type Maturity = "sap_naive" | "sap_experienced" | "sap_expert";

interface ClientProfile {
  company_name: string;
  industry: Industry;
  company_size: CompanySize;
  system_landscape: Landscape;
  client_maturity: Maturity;
  legal_entities: number;
}

type RoleType = "user" | "super_user" | "admin";

interface UserRole {
  type: RoleType;
  permissions: {
    view_packages: boolean;
    edit_packages: boolean;
    create_packages: boolean;
    delete_packages: boolean;
    export_library: boolean;
  };
}

type ChangeType = "create" | "update" | "delete" | "module_add" | "module_update" | "module_delete";

interface PackageChange {
  id: string;
  timestamp: Date;
  user: string;
  type: ChangeType;
  packageId: string;
  before?: any;
  after?: any;
  reason: string;
}

type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

interface RiskAssessmentT {
  overall_risk: RiskLevel;
  specific_risks: Array<{
    package: string;
    risk: string;
    likelihood: RiskLevel;
    impact: RiskLevel;
    mitigation: string;
  }>;
  fricew_risks: Array<{
    category: string;
    likelihood: RiskLevel;
    impact: RiskLevel;
  }>;
}

type ViewKey = "packages" | "wrapper" | "estimation" | "risks" | "implementation";

interface AppState {
  packages: SAPPackage[];
  integrations: Integration[];
  malaysiaForms: MalaysiaForm[];
  projectServices: ProjectService[];
  clientProfile: ClientProfile;
  selectedView: ViewKey;
  btpIntegrationEnabled: boolean;
  userRole: UserRole;
  adminMode: boolean;
  packageChanges: PackageChange[];
  editingPackage: SAPPackage | null;
  editingModule: { packageId: string; module: SAPModule } | null;
  floatingCardMinimized: boolean;
}

// Copy all your seed data here (COMPLETE_PACKAGE_LIBRARY, etc.)
const COMPLETE_PACKAGE_LIBRARY: SAPPackage[] = [
  // Your package data goes here
  {
    id: "financial_master_data",
    name: "Financial Master Data Management",
    category: "Finance Core",
    description: "GL setup, cost centers, organizational structure",
    total_effort_pd: 192.9,
    sgd_price: 135000,
    layer: "core",
    type: "core",
    icon: "💰",
    malaysia_verified: true,
    critical_path: true,
    prerequisites: [],
    source: "Page 8",
    modules: [
      {
        id: "gl_setup",
        name: "General Ledger Setup",
        description: "Chart of accounts, fiscal year",
        effort_pd: 45,
        prerequisites: [],
        selected: false,
      },
      // Add all other modules...
    ],
    expanded: false,
    selected: false,
  },
  // Add all other packages...
];

const MALAYSIA_FORMS_LIBRARY: MalaysiaForm[] = [
  // Your forms data
];

const PROJECT_SERVICES_LIBRARY: ProjectService[] = [
  // Your services data
];

const DEFAULT_USER_ROLE: UserRole = {
  type: "user",
  permissions: {
    view_packages: true,
    edit_packages: false,
    create_packages: false,
    delete_packages: false,
    export_library: false,
  },
};

const SUPER_USER_ROLE: UserRole = {
  type: "super_user",
  permissions: {
    view_packages: true,
    edit_packages: true,
    create_packages: true,
    delete_packages: true,
    export_library: true,
  },
};

// Fix the context definition - remove template literals from object keys
const AppContext = createContext<{
  state: AppState;
  updatePackage: (id: string, updates: Partial<SAPPackage>) => void;
  updateClientProfile: (updates: Partial<ClientProfile>) => void;
  setSelectedView: (view: ViewKey) => void;
  addIntegration: (integration: Omit<Integration, "id" | "effort_pd"> & { effort_pd?: number }) => void;
  removeIntegration: (id: string) => void;
  updateIntegration: (id: string, updates: Partial<Integration>) => void;
  updateMalaysiaForm: (id: string, updates: Partial<MalaysiaForm>) => void;
  updateProjectService: (id: string, updates: Partial<ProjectService>) => void;
  setBtpIntegrationEnabled: (enabled: boolean) => void;
  setAdminMode: (enabled: boolean) => void;
  addPackage: (pkg: Omit<SAPPackage, "id" | "expanded" | "selected">) => void;
  deletePackage: (id: string) => void;
  addModule: (packageId: string, mod: Omit<SAPModule, "id" | "selected">) => void;
  updateModule: (packageId: string, moduleId: string, updates: Partial<SAPModule>) => void;
  deleteModule: (packageId: string, moduleId: string) => void;
  duplicatePackage: (id: string) => void;
  exportLibrary: () => void;
  importLibrary: (data: any) => void;
  logChange: (change: Omit<PackageChange, "id" | "timestamp">) => void;
  validatePrerequisites: (packageId: string, moduleId?: string) => { valid: boolean; missing: string[] };
  setFloatingCardMinimized: (b: boolean) => void;
  calculateTotalEffort: () => number;
  getSelectedPackages: () => SAPPackage[];
  calculateComplexityMultiplier: () => number;
  generateRiskAssessment: () => RiskAssessmentT;
} | null>(null);

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    packages: [...COMPLETE_PACKAGE_LIBRARY],
    integrations: [],
    malaysiaForms: [...MALAYSIA_FORMS_LIBRARY],
    projectServices: [...PROJECT_SERVICES_LIBRARY],
    clientProfile: {
      company_name: "",
      industry: "services",
      company_size: "mid_market",
      system_landscape: "greenfield",
      client_maturity: "sap_experienced",
      legal_entities: 1,
    },
    selectedView: "packages",
    btpIntegrationEnabled: false,
    userRole: DEFAULT_USER_ROLE,
    adminMode: false,
    packageChanges: [],
    editingPackage: null,
    editingModule: null,
    floatingCardMinimized: false,
  });

  const logChange = useCallback((change: Omit<PackageChange, "id" | "timestamp">) => {
    const newChange: PackageChange = {
      ...change,
      id: `chg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date(),
    };
    setState((prev) => ({
      ...prev,
      packageChanges: [newChange, ...prev.packageChanges].slice(0, 200),
    }));
  }, []);

  const updatePackage = useCallback((id: string, updates: Partial<SAPPackage>) => {
    setState((prev) => ({
      ...prev,
      packages: prev.packages.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, []);

  const updateClientProfile = useCallback((updates: Partial<ClientProfile>) => {
    setState((prev) => ({
      ...prev,
      clientProfile: { ...prev.clientProfile, ...updates },
    }));
  }, []);

  const setSelectedView = useCallback((view: ViewKey) => {
    setState((prev) => ({ ...prev, selectedView: view }));
  }, []);

  const addIntegration = useCallback((integration: Omit<Integration, "id" | "effort_pd"> & { effort_pd?: number }) => {
    const complexityEffort = { Simple: 15, Medium: 30, Complex: 60 };
    const effort = integration.effort_pd ?? complexityEffort[integration.complexity];
    const newInt: Integration = {
      ...integration,
      id: `int_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      effort_pd: effort,
    };
    setState((prev) => ({
      ...prev,
      integrations: [...prev.integrations, newInt],
    }));
  }, []);

  const removeIntegration = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      integrations: prev.integrations.filter((i) => i.id !== id),
    }));
  }, []);

  const updateIntegration = useCallback((id: string, updates: Partial<Integration>) => {
    setState((prev) => ({
      ...prev,
      integrations: prev.integrations.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    }));
  }, []);

  const updateMalaysiaForm = useCallback((id: string, updates: Partial<MalaysiaForm>) => {
    setState((prev) => ({
      ...prev,
      malaysiaForms: prev.malaysiaForms.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  }, []);

  const updateProjectService = useCallback((id: string, updates: Partial<ProjectService>) => {
    setState((prev) => ({
      ...prev,
      projectServices: prev.projectServices.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, []);

  const setBtpIntegrationEnabled = useCallback((enabled: boolean) => {
    setState((prev) => ({ ...prev, btpIntegrationEnabled: enabled }));
  }, []);

  const setAdminMode = useCallback((enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      adminMode: enabled,
      userRole: enabled ? SUPER_USER_ROLE : DEFAULT_USER_ROLE,
    }));
  }, []);

  const validatePrerequisites = useCallback((packageId: string, moduleId?: string) => {
    const pkg = state.packages.find((p) => p.id === packageId);
    if (!pkg) return { valid: true, missing: [] };

    const selectedPackageIds = state.packages.filter((p) => p.selected).map((p) => p.id);
    const selectedModuleIds = state.packages.flatMap((p) =>
      p.modules.filter((m) => m.selected).map((m) => m.id)
    );

    const missingPkg = pkg.prerequisites.filter((req) => !selectedPackageIds.includes(req));
    let missingMod: string[] = [];

    if (moduleId) {
      const mod = pkg.modules.find((m) => m.id === moduleId);
      if (mod) {
        missingMod = mod.prerequisites.filter((req) => !selectedModuleIds.includes(req));
      }
    }

    const missing = [...missingPkg, ...missingMod];
    return { valid: missing.length === 0, missing };
  }, [state.packages]);

  const calculateTotalEffort = useCallback(() => {
    let total = 0;
    state.packages.forEach((p) => {
      if (p.selected) {
        total += p.total_effort_pd;
      } else {
        p.modules.forEach((m) => {
          if (m.selected) total += m.effort_pd;
        });
      }
    });
    state.integrations.forEach((i) => (total += i.effort_pd));
    state.malaysiaForms.forEach((f) => {
      if (f.selected) total += f.effort_pd;
    });
    state.projectServices.forEach((s) => {
      if (s.selected) total += s.effort_pd;
    });
    return Math.round(total * 10) / 10;
  }, [state.packages, state.integrations, state.malaysiaForms, state.projectServices]);

  const getSelectedPackages = useCallback(() => {
    return state.packages.filter((p) => p.selected || p.modules.some((m) => m.selected));
  }, [state.packages]);

  const calculateComplexityMultiplier = useCallback(() => {
    return 1.0; // Simplified for now
  }, []);

  const generateRiskAssessment = useCallback((): RiskAssessmentT => {
    return {
      overall_risk: "MEDIUM",
      specific_risks: [],
      fricew_risks: [],
    };
  }, []);

  // Add other callback functions as needed...

  const contextValue = useMemo(() => ({
    state,
    updatePackage,
    updateClientProfile,
    setSelectedView,
    addIntegration,
    removeIntegration,
    updateIntegration,
    updateMalaysiaForm,
    updateProjectService,
    setBtpIntegrationEnabled,
    setAdminMode,
    addPackage: () => {},
    deletePackage: () => {},
    addModule: () => {},
    updateModule: () => {},
    deleteModule: () => {},
    duplicatePackage: () => {},
    exportLibrary: () => {},
    importLibrary: () => {},
    logChange,
    validatePrerequisites,
    setFloatingCardMinimized: () => {},
    calculateTotalEffort,
    getSelectedPackages,
    calculateComplexityMultiplier,
    generateRiskAssessment,
  }), [
    state,
    updatePackage,
    updateClientProfile,
    setSelectedView,
    addIntegration,
    removeIntegration,
    updateIntegration,
    updateMalaysiaForm,
    updateProjectService,
    setBtpIntegrationEnabled,
    setAdminMode,
    logChange,
    validatePrerequisites,
    calculateTotalEffort,
    getSelectedPackages,
    calculateComplexityMultiplier,
    generateRiskAssessment,
  ]);

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

export default AppProvider;