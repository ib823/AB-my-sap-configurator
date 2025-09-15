import React, { useState, useContext, createContext, useCallback, useMemo } from "react";

// ======================== TYPE DEFINITIONS ========================
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
  category: MFCategory;
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

interface RiskAssessment {
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

// ======================== SEED DATA ========================
const COMPLETE_PACKAGE_LIBRARY: SAPPackage[] = [
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
      {
        id: "cost_centers",
        name: "Cost Center Accounting",
        description: "Cost center hierarchy and allocation",
        effort_pd: 38,
        prerequisites: ["gl_setup"],
        selected: false,
      },
      {
        id: "profit_centers",
        name: "Profit Center Accounting",
        description: "Profit center structure",
        effort_pd: 32,
        prerequisites: ["gl_setup"],
        selected: false,
      }
    ],
    expanded: false,
    selected: false,
  },
  {
    id: "accounts_payable",
    name: "Accounts Payable",
    category: "Finance Core",
    description: "Vendor management, invoice processing, payment runs",
    total_effort_pd: 165.5,
    sgd_price: 115000,
    layer: "core",
    type: "core",
    icon: "📤",
    malaysia_verified: true,
    critical_path: true,
    prerequisites: ["financial_master_data"],
    source: "Page 9",
    modules: [
      {
        id: "vendor_master",
        name: "Vendor Master Data",
        description: "Vendor creation and maintenance",
        effort_pd: 28,
        prerequisites: [],
        selected: false,
      }
    ],
    expanded: false,
    selected: false,
  },
  {
    id: "sales_order_management",
    name: "Sales Order Management",
    category: "Sales & Distribution",
    description: "Order to cash process, pricing, delivery",
    total_effort_pd: 185.0,
    sgd_price: 130000,
    layer: "core",
    type: "core",
    icon: "💼",
    malaysia_verified: true,
    critical_path: true,
    prerequisites: [],
    source: "Page 15",
    modules: [
      {
        id: "sales_order_processing",
        name: "Sales Order Processing",
        description: "Order creation and fulfillment",
        effort_pd: 45,
        prerequisites: [],
        selected: false,
      }
    ],
    expanded: false,
    selected: false,
  }
];

const MALAYSIA_FORMS_LIBRARY: MalaysiaForm[] = [
  {
    id: "ea_form",
    form_name: "EA Form (Income Tax)",
    category: "Statutory",
    mandatory: true,
    effort_pd: 8,
    description: "Employee annual income tax statement",
    regulatory_body: "LHDN",
    selected: false,
    sap_module: "HCM"
  },
  {
    id: "cp39",
    form_name: "CP39 (Tax Deduction)",
    category: "Statutory",
    mandatory: true,
    effort_pd: 6,
    description: "Monthly tax deduction schedule",
    regulatory_body: "LHDN",
    selected: false,
    sap_module: "HCM"
  }
];

