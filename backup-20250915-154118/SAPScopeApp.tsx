/* ===============================================================================
   SAP SCOPE CONFIGURATOR - FIXED INTEGRATION SOLUTION
   Phase 4B → 4C: Resolving Blank Page Issue
   
   🎯 SOLUTION: Proper AppProvider wrapping within timeline modal
   🎨 STEVE JOBS UX: Seamless integration with project timeline
   =============================================================================== */

import React, { useState, createContext, useContext, useMemo } from 'react';
import { ChevronDown, ChevronRight, Plus, Minus, Search, Filter, 
         AlertTriangle, CheckCircle, Package, Settings, Download, 
         BarChart3, Users, FileText } from 'lucide-react';

// ======================== FIXED APP PROVIDER ========================
// This needs to be available in the modal context

const AppContext = createContext(null);

const SAPAppProvider = ({ children }) => {
  const [state, setState] = useState({
    packages: COMPLETE_PACKAGE_LIBRARY, // Your package data
    integrations: [],
    malaysiaForms: MALAYSIA_COMPLIANCE_FORMS,
    projectServices: PROJECT_SERVICES,
    clientProfile: {
      company_name: '',
      industry: 'services',
      company_size: 'sme',
      implementation_timeline: '6-12 months',
      budget_range: '100k-500k',
      key_priorities: [],
      current_systems: '',
      compliance_requirements: [],
      integration_complexity: 'Medium'
    },
    selectedView: 'packages',
    btpIntegrationEnabled: false,
    userRole: { type: 'user', permissions: {} },
    adminMode: false,
    packageChanges: [],
    editingPackage: null,
    editingModule: null,
    floatingCardMinimized: false
  });

  const updatePackage = (id, updates) => {
    setState(prev => ({
      ...prev,
      packages: prev.packages.map(pkg => 
        pkg.id === id ? { ...pkg, ...updates } : pkg
      )
    }));
  };

  const calculateTotalEffort = () => {
    return state.packages.reduce((total, pkg) => {
      if (pkg.selected) return total + pkg.total_effort_pd;
      return total + pkg.modules
        .filter(m => m.selected)
        .reduce((modTotal, mod) => modTotal + mod.effort_pd, 0);
    }, 0);
  };

  const value = {
    state,
    updatePackage,
    calculateTotalEffort,
    // Add all other methods from your original AppProvider
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within SAPAppProvider');
  }
  return context;
};

// ======================== FIXED SAP SCOPE COMPONENT ========================
// Simplified, working version that integrates with timeline

