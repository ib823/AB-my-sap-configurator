import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Filter, Package, ChevronDown, ChevronRight, Calculator, Download, Settings, TrendingUp, Shield, CheckCircle, AlertCircle, Plus, Minus, X, Save, Eye, EyeOff, Edit3, Copy, Upload, Trash2, Grid, List, Users, Building, MapPin, FileText, Database, BarChart3, Zap, Clock, DollarSign } from 'lucide-react';

// ======================== COMPLETE SAP PACKAGE LIBRARY ========================
const COMPLETE_PACKAGE_LIBRARY = [
  // Finance Core Packages
  {
    id: "financial_master_data",
    name: "Financial Master Data Management",
    category: "Finance Core",
    description: "Comprehensive GL setup, cost centers, profit centers, and organizational structure configuration",
    total_effort_pd: 192.9,
    sgd_price: 135000,
    layer: "core",
    type: "core",
    icon: "💰",
    malaysia_verified: true,
    critical_path: true,
    modules: [
      { id: "gl_setup", name: "General Ledger Setup", description: "Chart of accounts, GL master data", effort_pd: 45, prerequisites: [], selected: false },
      { id: "cost_centers", name: "Cost Center Management", description: "Cost center hierarchy and planning", effort_pd: 38, prerequisites: [], selected: false },
      { id: "profit_centers", name: "Profit Center Accounting", description: "Profit center master data and reporting", effort_pd: 35, prerequisites: ["gl_setup"], selected: false },
      { id: "org_structure", name: "Organizational Structure", description: "Company codes, plants, purchasing orgs", effort_pd: 42, prerequisites: [], selected: false },
      { id: "document_types", name: "Document Types & Number Ranges", description: "Configure all document types", effort_pd: 32.9, prerequisites: ["gl_setup"], selected: false }
    ],
    expanded: false,
    selected: false,
    prerequisites: [],
    source: "ABeam"
  },
  {
    id: "procurement_inventory",
    name: "Procurement & Inventory",
    category: "Finance Core",
    description: "End-to-end procure-to-pay process with automated accounting integration",
    total_effort_pd: 90.0,
    sgd_price: 63000,
    layer: "core",
    type: "core",
    icon: "📦",
    malaysia_verified: true,
    critical_path: true,
    modules: [
      { id: "p2p_process", name: "Procure-to-Pay Process", description: "Complete P2P cycle configuration", effort_pd: 50, prerequisites: ["financial_master_data"], selected: false },
      { id: "vendor_master", name: "Vendor Master Management", description: "Vendor creation and maintenance", effort_pd: 25, prerequisites: [], selected: false },
      { id: "inventory_mgmt", name: "Inventory Management", description: "Stock management and valuation", effort_pd: 15, prerequisites: [], selected: false }
    ],
    expanded: false,
    selected: false,
    prerequisites: ["financial_master_data"],
    source: "ABeam"
  },
  {
    id: "project_accounting",
    name: "Project Accounting",
    category: "Finance Core",
    description: "Project systems for tracking project costs and revenues",
    total_effort_pd: 64.3,
    sgd_price: 45000,
    layer: "core",
    type: "core",
    icon: "📊",
    malaysia_verified: true,
    critical_path: false,
    modules: [
      { id: "project_structure", name: "Project Structure", description: "WBS and project hierarchy", effort_pd: 30, prerequisites: ["financial_master_data"], selected: false },
      { id: "project_planning", name: "Project Planning", description: "Cost and revenue planning", effort_pd: 20, prerequisites: ["project_structure"], selected: false },
      { id: "project_execution", name: "Project Execution", description: "Actual postings and settlements", effort_pd: 14.3, prerequisites: ["project_planning"], selected: false }
    ],
    expanded: false,
    selected: false,
    prerequisites: ["financial_master_data"],
    source: "ABeam"
  },
  // HCM Core Packages
  {
    id: "core_hr",
    name: "Core HR",
    category: "HCM Core",
    description: "Personnel administration, organizational management, and time management",
    total_effort_pd: 180.0,
    sgd_price: 126000,
    layer: "core",
    type: "core",
    icon: "👥",
    malaysia_verified: true,
    critical_path: true,
    modules: [
      { id: "personnel_admin", name: "Personnel Administration", description: "Employee master data management", effort_pd: 60, prerequisites: [], selected: false },
      { id: "org_mgmt", name: "Organizational Management", description: "Org structure and positions", effort_pd: 45, prerequisites: [], selected: false },
      { id: "time_mgmt", name: "Time Management", description: "Attendance and leave management", effort_pd: 40, prerequisites: ["personnel_admin"], selected: false },
      { id: "employee_self_service", name: "Employee Self Service", description: "ESS portal configuration", effort_pd: 35, prerequisites: ["personnel_admin"], selected: false }
    ],
    expanded: false,
    selected: false,
    prerequisites: ["financial_master_data"],
    source: "ABeam"
  },
  {
    id: "malaysia_payroll",
    name: "Malaysia Payroll",
    category: "HCM Localization",
    description: "Complete Malaysia payroll with EPF, SOCSO, EIS, PCB, and compliance",
    total_effort_pd: 188.4,
    sgd_price: 132000,
    layer: "supplementary",
    type: "supplementary",
    icon: "🇲🇾",
    malaysia_verified: true,
    critical_path: true,
    compliance_critical: true,
    statutory_included: ["EPF", "SOCSO", "EIS", "PCB", "HRDF", "Zakat"],
    bank_formats_included: 12,
    modules: [
      { id: "payroll_setup", name: "Payroll Configuration", description: "Wage types and payroll schema", effort_pd: 55, prerequisites: ["core_hr"], selected: false },
      { id: "statutory_deductions", name: "Statutory Deductions", description: "EPF, SOCSO, EIS, PCB setup", effort_pd: 48, prerequisites: ["payroll_setup"], selected: false },
      { id: "bank_integration", name: "Bank Integration", description: "Malaysia bank formats", effort_pd: 35.4, prerequisites: ["payroll_setup"], selected: false },
      { id: "year_end_processing", name: "Year-End Processing", description: "EA Form, Borang E, CP8D", effort_pd: 30, prerequisites: ["statutory_deductions"], selected: false },
      { id: "compliance_reporting", name: "Compliance Reporting", description: "All statutory reports", effort_pd: 20, prerequisites: ["statutory_deductions"], selected: false }
    ],
    expanded: false,
    selected: false,
    prerequisites: ["core_hr"],
    source: "ABeam Malaysia"
  },
  // Supply Chain Packages
  {
    id: "supply_chain_planning",
    name: "Supply Chain Planning",
    category: "Supply Chain",
    description: "Demand planning, supply planning, and MRP configuration",
    total_effort_pd: 145.0,
    sgd_price: 101500,
    layer: "core",
    type: "core",
    icon: "📈",
    malaysia_verified: true,
    critical_path: true,
    modules: [
      { id: "demand_planning", name: "Demand Planning", description: "Forecast and demand management", effort_pd: 45, prerequisites: [], selected: false },
      { id: "supply_planning", name: "Supply Planning", description: "MRP and supply optimization", effort_pd: 50, prerequisites: ["demand_planning"], selected: false },
      { id: "production_planning", name: "Production Planning", description: "Production orders and scheduling", effort_pd: 35, prerequisites: ["supply_planning"], selected: false },
      { id: "inventory_optimization", name: "Inventory Optimization", description: "Safety stock and reorder points", effort_pd: 15, prerequisites: ["supply_planning"], selected: false }
    ],
    expanded: false,
    selected: false,
    prerequisites: ["financial_master_data", "procurement_inventory"],
    source: "ABeam"
  },
  {
    id: "warehouse_management",
    name: "Warehouse Management",
    category: "Supply Chain",
    description: "Advanced warehouse management with RF integration",
    total_effort_pd: 120.0,
    sgd_price: 84000,
    layer: "supplementary",
    type: "supplementary",
    icon: "🏭",
    malaysia_verified: true,
    critical_path: false,
    modules: [
      { id: "warehouse_structure", name: "Warehouse Structure", description: "Storage locations and bins", effort_pd: 35, prerequisites: [], selected: false },
      { id: "inbound_outbound", name: "Inbound/Outbound Process", description: "Goods receipt and issue", effort_pd: 40, prerequisites: ["warehouse_structure"], selected: false },
      { id: "rf_integration", name: "RF Integration", description: "Barcode and RFID setup", effort_pd: 30, prerequisites: ["warehouse_structure"], selected: false },
      { id: "cycle_counting", name: "Cycle Counting", description: "Physical inventory processes", effort_pd: 15, prerequisites: ["warehouse_structure"], selected: false }
    ],
    expanded: false,
    selected: false,
    prerequisites: ["procurement_inventory"],
    source: "ABeam"
  },
  // Malaysia Compliance
  {
    id: "malaysia_gst_sst",
    name: "Malaysia GST/SST Compliance",
    category: "Compliance",
    description: "Complete SST implementation with returns and compliance",
    total_effort_pd: 85.0,
    sgd_price: 59500,
    layer: "supplementary",
    type: "supplementary",
    icon: "📋",
    malaysia_verified: true,
    critical_path: true,
    compliance_critical: true,
    modules: [
      { id: "sst_config", name: "SST Configuration", description: "Tax codes and determination", effort_pd: 30, prerequisites: ["financial_master_data"], selected: false },
      { id: "sst_reporting", name: "SST-02 Returns", description: "Monthly SST returns", effort_pd: 25, prerequisites: ["sst_config"], selected: false },
      { id: "exemption_mgmt", name: "Exemption Management", description: "Exemption certificates", effort_pd: 15, prerequisites: ["sst_config"], selected: false },
      { id: "audit_trail", name: "Audit Trail", description: "Complete tax audit trail", effort_pd: 15, prerequisites: ["sst_config"], selected: false }
    ],
    expanded: false,
    selected: false,
    prerequisites: ["financial_master_data"],
    source: "ABeam Malaysia"
  },
  {
    id: "malaysia_myinvois",
    name: "MyInvois/DRC Integration",
    category: "Compliance",
    description: "E-Invoice integration with LHDN MyInvois system",
    total_effort_pd: 95.0,
    sgd_price: 66500,
    layer: "integration",
    type: "integration",
    icon: "📧",
    malaysia_verified: true,
    critical_path: true,
    compliance_critical: true,
    modules: [
      { id: "myinvois_setup", name: "MyInvois Setup", description: "API and authentication setup", effort_pd: 35, prerequisites: ["financial_master_data"], selected: false },
      { id: "invoice_generation", name: "E-Invoice Generation", description: "XML format and validation", effort_pd: 30, prerequisites: ["myinvois_setup"], selected: false },
      { id: "drc_integration", name: "DRC Integration", description: "Digital receipt compliance", effort_pd: 20, prerequisites: ["myinvois_setup"], selected: false },
      { id: "error_handling", name: "Error Handling", description: "Rejection and resubmission", effort_pd: 10, prerequisites: ["invoice_generation"], selected: false }
    ],
    expanded: false,
    selected: false,
    prerequisites: ["financial_master_data", "malaysia_gst_sst"],
    source: "ABeam Malaysia"
  },
  // Analytics
  {
    id: "financial_analytics",
    name: "Financial Analytics",
    category: "Analytics",
    description: "Real-time financial dashboards and reporting",
    total_effort_pd: 75.0,
    sgd_price: 52500,
    layer: "analytics",
    type: "analytics",
    icon: "📊",
    malaysia_verified: true,
    critical_path: false,
    modules: [
      { id: "financial_dashboards", name: "Financial Dashboards", description: "P&L, Balance Sheet, Cash Flow", effort_pd: 35, prerequisites: ["financial_master_data"], selected: false },
      { id: "cost_analytics", name: "Cost Analytics", description: "Cost center and profitability", effort_pd: 25, prerequisites: ["financial_master_data"], selected: false },
      { id: "predictive_analytics", name: "Predictive Analytics", description: "Forecasting and trends", effort_pd: 15, prerequisites: ["financial_dashboards"], selected: false }
    ],
    expanded: false,
    selected: false,
    prerequisites: ["financial_master_data"],
    source: "ABeam"
  },
  {
    id: "hr_analytics",
    name: "HR Analytics",
    category: "Analytics",
    description: "Workforce analytics and talent insights",
    total_effort_pd: 65.0,
    sgd_price: 45500,
    layer: "analytics",
    type: "analytics",
    icon: "📈",
    malaysia_verified: true,
    critical_path: false,
    modules: [
      { id: "workforce_analytics", name: "Workforce Analytics", description: "Headcount and demographics", effort_pd: 25, prerequisites: ["core_hr"], selected: false },
      { id: "talent_analytics", name: "Talent Analytics", description: "Performance and retention", effort_pd: 25, prerequisites: ["core_hr"], selected: false },
      { id: "payroll_analytics", name: "Payroll Analytics", description: "Compensation analysis", effort_pd: 15, prerequisites: ["malaysia_payroll"], selected: false }
    ],
    expanded: false,
    selected: false,
    prerequisites: ["core_hr"],
    source: "ABeam"
  }
];

