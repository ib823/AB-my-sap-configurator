export const MALAYSIA_FORMS_LIBRARY = [
  // Statutory Forms
  {
    id: "epf_form_a",
    form_name: "Borang A - EPF Registration",
    category: "Statutory",
    mandatory: true,
    effort_pd: 2,
    description: "Employer EPF registration form",
    regulatory_body: "KWSP",
    selected: false,
    sap_module: "malaysia_payroll"
  },
  {
    id: "epf_borang_8a",
    form_name: "Borang 8A - EPF Contribution",
    category: "Statutory",
    mandatory: true,
    effort_pd: 3,
    description: "Monthly EPF contribution submission",
    regulatory_body: "KWSP",
    selected: false,
    sap_module: "malaysia_payroll"
  },
  {
    id: "socso_form_8a",
    form_name: "Form 8A - SOCSO Contribution",
    category: "Statutory",
    mandatory: true,
    effort_pd: 3,
    description: "Monthly SOCSO contribution form",
    regulatory_body: "PERKESO",
    selected: false,
    sap_module: "malaysia_payroll"
  },
  {
    id: "eis_contribution",
    form_name: "EIS Contribution Form",
    category: "Statutory",
    mandatory: true,
    effort_pd: 2,
    description: "Employment Insurance System contribution",
    regulatory_body: "PERKESO",
    selected: false,
    sap_module: "malaysia_payroll"
  },
  {
    id: "pcb_cp39",
    form_name: "CP39 - PCB Submission",
    category: "Statutory",
    mandatory: true,
    effort_pd: 4,
    description: "Monthly tax deduction submission",
    regulatory_body: "LHDN",
    selected: false,
    sap_module: "malaysia_payroll"
  },
  {
    id: "ea_form",
    form_name: "EA Form",
    category: "Statutory",
    mandatory: true,
    effort_pd: 5,
    description: "Annual employee income statement",
    regulatory_body: "LHDN",
    selected: false,
    sap_module: "malaysia_payroll"
  },
  {
    id: "borang_e",
    form_name: "Borang E",
    category: "Statutory",
    mandatory: true,
    effort_pd: 4,
    description: "Employer's annual return",
    regulatory_body: "LHDN",
    selected: false,
    sap_module: "malaysia_payroll"
  },
  {
    id: "cp8d",
    form_name: "CP8D Form",
    category: "Statutory",
    mandatory: true,
    effort_pd: 3,
    description: "Notification of employee cessation",
    regulatory_body: "LHDN",
    selected: false,
    sap_module: "malaysia_payroll"
  },
  // Banking Forms
  {
    id: "maybank_giro",
    form_name: "Maybank Corporate Giro",
    category: "Banking",
    mandatory: false,
    effort_pd: 2,
    description: "Maybank salary payment format",
    regulatory_body: "Maybank",
    selected: false,
    sap_module: "malaysia_payroll"
  },
  {
    id: "cimb_clicks",
    form_name: "CIMB Clicks Format",
    category: "Banking",
    mandatory: false,
    effort_pd: 2,
    description: "CIMB bulk payment format",
    regulatory_body: "CIMB Bank",
    selected: false,
    sap_module: "malaysia_payroll"
  },
  {
    id: "public_bank_ecpay",
    form_name: "Public Bank eCPay",
    category: "Banking",
    mandatory: false,
    effort_pd: 2,
    description: "Public Bank corporate payment",
    regulatory_body: "Public Bank",
    selected: false,
    sap_module: "malaysia_payroll"
  },
  {
    id: "rhb_reflex",
    form_name: "RHB Reflex Format",
    category: "Banking",
    mandatory: false,
    effort_pd: 2,
    description: "RHB bulk payment system",
    regulatory_body: "RHB Bank",
    selected: false,
    sap_module: "malaysia_payroll"
  },
  // HR Forms
  {
    id: "hrdf_levy",
    form_name: "HRDF Levy Submission",
    category: "HR",
    mandatory: true,
    effort_pd: 2,
    description: "Human Resource Development Fund levy",
    regulatory_body: "HRDF",
    selected: false,
    sap_module: "malaysia_payroll"
  },
  {
    id: "overtime_approval",
    form_name: "Overtime Approval Form",
    category: "HR",
    mandatory: false,
    effort_pd: 1,
    description: "Employee overtime authorization",
    regulatory_body: "Internal",
    selected: false,
    sap_module: "core_hr"
  },
  {
    id: "leave_application",
    form_name: "Leave Application",
    category: "HR",
    mandatory: false,
    effort_pd: 1,
    description: "Annual and medical leave forms",
    regulatory_body: "Internal",
    selected: false,
    sap_module: "core_hr"
  },
  // Finance Forms
  {
    id: "sst_02",
    form_name: "SST-02 Return",
    category: "Finance",
    mandatory: true,
    effort_pd: 5,
    description: "Monthly SST return submission",
    regulatory_body: "RMCD",
    selected: false,
    sap_module: "malaysia_gst_sst"
  },
  {
    id: "sst_exemption",
    form_name: "SST Exemption Certificate",
    category: "Finance",
    mandatory: false,
    effort_pd: 2,
    description: "SST exemption application",
    regulatory_body: "RMCD",
    selected: false,
    sap_module: "malaysia_gst_sst"
  },
  {
    id: "myinvois_einvoice",
    form_name: "MyInvois e-Invoice",
    category: "Finance",
    mandatory: true,
    effort_pd: 8,
    description: "LHDN e-invoice submission",
    regulatory_body: "LHDN",
    selected: false,
    sap_module: "malaysia_myinvois"
  },
  {
    id: "bnm_reporting",
    form_name: "BNM Statistical Reporting",
    category: "Finance",
    mandatory: true,
    effort_pd: 4,
    description: "Bank Negara statistical reports",
    regulatory_body: "BNM",
    selected: false,
    sap_module: "financial_master_data"
  },
  // Compliance Forms
  {
    id: "ssm_annual_return",
    form_name: "SSM Annual Return",
    category: "Compliance",
    mandatory: true,
    effort_pd: 3,
    description: "Company annual return to SSM",
    regulatory_body: "SSM",
    selected: false,
    sap_module: "financial_master_data"
  },
  {
    id: "audit_confirmation",
    form_name: "Audit Confirmation",
    category: "Compliance",
    mandatory: true,
    effort_pd: 2,
    description: "External audit confirmations",
    regulatory_body: "MIA",
    selected: false,
    sap_module: "financial_master_data"
  },
  // Procurement Forms
  {
    id: "vendor_registration",
    form_name: "Vendor Registration",
    category: "Procurement",
    mandatory: false,
    effort_pd: 2,
    description: "New vendor onboarding form",
    regulatory_body: "Internal",
    selected: false,
    sap_module: "procurement_inventory"
  },
  {
    id: "purchase_requisition",
    form_name: "Purchase Requisition",
    category: "Procurement",
    mandatory: false,
    effort_pd: 1,
    description: "Internal purchase request",
    regulatory_body: "Internal",
    selected: false,
    sap_module: "procurement_inventory"
  }
];