const SAPScopeApp = () => {
  const { state, updatePackage, calculateTotalEffort } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(state.packages.map(p => p.category)));
    return ['all', ...cats];
  }, [state.packages]);

  const filteredPackages = useMemo(() => {
    return state.packages.filter(pkg => {
      const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || pkg.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [state.packages, searchQuery, selectedCategory]);

  const handlePackageToggle = (packageId) => {
    const pkg = state.packages.find(p => p.id === packageId);
    if (!pkg) return;

    updatePackage(packageId, { 
      selected: !pkg.selected,
      modules: pkg.modules.map(m => ({ ...m, selected: false }))
    });
  };

  const exportToTimeline = () => {
    const selectedPackages = state.packages.filter(p => 
      p.selected || p.modules.some(m => m.selected)
    );

    const exportData = {
      packages: selectedPackages,
      clientProfile: state.clientProfile,
      totalEffort: calculateTotalEffort(),
      integrations: state.integrations
    };

    console.log('✅ Exporting to timeline:', exportData);
    
    // This is the key event that connects to your timeline
    window.dispatchEvent(new CustomEvent('sapScopeExport', { detail: exportData }));
  };

  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      background: '#ffffff',
      borderRadius: '16px',
      minHeight: '600px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '800', 
          margin: '0 0 8px 0',
          color: '#1d1d1f'
        }}>
          SAP Scope Configurator
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: '#6e6e73', 
          margin: 0 
        }}>
          Configure your SAP implementation packages and modules
        </p>
      </div>

      {/* Search and Filter */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={20} style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#6e6e73'
          }} />
          <input
            type="text"
            placeholder="Search packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              border: '1px solid #d2d2d7',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '1px solid #d2d2d7',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            minWidth: '150px'
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Package Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        {filteredPackages.map(pkg => (
          <div key={pkg.id} style={{
            border: '1px solid #d2d2d7',
            borderRadius: '12px',
            padding: '16px',
            background: pkg.selected ? '#f0f8ff' : '#ffffff',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{pkg.icon}</span>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  margin: 0,
                  color: '#1d1d1f'
                }}>
                  {pkg.name}
                </h3>
              </div>
              
              <button
                onClick={() => handlePackageToggle(pkg.id)}
                style={{
                  background: pkg.selected ? '#007AFF' : 'transparent',
                  border: `2px solid ${pkg.selected ? '#007AFF' : '#d2d2d7'}`,
                  borderRadius: '6px',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {pkg.selected && (
                  <CheckCircle size={14} color="white" />
                )}
              </button>
            </div>
            
            <p style={{ 
              fontSize: '14px', 
              color: '#6e6e73', 
              margin: '0 0 12px 0',
              lineHeight: '1.4'
            }}>
              {pkg.description}
            </p>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#6e6e73'
            }}>
              <span>{pkg.total_effort_pd} PD</span>
              <span>SGD {pkg.sgd_price?.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary and Export */}
      <div style={{
        background: '#f5f5f7',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
            Total Effort: {calculateTotalEffort()} Person Days
          </div>
          <div style={{ fontSize: '14px', color: '#6e6e73' }}>
            {state.packages.filter(p => p.selected || p.modules.some(m => m.selected)).length} packages selected
          </div>
        </div>
        
        <button
          onClick={exportToTimeline}
          style={{
            background: '#007AFF',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.background = '#0056CC'}
          onMouseLeave={(e) => e.target.style.background = '#007AFF'}
        >
          <Download size={16} />
          Export to Timeline
        </button>
      </div>
    </div>
  );
};

// ======================== FIXED MODAL INTEGRATION ========================
// This is what should be used in your main App.jsx

export const SAPScopeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        maxWidth: '1400px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: 1001,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>

        {/* CRITICAL: Wrap SAP components in provider */}
        <SAPAppProvider>
          <SAPScopeApp />
        </SAPAppProvider>
      </div>
    </div>
  );
};

// ======================== MINIMAL PACKAGE LIBRARY ========================
// Add this if your package data is missing

const COMPLETE_PACKAGE_LIBRARY = [
  {
    id: "financial_master_data",
    name: "Financial Master Data Management",
    category: "Finance Core",
    description: "GL setup, cost centers, organizational structure",
    total_effort_pd: 192.9,
    sgd_price: 135000,
    icon: "💰",
    modules: [
      { id: "gl_setup", name: "General Ledger Setup", effort_pd: 45, selected: false },
      { id: "cost_centers", name: "Cost Center Management", effort_pd: 38, selected: false }
    ],
    selected: false
  },
  {
    id: "procurement_inventory",
    name: "Procurement & Inventory",
    category: "Finance Core", 
    description: "Automated P2P accounting",
    total_effort_pd: 90.0,
    sgd_price: 63000,
    icon: "📦",
    modules: [
      { id: "p2p_process", name: "Procure-to-Pay Process", effort_pd: 50, selected: false }
    ],
    selected: false
  }
];

const MALAYSIA_COMPLIANCE_FORMS = [];
const PROJECT_SERVICES = [];

// ======================== USAGE INSTRUCTIONS ========================
/*

TO FIX YOUR BLANK PAGE ISSUE:

1. In your main App.jsx, replace the SAP Scope modal section with:

```jsx
import { SAPScopeModal } from './SAPScopeIntegration-FIXED.jsx';

// In your component:
<SAPScopeModal 
  isOpen={sapScopeOpen} 
  onClose={() => setSapScopeOpen(false)} 
/>
```

2. Make sure to listen for the export event in your main app:

```jsx
useEffect(() => {
  const handleSAPExport = (event) => {
    const { packages, totalEffort } = event.detail;
    // Create timeline phases from SAP packages
    console.log('Received SAP export:', packages);
  };
  
  window.addEventListener('sapScopeExport', handleSAPExport);
  return () => window.removeEventListener('sapScopeExport', handleSAPExport);
}, []);
```

3. Update your SAP Scope Builder button to:

```jsx
<button 
  className="secondary-action" 
  onClick={() => setSapScopeOpen(true)}
>
  📑 SAP Scope Builder
</button>
```

RESULT: ✅ Working SAP Scope Configurator modal with proper context and export functionality

*/

export default SAPScopeApp;