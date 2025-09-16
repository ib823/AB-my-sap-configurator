import React, { useState, useMemo, createContext, useContext, useCallback } from 'react';
import { Search, Package, DollarSign, Clock, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';

// Package Library Data
const PACKAGE_LIBRARY = [
  {
    id: "financial_master",
    name: "Financial Master Data",
    category: "Finance Core",
    description: "GL setup, cost centers, organizational structure",
    total_effort_pd: 192.9,
    sgd_price: 135000,
    icon: "💰",
    selected: false,
    expanded: false,
    modules: [
      { id: "gl_setup", name: "General Ledger Setup", description: "Chart of accounts", effort_pd: 45, selected: false },
      { id: "cost_centers", name: "Cost Center Management", description: "Cost center hierarchy", effort_pd: 38, selected: false },
      { id: "profit_centers", name: "Profit Center Accounting", description: "Profitability analysis", effort_pd: 32, selected: false },
      { id: "company_code", name: "Company Code Config", description: "Legal entity setup", effort_pd: 28, selected: false },
      { id: "currency_config", name: "Currency Configuration", description: "Multi-currency setup", effort_pd: 25, selected: false },
      { id: "tax_setup", name: "Tax Configuration", description: "SST, GST, withholding tax", effort_pd: 24.9, selected: false }
    ]
  },
  {
    id: "procurement",
    name: "Procurement & Inventory",
    category: "Finance Core",
    description: "Automated P2P accounting",
    total_effort_pd: 90.0,
    sgd_price: 63000,
    icon: "📦",
    selected: false,
    expanded: false,
    modules: [
      { id: "vendor_master", name: "Vendor Master Data", description: "Supplier management", effort_pd: 20, selected: false },
      { id: "purchase_req", name: "Purchase Requisition", description: "PR workflow", effort_pd: 18, selected: false },
      { id: "purchase_order", name: "Purchase Order", description: "PO management", effort_pd: 22, selected: false },
      { id: "goods_receipt", name: "Goods Receipt", description: "Material receipt", effort_pd: 15, selected: false },
      { id: "invoice_verify", name: "Invoice Verification", description: "3-way matching", effort_pd: 15, selected: false }
    ]
  },
  {
    id: "core_hr",
    name: "Core HR",
    category: "HCM Core",
    description: "Employee data management",
    total_effort_pd: 180,
    sgd_price: 126000,
    icon: "👥",
    selected: false,
    expanded: false,
    modules: [
      { id: "org_mgmt", name: "Organizational Management", description: "Org structure", effort_pd: 40, selected: false },
      { id: "personnel_admin", name: "Personnel Administration", description: "Employee records", effort_pd: 35, selected: false },
      { id: "time_mgmt", name: "Time Management", description: "Attendance, leave", effort_pd: 45, selected: false },
      { id: "benefits", name: "Benefits Administration", description: "Insurance, retirement", effort_pd: 30, selected: false },
      { id: "ess", name: "Employee Self-Service", description: "Employee portal", effort_pd: 30, selected: false }
    ]
  }
];

const AppContext = createContext(null);

function AppProvider({ children }) {
  const [packages, setPackages] = useState([...PACKAGE_LIBRARY]);
  
  const updatePackage = useCallback((id, updates) => {
    setPackages(prev => prev.map(pkg => pkg.id === id ? { ...pkg, ...updates } : pkg));
  }, []);
  
  return (
    <AppContext.Provider value={{ packages, updatePackage }}>
      {children}
    </AppContext.Provider>
  );
}

function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

function SAPConfigurator() {
  const { packages, updatePackage } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(packages.map(p => p.category)));
    return ['all', ...cats];
  }, [packages]);

  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || pkg.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [packages, searchQuery, selectedCategory]);

  const totalEffort = useMemo(() => {
    return packages.reduce((total, pkg) => {
      if (pkg.selected) return total + pkg.total_effort_pd;
      const moduleEffort = pkg.modules.filter(m => m.selected).reduce((sum, m) => sum + m.effort_pd, 0);
      return total + moduleEffort;
    }, 0);
  }, [packages]);

  const totalCost = useMemo(() => {
    return packages.reduce((total, pkg) => {
      if (pkg.selected) return total + (pkg.sgd_price || 0);
      const moduleCount = pkg.modules.filter(m => m.selected).length;
      const moduleRatio = pkg.modules.length > 0 ? moduleCount / pkg.modules.length : 0;
      return total + (pkg.sgd_price || 0) * moduleRatio;
    }, 0);
  }, [packages]);

  const togglePackage = (id) => {
    const pkg = packages.find(p => p.id === id);
    updatePackage(id, { 
      selected: !pkg.selected,
      modules: pkg.modules.map(m => ({ ...m, selected: false }))
    });
  };

  const toggleModule = (pkgId, modId) => {
    const pkg = packages.find(p => p.id === pkgId);
    if (pkg.selected) return;
    updatePackage(pkgId, {
      modules: pkg.modules.map(m => m.id === modId ? { ...m, selected: !m.selected } : m)
    });
  };

  const styles = {
    container: { padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
    header: { marginBottom: '32px' },
    title: { fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' },
    subtitle: { color: '#666', fontSize: '14px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' },
    statCard: { background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    statLabel: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '12px', color: '#666' },
    statValue: { fontSize: '24px', fontWeight: 'bold' },
    controls: { display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' },
    searchBox: { flex: '1 1 300px', position: 'relative' },
    searchInput: { width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
    select: { padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', background: 'white' },
    packageCard: { background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '12px', overflow: 'hidden' },
    packageHeader: { padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' },
    checkbox: { width: '24px', height: '24px', borderRadius: '6px', border: '2px solid #ddd', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    checkboxSelected: { background: '#007AFF', border: 'none' },
    moduleSection: { borderTop: '1px solid #eee', padding: '12px 16px', background: '#fafafa' },
    module: { display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: 'white', borderRadius: '8px', marginBottom: '8px', border: '1px solid #eee' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>SAP Package Configurator</h1>
        <p style={styles.subtitle}>Select packages and modules to build your SAP implementation scope</p>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>
            <Package size={16} />
            <span>Selected Packages</span>
          </div>
          <div style={styles.statValue}>
            {packages.filter(p => p.selected).length}
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>
            <Clock size={16} />
            <span>Total Effort</span>
          </div>
          <div style={styles.statValue}>
            {totalEffort.toFixed(1)} PD
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>
            <DollarSign size={16} />
            <span>Estimated Cost</span>
          </div>
          <div style={styles.statValue}>
            SGD {totalCost.toLocaleString()}
          </div>
        </div>
      </div>

      <div style={styles.controls}>
        <div style={styles.searchBox}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} size={18} />
          <input
            type="text"
            placeholder="Search packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={styles.select}>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
          ))}
        </select>
      </div>

      {filteredPackages.map(pkg => (
        <div key={pkg.id} style={{ ...styles.packageCard, border: pkg.selected ? '2px solid #007AFF' : '2px solid transparent' }}>
          <div style={{ ...styles.packageHeader, background: pkg.selected ? 'linear-gradient(135deg, #007AFF10, #007AFF05)' : 'transparent' }}
               onClick={() => updatePackage(pkg.id, { expanded: !pkg.expanded })}>
            <button
              onClick={(e) => { e.stopPropagation(); togglePackage(pkg.id); }}
              style={{ ...styles.checkbox, ...(pkg.selected ? styles.checkboxSelected : {}) }}
            >
              {pkg.selected && <CheckCircle size={16} color="white" />}
            </button>
            <div style={{ fontSize: '20px' }}>{pkg.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{pkg.name}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>{pkg.description}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{pkg.total_effort_pd} PD</div>
              <div style={{ fontSize: '13px', color: '#666' }}>SGD {(pkg.sgd_price || 0).toLocaleString()}</div>
            </div>
            {pkg.expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>

          {pkg.expanded && pkg.modules && (
            <div style={styles.moduleSection}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#666' }}>MODULES</div>
              {pkg.modules.map(module => (
                <div key={module.id} style={{ ...styles.module, background: module.selected ? '#007AFF10' : 'white', border: module.selected ? '1px solid #007AFF' : '1px solid #eee' }}>
                  <button
                    onClick={() => toggleModule(pkg.id, module.id)}
                    disabled={pkg.selected}
                    style={{ ...styles.checkbox, width: '20px', height: '20px', opacity: pkg.selected ? 0.5 : 1, cursor: pkg.selected ? 'not-allowed' : 'pointer', ...(module.selected && !pkg.selected ? styles.checkboxSelected : {}) }}
                  >
                    {module.selected && !pkg.selected && <CheckCircle size={14} color="white" />}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{module.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{module.description}</div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#666' }}>{module.effort_pd} PD</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
        <SAPConfigurator />
      </div>
    </AppProvider>
  );
}