export const FORM_CATEGORIES = [
  { id: "statutory", name: "Statutory", count: 8, mandatory: true },
  { id: "banking", name: "Banking", count: 12, mandatory: false },
  { id: "hr", name: "HR", count: 3, mandatory: false },
  { id: "finance", name: "Finance", count: 4, mandatory: true },
  { id: "compliance", name: "Compliance", count: 2, mandatory: true },
  { id: "procurement", name: "Procurement", count: 2, mandatory: false }
];

export const REGULATORY_BODIES = [
  { id: "lhdn", name: "LHDN", fullName: "Lembaga Hasil Dalam Negeri" },
  { id: "kwsp", name: "KWSP", fullName: "Kumpulan Wang Simpanan Pekerja (EPF)" },
  { id: "perkeso", name: "PERKESO", fullName: "Pertubuhan Keselamatan Sosial (SOCSO)" },
  { id: "rmcd", name: "RMCD", fullName: "Royal Malaysian Customs Department" },
  { id: "bnm", name: "BNM", fullName: "Bank Negara Malaysia" },
  { id: "ssm", name: "SSM", fullName: "Suruhanjaya Syarikat Malaysia" },
  { id: "hrdf", name: "HRDF", fullName: "Human Resource Development Fund" }
];

export default MALAYSIA_FORMS_LIBRARY;
