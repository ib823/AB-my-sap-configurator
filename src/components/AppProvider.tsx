import React, { useState, useContext, createContext, useCallback, useMemo, useEffect } from 'react';

// ======================== TYPES & INTERFACES ========================

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

interface SAPPackage {
  id: string;
  name: string;
  category: string;
  description: string;
  total_effort_pd: number;
  sgd_price: number;
  layer: 'core' | 'supplementary' | 'integration' | 'external' | 'analytics';
  type: 'core' | 'supplementary' | 'integration' | 'external' | 'analytics' | 'identity';
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

interface Integration {
  id: string;
  system_name: string;
  integration_type: 'API' | 'File Transfer' | 'Real-time' | 'Batch' | 'Event-driven' | 'Database Direct';
  complexity: 'Simple' | 'Medium' | 'Complex';
  effort_pd: number;
  description: string;
}

interface MalaysiaForm {
  id: string;
  form_name: string;
  category: 'Statutory' | 'Banking' | 'HR' | 'Finance' | 'Compliance' | 'Sales' | 'Procurement' | 'Logistics';
  mandatory: boolean;
  effort_pd: number;
  description: string;
  regulatory_body: string;
  selected: boolean;
  sap_module: string;
}

interface ProjectService {
  id: string;
  service_name: string;
  category: 'Project Management' | 'Cutover & Migration' | 'Training' | 'Basis & Infrastructure' | 'Support';
  effort_pd: number;
  description: string;
  mandatory: boolean;
  selected: boolean;
}

interface ClientProfile {
  company_name: string;
  industry: 'services' | 'manufacturing' | 'financial_services' | 'government' | 'retail';
  company_size: 'sme' | 'mid_market' | 'large' | 'enterprise';
  system_landscape: 'greenfield' | 'brownfield' | 'hybrid' | 'complex_hybrid';
  client_maturity: 'sap_naive' | 'sap_experienced' | 'sap_expert';
  legal_entities: number;
}

interface UserRole {
  type: 'user' | 'super_user' | 'admin';
  permissions: {
    view_packages: boolean;
    edit_packages: boolean;
    create_packages: boolean;
    delete_packages: boolean;
    export_library: boolean;
  };
}

interface PackageChange {
  id: string;
  timestamp: Date;
  user: string;
  type: 'create' | 'update' | 'delete' | 'module_add' | 'module_update' | 'module_delete';
  packageId: string;
  before?: any;
  after?: any;
  reason: string;
}

interface RiskAssessment {
  overall_risk: 'LOW' | 'MEDIUM' | 'HIGH';
  specific_risks: Array<{
    package: string;
    risk: string;
    likelihood: 'LOW' | 'MEDIUM' | 'HIGH';
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    mitigation: string;
  }>;
  fricew_risks: Array<{
    category: string;
    likelihood: 'LOW' | 'MEDIUM' | 'HIGH';
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;
}

interface BundleAnalysis {
  bundle_opportunities: Array<{
    bundle_name: string;
    individual_cost_sgd: number;
    bundle_cost_sgd: number;
    savings_sgd: number;
    savings_percentage: number;
    risk_note: string;
  }>;
  recommendations: string[];
}

interface ImplementationPhase {
  phase_name: string;
  packages: string[];
  duration_weeks: number;
  parallel_opportunities: string[];
  critical_dependencies: string[];
}

interface AppState {
  packages: SAPPackage[];
  integrations: Integration[];
  malaysiaForms: MalaysiaForm[];
  projectServices: ProjectService[];
  clientProfile: ClientProfile;
  selectedView: 'packages' | 'integrations' | 'forms' | 'services';
  btpIntegrationEnabled: boolean;
  userRole: UserRole;
  adminMode: boolean;
  packageChanges: PackageChange[];
  editingPackage: SAPPackage | null;
  editingModule: SAPModule | null;
  floatingCardMinimized: boolean;
}

interface AppContextType {
  state: AppState;
  updatePackage: (id: string, updates: Partial<SAPPackage>) => void;
  updateClientProfile: (updates: Partial<ClientProfile>) => void;
  setSelectedView: (view: 'packages' | 'integrations' | 'forms' | 'services') => void;
  addIntegration: (integration: Omit<Integration, 'id'>) => void;
  removeIntegration: (id: string) => void;
  updateIntegration: (id: string, updates: Partial<Integration>) => void;
  updateMalaysiaForm: (id: string, updates: Partial<MalaysiaForm>) => void;
  updateProjectService: (id: string, updates: Partial<ProjectService>) => void;
  setBtpIntegrationEnabled: (enabled: boolean) => void;
  setAdminMode: (enabled: boolean) => void;
  addPackage: (pkg: Omit<SAPPackage, 'id'>) => void;
  deletePackage: (id: string) => void;
  addModule: (packageId: string, module: Omit<SAPModule, 'id'>) => void;
  updateModule: (packageId: string, moduleId: string, updates: Partial<SAPModule>) => void;
  deleteModule: (packageId: string, moduleId: string) => void;
  duplicatePackage: (id: string) => void;
  exportLibrary: () => void;
  importLibrary: (data: any) => void;
  logChange: (change: Omit<PackageChange, 'id' | 'timestamp'>) => void;
  validatePrerequisites: (packageId: string, moduleId?: string) => { valid: boolean; missing: string[] };
  setFloatingCardMinimized: (minimized: boolean) => void;
  calculateTotalEffort: () => number;
  getSelectedPackages: () => SAPPackage[];
  calculateComplexityMultiplier: () => number;
  generateRiskAssessment: () => RiskAssessment;
  generateBundleAnalysis: () => BundleAnalysis;
  generateImplementationPlan: () => ImplementationPhase[];
}

// ======================== SAMPLE DATA ========================

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
    source: "Core SAP Finance",
    modules: [
      { id: "gl_setup", name: "General Ledger Setup", description: "Chart of accounts, fiscal year", effort_pd: 45, prerequisites: [], selected: false },
      { id: "cost_centers", name: "Cost Center Management", description: "Cost center hierarchy and allocation", effort_pd: 38, prerequisites: ["gl_setup"], selected: false },
      { id: "profit_centers", name: "Profit Center Accounting", description: "Profitability analysis setup", effort_pd: 32, prerequisites: ["gl_setup"], selected: false },
      { id: "company_code", name: "Company Code Configuration", description: "Legal entity setup", effort_pd: 28, prerequisites: [], selected: false },
      { id: "currency_config", name: "Currency Configuration", description: "Multi-currency setup for Malaysia", effort_pd: 25, prerequisites: ["company_code"], selected: false, malaysia_verified: true },
      { id: "tax_setup", name: "Tax Configuration", description: "SST, GST, withholding tax setup", effort_pd: 24.9, prerequisites: ["company_code"], selected: false, malaysia_verified: true }
    ],
    expanded: false,
    selected: false
  },
  {
    id: "procurement_inventory",
    name: "Procurement & Inventory Management",
    category: "Finance Core",
    description: "Automated P2P accounting",
    total_effort_pd: 90.0,
    sgd_price: 63000,
    layer: "core",
    type: "core",
    icon: "📦",
    malaysia_verified: true,
    critical_path: false,
    prerequisites: ["financial_master_data"],
    source: "Core SAP Finance",
    modules: [
      { id: "po_processing", name: "Purchase Order Processing", description: "Automated PO workflows", effort_pd: 30, prerequisites: [], selected: false },
      { id: "inventory_mgmt", name: "Inventory Management", description: "Stock movements and valuation", effort_pd: 35, prerequisites: [], selected: false },
      { id: "vendor_mgmt", name: "Vendor Management", description: "Supplier master data", effort_pd: 25, prerequisites: [], selected: false }
    ],
    expanded: false,
    selected: false
  }
];

