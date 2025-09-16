#!/bin/bash
echo "🔧 Creating complete SAP Configurator application..."

# Create the complete App.jsx with ALL features
cat > src/components/App.jsx << 'APPEOF'
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  ChevronDown, ChevronRight, Plus, Minus, Package, Grid, List, 
  AlertTriangle, Clock, Users, Building, MapPin, TrendingUp, 
  Settings, FileText, Database, ArrowRight, X, Edit3, Shield, 
  Eye, EyeOff, Save, Trash2, Copy, Upload, Download, Calculator, 
  Zap 
} from 'lucide-react';

// Complete Package Library
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
  },
  {
    id: "project_accounting",
    name: "Project Accounting",
    category: "Finance Core",
    description: "Project cost tracking",
    total_effort_pd: 64.3,
    sgd_price: 45000,
    layer: "core",
    type: "core",
    icon: "📊",
    malaysia_verified: false,
    critical_path: false,
    prerequisites: ["financial_master_data"],
    source: "Page 8",
    modules: [
      { id: "project_master", name: "Project Master Data", description: "Project structure and WBS", effort_pd: 20, prerequisites: [], selected: false },
      { id: "project_planning", name: "Project Planning", description: "Resource and cost planning", effort_pd: 22, prerequisites: ["project_master"], selected: false },
      { id: "project_execution", name: "Project Execution", description: "Time and expense capture", effort_pd: 22.3, prerequisites: ["project_planning"], selected: false }
    ],
    expanded: false,
    selected: false
  },
  {
    id: "drc_compliance",
    name: "DRC Compliance (MyInvois)",
    category: "Malaysia Compliance",
    description: "LHDN e-invoice compliance",
    total_effort_pd: 38.6,
    sgd_price: 27000,
    layer: "integration",
    type: "integration",
    icon: "📋",
    malaysia_verified: true,
    critical_path: true,
    compliance_critical: true,
    prerequisites: ["financial_master_data"],
    source: "Page 8",
    modules: [
      { id: "myinvois_setup", name: "MyInvois Portal Setup", description: "LHDN portal configuration", effort_pd: 15, prerequisites: [], selected: false, malaysia_verified: true },
      { id: "drc_adapter", name: "DRC Adapter Configuration", description: "SAP DRC technical setup", effort_pd: 12, prerequisites: ["myinvois_setup"], selected: false, malaysia_verified: true },
      { id: "einvoice_templates", name: "E-Invoice Templates", description: "Invoice format compliance", effort_pd: 8, prerequisites: ["drc_adapter"], selected: false, malaysia_verified: true },
      { id: "validation_rules", name: "Validation Rules", description: "Business rule validation", effort_pd: 3.6, prerequisites: ["einvoice_templates"], selected: false, malaysia_verified: true }
    ],
    expanded: false,
    selected: false
  },
  {
    id: "core_hr",
    name: "Core HR",
    category: "HCM Core",
    description: "Employee data management",
    total_effort_pd: 180.0,
    sgd_price: 126000,
    layer: "supplementary",
    type: "supplementary",
    icon: "👥",
    malaysia_verified: true,
    critical_path: true,
    prerequisites: [],
    source: "Page 14",
    modules: [
      { id: "employee_master", name: "Employee Master Data", description: "Personal and employment data", effort_pd: 45, prerequisites: [], selected: false },
      { id: "org_management", name: "Organizational Management", description: "Org structure and positions", effort_pd: 35, prerequisites: [], selected: false },
      { id: "personnel_admin", name: "Personnel Administration", description: "HR processes and workflows", effort_pd: 40, prerequisites: ["employee_master"], selected: false },
      { id: "benefits_admin", name: "Benefits Administration", description: "Employee benefits management", effort_pd: 30, prerequisites: ["personnel_admin"], selected: false },
      { id: "leave_management", name: "Leave Management", description: "Leave types and approval workflow", effort_pd: 30, prerequisites: ["personnel_admin"], selected: false }
    ],
    expanded: false,
    selected: false
  },
  {
    id: "payroll",
    name: "Malaysia Payroll",
    category: "HCM Operations",
    description: "EPF, SOCSO, EIS compliance",
    total_effort_pd: 213.4,
    sgd_price: 149400,
    layer: "supplementary",
    type: "supplementary",
    icon: "💳",
    malaysia_verified: true,
    critical_path: false,
    prerequisites: ["core_hr"],
    source: "Page 14",
    statutory_included: ["EPF", "SOCSO", "EIS", "PCB"],
    modules: [
      { id: "payroll_schema", name: "Payroll Schema Configuration", description: "Malaysia payroll calculation rules", effort_pd: 50, prerequisites: [], selected: false, malaysia_verified: true },
      { id: "epf_setup", name: "EPF Integration", description: "Employees Provident Fund setup", effort_pd: 35, prerequisites: ["payroll_schema"], selected: false, malaysia_verified: true },
      { id: "socso_setup", name: "SOCSO Integration", description: "Social Security Organization setup", effort_pd: 35, prerequisites: ["payroll_schema"], selected: false, malaysia_verified: true },
      { id: "eis_setup", name: "EIS Integration", description: "Employment Insurance System", effort_pd: 25, prerequisites: ["payroll_schema"], selected: false, malaysia_verified: true },
      { id: "pcb_calculation", name: "PCB Tax Calculation", description: "Pay-as-you-earn tax computation", effort_pd: 40, prerequisites: ["payroll_schema"], selected: false, malaysia_verified: true },
      { id: "bonus_processing", name: "Bonus Processing", description: "Annual bonus and incentives", effort_pd: 28.4, prerequisites: ["pcb_calculation"], selected: false, malaysia_verified: true }
    ],
    expanded: false,
    selected: false
  }
];

