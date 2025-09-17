export const EXTENDED_PACKAGES = [
  // Manufacturing Packages
  {
    id: "discrete_manufacturing",
    name: "Discrete Manufacturing",
    category: "Manufacturing",
    description: "Production planning, shop floor control, and discrete manufacturing processes",
    total_effort_pd: 165.0,
    sgd_price: 115500,
    layer: "core",
    type: "core",
    icon: "🏭",
    malaysia_verified: true,
    critical_path: true,
    modules: [
      { id: "production_orders", name: "Production Orders", description: "Work order management", effort_pd: 45, prerequisites: ["supply_chain_planning"], selected: false },
      { id: "shop_floor", name: "Shop Floor Control", description: "MES integration and tracking", effort_pd: 40, prerequisites: ["production_orders"], selected: false },
      { id: "quality_mgmt", name: "Quality Management", description: "QM processes and inspections", effort_pd: 35, prerequisites: [], selected: false },
      { id: "product_costing", name: "Product Costing", description: "Standard and actual costing", effort_pd: 45, prerequisites: ["financial_master_data"], selected: false }
    ],
    expanded: false,
    selected: false,
    prerequisites: ["supply_chain_planning", "financial_master_data"],
    source: "ABeam"
  },
  {
    id: "process_manufacturing",
    name: "Process Manufacturing",
    category: "Manufacturing",
    description: "Batch processing, recipe management, and process industry requirements",
    total_effort_pd: 185.0,
    sgd_price: 129500,
    layer: "core",
    type: "core",
    icon: "⚗️",
    malaysia_verified: true,
    critical_path: true,
    modules: [
      { id: "recipe_mgmt", name: "Recipe Management", description: "Master recipes and formulas", effort_pd: 50, prerequisites: [], selected: false },
      { id: "batch_mgmt", name: "Batch Management", description: "Batch tracking and genealogy", effort_pd: 45, prerequisites: [], selected: false },
      { id: "process_orders", name: "Process Orders", description: "Process manufacturing orders", effort_pd: 40, prerequisites: ["recipe_mgmt"], selected: false },
      { id: "compliance_tracking", name: "Compliance Tracking", description: "GMP and regulatory compliance", effort_pd: 50, prerequisites: ["batch_mgmt"], selected: false }
    ],
    expanded: false,
    selected: false,
    prerequisites: ["supply_chain_planning"],
    source: "ABeam"
  },
  // CRM Packages
  {
    id: "sales_cloud",
    name: "Sales Cloud",
    category: "CRM",
    description: "Lead management, opportunity tracking, and sales automation",
    total_effort_pd: 120.0,
    sgd_price: 84000,
    layer: "supplementary",
    type: "supplementary",
    icon: "💼",
    malaysia_verified: true,
    critical_path: false,
    modules: [
      { id: "lead_mgmt", name: "Lead Management", description: "Lead capture and qualification", effort_pd: 30, prerequisites: [], selected: false },
      { id: "opportunity_mgmt", name: "Opportunity Management", description: "Pipeline and forecast", effort_pd: 35, prerequisites: ["lead_mgmt"], selected: false },
      { id: "account_mgmt", name: "Account Management", description: "360-degree customer view", effort_pd: 30, prerequisites: [], selected: false },
      { id: "sales_analytics", name: "Sales Analytics", description: "Sales dashboards and KPIs", effort_pd: 25, prerequisites: ["opportunity_mgmt"], selected: false }
    ],
    expanded: false,
    selected: false,
    prerequisites: [],
    source: "ABeam"
  },
  {
    id: "service_cloud",
    name: "Service Cloud",
    category: "CRM",
    description: "Customer service, ticketing, and field service management",
    total_effort_pd: 110.0,
    sgd_price: 77000,
    layer: "supplementary",
    type: "supplementary",
    icon: "🎧",
    malaysia_verified: true,
    critical_path: false,
    modules: [
      { id: "ticketing", name: "Ticketing System", description: "Case management and routing", effort_pd: 35, prerequisites: [], selected: false },
      { id: "knowledge_base", name: "Knowledge Base", description: "Self-service portal", effort_pd: 25, prerequisites: [], selected: false },
      { id: "field_service", name: "Field Service", description: "Technician scheduling", effort_pd: 30, prerequisites: ["ticketing"], selected: false },
      { id: "service_analytics", name: "Service Analytics", description: "SLA and performance metrics", effort_pd: 20, prerequisites: ["ticketing"], selected: false }
    ],
    expanded: false,
    selected: false,
    prerequisites: [],
    source: "ABeam"
  },
  {
    id: "marketing_cloud",
    name: "Marketing Cloud",
    category: "CRM",
    description: "Campaign management, marketing automation, and customer journey",
    total_effort_pd: 95.0,
    sgd_price: 66500,
    layer: "supplementary",
    type: "supplementary",
    icon: "📢",
    malaysia_verified: true,
    critical_path: false,
    modules: [
      { id: "campaign_mgmt", name: "Campaign Management", description: "Multi-channel campaigns", effort_pd: 35, prerequisites: [], selected: false },
      { id: "email_marketing", name: "Email Marketing", description: "Email automation and templates", effort_pd: 20, prerequisites: [], selected: false },
      { id: "customer_journey", name: "Customer Journey", description: "Journey builder and touchpoints", effort_pd: 25, prerequisites: ["campaign_mgmt"], selected: false },
      { id: "marketing_analytics", name: "Marketing Analytics", description: "ROI and attribution", effort_pd: 15, prerequisites: ["campaign_mgmt"], selected: false }
    ],
    expanded: false,
    selected: false,
    prerequisites: ["sales_cloud"],
    source: "ABeam"
  },
  // BTP & Integration
  {
    id: "btp_foundation",
    name: "BTP Foundation",
    category: "Platform",
    description: "SAP Business Technology Platform setup and configuration",
    total_effort_pd: 75.0,
    sgd_price: 52500,
    layer: "integration",
    type: "integration",
    icon: "☁️",
    malaysia_verified: true,
    critical_path: true,
    modules: [
      { id: "btp_setup", name: "BTP Setup", description: "Subaccount and entitlements", effort_pd: 20, prerequisites: [], selected: false },
      { id: "identity_auth", name: "Identity Authentication", description: "IAS and SSO setup", effort_pd: 25, prerequisites: ["btp_setup"], selected: false },
      { id: "connectivity", name: "Cloud Connector", description: "On-premise connectivity", effort_pd: 20, prerequisites: ["btp_setup"], selected: false },
      { id: "monitoring", name: "Monitoring & Alerts", description: "Application monitoring", effort_pd: 10, prerequisites: ["btp_setup"], selected: false }
    ],
    expanded: false,
    selected: false,
    prerequisites: [],
    source: "ABeam"
  },
  {
    id: "integration_suite",
    name: "Integration Suite",
    category: "Platform",
    description: "API management, integration flows, and event mesh",
    total_effort_pd: 145.0,
    sgd_price: 101500,
    layer: "integration",
    type: "integration",
    icon: "🔗",
    malaysia_verified: true,
    critical_path: false,
    modules: [
      { id: "cloud_integration", name: "Cloud Integration", description: "iFlows and mappings", effort_pd: 50, prerequisites: ["btp_foundation"], selected: false },
      { id: "api_mgmt", name: "API Management", description: "API gateway and policies", effort_pd: 40, prerequisites: ["btp_foundation"], selected: false },
      { id: "event_mesh", name: "Event Mesh", description: "Event-driven architecture", effort_pd: 35, prerequisites: ["btp_foundation"], selected: false },
      { id: "open_connectors", name: "Open Connectors", description: "Third-party integrations", effort_pd: 20, prerequisites: ["cloud_integration"], selected: false }
    ],
    expanded: false,
    selected: false,
    prerequisites: ["btp_foundation"],
    source: "ABeam"
  },
  // Asset Management
  {
    id: "enterprise_asset_mgmt",
    name: "Enterprise Asset Management",
    category: "Operations",
    description: "Plant maintenance, asset lifecycle, and predictive maintenance",
    total_effort_pd: 155.0,
    sgd_price: 108500,
    layer: "supplementary",
    type: "supplementary",
    icon: "🔧",
    malaysia_verified: true,
    critical_path: false,
    modules: [
      { id: "equipment_master", name: "Equipment Master", description: "Technical objects and BOM", effort_pd: 40, prerequisites: [], selected: false },
      { id: "preventive_maint", name: "Preventive Maintenance", description: "Maintenance plans and scheduling", effort_pd: 45, prerequisites: ["equipment_master"], selected: false },
      { id: "work_orders", name: "Work Order Management", description: "Maintenance orders and notifications", effort_pd: 35, prerequisites: ["equipment_master"], selected: false },
      { id: "predictive_maint", name: "Predictive Maintenance", description: "IoT and ML-based predictions", effort_pd: 35, prerequisites: ["preventive_maint"], selected: false }
    ],
    expanded: false,
    selected: false,
    prerequisites: ["financial_master_data"],
    source: "ABeam"
  },
  // Extended Finance
  {
    id: "treasury_mgmt",
    name: "Treasury Management",
    category: "Finance Extended",
    description: "Cash management, liquidity planning, and risk management",
    total_effort_pd: 125.0,
    sgd_price: 87500,
    layer: "supplementary",
    type: "supplementary",
    icon: "🏦",
    malaysia_verified: true,
    critical_path: false,
    modules: [
      { id: "cash_mgmt", name: "Cash Management", description: "Cash position and forecasting", effort_pd: 40, prerequisites: ["financial_master_data"], selected: false },
      { id: "liquidity_planning", name: "Liquidity Planning", description: "Liquidity forecasts", effort_pd: 30, prerequisites: ["cash_mgmt"], selected: false },
      { id: "bank_comm", name: "Bank Communication", description: "MT940, BAI2 formats", effort_pd: 35, prerequisites: ["cash_mgmt"], selected: false },
      { id: "risk_mgmt", name: "Risk Management", description: "FX and interest rate hedging", effort_pd: 20, prerequisites: ["cash_mgmt"], selected: false }
    ],
    expanded: false,
    selected: false,
    prerequisites: ["financial_master_data"],
    source: "ABeam"
  },
  {
    id: "consolidation",
    name: "Financial Consolidation",
    category: "Finance Extended",
    description: "Group reporting, consolidation, and intercompany eliminations",
    total_effort_pd: 145.0,
    sgd_price: 101500,
    layer: "supplementary",
    type: "supplementary",
    icon: "📈",
    malaysia_verified: true,
    critical_path: false,
    modules: [
      { id: "group_reporting", name: "Group Reporting", description: "Consolidated financial statements", effort_pd: 50, prerequisites: ["financial_master_data"], selected: false },
      { id: "intercompany", name: "Intercompany Reconciliation", description: "IC matching and eliminations", effort_pd: 45, prerequisites: ["group_reporting"], selected: false },
      { id: "currency_translation", name: "Currency Translation", description: "Multi-currency consolidation", effort_pd: 30, prerequisites: ["group_reporting"], selected: false },
      { id: "management_consolidation", name: "Management Consolidation", description: "Management reporting", effort_pd: 20, prerequisites: ["group_reporting"], selected: false }
    ],
    expanded: false,
    selected: false,
    prerequisites: ["financial_master_data"],
    source: "ABeam"
  }
];
