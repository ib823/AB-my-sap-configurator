import React, { useState, useContext, createContext, useCallback, useMemo, useEffect } from 'react';

// ======================== COMPLETE PACKAGE LIBRARY ========================
const COMPLETE_PACKAGE_LIBRARY = [
  // FINANCE CORE PACKAGES
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
    name: "Procurement & Inventory Accounting",
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
    source: "Page 8",
    modules: [
      { id: "vendor_master", name: "Vendor Master Data", description: "Supplier information management", effort_pd: 20, prerequisites: [], selected: false },
      { id: "purchase_requisition", name: "Purchase Requisition", description: "PR workflow and approval", effort_pd: 18, prerequisites: ["vendor_master"], selected: false },
      { id: "purchase_order", name: "Purchase Order Processing", description: "PO creation and management", effort_pd: 22, prerequisites: ["purchase_requisition"], selected: false },
      { id: "goods_receipt", name: "Goods Receipt", description: "Material receipt processing", effort_pd: 15, prerequisites: ["purchase_order"], selected: false },
      { id: "invoice_verification", name: "Invoice Verification", description: "3-way matching process", effort_pd: 15, prerequisites: ["goods_receipt"], selected: false }
    ],
    expanded: false,
    selected: false
  }
  // Add more packages as needed
];

// ======================== MALAYSIA FORMS LIBRARY ========================
const MALAYSIA_FORMS_LIBRARY = [
  { id: "einvoice_pdf", form_name: "e-Invoice PDF – Invoice (IRBM UID + QR)", category: "Statutory", mandatory: true, effort_pd: 8, description: "LHDN compliant e-invoice with QR code", regulatory_body: "LHDN", sap_module: "SD/FI (AR)", selected: false },
  { id: "credit_note_pdf", form_name: "e-Invoice PDF – Credit Note", category: "Statutory", mandatory: true, effort_pd: 6, description: "Credit note with e-invoice compliance", regulatory_body: "LHDN", sap_module: "SD/FI (AR)", selected: false }
  // Add more forms as needed
];

// ======================== PROJECT SERVICES LIBRARY ========================
const PROJECT_SERVICES_LIBRARY = [
  { id: "project_management", service_name: "Project Management", category: "Project Management", effort_pd: 120, description: "End-to-end project management", mandatory: true, selected: false },
  { id: "change_management", service_name: "Change Management", category: "Project Management", effort_pd: 80, description: "Organizational change management", mandatory: true, selected: false }
  // Add more services as needed
];

// Context creation
const AppContext = createContext(null);