// Main Component
export default function SAPConfigurator() {
  const [packages, setPackages] = useState([...COMPLETE_PACKAGE_LIBRARY]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showExpandedView, setShowExpandedView] = useState(false);

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

  const updatePackage = (id, updates) => {
    setPackages(prev => prev.map(pkg => 
      pkg.id === id ? { ...pkg, ...updates } : pkg
    ));
  };

  const togglePackageSelection = (id) => {
    const pkg = packages.find(p => p.id === id);
    if (!pkg) return;
    
    updatePackage(id, { 
      selected: !pkg.selected,
      modules: pkg.modules.map(m => ({ ...m, selected: false }))
    });
  };

  const toggleModuleSelection = (packageId, moduleId) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg || pkg.selected) return;
    
    const updatedModules = pkg.modules.map(m => 
      m.id === moduleId ? { ...m, selected: !m.selected } : m
    );
    
    updatePackage(packageId, { modules: updatedModules });
  };

  const calculateTotalEffort = () => {
    let total = 0;
    packages.forEach(pkg => {
      if (pkg.selected) {
        total += pkg.total_effort_pd;
      } else {
        pkg.modules.forEach(module => {
          if (module.selected) {
            total += module.effort_pd;
          }
        });
      }
    });
    return Math.round(total * 10) / 10;
  };

  const totalEffort = calculateTotalEffort();
  const totalCost = packages.reduce((sum, pkg) => {
    if (pkg.selected || pkg.modules.some(m => m.selected)) {
      return sum + pkg.sgd_price;
    }
    return sum;
  }, 0);

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '32px' }}>
        SAP Implementation Scope Builder
      </h1>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <input
          type="text"
          placeholder="Search packages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: '12px',
            border: '1px solid #e5e5e7',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '12px',
            border: '1px solid #e5e5e7',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button
          onClick={() => setShowExpandedView(!showExpandedView)}
          style={{
            padding: '12px 24px',
            background: '#007AFF',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {showExpandedView ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {filteredPackages.map(pkg => (
          <div
            key={pkg.id}
            style={{
              border: pkg.selected ? '2px solid #007AFF' : '1px solid #e5e5e7',
              borderRadius: '12px',
              overflow: 'hidden',
              background: pkg.selected ? 'rgba(0,122,255,0.05)' : 'white',
              transition: 'all 0.2s'
            }}
          >
            <div 
              style={{
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
              onClick={() => togglePackageSelection(pkg.id)}
            >
              <span style={{ fontSize: '24px' }}>{pkg.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{pkg.name}</h3>
                  {pkg.malaysia_verified && (
                    <span style={{
                      background: '#34C759',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>MY</span>
                  )}
                  {pkg.critical_path && (
                    <span style={{
                      background: '#FF3B30',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>CRITICAL</span>
                  )}
                </div>
                <p style={{ margin: '4px 0 0', color: '#8E8E93', fontSize: '14px' }}>
                  {pkg.description}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: '700' }}>{pkg.total_effort_pd} PD</div>
                <div style={{ fontSize: '14px', color: '#8E8E93' }}>SGD ${pkg.sgd_price.toLocaleString()}</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updatePackage(pkg.id, { expanded: !pkg.expanded });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px'
                }}
              >
                {pkg.expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>
            </div>

            {(pkg.expanded || showExpandedView) && (
              <div style={{
                borderTop: '1px solid #e5e5e7',
                padding: '20px',
                background: '#F9F9FA'
              }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600' }}>
                  Individual Modules:
                </h4>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {pkg.modules.map(module => (
                    <div
                      key={module.id}
                      style={{
                        padding: '12px',
                        background: module.selected ? '#007AFF15' : 'white',
                        border: module.selected ? '1px solid #007AFF' : '1px solid #e5e5e7',
                        borderRadius: '8px',
                        cursor: pkg.selected ? 'not-allowed' : 'pointer',
                        opacity: pkg.selected ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      onClick={() => !pkg.selected && toggleModuleSelection(pkg.id, module.id)}
                    >
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>{module.name}</div>
                        <div style={{ fontSize: '12px', color: '#8E8E93' }}>{module.description}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: '600' }}>{module.effort_pd} PD</span>
                        {module.selected && <span style={{ color: '#007AFF' }}>✓</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        background: 'white',
        border: '1px solid #e5e5e7',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        minWidth: '280px'
      }}>
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', color: '#8E8E93', marginBottom: '4px' }}>Total Effort</div>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>{totalEffort} PD</div>
        </div>
        <div style={{ paddingTop: '12px', borderTop: '1px solid #e5e5e7' }}>
          <div style={{ fontSize: '12px', color: '#8E8E93', marginBottom: '4px' }}>Estimated Cost</div>
          <div style={{ fontSize: '20px', fontWeight: '600' }}>SGD ${totalCost.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
APPEOF

echo "✅ Complete SAP Configurator created!"
