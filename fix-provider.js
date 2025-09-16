const fs = require('fs');

const cleanedContent = `
import React, { useState, useContext, createContext, useCallback, useEffect } from 'react';

// Data structures (no TypeScript)
const DEFAULT_USER_ROLE = {
  type: 'user',
  permissions: {
    view_packages: false,
    edit_packages: false,
    create_packages: false,
    delete_packages: false,
    export_library: false
  }
};

const SUPER_USER_ROLE = {
  type: 'super_user',
  permissions: {
    view_packages: true,
    edit_packages: true,
    create_packages: true,
    delete_packages: true,
    export_library: true
  }
};

// Your complete package library data
const COMPLETE_PACKAGE_LIBRARY = [
  // Include all your package data here
];

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState({
    packages: [...COMPLETE_PACKAGE_LIBRARY],
    integrations: [],
    malaysiaForms: [],
    projectServices: [],
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

  // All your methods here (without TypeScript annotations)
  const updatePackage = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      packages: prev.packages.map(pkg => 
        pkg.id === id ? { ...pkg, ...updates } : pkg
      )
    }));
  }, []);

  // Include all other methods...

  const value = {
    state,
    updatePackage,
    // ... all other methods
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export default AppProvider;
`;

fs.writeFileSync('src/components/AppProvider.jsx', cleanedContent);
console.log('✅ AppProvider cleaned');
