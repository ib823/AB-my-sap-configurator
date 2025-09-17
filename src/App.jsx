import React, { useState } from 'react';
import EnhancedApp from './components/EnhancedApp';

// Complete SAP Package Library (base packages)
export const COMPLETE_PACKAGE_LIBRARY = [
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
  }
];

// Export for use in EnhancedApp
window.COMPLETE_PACKAGE_LIBRARY = COMPLETE_PACKAGE_LIBRARY;

export default function App() {
  return <EnhancedApp />;
}