// Main Provider Component
export const AppProvider = ({ children }) => {
  const [state, setState] = useState({
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
    userRole: {
      type: 'user',
      permissions: {
        view_packages: true,
        edit_packages: false,
        create_packages: false,
        delete_packages: false,
        export_library: false
      }
    },
    adminMode: false,
    packageChanges: [],
    editingPackage: null,
    editingModule: null,
    floatingCardMinimized: false
  });

  // Toggle admin mode with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        setState(prev => ({ 
          ...prev, 
          adminMode: !prev.adminMode,
          userRole: !prev.adminMode ? {
            type: 'super_user',
            permissions: {
              view_packages: true,
              edit_packages: true,
              create_packages: true,
              delete_packages: true,
              export_library: true
            }
          } : {
            type: 'user',
            permissions: {
              view_packages: true,
              edit_packages: false,
              create_packages: false,
              delete_packages: false,
              export_library: false
            }
          }
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const validatePrerequisites = useCallback((packageId, moduleId) => {
    const pkg = state.packages.find(p => p.id === packageId);
    if (!pkg) return { valid: true, missing: [], warnings: [] };

    const selectedPackageIds = state.packages.filter(p => p.selected).map(p => p.id);
    const selectedModuleIds = state.packages.flatMap(p => p.modules.filter(m => m.selected).map(m => m.id));

    // Check package prerequisites
    const missingPackagePrereqs = pkg.prerequisites.filter(prereqId => 
      !selectedPackageIds.includes(prereqId)
    );

    // Check module prerequisites if moduleId provided
    let missingModulePrereqs = [];
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
      missing: allMissing,
      warnings: []
    };
  }, [state.packages]);

  const updatePackage = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      packages: prev.packages.map(pkg => 
        pkg.id === id ? { ...pkg, ...updates } : pkg
      )
    }));
  }, []);

  const updateClientProfile = useCallback((updates) => {
    setState(prev => ({
      ...prev,
      clientProfile: { ...prev.clientProfile, ...updates }
    }));
  }, []);

  const setSelectedView = useCallback((view) => {
    setState(prev => ({ ...prev, selectedView: view }));
  }, []);

  const addIntegration = useCallback((integration) => {
    const newIntegration = {
      ...integration,
      id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setState(prev => ({
      ...prev,
      integrations: [...prev.integrations, newIntegration]
    }));
  }, []);

  const removeIntegration = useCallback((id) => {
    setState(prev => ({
      ...prev,
      integrations: prev.integrations.filter(int => int.id !== id)
    }));
  }, []);

  const updateIntegration = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      integrations: prev.integrations.map(int => 
        int.id === id ? { ...int, ...updates } : int
      )
    }));
  }, []);

  const updateMalaysiaForm = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      malaysiaForms: prev.malaysiaForms.map(form => 
        form.id === id ? { ...form, ...updates } : form
      )
    }));
  }, []);

  const updateProjectService = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      projectServices: prev.projectServices.map(service => 
        service.id === id ? { ...service, ...updates } : service
      )
    }));
  }, []);

  const setBtpIntegrationEnabled = useCallback((enabled) => {
    setState(prev => ({ ...prev, btpIntegrationEnabled: enabled }));
  }, []);

  const setAdminMode = useCallback((enabled) => {
    setState(prev => ({ 
      ...prev, 
      adminMode: enabled
    }));
  }, []);

  const setFloatingCardMinimized = useCallback((minimized) => {
    setState(prev => ({ ...prev, floatingCardMinimized: minimized }));
  }, []);

  const calculateTotalEffort = useCallback(() => {
    let totalEffort = 0;

    // Package effort
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

    // Integration effort
    state.integrations.forEach(integration => {
      totalEffort += integration.effort_pd;
    });

    // Forms effort
    state.malaysiaForms.forEach(form => {
      if (form.selected) {
        totalEffort += form.effort_pd;
      }
    });

    // Project services effort
    state.projectServices.forEach(service => {
      if (service.selected) {
        totalEffort += service.effort_pd;
      }
    });

    return Math.round(totalEffort * 10) / 10;
  }, [state]);

  const getSelectedPackages = useCallback(() => {
    return state.packages.filter(pkg => 
      pkg.selected || pkg.modules.some(m => m.selected)
    );
  }, [state.packages]);

  const calculateComplexityMultiplier = useCallback(() => {
    const sizeMultipliers = { sme: 0.8, mid_market: 1.0, large: 1.3, enterprise: 1.6 };
    const industryMultipliers = { 
      services: 1.0, 
      manufacturing: 1.2, 
      financial_services: 1.4, 
      government: 1.3,
      retail: 1.1 
    };
    const landscapeMultipliers = {
      greenfield: 0.9,
      brownfield: 1.2,
      hybrid: 1.4,
      complex_hybrid: 1.7
    };
    const maturityMultipliers = {
      sap_naive: 1.3,
      sap_experienced: 1.0,
      sap_expert: 0.9
    };

    const { company_size, industry, system_landscape, client_maturity, legal_entities } = state.clientProfile;

    const sizeMultiplier = sizeMultipliers[company_size] || 1.0;
    const industryMultiplier = industryMultipliers[industry] || 1.0;
    const landscapeMultiplier = landscapeMultipliers[system_landscape] || 1.0;
    const maturityMultiplier = maturityMultipliers[client_maturity] || 1.0;

    let entityMultiplier = 1.0;
    if (legal_entities === 1) entityMultiplier = 1.0;
    else if (legal_entities === 2) entityMultiplier = 1.4;
    else if (legal_entities === 3) entityMultiplier = 1.7;
    else entityMultiplier = 2.0 + (legal_entities - 4) * 0.3;

    return sizeMultiplier * industryMultiplier * landscapeMultiplier * maturityMultiplier * entityMultiplier;
  }, [state.clientProfile]);

  const generateRiskAssessment = useCallback(() => {
    const selectedPackages = getSelectedPackages();
    const risks = {
      overall_risk: 'MEDIUM',
      specific_risks: [],
      fricew_risks: []
    };

    selectedPackages.forEach(pkg => {
      if (pkg.id === 'drc_compliance') {
        risks.specific_risks.push({
          package: pkg.name,
          risk: 'LHDN e-Invoice Integration',
          likelihood: 'MEDIUM',
          impact: 'HIGH',
          mitigation: 'Early prototype, LHDN liaison'
        });
      }
    });

    return risks;
  }, [getSelectedPackages]);

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
    setFloatingCardMinimized,
    calculateTotalEffort,
    getSelectedPackages,
    calculateComplexityMultiplier,
    generateRiskAssessment,
    validatePrerequisites,
    generateBundleAnalysis: () => ({ bundle_opportunities: [], recommendations: [] }),
    generateImplementationPlan: () => [],
    addPackage: () => {},
    deletePackage: () => {},
    addModule: () => {},
    updateModule: () => {},
    deleteModule: () => {},
    duplicatePackage: () => {},
    exportLibrary: () => {},
    importLibrary: () => {},
    logChange: () => {}
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export default AppProvider;
