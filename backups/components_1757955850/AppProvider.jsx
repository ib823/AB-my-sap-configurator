import React, { createContext, useContext, useState, useCallback } from 'react';

// SAP Package Data
const COMPLETE_PACKAGE_LIBRARY = [
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
        selected: false
      },
      {
        id: "cost_centers",
        name: "Cost Center Management",
        description: "Cost center hierarchy and allocation",
        effort_pd: 38,
        prerequisites: ["gl_setup"],
        selected: false
      },
      {
        id: "profit_centers",
        name: "Profit Center Accounting",
        description: "Profitability analysis setup",
        effort_pd: 32,
        prerequisites: ["gl_setup"],
        selected: false
      }
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
    critical_path: true,
    prerequisites: ["financial_master_data"],
    source: "Page 8",
    modules: [],
    expanded: false,
    selected: false
  }
];

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState({
    packages: COMPLETE_PACKAGE_LIBRARY,
    selectedPackages: [],
    clientProfile: {
      companyName: "ABeam Malaysia",
      industry: "Professional Services",
      companySize: "Enterprise"
    },
    totalEffort: 0
  });

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

  const calculateTotalEffort = useCallback(() => {
    return state.packages.reduce((total, pkg) => {
      if (pkg.selected) return total + pkg.total_effort_pd;
      return total + pkg.modules.filter(m => m.selected).reduce((sum, m) => sum + m.effort_pd, 0);
    }, 0);
  }, [state.packages]);

  const contextValue = {
    state,
    updatePackage,
    updateClientProfile,
    calculateTotalEffort,
    validatePrerequisites: () => ({ valid: true, missing: [] }),
    generateRiskAssessment: () => ({ overall_risk: 'LOW', specific_risks: [] })
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export default AppProvider;
