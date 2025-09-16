#!/bin/bash

# SAP Configurator Fix Application Script
# This script will create all fixed files directly in your project

echo "🚀 Applying SAP Configurator Fix..."
echo "===================================="
echo ""

# Ensure we're in the right directory
if [ ! -d "src/components" ]; then
    echo "❌ Error: Please run this script from your project root directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected: /workspaces/AB-my-sap-configurator"
    exit 1
fi

echo "✅ Creating backup..."
mkdir -p backup-$(date +%Y%m%d-%H%M%S)
cp -r src/components/* backup-$(date +%Y%m%d-%H%M%S)/ 2>/dev/null || true

echo "📝 Creating AppProvider.tsx..."
cat > src/components/AppProvider.tsx << 'APPROVIDER_EOF'
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
APPROVIDER_EOF

echo "✅ AppProvider.tsx created!"

# Continue in next part due to length...
echo "📝 Creating remaining files..."

# Create the complete fix application script
cat > APPLY_FIX_PART2.sh << 'PART2_EOF'
#!/bin/bash

echo "📝 Creating SAPScopeApp.tsx..."
cat > src/components/SAPScopeApp.tsx << 'SCOPEAPP_EOF'
import React, { useState, useMemo } from 'react';
import { useApp } from './AppProvider';
import { ChevronDown, ChevronRight, Plus, Minus, AlertTriangle, Search, Filter, Package, FileText, DollarSign, AlertCircle } from 'lucide-react';

const INDUSTRIES = [
  { value: 'services', label: 'Professional Services' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'financial_services', label: 'Financial Services' },
  { value: 'government', label: 'Government' },
  { value: 'retail', label: 'Retail' }
];

const COMPANY_SIZES = [
  { value: 'sme', label: 'SME (< 100 employees)' },
  { value: 'mid_market', label: 'Mid Market (100-1000 employees)' },
  { value: 'large', label: 'Large (1000+ employees)' },
  { value: 'enterprise', label: 'Enterprise (5000+ employees)' }
];

const SAPScopeApp: React.FC = () => {
  const {
    state,
    updatePackage,
    updateClientProfile,
    updateMalaysiaForm,
    updateProjectService,
    validatePrerequisites,
    calculateTotalEffort,
    generateRiskAssessment
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'packages' | 'forms' | 'services'>('packages');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(state.packages.map(p => p.category)));
    return ['all', ...cats];
  }, [state.packages]);

  // Filter packages
  const filteredPackages = useMemo(() => {
    return state.packages.filter(pkg => {
      const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || pkg.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [state.packages, searchQuery, selectedCategory]);

  const handlePackageToggle = (packageId: string) => {
    const pkg = state.packages.find(p => p.id === packageId);
    if (!pkg) return;

    const validation = validatePrerequisites(packageId);
    if (!validation.valid && !pkg.selected) {
      alert(\`Missing prerequisites: \${validation.missing.join(', ')}\`);
      return;
    }

    updatePackage(packageId, { 
      selected: !pkg.selected,
      modules: pkg.modules.map(m => ({ ...m, selected: !pkg.selected }))
    });
  };

  const handleModuleToggle = (packageId: string, moduleId: string) => {
    const pkg = state.packages.find(p => p.id === packageId);
    if (!pkg || pkg.selected) return;

    const moduleValidation = validatePrerequisites(packageId, moduleId);
    const module = pkg.modules.find(m => m.id === moduleId);
    
    if (!moduleValidation.valid && module && !module.selected) {
      alert(\`Missing module prerequisites: \${moduleValidation.missing.join(', ')}\`);
      return;
    }

    const updatedModules = pkg.modules.map(m => 
      m.id === moduleId ? { ...m, selected: !m.selected } : m
    );

    updatePackage(packageId, { modules: updatedModules });
  };

  const totalEffort = calculateTotalEffort();
  const complexityMultiplier = state.clientProfile.company_size === 'enterprise' ? 1.2 : 1.0;
  const adjustedEffort = Math.round(totalEffort * complexityMultiplier);
  const estimatedCostSGD = Math.round(adjustedEffort * 2800);
  const estimatedCostMYR = Math.round(adjustedEffort * 2450);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">SAP Implementation Scope Builder</h1>
              <p className="text-sm text-slate-600 mt-1">Configure your SAP S/4HANA implementation scope</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-slate-600">Total Effort</div>
                <div className="text-2xl font-bold text-blue-600">{adjustedEffort} PD</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-600">Estimated Cost</div>
                <div className="text-2xl font-bold text-green-600">SGD \${estimatedCostSGD.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Client Profile Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={state.clientProfile.company_name}
                onChange={(e) => updateClientProfile({ company_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter company name..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
              <select
                value={state.clientProfile.industry}
                onChange={(e) => updateClientProfile({ industry: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {INDUSTRIES.map(ind => (
                  <option key={ind.value} value={ind.value}>{ind.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Size</label>
              <select
                value={state.clientProfile.company_size}
                onChange={(e) => updateClientProfile({ company_size: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {COMPANY_SIZES.map(size => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('packages')}
              className={\`flex-1 px-6 py-3 text-sm font-medium transition-colors \${
                activeTab === 'packages'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }\`}
            >
              <Package className="w-4 h-4 inline-block mr-2" />
              SAP Packages
            </button>
            <button
              onClick={() => setActiveTab('forms')}
              className={\`flex-1 px-6 py-3 text-sm font-medium transition-colors \${
                activeTab === 'forms'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }\`}
            >
              <FileText className="w-4 h-4 inline-block mr-2" />
              Malaysia Forms
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={\`flex-1 px-6 py-3 text-sm font-medium transition-colors \${
                activeTab === 'services'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }\`}
            >
              <DollarSign className="w-4 h-4 inline-block mr-2" />
              Project Services
            </button>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'packages' && (
          <>
            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search packages..."
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="text-slate-400 w-5 h-5" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Packages List */}
            <div className="space-y-4">
              {filteredPackages.map(pkg => (
                <div
                  key={pkg.id}
                  className={\`bg-white rounded-xl shadow-sm border-2 transition-all \${
                    pkg.selected ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'
                  }\`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{pkg.icon}</span>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {pkg.name}
                              {pkg.malaysia_verified && (
                                <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                  MY Verified
                                </span>
                              )}
                              {pkg.critical_path && (
                                <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                                  Critical Path
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1">{pkg.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-slate-500">
                                Category: <span className="font-medium">{pkg.category}</span>
                              </span>
                              <span className="text-sm text-slate-500">
                                Effort: <span className="font-medium">{pkg.total_effort_pd} PD</span>
                              </span>
                              <span className="text-sm text-slate-500">
                                Price: <span className="font-medium">SGD \${pkg.sgd_price.toLocaleString()}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updatePackage(pkg.id, { expanded: !pkg.expanded })}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          {pkg.expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => handlePackageToggle(pkg.id)}
                          className={\`px-4 py-2 rounded-lg font-medium transition-colors \${
                            pkg.selected
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }\`}
                        >
                          {pkg.selected ? 'Selected' : 'Select Package'}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Modules */}
                    {pkg.expanded && pkg.modules.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">Modules</h4>
                        <div className="space-y-2">
                          {pkg.modules.map(module => (
                            <div
                              key={module.id}
                              className={\`flex items-center justify-between p-3 rounded-lg \${
                                module.selected ? 'bg-blue-100' : 'bg-slate-50'
                              } \${pkg.selected ? 'opacity-50 cursor-not-allowed' : ''}\`}
                            >
                              <div className="flex-1">
                                <div className="font-medium text-sm text-slate-900">{module.name}</div>
                                <div className="text-xs text-slate-600">{module.description}</div>
                                <div className="text-xs text-slate-500 mt-1">Effort: {module.effort_pd} PD</div>
                              </div>
                              <button
                                onClick={() => handleModuleToggle(pkg.id, module.id)}
                                disabled={pkg.selected}
                                className={\`px-3 py-1 rounded text-sm font-medium transition-colors \${
                                  module.selected
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-slate-700 border border-slate-300'
                                } \${pkg.selected ? 'cursor-not-allowed' : 'hover:bg-blue-700 hover:text-white'}\`}
                              >
                                {module.selected ? 'Selected' : 'Select'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Malaysia Forms Tab */}
        {activeTab === 'forms' && (
          <div className="space-y-4">
            {state.malaysiaForms.map(form => (
              <div
                key={form.id}
                className={\`bg-white rounded-xl shadow-sm border-2 p-6 transition-all \${
                  form.selected ? 'border-green-500 bg-green-50/30' : 'border-slate-200 hover:border-slate-300'
                }\`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {form.form_name}
                      {form.mandatory && (
                        <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                          Mandatory
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">{form.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-slate-500">
                        Category: <span className="font-medium">{form.category}</span>
                      </span>
                      <span className="text-sm text-slate-500">
                        Effort: <span className="font-medium">{form.effort_pd} PD</span>
                      </span>
                      <span className="text-sm text-slate-500">
                        Regulatory: <span className="font-medium">{form.regulatory_body}</span>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => updateMalaysiaForm(form.id, { selected: !form.selected })}
                    className={\`px-4 py-2 rounded-lg font-medium transition-colors \${
                      form.selected
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }\`}
                  >
                    {form.selected ? 'Selected' : 'Select Form'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Project Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            {state.projectServices.map(service => (
              <div
                key={service.id}
                className={\`bg-white rounded-xl shadow-sm border-2 p-6 transition-all \${
                  service.selected ? 'border-purple-500 bg-purple-50/30' : 'border-slate-200 hover:border-slate-300'
                }\`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {service.service_name}
                      {service.mandatory && (
                        <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                          Mandatory
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">{service.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-slate-500">
                        Category: <span className="font-medium">{service.category}</span>
                      </span>
                      <span className="text-sm text-slate-500">
                        Effort: <span className="font-medium">{service.effort_pd} PD</span>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => updateProjectService(service.id, { selected: !service.selected })}
                    className={\`px-4 py-2 rounded-lg font-medium transition-colors \${
                      service.selected
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }\`}
                  >
                    {service.selected ? 'Selected' : 'Select Service'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SAPScopeApp;
SCOPEAPP_EOF

echo "✅ SAPScopeApp.tsx created!"
echo "✅ All files created successfully!"
echo ""
echo "🎉 Fix applied! Now restart your server:"
echo "   npm run dev"
PART2_EOF

chmod +x APPLY_FIX_PART2.sh
./APPLY_FIX_PART2.sh

echo ""
echo "=========================================="
echo "✅ SAP Configurator fix successfully applied!"
echo ""
echo "Next steps:"
echo "1. Restart your dev server: npm run dev"
echo "2. Open http://localhost:5173"
echo "3. You should see the working SAP Scope Builder!"
echo ""
echo "If you still have issues, check:"
echo "- Browser console for any errors"
echo "- That all files were created properly"
echo "- That the server restarted correctly"