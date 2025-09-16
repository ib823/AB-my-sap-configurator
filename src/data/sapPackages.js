// Complete SAP Package Library
export const COMPLETE_PACKAGE_LIBRARY = [
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
    id: "plan_to_fulfil",
    name: "Plan to Fulfil",
    category: "SCM Core",
    description: "Production planning and inventory management",
    total_effort_pd: 257.1,
    sgd_price: 180000,
    layer: "core",
    type: "core",
    icon: "🏭",
    malaysia_verified: false,
    critical_path: false,
    prerequisites: [],
    source: "Page 12",
    modules: [
      { id: "material_master", name: "Material Master Data", description: "Product and material setup", effort_pd: 45, prerequisites: [], selected: false },
      { id: "production_planning", name: "Production Planning", description: "MRP and production scheduling", effort_pd: 60, prerequisites: ["material_master"], selected: false },
      { id: "inventory_management", name: "Inventory Management", description: "Stock control and movements", effort_pd: 52, prerequisites: ["material_master"], selected: false },
      { id: "warehouse_management", name: "Warehouse Management", description: "Basic warehouse operations", effort_pd: 50, prerequisites: ["inventory_management"], selected: false },
      { id: "quality_management", name: "Quality Management", description: "Quality inspection and control", effort_pd: 50.1, prerequisites: ["production_planning"], selected: false }
    ],
    expanded: false,
    selected: false
  }
];

export const MALAYSIA_FORMS_LIBRARY = [
  { id: "einvoice_pdf", form_name: "e-Invoice PDF – Invoice (IRBM UID + QR)", category: "Statutory", mandatory: true, effort_pd: 8, description: "LHDN compliant e-invoice with QR code", regulatory_body: "LHDN", sap_module: "SD/FI (AR)", selected: false },
  { id: "credit_note_pdf", form_name: "e-Invoice PDF – Credit Note", category: "Statutory", mandatory: true, effort_pd: 6, description: "Credit note with e-invoice compliance", regulatory_body: "LHDN", sap_module: "SD/FI (AR)", selected: false },
  { id: "debit_note_pdf", form_name: "e-Invoice PDF – Debit Note", category: "Statutory", mandatory: true, effort_pd: 6, description: "Debit note with e-invoice compliance", regulatory_body: "LHDN", sap_module: "SD/FI (AR)", selected: false },
  { id: "purchase_order", form_name: "Purchase Order (PO/LPO)", category: "Procurement", mandatory: true, effort_pd: 4, description: "Standard purchase order format", regulatory_body: "Internal", sap_module: "MM (Procurement)", selected: false },
  { id: "epf_borang_a", form_name: "EPF Borang A", category: "HR", mandatory: true, effort_pd: 5, description: "EPF monthly contribution form", regulatory_body: "KWSP", sap_module: "HCM Payroll", selected: false },
  { id: "socso_form_8a", form_name: "SOCSO Form 8A", category: "HR", mandatory: true, effort_pd: 5, description: "SOCSO monthly contribution", regulatory_body: "PERKESO", sap_module: "HCM Payroll", selected: false },
  { id: "ea_form", form_name: "EA Form", category: "HR", mandatory: true, effort_pd: 6, description: "Employee yearly income statement", regulatory_body: "LHDN", sap_module: "HCM Payroll", selected: false },
  { id: "cp39", form_name: "CP39 - PCB Deduction", category: "HR", mandatory: true, effort_pd: 4, description: "Monthly tax deduction schedule", regulatory_body: "LHDN", sap_module: "HCM Payroll", selected: false }
];

export const PROJECT_SERVICES_LIBRARY = [
  { id: "pm_office", service_name: "Project Management Office", category: "Project Management", effort_pd: 120, description: "Overall project governance and PMO", mandatory: true, selected: false },
  { id: "change_management", service_name: "Change Management", category: "Project Management", effort_pd: 80, description: "Organizational change and adoption", mandatory: true, selected: false },
  { id: "data_migration", service_name: "Data Migration", category: "Cutover & Migration", effort_pd: 150, description: "Master and transaction data migration", mandatory: true, selected: false },
  { id: "end_user_training", service_name: "End User Training", category: "Training", effort_pd: 60, description: "Training for business users", mandatory: true, selected: false },
  { id: "basis_setup", service_name: "Basis & System Setup", category: "Basis & Infrastructure", effort_pd: 80, description: "Technical system setup and configuration", mandatory: true, selected: false },
  { id: "hypercare", service_name: "Hypercare Support", category: "Support", effort_pd: 90, description: "Post go-live intensive support", mandatory: true, selected: false }
];