const PROJECT_SERVICES_LIBRARY: ProjectService[] = [
  {
    id: "pm_standard",
    service_name: "Project Management Standard",
    category: "Project Management",
    effort_pd: 120,
    description: "Standard project management services",
    mandatory: true,
    selected: false
  },
  {
    id: "cutover",
    service_name: "Cutover Planning & Execution",
    category: "Cutover & Migration",
    effort_pd: 45,
    description: "Go-live preparation and cutover execution",
    mandatory: true,
    selected: false
  }
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

// ======================== CONTEXT DEFINITION ========================
interface AppContextType {
  state: AppState;
  updatePackage: (id: string, updates: Partial<SAPPackage>) => void;
  updateClientProfile: (updates: Partial<ClientProfile>) => void;
  setSelectedView: (view: ViewKey) => void;
  addIntegration: (integration: Omit<Integration, "id">) => void;
  removeIntegration: (id: string) => void;
  updateIntegration: (id: string, updates: Partial<Integration>) => void;
  updateMalaysiaForm: (id: string, updates: Partial<MalaysiaForm>) => void;
  updateProjectService: (id: string, updates: Partial<ProjectService>) => void;
  setBtpIntegrationEnabled: (enabled: boolean) => void;
  setAdminMode: (enabled: boolean) => void;
  addPackage: (pkg: Omit<SAPPackage, "id">) => void;
  deletePackage: (id: string) => void;
  addModule: (packageId: string, mod: Omit<SAPModule, "id">) => void;
  updateModule: (packageId: string, moduleId: string, updates: Partial<SAPModule>) => void;
  deleteModule: (packageId: string, moduleId: string) => void;
  duplicatePackage: (id: string) => void;
  exportLibrary: () => void;
  importLibrary: (data: any) => void;
  logChange: (change: Omit<PackageChange, "id" | "timestamp">) => void;
  validatePrerequisites: (packageId: string, moduleId?: string) => { valid: boolean; missing: string[] };
  setFloatingCardMinimized: (minimized: boolean) => void;
  calculateTotalEffort: () => number;
  getSelectedPackages: () => SAPPackage[];
  calculateComplexityMultiplier: () => number;
  generateRiskAssessment: () => RiskAssessment;
}

const AppContext = createContext<AppContextType | null>(null);

// ======================== PROVIDER COMPONENT ========================
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      id: \`chg_\${Date.now()}_\${Math.random().toString(36).slice(2, 8)}\`,
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

  const addIntegration = useCallback((integration: Omit<Integration, "id">) => {
    const newIntegration: Integration = {
      ...integration,
      id: \`int_\${Date.now()}_\${Math.random().toString(36).slice(2, 8)}\`,
    };
    setState((prev) => ({
      ...prev,
      integrations: [...prev.integrations, newIntegration],
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
    setState((prev) => ({ ...prev, adminMode: enabled }));
  }, []);

  const setFloatingCardMinimized = useCallback((minimized: boolean) => {
    setState((prev) => ({ ...prev, floatingCardMinimized: minimized }));
  }, []);

  const addPackage = useCallback(() => {
    console.log("Add package - not implemented");
  }, []);

  const deletePackage = useCallback(() => {
    console.log("Delete package - not implemented");
  }, []);

  const addModule = useCallback(() => {
    console.log("Add module - not implemented");
  }, []);

  const updateModule = useCallback(() => {
    console.log("Update module - not implemented");
  }, []);

  const deleteModule = useCallback(() => {
    console.log("Delete module - not implemented");
  }, []);

  const duplicatePackage = useCallback(() => {
    console.log("Duplicate package - not implemented");
  }, []);

  const exportLibrary = useCallback(() => {
    console.log("Export library - not implemented");
  }, []);

  const importLibrary = useCallback(() => {
    console.log("Import library - not implemented");
  }, []);

  const validatePrerequisites = useCallback((packageId: string, moduleId?: string) => {
    const pkg = state.packages.find((p) => p.id === packageId);
    if (!pkg) return { valid: false, missing: [packageId] };

    const missing: string[] = [];
    
    if (moduleId) {
      const module = pkg.modules.find((m) => m.id === moduleId);
      if (module && module.prerequisites) {
        module.prerequisites.forEach((prereq) => {
          const prereqModule = pkg.modules.find((m) => m.id === prereq);
          if (prereqModule && !prereqModule.selected) {
            missing.push(prereq);
          }
        });
      }
    } else {
      pkg.prerequisites?.forEach((prereq) => {
        const prereqPkg = state.packages.find((p) => p.id === prereq);
        if (prereqPkg && !prereqPkg.selected) {
          missing.push(prereq);
        }
      });
    }

    return { valid: missing.length === 0, missing };
  }, [state.packages]);

  const calculateTotalEffort = useCallback(() => {
    let total = 0;
    
    state.packages.forEach((pkg) => {
      if (pkg.selected) {
        total += pkg.total_effort_pd;
      } else {
        pkg.modules.forEach((mod) => {
          if (mod.selected) total += mod.effort_pd;
        });
      }
    });

    state.integrations.forEach((int) => {
      total += int.effort_pd;
    });

    state.malaysiaForms.forEach((form) => {
      if (form.selected) total += form.effort_pd;
    });

    state.projectServices.forEach((service) => {
      if (service.selected) total += service.effort_pd;
    });

    return total;
  }, [state]);

  const getSelectedPackages = useCallback(() => {
    return state.packages.filter((pkg) => pkg.selected || pkg.modules.some((m) => m.selected));
  }, [state.packages]);

  const calculateComplexityMultiplier = useCallback(() => {
    let multiplier = 1.0;
    
    if (state.clientProfile.company_size === "enterprise") multiplier += 0.2;
    if (state.clientProfile.system_landscape === "complex_hybrid") multiplier += 0.3;
    if (state.clientProfile.client_maturity === "sap_naive") multiplier += 0.15;
    if (state.clientProfile.legal_entities > 5) multiplier += 0.1;
    
    return multiplier;
  }, [state.clientProfile]);

  const generateRiskAssessment = useCallback((): RiskAssessment => {
    const risks: RiskAssessment = {
      overall_risk: "LOW",
      specific_risks: [],
      fricew_risks: [],
    };

    const selectedPackages = getSelectedPackages();
    
    if (selectedPackages.length > 10) {
      risks.specific_risks.push({
        package: "Overall",
        risk: "Large scope with multiple packages",
        likelihood: "HIGH",
        impact: "HIGH",
        mitigation: "Phase implementation and ensure adequate resources",
      });
    }

    const criticalPackages = selectedPackages.filter((p) => p.critical_path);
    if (criticalPackages.length > 0) {
      risks.specific_risks.push({
        package: "Critical Path",
        risk: "Critical path dependencies",
        likelihood: "MEDIUM",
        impact: "HIGH",
        mitigation: "Careful sequencing and dependency management",
      });
    }

    const highRisks = risks.specific_risks.filter((r) => r.impact === "HIGH").length;
    if (highRisks >= 3) risks.overall_risk = "HIGH";
    else if (highRisks >= 1) risks.overall_risk = "MEDIUM";
    else risks.overall_risk = "LOW";

    return risks;
  }, [getSelectedPackages]);

  const contextValue = useMemo<AppContextType>(() => ({
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
    addPackage,
    deletePackage,
    addModule,
    updateModule,
    deleteModule,
    duplicatePackage,
    exportLibrary,
    importLibrary,
    logChange,
    validatePrerequisites,
    setFloatingCardMinimized,
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
    addPackage,
    deletePackage,
    addModule,
    updateModule,
    deleteModule,
    duplicatePackage,
    exportLibrary,
    importLibrary,
    logChange,
    validatePrerequisites,
    setFloatingCardMinimized,
    calculateTotalEffort,
    getSelectedPackages,
    calculateComplexityMultiplier,
    generateRiskAssessment,
  ]);

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

// ======================== EXPORT HOOK ========================
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

export default AppProvider;
