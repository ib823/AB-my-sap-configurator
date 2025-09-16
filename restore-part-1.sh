#!/bin/bash
echo "🔧 Part 1: Creating base structure and constants..."

cat > src/components/App.jsx << 'APPEOF'
import React, { useState, useEffect, useMemo, useCallback } from "react";

/* ==========================
   RESOURCE CATALOG & RATES
   ========================== */
const RESOURCE_CATALOG = {
  ABMY: {
    currency: "MYR",
    multiplier: 1.0,
    positions: {
      "Partner": { rate: 1200, level: "Executive" },
      "Director": { rate: 1000, level: "Executive" },
      "Senior Manager": { rate: 800, level: "Senior" },
      "Manager": { rate: 600, level: "Mid" },
      "Senior Consultant": { rate: 450, level: "Mid" },
      "Consultant": { rate: 350, level: "Junior" },
      "Analyst": { rate: 250, level: "Entry" }
    }
  },
  ABSG: {
    currency: "SGD",
    multiplier: 1.0,
    positions: {
      "Partner": { rate: 2000, level: "Executive" },
      "Director": { rate: 1600, level: "Executive" },
      "Senior Manager": { rate: 1200, level: "Senior" },
      "Manager": { rate: 900, level: "Mid" },
      "Senior Consultant": { rate: 700, level: "Mid" },
      "Consultant": { rate: 500, level: "Junior" },
      "Analyst": { rate: 350, level: "Entry" }
    }
  },
  ABVN: {
    currency: "VND",
    multiplier: 1000,
    positions: {
      "Partner": { rate: 25, level: "Executive" },
      "Director": { rate: 20, level: "Executive" },
      "Senior Manager": { rate: 15, level: "Senior" },
      "Manager": { rate: 10, level: "Mid" },
      "Senior Consultant": { rate: 7, level: "Mid" },
      "Consultant": { rate: 5, level: "Junior" },
      "Analyst": { rate: 3, level: "Entry" }
    }
  },
  ABTH: {
    currency: "THB",
    multiplier: 1.0,
    positions: {
      "Partner": { rate: 8000, level: "Executive" },
      "Director": { rate: 6500, level: "Executive" },
      "Senior Manager": { rate: 5000, level: "Senior" },
      "Manager": { rate: 3500, level: "Mid" },
      "Senior Consultant": { rate: 2500, level: "Mid" },
      "Consultant": { rate: 1800, level: "Junior" },
      "Analyst": { rate: 1200, level: "Entry" }
    }
  },
  ABID: {
    currency: "IDR",
    multiplier: 1000,
    positions: {
      "Partner": { rate: 3500, level: "Executive" },
      "Director": { rate: 2800, level: "Executive" },
      "Senior Manager": { rate: 2200, level: "Senior" },
      "Manager": { rate: 1600, level: "Mid" },
      "Senior Consultant": { rate: 1200, level: "Mid" },
      "Consultant": { rate: 800, level: "Junior" },
      "Analyst": { rate: 500, level: "Entry" }
    }
  }
};

const CURRENCY_RATES = {
  ABMY: { ABSG: 0.31, ABVN: 5200, ABTH: 7.5, ABID: 3400, USD: 0.22 },
  ABSG: { ABMY: 3.2, ABVN: 16800, ABTH: 24, ABID: 11000, USD: 0.72 },
  ABVN: { ABMY: 0.00019, ABSG: 0.00006, ABTH: 0.0014, ABID: 0.65, USD: 0.00004 },
  ABTH: { ABMY: 0.13, ABSG: 0.042, ABVN: 700, ABID: 460, USD: 0.029 },
  ABID: { ABMY: 0.00029, ABSG: 0.00009, ABVN: 1.54, ABTH: 0.0022, USD: 0.000064 }
};

const OPE_RATES = {
  ABMY: {
    parking: 20, carMileage: 0.8, hotelNight: 350, perDiem: 150,
    flightDomestic: 400, taxiAirport: 100
  },
  ABSG: {
    parking: 30, carMileage: 1.2, hotelNight: 450, perDiem: 200,
    flightDomestic: 500, taxiAirport: 150
  },
  ABVN: {
    parking: 50000, carMileage: 15000, hotelNight: 1800000, perDiem: 800000,
    flightDomestic: 2500000, taxiAirport: 500000
  },
  ABTH: {
    parking: 100, carMileage: 20, hotelNight: 2500, perDiem: 1000,
    flightDomestic: 3000, taxiAirport: 800
  },
  ABID: {
    parking: 20000, carMileage: 5000, hotelNight: 800000, perDiem: 400000,
    flightDomestic: 1500000, taxiAirport: 350000
  }
};

/* ==========================
   SAP CATALOG & MAPPING
   ========================== */
const SAP_CATALOG = {
  Finance_1: {
    name: "Financial Master Data Management",
    category: "Finance Core",
    description: "GL setup, cost centers, organizational structure",
    mandays: 192.9
  },
  Finance_2: {
    name: "Procurement & Inventory Accounting",
    category: "Finance Core",
    description: "Automated P2P accounting",
    mandays: 90.0
  },
  Finance_21: {
    name: "Project Accounting",
    category: "Finance Advanced",
    description: "Project cost tracking",
    mandays: 64.3
  },
  HCM_1: {
    name: "Core HR",
    category: "HR Core",
    description: "Employee data management",
    mandays: 180.0
  },
  SCM_2: {
    name: "Plan to Fulfil",
    category: "Supply Chain",
    description: "Production planning and execution",
    mandays: 257.1
  }
};

const BUSINESS_CATEGORIES = {
  "Finance Core": { 
    description: "Essential financial management capabilities", 
    icon: "💰", 
    packages: ["Finance_1", "Finance_2"] 
  },
  "Finance Advanced": { 
    description: "Enhanced financial features for complex organizations", 
    icon: "📊", 
    packages: ["Finance_21"] 
  },
  "HR Core": { 
    description: "Employee management and payroll processing", 
    icon: "👥", 
    packages: ["HCM_1"] 
  },
  "Supply Chain": { 
    description: "Production planning and inventory management", 
    icon: "🏭", 
    packages: ["SCM_2"] 
  }
};

const SAP_TO_TIMELINE_MAPPING = {
  Finance_1: {
    phaseName: "Financial Master Data Setup",
    category: "Configuration",
    dependencies: ["Project Kickoff", "System Landscape Setup"],
    parallelizable: false
  },
  Finance_2: {
    phaseName: "Procurement & Inventory Setup",
    category: "Configuration",
    dependencies: ["Finance_1", "Master Data Setup"],
    parallelizable: true
  },
  Finance_21: {
    phaseName: "Project Accounting Configuration",
    category: "Advanced Configuration",
    dependencies: ["Finance_1", "Organizational Setup"],
    parallelizable: true
  },
  HCM_1: {
    phaseName: "Core HR Implementation",
    category: "HR Setup",
    dependencies: ["Organizational Setup", "Security Roles"],
    parallelizable: true
  },
  SCM_2: {
    phaseName: "Production Planning Configuration",
    category: "SCM Setup",
    dependencies: ["Master Data Setup", "Organizational Structure"],
    parallelizable: true
  }
};

const BUSINESS_DAY_BASE_DATE = new Date("2024-01-01");
APPEOF

echo "✅ Part 1 complete! Run restore-part-2.sh next"