// ======================== MAIN COMPONENT ========================
export default function App() {
  const [packages, setPackages] = useState(COMPLETE_PACKAGE_LIBRARY);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [adminMode, setAdminMode] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [clientProfile, setClientProfile] = useState({
    company_name: '',
    industry: 'services',
    company_size: 'sme',
    system_landscape: 'greenfield',
    client_maturity: 'sap_experienced',
    legal_entities: 1
  });

  // Keyboard shortcut for admin mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setAdminMode(!adminMode);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [adminMode]);

  // Categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(packages.map(p => p.category)));
    return ['all', ...cats];
  }, [packages]);

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || pkg.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [packages, searchQuery, selectedCategory]);

  // Calculate totals
  const totals = useMemo(() => {
    let effort = 0;
    let cost = 0;
    let moduleCount = 0;
    let packageCount = 0;

    packages.forEach(pkg => {
      if (pkg.selected) {
        effort += pkg.total_effort_pd;
        cost += pkg.sgd_price;
        packageCount++;
        moduleCount += pkg.modules.length;
      } else {
        const selectedModules = pkg.modules.filter(m => m.selected);
        selectedModules.forEach(m => {
          effort += m.effort_pd;
          moduleCount++;
        });
        cost += (selectedModules.length / pkg.modules.length) * pkg.sgd_price;
      }
    });

    return { effort, cost, moduleCount, packageCount };
  }, [packages]);

  // Package selection handler
  const togglePackage = (packageId) => {
    setPackages(prev => prev.map(pkg => {
      if (pkg.id === packageId) {
        const newSelected = !pkg.selected;
        return {
          ...pkg,
          selected: newSelected,
          modules: pkg.modules.map(m => ({ ...m, selected: false }))
        };
      }
      return pkg;
    }));
  };

  // Module selection handler
  const toggleModule = (packageId, moduleId) => {
    setPackages(prev => prev.map(pkg => {
      if (pkg.id === packageId && !pkg.selected) {
        return {
          ...pkg,
          modules: pkg.modules.map(m => 
            m.id === moduleId ? { ...m, selected: !m.selected } : m
          )
        };
      }
      return pkg;
    }));
  };

  // Toggle package expansion
  const toggleExpanded = (packageId) => {
    setPackages(prev => prev.map(pkg => 
      pkg.id === packageId ? { ...pkg, expanded: !pkg.expanded } : pkg
    ));
  };

  // Export to Excel functionality
  const exportToExcel = () => {
    const selectedPackages = packages.filter(pkg => 
      pkg.selected || pkg.modules.some(m => m.selected)
    );
    
    const exportData = {
      timestamp: new Date().toISOString(),
      clientProfile,
      packages: selectedPackages,
      totals,
      configuration: {
        adminMode,
        version: '2.0',
        source: 'ABeam SAP Configurator'
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAP_Configuration_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    setShowExportDialog(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#1a202c' }}>
              SAP Implementation Configurator
            </h1>
            <p style={{ margin: '8px 0 0', color: '#718096', fontSize: '14px' }}>
              ABeam Consulting - Malaysia Edition {adminMode && <span style={{color: '#e53e3e'}}>(ADMIN MODE)</span>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowExportDialog(true)}
              style={{
                padding: '10px 20px',
                background: '#48bb78',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600'
              }}
            >
              <Download size={18} />
              Export Configuration
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                background: '#ed8936',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600'
              }}
            >
              <Settings size={18} />
              Reset
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: '#a0aec0' }} />
            <input
              type="text"
              placeholder="Search packages or modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                border: '1px solid #e2e8f0',
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
              padding: '12px 20px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '200px'
            }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Statistics Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <div style={{
            padding: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={24} />
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{totals.packageCount}</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Packages Selected</div>
              </div>
            </div>
          </div>
          <div style={{
            padding: '15px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Grid size={24} />
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{totals.moduleCount}</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Modules Selected</div>
              </div>
            </div>
          </div>
          <div style={{
            padding: '15px',
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={24} />
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{totals.effort.toFixed(1)}</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Person Days</div>
              </div>
            </div>
          </div>
          <div style={{
            padding: '15px',
            background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <DollarSign size={24} />
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>
                  ${(totals.cost / 1000).toFixed(0)}K
                </div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>SGD Estimate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Package Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '20px'
      }}>
        {filteredPackages.map(pkg => (
          <div
            key={pkg.id}
            style={{
              background: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: pkg.selected ? '0 20px 40px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.08)',
              transform: pkg.selected ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.3s ease',
              border: pkg.selected ? '2px solid #667eea' : '2px solid transparent'
            }}
          >
            {/* Package Header */}
            <div
              style={{
                padding: '20px',
                background: pkg.selected 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
                color: pkg.selected ? 'white' : '#2d3748',
                cursor: 'pointer',
                userSelect: 'none'
              }}
              onClick={() => togglePackage(pkg.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{pkg.icon}</span>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{pkg.name}</h3>
                  </div>
                  <p style={{ 
                    margin: '0 0 10px', 
                    fontSize: '13px', 
                    opacity: pkg.selected ? 0.95 : 0.7 
                  }}>
                    {pkg.description}
                  </p>
                  <div style={{ display: 'flex', gap: '15px', fontSize: '13px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      background: pkg.selected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)',
                      borderRadius: '4px',
                      fontWeight: '500'
                    }}>
                      {pkg.total_effort_pd} PD
                    </span>
                    <span style={{ 
                      padding: '4px 8px', 
                      background: pkg.selected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)',
                      borderRadius: '4px',
                      fontWeight: '500'
                    }}>
                      SGD ${(pkg.sgd_price / 1000).toFixed(0)}K
                    </span>
                    <span style={{ 
                      padding: '4px 8px', 
                      background: pkg.selected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)',
                      borderRadius: '4px',
                      fontWeight: '500'
                    }}>
                      {pkg.category}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {pkg.malaysia_verified && (
                    <Shield size={20} style={{ color: pkg.selected ? '#48bb78' : '#48bb78' }} />
                  )}
                  {pkg.critical_path && (
                    <AlertCircle size={20} style={{ color: pkg.selected ? '#f6e05e' : '#ed8936' }} />
                  )}
                  {pkg.selected && <CheckCircle size={24} />}
                </div>
              </div>
            </div>

            {/* Modules Section */}
            <div style={{ padding: '0 20px 20px' }}>
              <button
                onClick={() => toggleExpanded(pkg.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '10px 0',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#4a5568',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {pkg.expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                Modules ({pkg.modules.length})
              </button>
              
              {pkg.expanded && (
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {pkg.modules.map(module => (
                    <div
                      key={module.id}
                      style={{
                        padding: '12px',
                        background: module.selected ? '#edf2f7' : '#f7fafc',
                        borderRadius: '8px',
                        border: module.selected ? '1px solid #cbd5e0' : '1px solid #e2e8f0',
                        cursor: pkg.selected ? 'not-allowed' : 'pointer',
                        opacity: pkg.selected ? 0.6 : 1,
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => !pkg.selected && toggleModule(pkg.id, module.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748', marginBottom: '4px' }}>
                            {module.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#718096' }}>
                            {module.description}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ 
                            fontSize: '13px', 
                            fontWeight: '500', 
                            color: '#4a5568',
                            padding: '2px 6px',
                            background: '#edf2f7',
                            borderRadius: '4px'
                          }}>
                            {module.effort_pd} PD
                          </span>
                          {module.selected && <CheckCircle size={18} style={{ color: '#48bb78' }} />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Export Dialog */}
      {showExportDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '500px',
            maxWidth: '90%'
          }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '24px', fontWeight: '600' }}>Export Configuration</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Company Name
              </label>
              <input
                type="text"
                value={clientProfile.company_name}
                onChange={(e) => setClientProfile({ ...clientProfile, company_name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder="Enter company name..."
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Industry
              </label>
              <select
                value={clientProfile.industry}
                onChange={(e) => setClientProfile({ ...clientProfile, industry: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="services">Services</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="financial_services">Financial Services</option>
                <option value="government">Government</option>
                <option value="retail">Retail</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowExportDialog(false)}
                style={{
                  padding: '10px 20px',
                  background: '#e2e8f0',
                  color: '#2d3748',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={exportToExcel}
                style={{
                  padding: '10px 20px',
                  background: '#48bb78',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Download size={18} />
                Export JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