const MALAYSIA_FORMS_LIBRARY: MalaysiaForm[] = [
  {
    id: "sst_form",
    form_name: "SST Return Form",
    category: "Statutory",
    mandatory: true,
    effort_pd: 15,
    description: "Sales and Service Tax return filing",
    regulatory_body: "Royal Malaysian Customs Department",
    selected: false,
    sap_module: "FI-CA"
  }
];

const PROJECT_SERVICES_LIBRARY: ProjectService[] = [
  {
    id: "project_mgmt",
    service_name: "Project Management",
    category: "Project Management",
    effort_pd: 120,
    description: "End-to-end project coordination",
    mandatory: true,
    selected: false
  }
];

const DEFAULT_USER_ROLE: UserRole = {
  type: 'user',
  permissions: {
    view_packages: true,
    edit_packages: false,
    create_packages: false,
    delete_packages: false,
    export_library: false
  }
};

const SUPER_USER_ROLE: UserRole = {
  type: 'super_user',
  permissions: {
    view_packages: true,
    edit_packages: true,
    create_packages: true,
    delete_packages: true,
    export_library: true
  }
};

// ======================== CONTEXT SETUP ========================

const AppContext = createContext<AppContextType | null>(null);

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    packages: [...COMPLETE_PACKAGE_LIBRARY],
    integrations: [],
    malaysiaForms: [...MALAYSIA_FORMS_LIBRARY],
    projectServices: [...PROJECT_SERVICES_LIBRARY],
    clientProfile: {
      company_name: '',
      industry: 'services',
      company_size: 'mid_market',
      system_landscape: 'greenfield',
      client_maturity: 'sap_experienced',
      legal_entities: 1
    },
    selectedView: 'packages',
    btpIntegrationEnabled: false,
    userRole: DEFAULT_USER_ROLE,
    adminMode: false,
    packageChanges: [],
    editingPackage: null,
    editingModule: null,
    floatingCardMinimized: false
  });

  // Admin mode toggle via keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        setState(prev => ({ 
          ...prev, 
          adminMode: !prev.adminMode,
          userRole: !prev.adminMode ? SUPER_USER_ROLE : DEFAULT_USER_ROLE
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const validatePrerequisites = useCallback((packageId: string, moduleId?: string) => {
    const pkg = state.packages.find(p => p.id === packageId);
    if (!pkg) return { valid: true, missing: [] };

    const selectedPackageIds = state.packages.filter(p => p.selected).map(p => p.id);
    const selectedModuleIds = state.packages.flatMap(p => p.modules.filter(m => m.selected).map(m => m.id));

    // Check package prerequisites
    const missingPackagePrereqs = pkg.prerequisites.filter(prereqId => 
      !selectedPackageIds.includes(prereqId)
    );

    // Check module prerequisites if moduleId provided
    let missingModulePrereqs: string[] = [];
    if (moduleId) {
      const module = pkg.modules.find(m => m.id === moduleId);
      if (module) {
        missingModulePrereqs = module.prerequisites.filter(prereqId => 
          !selectedModuleIds.includes(prereqId)
        );
      }
    }

    const allMissing = [...missingPackagePrereqs, ...missingModulePrereqs];
    return {
      valid: allMissing.length === 0,
      missing: allMissing
    };
  }, [state.packages]);

  const updatePackage = useCallback((id: string, updates: Partial<SAPPackage>) => {
    setState(prev => {
      const oldPackage = prev.packages.find(p => p.id === id);
      const newPackages = prev.packages.map(pkg => 
        pkg.id === id ? { ...pkg, ...updates } : pkg
      );
      
      // Log the change if admin
      if (prev.adminMode && oldPackage) {
        const change: Omit<PackageChange, 'id' | 'timestamp'> = {
          user: 'Admin',
          type: 'update',
          packageId: id,
          before: oldPackage,
          after: { ...oldPackage, ...updates },
          reason: 'Package updated via admin interface'
        };
        
        const newChange: PackageChange = {
          ...change,
          id: `chg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date()
        };

        return {
          ...prev,
          packages: newPackages,
          packageChanges: [newChange, ...prev.packageChanges].slice(0, 100)
        };
      }
      
      return { ...prev, packages: newPackages };
    });
  }, []);

  const updateClientProfile = useCallback((updates: Partial<ClientProfile>) => {
    setState(prev => ({
      ...prev,
      clientProfile: { ...prev.clientProfile, ...updates }
    }));
  }, []);

  const setSelectedView = useCallback((view: 'packages' | 'integrations' | 'forms' | 'services') => {
    setState(prev => ({ ...prev, selectedView: view }));
  }, []);

  const addIntegration = useCallback((integration: Omit<Integration, 'id'>) => {
    const newIntegration: Integration = {
      ...integration,
      id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setState(prev => ({
      ...prev,
      integrations: [...prev.integrations, newIntegration]
    }));
  }, []);

  const removeIntegration = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      integrations: prev.integrations.filter(int => int.id !== id)
    }));
  }, []);

  const updateIntegration = useCallback((id: string, updates: Partial<Integration>) => {
    setState(prev => ({
      ...prev,
      integrations: prev.integrations.map(int =>
        int.id === id ? { ...int, ...updates } : int
      )
    }));
  }, []);

  const updateMalaysiaForm = useCallback((id: string, updates: Partial<MalaysiaForm>) => {
    setState(prev => ({
      ...prev,
      malaysiaForms: prev.malaysiaForms.map(form =>
        form.id === id ? { ...form, ...updates } : form
      )
    }));
  }, []);

  const updateProjectService = useCallback((id: string, updates: Partial<ProjectService>) => {
    setState(prev => ({
      ...prev,
      projectServices: prev.projectServices.map(service =>
        service.id === id ? { ...service, ...updates } : service
      )
    }));
  }, []);

  const setBtpIntegrationEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, btpIntegrationEnabled: enabled }));
  }, []);

  const setAdminMode = useCallback((enabled: boolean) => {
    setState(prev => ({ 
      ...prev, 
      adminMode: enabled,
      userRole: enabled ? SUPER_USER_ROLE : DEFAULT_USER_ROLE
    }));
  }, []);

  const addPackage = useCallback((pkg: Omit<SAPPackage, 'id'>) => {
    const newPackage: SAPPackage = {
      ...pkg,
      id: `pkg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setState(prev => ({
      ...prev,
      packages: [...prev.packages, newPackage]
    }));
  }, []);

  const deletePackage = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      packages: prev.packages.filter(pkg => pkg.id !== id)
    }));
  }, []);

  const addModule = useCallback((packageId: string, module: Omit<SAPModule, 'id'>) => {
    const newModule: SAPModule = {
      ...module,
      id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setState(prev => ({
      ...prev,
      packages: prev.packages.map(pkg =>
        pkg.id === packageId
          ? {
              ...pkg,
              modules: [...pkg.modules, newModule],
              total_effort_pd: pkg.total_effort_pd + newModule.effort_pd
            }
          : pkg
      )
    }));
  }, []);

  const updateModule = useCallback((packageId: string, moduleId: string, updates: Partial<SAPModule>) => {
    setState(prev => ({
      ...prev,
      packages: prev.packages.map(pkg =>
        pkg.id === packageId
          ? {
              ...pkg,
              modules: pkg.modules.map(mod => 
                mod.id === moduleId ? { ...mod, ...updates } : mod
              ),
              total_effort_pd: pkg.modules.reduce((sum, m) => 
                sum + (m.id === moduleId ? (updates.effort_pd || m.effort_pd) : m.effort_pd), 0
              )
            }
          : pkg
      )
    }));
  }, []);

  const deleteModule = useCallback((packageId: string, moduleId: string) => {
    setState(prev => ({
      ...prev,
      packages: prev.packages.map(pkg => 
        pkg.id === packageId 
          ? {
              ...pkg,
              modules: pkg.modules.filter(mod => mod.id !== moduleId),
              total_effort_pd: pkg.modules.filter(mod => mod.id !== moduleId).reduce((sum, m) => sum + m.effort_pd, 0)
            }
          : pkg
      )
    }));
  }, []);

  const duplicatePackage = useCallback((id: string) => {
    setState(prev => {
      const packageToDupe = prev.packages.find(p => p.id === id);
      if (!packageToDupe) return prev;
      
      const newPackage: SAPPackage = {
        ...packageToDupe,
        id: `pkg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${packageToDupe.name} (Copy)`,
        modules: packageToDupe.modules.map(mod => ({
          ...mod,
          id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          selected: false
        })),
        expanded: false,
        selected: false
      };
      
      return {
        ...prev,
        packages: [...prev.packages, newPackage]
      };
    });
  }, []);

  const exportLibrary = useCallback(() => {
    const exportData = {
      packages: state.packages,
      malaysiaForms: state.malaysiaForms,
      projectServices: state.projectServices,
      changes: state.packageChanges,
      timestamp: new Date().toISOString(),
      version: '2.1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sap-package-library-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const importLibrary = useCallback((data: any) => {
    try {
      setState(prev => ({
        ...prev,
        packages: data.packages || prev.packages,
        malaysiaForms: data.malaysiaForms || prev.malaysiaForms,
        projectServices: data.projectServices || prev.projectServices
      }));
    } catch (error) {
      console.error('Import failed:', error);
    }
  }, []);

  const logChange = useCallback((change: Omit<PackageChange, 'id' | 'timestamp'>) => {
    const newChange: PackageChange = {
      ...change,
      id: `chg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      packageChanges: [newChange, ...prev.packageChanges].slice(0, 100)
    }));
  }, []);

  const calculateTotalEffort = useCallback((): number => {
    let totalEffort = 0;

    state.packages.forEach(pkg => {
      if (pkg.selected) {
        totalEffort += pkg.total_effort_pd;
      } else {
        pkg.modules.forEach(module => {
          if (module.selected) {
            totalEffort += module.effort_pd;
          }
        });
      }
    });

    state.integrations.forEach(integration => {
      totalEffort += integration.effort_pd;
    });

    state.malaysiaForms.forEach(form => {
      if (form.selected) {
        totalEffort += form.effort_pd;
      }
    });

    state.projectServices.forEach(service => {
      if (service.selected) {
        totalEffort += service.effort_pd;
      }
    });

    return totalEffort;
  }, [state]);

  const getSelectedPackages = useCallback((): SAPPackage[] => {
    return state.packages.filter(pkg => pkg.selected || pkg.modules.some(m => m.selected));
  }, [state.packages]);

  const calculateComplexityMultiplier = useCallback((): number => {
    const selectedPackages = getSelectedPackages();
    const baseMultiplier = 1.0;
    const complexityFactors = selectedPackages.length * 0.1;
    return Math.max(baseMultiplier, baseMultiplier + complexityFactors);
  }, [getSelectedPackages]);

  const generateRiskAssessment = useCallback((): RiskAssessment => {
    const selectedPackages = getSelectedPackages();
    const risks: RiskAssessment = {
      overall_risk: 'LOW',
      specific_risks: [],
      fricew_risks: []
    };

    // Generate specific risks based on selected packages
    selectedPackages.forEach(pkg => {
      if (pkg.critical_path) {
        risks.specific_risks.push({
          package: pkg.name,
          risk: 'Critical path dependency',
          likelihood: 'MEDIUM',
          impact: 'HIGH',
          mitigation: 'Ensure prerequisite packages are implemented first'
        });
      }
    });

    const categories = new Set(selectedPackages.map(pkg => pkg.category.split(' ')[0]));
    categories.forEach(category => {
      let likelihood: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
      if (category === 'Finance' || category === 'HCM') likelihood = 'HIGH';
      
      risks.fricew_risks.push({
        category,
        likelihood,
        impact: 'HIGH'
      });
    });

    const highRisks = risks.specific_risks.filter(r => r.impact === 'HIGH').length;
    if (highRisks >= 3) risks.overall_risk = 'HIGH';
    else if (highRisks >= 1) risks.overall_risk = 'MEDIUM';
    else risks.overall_risk = 'LOW';

    return risks;
  }, [getSelectedPackages]);

  const generateBundleAnalysis = useCallback((): BundleAnalysis => {
    return { bundle_opportunities: [], recommendations: [] };
  }, []);

  const generateImplementationPlan = useCallback((): ImplementationPhase[] => {
    return [];
  }, []);

  const setFloatingCardMinimized = useCallback((minimized: boolean) => {
    setState(prev => ({ ...prev, floatingCardMinimized: minimized }));
  }, []);

  const value = {
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
    generateBundleAnalysis,
    generateImplementationPlan
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export default AppProvider;
export { useApp };
export type { SAPPackage, SAPModule, Integration, MalaysiaForm, ProjectService, ClientProfile };