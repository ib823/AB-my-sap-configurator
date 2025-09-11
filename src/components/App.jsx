
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import SAPScopeApp from './SAPScopeApp';

/* ===========================================
   AppleEye — animated, label-free, “Apple-like”
   =========================================== */
const AppleEye = ({
  size = 32,
  isOpen = true,
  onToggle,
  className = "",
}) => {
  const [open, setOpen] = useState(isOpen);
  const [blinking, setBlinking] = useState(false);

  // keep in sync with prop
  useEffect(() => setOpen(isOpen), [isOpen]);

  // organic auto-blink (random cadence)
  useEffect(() => {
    let t;
    const schedule = () => {
      const next = Math.random() * (3000 - 2000) + 2000; // 2-3 seconds
      t = setTimeout(() => {
        setBlinking(true);
        setTimeout(() => setBlinking(false), 120);
        schedule();
      }, next);
    };
    schedule();
    return () => clearTimeout(t);
  }, []);

  const closed = blinking || !open;

  const handlePress = () => {
    const next = !open;
    if (onToggle) onToggle(next);
    else setOpen(next);
  };

  return (
    <button
      className={`eye-button ${className}`}
      onClick={handlePress}
      aria-pressed={open}
      aria-label={open ? "Hide pricing (client mode)" : "Show pricing (internal mode)"}
      title={open ? "Switch to client mode" : "Switch to internal mode"}
      style={{ 
        width: size + 8, 
        height: size + 8,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px",
        borderRadius: "50%",
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
      onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
      onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
      onMouseDown={(e) => e.target.style.transform = "scale(0.95)"}
      onMouseUp={(e) => e.target.style.transform = "scale(1.1)"}
    >
      <div
        style={{
          width: size,
          height: size * 0.6,
          position: "relative",
          background: "linear-gradient(145deg, #ffffff, #f0f0f0)",
          borderRadius: size + "px",
          boxShadow: 
            "0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          transform: closed ? "scaleY(0.1)" : "scaleY(1)",
          backgroundColor: closed ? "#e8e8e8" : "white"
        }}
      >
        {/* Iris */}
        <div
          style={{
            width: size * 0.5,
            height: size * 0.5,
            background: "radial-gradient(circle at 30% 30%, #e24a4a, #a02c2c, #721e1e)",
            borderRadius: "50%",
            position: "relative",
            transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            transform: closed ? "scale(0)" : "scale(1)",
            opacity: closed ? 0 : 1,
            boxShadow: "0 0 0 2px rgba(255, 255, 255, 0.8), 0 2px 8px rgba(0, 0, 0, 0.2)"
          }}
        >
          {/* Pupil */}
          <div
            style={{
              width: size * 0.2,
              height: size * 0.2,
              background: "radial-gradient(circle at 30% 30%, #2c2c2c, #000000)",
              borderRadius: "50%",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)"
            }}
          >
            {/* Highlight */}
            <div
              style={{
                width: size * 0.08,
                height: size * 0.08,
                background: "rgba(255, 255, 255, 0.9)",
                borderRadius: "50%",
                position: "absolute",
                top: "25%",
                left: "30%"
              }}
            />
          </div>
        </div>
      </div>
    </button>
  );
};


/* ===========================================
   RolePicker (used inside Resource Management)
   =========================================== */
const RolePicker = ({ selectedRole, selectedRegion, onSelect, RESOURCE_CATALOG, formatCurrency }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const allOptions = [];
  Object.entries(RESOURCE_CATALOG).forEach(([regionCode, regionData]) => {
    Object.entries(regionData.positions).forEach(([role, data]) => {
      allOptions.push({
        role,
        region: regionCode,
        rate: data.rate,
        symbol: regionData.symbol,
        currency: regionData.currency
      });
    });
  });

  const filteredOptions = allOptions.filter(
    (o) =>
      o.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = allOptions.find(
    (opt) => opt.role === selectedRole && opt.region === selectedRegion
  );

  return (
    <div style={{ position: "relative" }}>
      {/* Selected pill */}
      <div
        className="form-input"
        onClick={() => setIsOpen((v) => !v)}
        style={{
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: "14px" }}>
            {selectedOption?.role || "Select Role"}
          </div>
          {selectedOption && (
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              {selectedOption.region} • {formatCurrency(selectedOption.rate, selectedOption.region, { abbreviate: false })}/hr
            </div>
          )}
        </div>
        <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
          {isOpen ? "▲" : "▼"}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 10000,
            backgroundColor: "white",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            boxShadow: "var(--shadow-medium)",
            overflow: "hidden"
          }}
        >
          <input
            style={{
              padding: "8px 12px",
              border: "none",
              borderBottom: "1px solid var(--border)",
              width: "100%",
              fontSize: "14px",
              backgroundColor: "rgba(0,122,255,0.02)",
              outline: "none"
            }}
            placeholder="Search roles or regions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />

          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            {filteredOptions.map((option, idx) => {
              const active =
                option.role === selectedRole && option.region === selectedRegion;
              return (
                <div
                  key={`${option.role}-${option.region}-${idx}`}
                  style={{
                    padding: "12px",
                    borderBottom:
                      idx < filteredOptions.length - 1
                        ? "1px solid var(--border)"
                        : "none",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: active ? "rgba(0,122,255,0.08)" : "white"
                  }}
                  onClick={() => {
                    onSelect(option.role, option.region, option.rate);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "14px",
                        color: "var(--text-primary)",
                        marginBottom: "2px"
                      }}
                    >
                      {option.role}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                        fontWeight: 500
                      }}
                    >
                      {option.region}
                    </div>
                  </div>
                  <div
                    style={{ fontSize: "13px", fontWeight: 700, color: "var(--primary)" }}
                  >
                    {formatCurrency(option.rate, option.region, { abbreviate: false })}/hr
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const EyeToggle = ({ isInternal, onClick }) => {
  // Corrected logic:
  // Open eye = can see pricing (internal mode)
  // Closed eye = can't see pricing (client mode)
  return (
    <AppleEye
      size={32}
      isOpen={isInternal}
      onToggle={() => onClick?.()}
    />
  );
};


/* =======================
   MAIN COMPONENT
   ======================= */
export default function ProjectTimeline() {
  /* ===========================
     DESIGN SYSTEM & GLOBAL CSS
     =========================== */
  const styles = `
 :root{
  --primary:#007AFF; --success:#34C759; --warning:#FF9500; --danger:#FF3B30;
  --background:#F2F2F7; --surface:#FFFFFF;
  --text-primary:#000000; --text-secondary:#8E8E93; --text-tertiary:#C7C7CC;
  --border:rgba(0,0,0,0.06); --border-strong:rgba(0,0,0,0.12);
  --shadow-soft:0 1px 3px rgba(0,0,0,0.12); --shadow-medium:0 8px 25px rgba(0,0,0,0.15); --shadow-strong:0 16px 40px rgba(0,0,0,0.25);
  --radius:12px; --transition:cubic-bezier(0.25,0.46,0.45,0.94); --spring:cubic-bezier(0.175,0.885,0.32,1.275);
  --unit-width:80px; --transition-zoom: 0.2s ease-out;
}
  *{box-sizing:border-box}
  body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;background:var(--background);color:var(--text-primary)}
  .app{max-width:1400px;margin:0 auto;padding:24px;min-height:100vh}

  /* Header */
  .header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;gap:16px;flex-wrap:wrap}
  .title{font-size:28px;font-weight:800;letter-spacing:-0.3px;margin:0}
  .header-controls{display:flex;align-items:center;gap:8px;flex-wrap:wrap}

  .project-status-bar{display:flex;align-items:center;gap:12px;margin-top:6px;flex-wrap:wrap}
  .status-metric{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-secondary);font-weight:600}
  .status-metric-value{color:var(--text-primary);font-weight:800}
  .status-separator{width:1px;height:18px;background:var(--border)}

  .primary-action{
    background:var(--primary);color:#fff;border:none;padding:10px 16px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;
    transition:all .3s var(--spring);box-shadow:var(--shadow-soft);position:relative;overflow:hidden
  }
  .primary-action:hover{transform:translateY(-1px);box-shadow:var(--shadow-medium)}
  .secondary-action{background:var(--surface);color:var(--text-primary);border:1px solid var(--border);padding:10px 12px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}
  .form-select{background:var(--surface)}

  /* Suggestions */
  .suggestions{background:linear-gradient(135deg,#F8F9FA 0%,#E9ECEF 100%);border:1px solid var(--border);border-radius:var(--radius);padding:12px;margin-bottom:16px;display:flex;align-items:center;gap:12px}
  .suggestion-icon{width:28px;height:28px;background:var(--primary);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;flex-shrink:0}
  .suggestion-content{flex:1}.suggestion-title{font-weight:700;margin:0 0 2px 0;font-size:14px}.suggestion-text{margin:0;font-size:12px;color:var(--text-secondary)}
  .suggestion-action{background:var(--primary);color:#fff;border:none;padding:8px 12px;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer}

  /* Timeline */
  .timeline-container{background:var(--surface);border-radius:var(--radius);box-shadow:var(--shadow-soft);overflow:hidden;position:relative}
  .timeline-header{border-bottom:1px solid var(--border);background:linear-gradient(180deg,#FFFFFF 0%,#FAFAFA 100%);position:sticky;top:0;z-index:10;backdrop-filter:blur(8px)}
  .timeline-header-inner{padding:0 24px;overflow-x:auto;scrollbar-width:none}
  .timeline-header-inner::-webkit-scrollbar{display:none}
  .timeline-scale{display:flex;min-width:max-content}
  .scale-unit{min-width:var(--unit-width);width:var(--unit-width);text-align:center;border-right:1px solid var(--border);position:relative;padding:8px 4px;flex-shrink:0}
  .scale-unit.today{background:rgba(0,122,255,0.10)}
  .scale-unit.holiday{background:rgba(255,149,0,0.10);border-left:3px solid var(--warning)}
  .date-line-1{font-size:12px;font-weight:800;color:var(--text-primary);line-height:1.2}
  .date-line-2{font-size:11px;color:var(--text-secondary);font-weight:700;line-height:1.2;margin-top:2px}
  .date-line-3{font-size:10px;color:var(--text-tertiary);font-weight:700;line-height:1.2;margin-top:1px}

  .timeline-body{position:relative;overflow-x:auto}
  .timeline-content{position:relative;min-width:max-content}

  .timeline-grid{position:absolute;top:0;left:24px;right:24px;bottom:0;display:flex;pointer-events:none;min-width:max-content}
  .grid-line{border-right:1px solid var(--border);min-width:var(--unit-width);width:var(--unit-width);flex-shrink:0}
  .grid-line.today{background:linear-gradient(180deg,rgba(0,122,255,0.12) 0%,rgba(0,122,255,0.06) 100%);border-right:2px solid var(--primary)}
  .grid-line.holiday{background:linear-gradient(180deg,rgba(255,149,0,0.08) 0%,rgba(255,149,0,0.04) 100%);border-left:2px solid var(--warning)}

  .phases-container{position:relative;z-index:1;padding:0 24px}

  /* Row & bar sizing */
  .phase-row{position:relative;height:92px;border-bottom:1px solid var(--border);display:flex;align-items:center}
  .phase-row:last-child{border-bottom:none}
  .phase-bar{position:absolute;top:16px;height:60px;background:linear-gradient(135deg,var(--phase-color) 0%,var(--phase-color-dark) 100%);border-radius:12px;cursor:pointer;box-shadow:0 2px 12px rgba(0,0,0,0.12);overflow:hidden;min-width:80px;border:2px solid transparent;transition:all var(--transition-zoom)}
  .phase-bar.selected{box-shadow:var(--shadow-strong);border-color:var(--primary);z-index:10}
  .phase-content{padding:14px 18px;height:100%;display:flex;align-items:center;justify-content:space-between;color:#fff}
  .phase-title{font-size:15px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;text-shadow:0 1px 3px rgba(0,0,0,0.3)}
  .phase-meta{display:flex;align-items:center;gap:8px;margin-left:12px}
  .phase-duration{font-size:12px;opacity:.95;font-weight:800}

  /* Resource chips on bars */
  .resource-avatars{position:absolute;top:-4px;left:8px;display:flex;gap:2px;opacity:.95}
  .resource-avatar{width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:var(--text-primary);border:1px solid rgba(255,255,255,0.8)}
  .resource-capacity{position:absolute;bottom:4px;left:8px;right:8px;height:4px;background:rgba(255,255,255,0.25);border-radius:3px;overflow:hidden}
  .resource-fill{height:100%;background:rgba(255,255,255,0.85)}

  /* Empty */
  .empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;height:360px;color:var(--text-secondary)}
  .empty-icon{font-size:44px;margin-bottom:12px;opacity:.5}
  .empty-title{font-size:18px;font-weight:800;margin-bottom:6px}
  .empty-subtitle{font-size:14px;text-align:center;margin-bottom:16px;max-width:360px;line-height:1.4}

.phase-bar:hover .phase-delete-btn { opacity: 1; }
.phase-delete-btn:hover {
  background: #ff1744 !important;
  transform: scale(1.1);
}

  /* Panel */
  .detail-panel{position:fixed;top:0;right:0;width:420px;height:100vh;background:var(--surface);box-shadow:-8px 0 25px rgba(0,0,0,0.15);transform:translateX(100%);transition:transform .45s var(--spring);z-index:100;overflow-y:auto}
  .detail-panel.open{transform:translateX(0)}
  .detail-header{padding:20px;border-bottom:1px solid var(--border);background:linear-gradient(135deg,var(--surface) 0%,#F8F9FB 100%);position:sticky;top:0;z-index:10}
  .detail-title{font-size:20px;font-weight:900;margin:0 0 4px 0}
  .detail-subtitle{font-size:13px;color:var(--text-secondary);margin:0}
  .detail-content{padding:20px}
  .detail-section{margin-bottom:24px}
  .section-title{font-size:15px;font-weight:900;margin:0 0 10px 0}

  .form-label{display:block;font-size:13px;font-weight:800;margin-bottom:6px;color:var(--text-primary)}
  .form-input,.form-select{width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;font-size:14px;background:var(--surface)}
  .form-checkbox{display:flex;align-items:center;gap:8px;font-size:14px}
  .checkbox{width:16px;height:16px;accent-color:var(--primary)}

  .backdrop{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);opacity:0;pointer-events:none;transition:opacity .45s var(--transition);z-index:99}
  .backdrop.open{opacity:1;pointer-events:auto}

  /* Notifications */
  @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

  /* Phase responsive styles */
  .phase-bar-compact { position: relative; }
  .phase-bar-compact .phase-content { padding: 8px 12px; }
  .phase-bar-compact .phase-title { font-size: 13px; font-weight: 900; }
  .phase-bar-compact .phase-meta { gap: 4px; }
  .phase-bar-compact .phase-duration { font-size: 10px; background: rgba(255,255,255,0.3); padding: 2px 6px; border-radius: 4px; }

  .phase-info-tooltip {
    position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
    background: rgba(0,0,0,0.9); color: white; padding: 12px 16px; border-radius: 8px;
    font-size: 13px; white-space: nowrap; z-index: 1000; opacity: 0; pointer-events: none;
    transition: opacity 0.2s ease; margin-bottom: 8px;
  }
  .phase-info-tooltip::after {
    content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
    border: 5px solid transparent; border-top-color: rgba(0,0,0,0.9);
  }
  .phase-bar:hover .phase-info-tooltip { opacity: 1; }

  .phase-bar-minimal { justify-content: center; align-items: center; }
  .phase-bar-minimal .phase-content { text-align: center; padding: 4px; }
  .phase-bar-minimal .phase-title { display: none; }
  .phase-icon { font-size: 18px; opacity: 0.9; }

  /* ===== PATCH 6: Button layout improvements ===== */
  .header-controls{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .header-controls .form-select{min-width:90px;padding:8px 12px;font-size:13px;border:2px solid var(--border);font-weight:700}
  @media (max-width:768px){
    .header{flex-direction:column;gap:12px;align-items:stretch}
    .header-controls{justify-content:flex-start;flex-wrap:wrap;gap:8px}
    .header-controls button,.header-controls select{flex:0 0 auto}
  }
  `;

  /* ======= STATE ======= */
  const [phases, setPhases] = useState([]);
  const [holidays, setHolidays] = useState([
    { id: 1, date: "2025-01-01", name: "New Year" },
    { id: 2, date: "2025-02-01", name: "Regional Holiday" }
  ]);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [forexModalOpen, setForexModalOpen] = useState(false);
  const [customRates, setCustomRates] = useState({}); // User-defined rates
  const [useCustomRates, setUseCustomRates] = useState(false)

  // Client presentation mode - hides all monetary figures
  const [clientPresentationMode, setClientPresentationMode] = useState(false);
  const [sapScopeOpen, setSapScopeOpen] = useState(false);

  // Helper function to conditionally show monetary values
  const showMoney = (monetaryValue, fallback = "—") => {
    return clientPresentationMode ? fallback : monetaryValue;
  };

  // Resource Management Cockpit state
  const [resourceManagementOpen, setResourceManagementOpen] = useState(false);

const [operatingMode, setOperatingMode] = useState("consultant"); // 'consultant' | 'client_facing' | 'sap_scope' | 'proposal_review'
const [sapSelection, setSapSelection] = useState(null);
const [clientProfile, setClientProfile] = useState(null);
const [recommendations, setRecommendations] = useState([]);

  // Project Location (OPE)
  const [projectLocation, setProjectLocation] = useState({
    city: "",
    address: "",
    distanceFromKL: 0, // hours by car
    requiresFlights: false,
    isRemote: false
  });
  const [projectLocationOpen, setProjectLocationOpen] = useState(false);

  const OPE_RATES = {
    ABMY: { perDiem: 150, hotelNight: 300, carMileage: 0.8, parking: 20, flightDomestic: 400, taxiAirport: 120 },
    ABSG: { perDiem: 80,  hotelNight: 180, carMileage: 0.5, parking: 15, flightDomestic: 250, taxiAirport: 60 }
  };

  /* ==============================
     RESOURCE CATALOG & CURRENCY
     ============================== */
  const RESOURCE_CATALOG = {
    ABMY: {
      currency: "MYR",
      symbol: "RM",
      decimals: 2,
      symbolPos: "before",
      sep: ",",
      positions: {
        Principal: { rate: 2000 },
        Director: { rate: 1600 },
        "Senior Manager": { rate: 1200 },
        Manager: { rate: 750 },
        "Senior Consultant": { rate: 410 },
        Consultant: { rate: 260 },
        Analyst: { rate: 240 }
      }
    },
    ABSG: {
      currency: "SGD",
      symbol: "S$",
      decimals: 2,
      symbolPos: "before",
      sep: ",",
      positions: {
        Principal: { rate: 1400 },
        Director: { rate: 1000 },
        "Senior Manager": { rate: 800 },
        Manager: { rate: 450 },
        "Associate Manager": { rate: 370 },
        "Senior Consultant": { rate: 300 },
        Consultant: { rate: 230 },
        "System Analyst": { rate: 180 },
        "Senior Expert": { rate: 800 },
        Expert: { rate: 430 },
        "Senior Specialist": { rate: 300 },
        Specialist: { rate: 230 },
        "Junior Specialist": { rate: 180 }
      }
    },
    ABASG: {
      currency: "SGD",
      symbol: "S$",
      decimals: 2,
      symbolPos: "before",
      sep: ",",
      positions: {
        Principal: { rate: 1200 },
        Director: { rate: 960 },
        "Senior Manager": { rate: 660 },
        Manager: { rate: 440 },
        "Senior Consultant": { rate: 280 },
        Consultant: { rate: 210 },
        Associate: { rate: 170 }
      }
    },
    ABVN: {
      currency: "VND",
      symbol: "₫",
      decimals: 0,
      symbolPos: "after",
      sep: ",",
      positions: {
        Principal: { rate: 13000000 },
        Director: { rate: 10000000 },
        "Senior Manager": { rate: 6000000 },
        Manager: { rate: 4000000 },
        "Associate Manager": { rate: 2800000 },
        "Senior Consultant": { rate: 2600000 },
        Consultant: { rate: 1400000 },
        Analyst: { rate: 1000000 },
        "Senior Expert": { rate: 6000000 },
        Expert: { rate: 4000000 },
        "Associate Expert": { rate: 2000000 },
        "Senior Specialist": { rate: 1600000 },
        Specialist: { rate: 1100000 },
        "Jr. Specialist": { rate: 900000 }
      }
    },
    ABTH: {
      currency: "THB",
      symbol: "฿",
      decimals: 2,
      symbolPos: "before",
      sep: ",",
      positions: {
        Principal: { rate: 35000 },
        Director: { rate: 25000 },
        "Senior Manager": { rate: 11000 },
        Manager: { rate: 7300 },
        "Associate Manager": { rate: 5000 },
        "Senior Consultant": { rate: 4300 },
        Consultant: { rate: 3300 },
        Analyst: { rate: 2300 },
        "Senior Expert": { rate: 10000 },
        Expert: { rate: 6100 },
        "Associate Expert": { rate: 3800 },
        "Senior Specialist": { rate: 2900 },
        Specialist: { rate: 2300 },
        "Jr. Specialist": { rate: 1600 }
      }
    },
    ABID: {
      currency: "IDR",
      symbol: "Rp",
      decimals: 0,
      symbolPos: "before",
      sep: ".",
      positions: {
        Principal: { rate: 7150000 },
        Director: { rate: 4100000 },
        "Senior Manager": { rate: 3800000 },
        Manager: { rate: 2800000 },
        "Associate Manager": { rate: 2000000 },
        "Senior Consultant": { rate: 1450000 },
        Consultant: { rate: 900000 },
        Analyst: { rate: 600000 },
        "Senior Expert": { rate: 3600000 },
        Expert: { rate: 2200000 },
        "Associate Expert": { rate: 1500000 },
        "Senior Specialist": { rate: 1100000 },
        Specialist: { rate: 600000 },
        Developer: { rate: 450000 },
        "Junior Specialist": { rate: 300000 }
      }
    }
  };

  // Currency options
  const CURRENCY_OPTIONS = [
    ...Object.keys(RESOURCE_CATALOG),
    "JPY",
    "USD",
    "EUR"
  ];

  const [selectedCatalogRegion, setSelectedCatalogRegion] = useState("ABMY");
  const [showCurrencyConversion] = useState(false); // kept for feature parity
  const [liveRates, setLiveRates] = useState(null);
  const [ratesLastUpdated, setRatesLastUpdated] = useState(null);

  const FALLBACK_RATES = {
    ABMY: { ABSG: 0.32, ABASG: 0.32, ABVN: 5200, ABTH: 8.5, ABID: 2400, JPY: 34, USD: 0.22, EUR: 0.20 },
    ABSG: { ABMY: 3.1, ABASG: 1.0, ABVN: 16200, ABTH: 26.5, ABID: 7500, JPY: 105, USD: 0.68, EUR: 0.62 },
    ABASG: { ABMY: 3.1, ABSG: 1.0, ABVN: 16200, ABTH: 26.5, ABID: 7500, JPY: 105, USD: 0.68, EUR: 0.62 },
    ABVN: { ABMY: 0.00019, ABSG: 0.000062, ABASG: 0.000062, ABTH: 0.0016, ABID: 0.46, JPY: 0.0065, USD: 0.000042, EUR: 0.000038 },
    ABTH: { ABMY: 0.12, ABSG: 0.038, ABASG: 0.038, ABVN: 625, ABID: 290, JPY: 4.0, USD: 0.026, EUR: 0.024 },
    ABID: { ABMY: 0.00042, ABSG: 0.00013, ABASG: 0.00013, ABVN: 2.2, ABTH: 0.0034, JPY: 0.014, USD: 0.000092, EUR: 0.000084 },
    JPY: { ABMY: 0.029, ABSG: 0.0095, ABASG: 0.0095, ABVN: 153, ABTH: 0.25, ABID: 71, USD: 0.0065, EUR: 0.0059 },
    USD: { ABMY: 4.5, ABSG: 1.47, ABASG: 1.47, ABVN: 23500, ABTH: 38, ABID: 10900, JPY: 154, EUR: 0.91 },
    EUR: { ABMY: 4.9, ABSG: 1.61, ABASG: 1.61, ABVN: 26000, ABTH: 42, ABID: 12000, JPY: 169, USD: 1.10 }
  };

  const getCurrencyMeta = (region) =>
    (
      {
        ABMY: { code: "MYR", symbol: "RM", decimals: 2, symbolPos: "before", sep: "," },
        ABSG: { code: "SGD", symbol: "S$", decimals: 2, symbolPos: "before", sep: "," },
        ABASG: { code: "SGD", symbol: "S$", decimals: 2, symbolPos: "before", sep: "," },
        ABTH: { code: "THB", symbol: "฿", decimals: 2, symbolPos: "before", sep: "," },
        ABVN: { code: "VND", symbol: "₫", decimals: 0, symbolPos: "after", sep: "," },
        ABID: { code: "IDR", symbol: "Rp", decimals: 0, symbolPos: "before", sep: "." },
        JPY: { code: "JPY", symbol: "¥", decimals: 0, symbolPos: "before", sep: "," },
        USD: { code: "USD", symbol: "$", decimals: 2, symbolPos: "before", sep: "," },
        EUR: { code: "EUR", symbol: "€", decimals: 2, symbolPos: "before", sep: "," }
      }[region] || { code: "MYR", symbol: "RM", decimals: 2, symbolPos: "before", sep: "," }
    );

  const fmtNum = (num, dec, sep) => {
    const fixed = Number(num).toFixed(dec);
    const [i, f] = fixed.split(".");
    const int = i.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    return f !== undefined && dec > 0 ? `${int}.${f}` : int;
  };

  const abbreviateNum = (amount) => {
    const a = Math.abs(amount);
    if (a <= 9999) return { v: amount, u: "" };
    if (a < 1_000_000) return { v: amount / 1_000, u: "K" };
    if (a < 1_000_000_000) return { v: amount / 1_000_000, u: "M" };
    if (a < 1_000_000_000_000) return { v: amount / 1_000_000_000, u: "B" };
    return { v: amount / 1_000_000_000_000, u: "T" };
  };

  const formatCurrency = (amount, regionCode = "ABMY", { style = "code", abbreviate = true } = {}) => {
    const meta = getCurrencyMeta(regionCode);
    const { v, u } = abbreviate ? abbreviateNum(amount) : { v: amount, u: "" };
    const decimals = u ? 2 : meta.decimals;
    const num = fmtNum(v, decimals, meta.sep);
    if (style === "code") return `${meta.code} ${num}${u ? ` ${u}` : ""}`;
    return meta.symbolPos === "after"
      ? `${num}${u ? ` ${u}` : ""}${meta.symbol}`
      : `${meta.symbol}${num}${u ? ` ${u}` : ""}`;
  };

// Replace the convertCurrency function (around line 560-570) with:

const convertCurrency = (amount, fromRegion, toRegion) => {
  if (fromRegion === toRegion) return amount;
  
  // Check for custom rates first
  if (useCustomRates && customRates[fromRegion]?.[toRegion]) {
    return amount * customRates[fromRegion][toRegion];
  }
  
  // Fall back to live/fallback rates
  const rates = liveRates || FALLBACK_RATES;
  const rate = rates[fromRegion]?.[toRegion] ?? 1;
  return amount * rate;
};

  useEffect(() => {
    // Live FX (best effort; fallback if fails)
    const fetchLiveRates = async () => {
      try {
        const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        const data = await res.json();
        const baseCurrencies = {
          ABMY: "MYR",
          ABSG: "SGD",
          ABASG: "SGD",
          ABVN: "VND",
          ABTH: "THB",
          ABID: "IDR",
          JPY: "JPY",
          USD: "USD",
          EUR: "EUR"
        };
        const rates = {};
        Object.entries(baseCurrencies).forEach(([regionFrom, cf]) => {
          rates[regionFrom] = {};
          Object.entries(baseCurrencies).forEach(([regionTo, ct]) => {
            if (regionFrom !== regionTo) {
              const fromRate = data.rates?.[cf] ?? 1;
              const toRate = data.rates?.[ct] ?? 1;
              rates[regionFrom][regionTo] = toRate / fromRate;
            }
          });
        });
        setLiveRates(rates);
        setRatesLastUpdated(new Date());
      } catch {
        setLiveRates(FALLBACK_RATES);
        setRatesLastUpdated(null);
      }
    };
    fetchLiveRates();
    const id = setInterval(fetchLiveRates, 3600000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line

  // ADD this new useEffect:
useEffect(() => {
  const handleSAPScopeExport = (event) => {
    const { packages, clientProfile, totalEffort, integrations, malaysiaForms, projectServices } = event.detail;
    
    // Simple transformation - map package IDs directly
    const packageIds = packages.map(pkg => pkg.id);
    const clientData = {
      companyName: clientProfile?.company_name || "",
      industry: clientProfile?.industry || "services",
      region: "ABMY",
      size: clientProfile?.company_size || "medium",
      complexity: "standard",
      timeline: "normal",
      employees: 500,
      annualRevenueMYR: 200000000
    };
    
    // Import into timeline using existing function
    importSAPTimeline(packageIds, clientData);
    
    // Close SAP scope and switch to timeline view
    setSapScopeOpen(false);
    setOperatingMode("proposal_review");
  };
  
  window.addEventListener('sapScopeExport', handleSAPScopeExport);
  return () => window.removeEventListener('sapScopeExport', handleSAPScopeExport);
}, []);

  /* =====================
     DATE / TIMELINE UTILS
     ===================== */

  // Base: next Monday from today
  const BUSINESS_DAY_BASE_DATE = useMemo(() => {
    const today = new Date();
    const dow = today.getDay(); // 0..6
    const daysToAdd = dow === 1 ? 0 : (8 - dow) % 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysToAdd);
    return nextMonday;
  }, []);

  // Fix Calendar Date Accuracy (REPLACED)
  const generateBusinessDays = (startDate, totalBusinessDays) => {
    const out = [];
    const d = new Date(startDate);
    let count = 0;
    const holidaySet = new Set(holidays.map(h => h.date));
    while (count < totalBusinessDays) {
      const dow = d.getDay(); // 0 = Sun
      const ymd = d.toISOString().split("T")[0];
      if (dow >= 1 && dow <= 5) {
        const isHoliday = holidaySet.has(ymd);
        const holiday = holidays.find(h => h.date === ymd);
        out.push({
          date: new Date(d),
          dateString: ymd,
          businessDayIndex: count,
          isToday: ymd === new Date().toISOString().split("T")[0],
          isHoliday,
          holidayName: holiday?.name
        });
        count++;
      }
      d.setDate(d.getDate() + 1);
    }
    return out;
  };

  // Map index -> Date
  const businessDayToDate = (index, hols = holidays, skipHolidays = true, baseDate = BUSINESS_DAY_BASE_DATE) => {
    const start = new Date(baseDate);
    const holidaySet = new Set((hols || []).map(h => h.date));
    let d = new Date(start);
    let count = 0;
    if (index <= 0) return d;
    while (count < index) {
      d.setDate(d.getDate() + 1);
      const dow = d.getDay();
      const ymd = d.toISOString().split("T")[0];
      const weekday = dow >= 1 && dow <= 5;
      const isHol = holidaySet.has(ymd);
      if (weekday && (!skipHolidays || !isHol)) count++;
    }
    return d;
  };

  // Date -> business day index
  const dateToBusinessDay = (dateInput, hols = holidays, skipHolidays = true, baseDate = BUSINESS_DAY_BASE_DATE) => {
    const target = new Date(dateInput);
    const holidaySet = new Set((hols || []).map(h => h.date));
    const start = new Date(baseDate);
    if (target <= start) return 0;
    let d = new Date(start);
    let idx = 0;
    while (d < target) {
      d.setDate(d.getDate() + 1);
      const dow = d.getDay();
      const ymd = d.toISOString().split("T")[0];
      const weekday = dow >= 1 && dow <= 5;
      const isHol = holidaySet.has(ymd);
      if (weekday && (!skipHolidays || !isHol)) idx++;
    }
    return idx;
  };

  const getOptimalZoomLevel = (spanBusinessDays, containerWidth) => {
    const levels = [
      { name: "daily", unit: 1, minWidth: 60, label: "Daily" },
      { name: "weekly", unit: 5, minWidth: 80, label: "Weekly" },
      { name: "biweekly", unit: 10, minWidth: 100, label: "Bi-weekly" },
      { name: "monthly", unit: 22, minWidth: 120, label: "Monthly" },
      { name: "quarterly", unit: 66, minWidth: 140, label: "Quarterly" },
      { name: "halfyearly", unit: 132, minWidth: 160, label: "Half-yearly" },
      { name: "yearly", unit: 264, minWidth: 180, label: "Yearly" },
      { name: "biyearly", unit: 528, minWidth: 200, label: "Bi-yearly" }
    ];
    for (const level of levels) {
      const units = Math.ceil(spanBusinessDays / level.unit);
      const requiredWidth = units * level.minWidth;
      if (requiredWidth <= containerWidth) return level;
    }
    return levels[levels.length - 1];
  };

  const formatDateForZoom = (startDate, zoomName, endDate = null) => {
    const month = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    const day = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
    switch (zoomName) {
      case "daily":
      case "weekly":
      case "biweekly": {
        const d = startDate.getDate();
        const ord = (x)=> (x>3 && x<21) ? "th" : (["th","st","nd","rd"][Math.min(x%10,4)] || "th");
        return { line1: day[startDate.getDay()], line2: `${d}${ord(d)} ${month[startDate.getMonth()]}`, line3: String(startDate.getFullYear()) };
      }
      case "monthly":
      case "quarterly":
      case "halfyearly": {
        if (zoomName === "quarterly") {
          const q = Math.floor(startDate.getMonth()/3)+1;
          return { line1:`Q${q}`, line2:String(startDate.getFullYear()), line3:"" };
        }
        if (zoomName === "halfyearly") {
          const h = startDate.getMonth()<6 ? "H1" : "H2";
          return { line1:h, line2:String(startDate.getFullYear()), line3:"" };
        }
        return { line1:month[startDate.getMonth()], line2:String(startDate.getFullYear()), line3:"" };
      }
      case "yearly":
      case "biyearly": {
        return { line1:String(startDate.getFullYear()), line2:(zoomName==="biyearly" && endDate)?`-${endDate.getFullYear()}`:"", line3:"" };
      }
      default: return { line1:"", line2:"", line3:"" };
    }
  };

  // Weekly/biweekly groupings aligned to Monday
  const generateZoomedBusinessDays = (startDate, totalBusinessDays, zoomLevel) => {
    const base = generateBusinessDays(startDate, totalBusinessDays);
    if (zoomLevel.name === "daily") {
      return base.map(d => ({ ...d, isGroup:false, groupSize:1, label: formatDateForZoom(d.date, "daily") }));
    }
    const groups = [];
    if (zoomLevel.name === "weekly" || zoomLevel.name === "biweekly") {
      let currentIndex = 0;
      while (currentIndex < base.length) {
        const currentDate = base[currentIndex].date;
        const dayOfWeek = currentDate.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(currentDate);
        monday.setDate(monday.getDate() + mondayOffset);
        const periodLength = zoomLevel.name === "weekly" ? 5 : 10;
        const slice = base.slice(currentIndex, currentIndex + periodLength);
        if (!slice.length) break;
        const first = slice[0];
        const last = slice[slice.length - 1];
        groups.push({
          date: monday,
          dateString: monday.toISOString().split("T")[0],
          businessDayIndex: first.businessDayIndex,
          isToday: slice.some(x => x.isToday),
          isHoliday: slice.some(x => x.isHoliday),
          holidayName: slice.find(x => x.isHoliday)?.holidayName,
          isGroup: true,
          groupSize: slice.length,
          groupEnd: last.date,
          label: formatDateForZoom(monday, zoomLevel.name, last.date)
        });
        currentIndex += periodLength;
      }
    } else {
      for (let i = 0; i < base.length; i += zoomLevel.unit) {
        const slice = base.slice(i, i + zoomLevel.unit);
        const first = slice[0], last = slice[slice.length - 1];
        groups.push({
          date: first.date,
          dateString: first.dateString,
          businessDayIndex: first.businessDayIndex,
          isToday: slice.some(x => x.isToday),
          isHoliday: slice.some(x => x.isHoliday),
          holidayName: slice.find(x => x.isHoliday)?.holidayName,
          isGroup: true,
          groupSize: slice.length,
          groupEnd: last.date,
          label: formatDateForZoom(first.date, zoomLevel.name, last.date)
        });
      }
    }
    return groups;
  };

  const calculateEndDate = (startDate, workingDays, hols = holidays, skipHolidays = true) => {
    let d = new Date(startDate);
    let added = 0;
    const holidaySet = new Set((hols || []).map((h) => h.date));
    while (added < workingDays) {
      const dow = d.getDay();
      const ymd = d.toISOString().split("T")[0];
      const weekday = dow >= 1 && dow <= 5;
      const isHol = holidaySet.has(ymd);
      if (weekday && (!skipHolidays || !isHol)) added++;
      if (added < workingDays) d.setDate(d.getDate() + 1);
    }
    return d;
  };

  /* ======================
     PROJECT DATE HELPERS
     ====================== */
  const getProjectStartDate = () => {
    if (!phases.length) return null;
    const earliest = phases.reduce((e,p)=> p.startBusinessDay < e.startBusinessDay ? p : e);
    return businessDayToDate(earliest.startBusinessDay, holidays, true, BUSINESS_DAY_BASE_DATE);
  };

  const getProjectEndDate = () => {
    if (!phases.length) return null;
    const last = phases.reduce((l, p) => {
      const curEnd = p.startBusinessDay + p.workingDays;
      const lastEnd = l.startBusinessDay + l.workingDays;
      return curEnd > lastEnd ? p : l;
    });
    return calculateEndDate(
      businessDayToDate(last.startBusinessDay, holidays, true, BUSINESS_DAY_BASE_DATE),
      last.workingDays,
      holidays,
      last.skipHolidays
    );
  };

  const formatDateElegant = (date) => {
    if (!date) return "—";
    const dd = date.getDate();
    const mm = date.toLocaleDateString("en-US", { month: "short" });
    const yy = date.getFullYear();
    const suf = (d) =>
      d > 3 && d < 21 ? "th" : (["th", "st", "nd", "rd"][Math.min(d % 10, 4)] || "th");
    return `${dd}${suf(dd)} ${mm} ${yy}`;
  };

  const calculateProjectDuration = () => {
    const s = getProjectStartDate(), e = getProjectEndDate();
    if (!s || !e) return null;
    const s0 = new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime();
    const e0 = new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime();
    const total = Math.max(1, Math.round((e0 - s0) / 86400000) + 1);

    if (total < 5) return { total, formatted: `${total} day${total !== 1 ? "s" : ""}` };
    if (total <= 28) {
      const weeks = Math.floor(total / 7);
      const days = total % 7;
      const parts = [];
      if (weeks) parts.push(`${weeks} week${weeks > 1 ? "s" : ""}`);
      if (days) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
      return { total, formatted: parts.join(" ") };
    }
    const months = Math.floor(total / 30);
    const remainingAfterMonths = total % 30;
    const weeks = Math.floor(remainingAfterMonths / 7);
    const days = remainingAfterMonths % 7;

    const parts = [];
    if (months) parts.push(`${months} month${months > 1 ? "s" : ""}`);
    if (weeks) parts.push(`${weeks} week${weeks > 1 ? "s" : ""}`);
    if (days) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
    return { total, formatted: parts.join(" ") };
  };

  const calculatePhasePersonDays = (phase) =>
    (phase?.resources || []).reduce(
      (sum, r) => sum + Math.round((phase.workingDays * (r.allocation || 0)) / 100),
      0
    );

  const calculateTotalPersonDays = () =>
    phases.reduce(
      (t, p) =>
        t +
        (p.resources || []).reduce(
          (pt, r) => pt + Math.round((p.workingDays * (r.allocation || 0)) / 100),
          0
        ),
      0
    );

  /* ======================
     PATCH 2: Holiday range
     ====================== */
const getHolidaysInRange = () => {
  if (!phases.length) return [];

  const startDate = getProjectStartDate();
  const endDate = getProjectEndDate();

  if (!startDate || !endDate) return [];

  return holidays.filter(holiday => {
    const holidayDate = new Date(holiday.date);
    return holidayDate >= startDate && holidayDate <= endDate;
  });
};

  /* ==========================
     COSTING / OPE / BLENDED
     ========================== */
  const calculateResourceOPE = (resource, phase, projectLoc = projectLocation) => {
    if (!resource?.includeOPE) return 0;
    const region = resource.region || "ABMY";
    const rates = OPE_RATES[region] || OPE_RATES.ABMY;
    const workingDays = Math.round((phase.workingDays * (resource.allocation || 0)) / 100);
    let opeTotal = 0;
    if (projectLoc.isRemote) return 0;

    if (projectLoc.distanceFromKL <= 2) {
      opeTotal += workingDays * rates.parking; // parking
      opeTotal += workingDays * 50;            // local travel allowance
    } else {
      if (projectLoc.requiresFlights) {
        opeTotal += rates.flightDomestic; // return flight
        opeTotal += rates.taxiAirport;    // airport transfers
      } else {
        opeTotal += projectLoc.distanceFromKL * 100 * rates.carMileage * 2;
      }
      const nights = Math.max(1, workingDays - 1);
      opeTotal += nights * rates.hotelNight;
      opeTotal += workingDays * rates.perDiem;
    }
    return opeTotal;
  };

  const calculatePhaseCost = (phase, projectBaseCurrency = selectedCatalogRegion) => {
    return (phase.resources || []).reduce((sum, r) => {
      const pd = Math.round((phase.workingDays * (r.allocation || 0)) / 100);
      const dailyRateLocal = (r.hourlyRate || 0) * 8;
      const localCost = pd * dailyRateLocal;
      const opeLocal = calculateResourceOPE(r, phase);
      const totalLocal = localCost + opeLocal;
      const converted = convertCurrency(totalLocal, r.region || "ABMY", projectBaseCurrency);
      return sum + converted;
    }, 0);
  };

  const calculateProjectCost = (customPhases = null, base = selectedCatalogRegion) =>
    (customPhases || phases).reduce((t, p) => t + calculatePhaseCost(p, base), 0);

  const calculateBlendedRate = () => {
    const totalCost = calculateProjectCost(phases, selectedCatalogRegion);
    const totalDays = calculateTotalPersonDays();
    return totalDays > 0 ? totalCost / totalDays : 0;
  };

  /* ==========================
     NOTIFICATIONS / ERRORS
     ========================== */
  const [errors, setErrors] = useState({});
  const [notifications, setNotifications] = useState([]);
  const addNotification = (message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  };

  {/* SAP Scope Modal */}

  const NotificationStack = () => (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }}
    >
      {notifications.map((n) => (
        <div
          key={n.id}
          style={{
            background:
              n.type === "error"
                ? "var(--danger)"
                : n.type === "success"
                ? "var(--success)"
                : "var(--primary)",
            color: "#fff",
            padding: "12px 16px",
            borderRadius: 10,
            boxShadow: "var(--shadow-medium)",
            maxWidth: 420,
            animation: "slideInRight .3s ease-out"
          }}
        >
          {n.message}
        </div>
      ))}
    </div>
  );

  /* ==========================
     SCHEDULING / SEQUENCING
     ========================== */
  const getCategoryColor = (category) => {
    const colorMap = {
      Configuration: "#007AFF",
      "Advanced Configuration": "#5856D6",
      "HR Setup": "#34C759",
      "SCM Setup": "#FF9500",
      Technical: "#FF3B30",
      "Change Management": "#8E8E93",
      "Project Management": "#8E8E93",
      Foundation: "#5AC8FA"
    };
    return colorMap[category] || "#007AFF";
  };
  const darken = (hex, amt = 0.2) => {
    const n = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, Math.floor(((n >> 16) & 255) * (1 - amt)));
    const g = Math.max(0, Math.floor(((n >> 8) & 255) * (1 - amt)));
    const b = Math.max(0, Math.floor((n & 255) * (1 - amt)));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  };
  const colorVars = (c) => ({ "--phase-color": c, "--phase-color-dark": darken(c) });

  const SAP_CATALOG = {
    Finance_1: {
      id: "Finance_1",
      name: "Financial Master Data Management",
      description: "Foundation for all financial reporting - chart of accounts, cost centers, profit centers",
      mandays: 193,
      category: "Finance Core"
    },
    Finance_2: {
      id: "Finance_2",
      name: "Procurement & Inventory Accounting",
      description: "Automate procurement approvals, vendor payments, and inventory valuation",
      mandays: 90,
      category: "Finance Core"
    },
    Finance_21: {
      id: "Finance_21",
      name: "Project & Resource Management",
      description: "Track project costs, resource allocation, and profitability analysis",
      mandays: 129,
      category: "Finance Advanced"
    },
    HCM_1: {
      id: "HCM_1",
      name: "Core HR (EC)",
      description: "Central employee database, organizational management, personnel administration",
      mandays: 180,
      category: "HR Core"
    },
    SCM_2: {
      id: "SCM_2",
      name: "Plan to Fulfil",
      description: "Demand planning, production scheduling, inventory optimization",
      mandays: 257,
      category: "Supply Chain"
    }
  };

  const BUSINESS_CATEGORIES = {
    "Finance Core": { description: "Essential financial management capabilities", icon: "💰", packages: ["Finance_1", "Finance_2"] },
    "Finance Advanced": { description: "Enhanced financial features for complex organizations", icon: "📊", packages: ["Finance_21"] },
    "HR Core": { description: "Employee management and payroll processing", icon: "👥", packages: ["HCM_1"] },
    "Supply Chain": { description: "Production planning and inventory management", icon: "🏭", packages: ["SCM_2"] }
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

  const computeTeamSize = (sapPackage, profile) => {
    const baseByCategory = {
      "Finance Core": 5, "Finance Advanced": 4, "HR Core": 5, "Supply Chain": 6,
      Configuration: 5, "Advanced Configuration": 4, "HR Setup": 5, "SCM Setup": 6
    };
    const sizeMap = { small: 0.8, medium: 1.0, large: 1.3, enterprise: 1.6 };
    const complexityMap = { low: 0.9, standard: 1.0, high: 1.2, extreme: 1.4 };
    const timelineMap = { relaxed: 0.9, normal: 1.0, aggressive: 1.2 };

    const cat = sapPackage.category || "Configuration";
    const base = baseByCategory[cat] || 5;
    const size = profile?.size || "medium";
    const complexity = profile?.complexity || "standard";
    const timeline = profile?.timeline || "normal";

    const team = Math.round(
      base * (sizeMap[size] || 1) * (complexityMap[complexity] || 1) * (timelineMap[timeline] || 1)
    );
    return Math.max(2, Math.min(12, team));
  };

  const calculateResourceRequirements = (sapPackage, profile) => {
    const teamSize = computeTeamSize(sapPackage, profile);
    const mixes = {
      "Finance Core": ["Manager", "Senior Consultant", "Senior Consultant", "Consultant", "Analyst"],
      "Finance Advanced": ["Manager", "Senior Consultant", "Consultant", "Analyst"],
      "HR Core": ["Manager", "Senior Consultant", "Consultant", "Analyst", "Analyst"],
      "Supply Chain": ["Manager", "Senior Consultant", "Senior Consultant", "Consultant", "Consultant", "Analyst"],
      Configuration: ["Manager", "Senior Consultant", "Consultant", "Analyst", "Analyst"],
      "Advanced Configuration": ["Manager", "Senior Consultant", "Consultant", "Analyst"],
      "HR Setup": ["Manager", "Senior Consultant", "Consultant", "Analyst", "Analyst"],
      "SCM Setup": ["Manager", "Senior Consultant", "Senior Consultant", "Consultant", "Consultant", "Analyst"]
    };
    const baseMix = mixes[sapPackage.category] || mixes["Configuration"];
    const region = profile?.region || "ABMY";
    const allocations = [100, 100, 80, 60, 60, 50, 50, 40];

    const chosen = [];
    for (let i = 0; i < teamSize; i++) {
      const role = baseMix[i % baseMix.length];
      const rate = RESOURCE_CATALOG[region]?.positions[role]?.rate || 0;
      chosen.push({
        id: Date.now() + i + Math.random(),
        name: `${role} ${i + 1}`,
        role,
        allocation: allocations[i % allocations.length],
        region,
        hourlyRate: rate
      });
    }
    return chosen;
  };

  const buildFoundationPhases = (profile) => {
    const region = profile?.region || "ABMY";
    const foundation = [
      { key: "Project Kickoff", name: "Project Kickoff", workingDays: 2, category: "Foundation" },
      { key: "System Landscape Setup", name: "System Landscape Setup", workingDays: 3, category: "Foundation" },
      { key: "Organizational Setup", name: "Organizational Setup", workingDays: 3, category: "Foundation" },
      { key: "Master Data Setup", name: "Master Data Setup", workingDays: 5, category: "Foundation" },
      { key: "Security Roles", name: "Security Roles", workingDays: 2, category: "Foundation" },
      { key: "Organizational Structure", name: "Organizational Structure", workingDays: 3, category: "Foundation" }
    ];
    return foundation.map((f, idx) => ({
      id: `FND_${idx}_${Date.now()}`,
      name: f.name,
      phaseKey: f.key,
      status: "idle",
      startBusinessDay: 0,
      workingDays: f.workingDays,
      color: getCategoryColor("Foundation"),
      description: "Foundation workstream",
      skipHolidays: true,
      resources: calculateResourceRequirements({ category: "Configuration" }, { ...profile, region }),
      category: "Foundation",
      dependencies: []
    }));
  };

  const calculateIntelligentSequencing = (allPhases) => {
    const nodes = {};
    allPhases.forEach((p) => {
      const key = p.phaseKey || p.name;
      nodes[key] = { ...p, phaseKey: key, deps: (p.dependencies || []).slice() };
    });

    const indeg = {};
    Object.values(nodes).forEach((n) => (indeg[n.phaseKey] = 0));
    Object.values(nodes).forEach((n) =>
      n.deps.forEach((d) => { if (nodes[d]) indeg[n.phaseKey]++; })
    );

    const queue = [];
    Object.keys(indeg).forEach((k) => { if (indeg[k] === 0) queue.push(k); });

    const earliestStart = {};
    Object.keys(nodes).forEach((k) => (earliestStart[k] = 0));

    const ordered = [];
    while (queue.length) {
      const k = queue.shift();
      ordered.push(k);
      const n = nodes[k];
      Object.values(nodes).forEach((m) => {
        if ((m.deps || []).includes(k)) {
          const depEnd = earliestStart[k] + (nodes[k].workingDays || 0);
          earliestStart[m.phaseKey] = Math.max(earliestStart[m.phaseKey] || 0, depEnd);
          indeg[m.phaseKey]--;
          if (indeg[m.phaseKey] === 0) queue.push(m.phaseKey);
        }
      });
    }

    if (ordered.length !== Object.keys(nodes).length) {
      let currentStart = 0;
      return Object.values(nodes).map((n) => {
        const out = { ...n, startBusinessDay: currentStart };
        currentStart += n.workingDays || 1;
        return out;
      });
    }

    return Object.values(nodes)
      .map((n) => ({ ...n, startBusinessDay: Math.max(0, Math.round(earliestStart[n.phaseKey] || 0)) }))
      .sort((a, b) => a.startBusinessDay - b.startBusinessDay || a.name.localeCompare(b.name));
  };

  const generatePMPhases = () => ([
    {
      id: Date.now() + Math.random(),
      name: "Project Initiation",
      phaseKey: "Project Initiation",
      status: "idle",
      startBusinessDay: 0,
      workingDays: 2,
      color: getCategoryColor("Project Management"),
      description: "Project setup, team onboarding, and stakeholder alignment",
      skipHolidays: true,
      resources: [
        {
          id: Date.now(),
          name: "Project Manager",
          role: "Manager",
          allocation: 100,
          region: "ABMY",
          hourlyRate: RESOURCE_CATALOG["ABMY"]?.positions["Manager"]?.rate || 750
        }
      ],
      category: "Project Management",
      dependencies: ["Project Kickoff"]
    }
  ]);

  const generateFRICEWPhases = (functionalPhases) => {
    const totalConfig = functionalPhases.filter((p) => String(p.category).includes("Configuration")).length;
    return [
      {
        id: Date.now() + Math.random(),
        name: "Reports & Analytics Development",
        phaseKey: "Reports & Analytics Development",
        status: "idle",
        startBusinessDay: 10,
        workingDays: Math.max(3, Math.round(totalConfig * 2)),
        color: getCategoryColor("Technical"),
        description: "Custom reports and analytics development",
        skipHolidays: true,
        resources: calculateResourceRequirements({ category: "Configuration" }, clientProfile || { region: "ABMY" }),
        category: "Technical",
        dependencies: ["Master Data Setup"]
      }
    ];
  };

  const generateChangeManagementPhases = () => ([
    {
      id: Date.now() + Math.random(),
      name: "Change Readiness & Training",
      phaseKey: "Change Readiness & Training",
      status: "idle",
      startBusinessDay: 15,
      workingDays: 5,
      color: getCategoryColor("Change Management"),
      description: "End user training and change management activities",
      skipHolidays: true,
      resources: calculateResourceRequirements({ category: "Configuration" }, clientProfile || { region: "ABMY" }),
      category: "Change Management",
      dependencies: ["Organizational Setup"]
    }
  ]);

  const generateTimelineFromSAPSelection = (selectedPackages, companyProfile) => {
    const profile = {
      companyName: companyProfile?.companyName || "",
      industry: companyProfile?.industry || "",
      region: companyProfile?.region || "ABMY",
      size: companyProfile?.size || "medium",
      complexity: companyProfile?.complexity || "standard",
      timeline: companyProfile?.timeline || "normal",
      employees: Number(companyProfile?.employees || 500),
      annualRevenueMYR: Number(companyProfile?.annualRevenueMYR || 200_000_000)
    };
    
    // ADD this transformation function:
    const foundation = buildFoundationPhases(profile);

    const functionalPhases = selectedPackages
      .map((pkgId) => {
        const sapPackage = SAP_CATALOG[pkgId];
        const mapping = SAP_TO_TIMELINE_MAPPING[pkgId];
        if (!sapPackage || !mapping) return null;

        const teamSize = computeTeamSize(sapPackage, profile);
        const workingDays = Math.max(1, Math.ceil((sapPackage.mandays || 5) / teamSize));

        return {
          id: Date.now() + Math.random(),
          name: mapping.phaseName,
          phaseKey: mapping.phaseName,
          status: "idle",
          startBusinessDay: 0,
          workingDays,
          color: getCategoryColor(mapping.category),
          description: sapPackage.description,
          skipHolidays: true,
          resources: calculateResourceRequirements(sapPackage, profile),
          sapPackageId: pkgId,
          category: mapping.category,
          dependencies: (mapping.dependencies || []).slice()
        };
      })
      .filter(Boolean);

    const pmPhases = generatePMPhases();
    const fricewPhases = generateFRICEWPhases(functionalPhases);
    const changePhases = generateChangeManagementPhases();

    const all = [...foundation, ...functionalPhases, ...pmPhases, ...fricewPhases, ...changePhases];
    const sequenced = calculateIntelligentSequencing(all);
    return { sequenced, profile };
  };

  const suggestAdditionalPackages = (selected, profile) => {
    const suggestions = new Set();
    const sel = new Set(selected);
    if (sel.has("Finance_1") && !sel.has("Finance_2")) suggestions.add("Finance_2");
    if (sel.has("Finance_21") && !sel.has("Finance_1")) suggestions.add("Finance_1");
    return Array.from(suggestions).filter((id) => SAP_CATALOG[id]);
  };

  const importSAPTimeline = (sapPackages, clientData) => {
    const { sequenced, profile } = generateTimelineFromSAPSelection(sapPackages, clientData);
    setPhases(sequenced);
    setSapSelection({ packages: sapPackages, clientData: profile });
    setClientProfile(profile);
    setRecommendations(suggestAdditionalPackages(sapPackages, profile));
    setOperatingMode("proposal_review");
    requestAnimationFrame(() => autoFitTimeline());
  };

  /* ==========================
     PHASE CRUD / LAYOUT
     ========================== */
  const addPhase = () => {
  const todayBusinessDay = dateToBusinessDay(new Date(), holidays, true, BUSINESS_DAY_BASE_DATE);
  const minStartDay = Math.max(todayBusinessDay, 0);

  const newPhase = {
    id: Date.now(),
    name: "New Phase",
    phaseKey: "New Phase",
    status: "idle",
    startBusinessDay: phases.length
      ? Math.max(minStartDay, ...phases.map((p) => p.startBusinessDay + p.workingDays))
      : minStartDay,
    workingDays: 5,
    color: "#007AFF",
    description: "",
    skipHolidays: true,
    resources: []
  };
  setPhases((p) => [...p, newPhase]);
  // Force timeline refresh after phase is added
  setTimeout(() => autoFitTimeline(), 50);
};
  const duplicatePhase = (id) => {
    const src = phases.find(p => p.id === id);
    if (!src) return;
    const dup = {
      ...src,
      id: Date.now() + Math.random(),
      name: src.name + " (Copy)",
      startBusinessDay: src.startBusinessDay + src.workingDays
    };
    setPhases(prev => [...prev, dup]);
    addNotification("Phase duplicated", "success", 2000);
  };

  const validatePhase = (phase) => {
    const errs = {};
    if (!phase.name?.trim()) errs.name = "Phase name is required";
    if (phase.workingDays < 1) errs.workingDays = "Working days must be at least 1";
    const todayBusinessDay = dateToBusinessDay(new Date(), holidays, true, BUSINESS_DAY_BASE_DATE);
    if (phase.startBusinessDay < todayBusinessDay) {
      errs.startBusinessDay = "Phase cannot start before today";
    }
    const totalAllocation = (phase.resources || []).reduce(
      (sum, r) => sum + (r.allocation || 0),
      0
    );
    if (totalAllocation > (phase.resources?.length ?? 0) * 100) {
      errs.resources = "Total resource allocation exceeds capacity";
    }
    return errs;
  };

  const updatePhase = (id, updates) => {
    const target = phases.find((p) => p.id === id);
    if (!target) return addNotification("Phase not found", "error");
    const updated = { ...target, ...updates };
    const v = validatePhase(updated);
    if (Object.keys(v).length) {
      setErrors((prev) => ({ ...prev, [id]: v }));
      addNotification("Please fix validation errors", "error");
      return;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setPhases((prev) => prev.map((p) => (p.id === id ? updated : p)));
    setTimeout(() => autoFitTimeline(), 0);
    addNotification("Phase updated", "success", 2500);
  };

  const deletePhase = (id) => {
    if (window.confirm("Delete this phase?")) {
      setPhases((prev) => prev.filter((p) => p.id !== id));
      closePhaseDetail();
    }
  };

  const openPhaseDetail = (p) => {
    setSelectedPhase(p);
    setDetailPanelOpen(true);
  };
  const closePhaseDetail = () => {
    setDetailPanelOpen(false);
    setTimeout(() => setSelectedPhase(null), 250);
  };

  /* ==========================
     TIMELINE MEASURE & ZOOM
     ========================== */
  const memoizedTimelineData = useMemo(() => {
    if (!phases.length) {
      const zoomLevel = { name: "daily", unit: 1, minWidth: 80, label: "Daily" };
      const totalBusinessDays = 30;
      const businessDays = generateZoomedBusinessDays(BUSINESS_DAY_BASE_DATE, totalBusinessDays, zoomLevel);
      const todayIndex = businessDays.findIndex((d) => d.isToday);
      window.timelineStartOffset = 0;
      window.currentZoomLevel = zoomLevel;
      document.documentElement.style.setProperty("--unit-width", "80px");
      return { businessDays, totalBusinessDays, todayIndex, zoomLevel, startOffset: 0 };
    }

    const minStart = Math.min(...phases.map((p) => p.startBusinessDay));
    const maxEnd = Math.max(...phases.map((p) => p.startBusinessDay + p.workingDays));
    const startOffset = Math.max(0, minStart - 2);
    const totalSpan = Math.max(1, maxEnd - minStart);
    const paddedSpan = Math.max(totalSpan + 4, 10);

    const container = document.querySelector(".timeline-body");
    const containerWidth = container ? container.clientWidth - 48 : 900;
    const zoomLevel = getOptimalZoomLevel(paddedSpan, containerWidth);

    window.timelineStartOffset = startOffset;
    window.currentZoomLevel = zoomLevel;

    const businessDays = generateZoomedBusinessDays(BUSINESS_DAY_BASE_DATE, Math.max(15, maxEnd - startOffset + 5), zoomLevel);
    return { businessDays, totalBusinessDays: Math.max(15, maxEnd - startOffset + 5), todayIndex: businessDays.findIndex(d=>d.isToday), zoomLevel, startOffset };
  }, [phases, holidays]);

  const autoFitTimeline = useCallback(() => {
    const bodyScroll = document.querySelector(".timeline-body");
    if (!bodyScroll) return;

    if (!phases.length) {
      window.currentZoomLevel = { name: "daily", unit: 1, minWidth: 80, label: "Daily" };
      window.timelineStartOffset = 0;
      document.documentElement.style.setProperty("--unit-width", "80px");
      return;
    }

    const containerWidth = bodyScroll.clientWidth - 48;
    const minStart = Math.min(...phases.map((p) => p.startBusinessDay));
    const maxEnd = Math.max(...phases.map((p) => p.startBusinessDay + p.workingDays));
    const contentSpan = Math.max(1, maxEnd - minStart);
    const paddedSpan = Math.max(contentSpan + 4, 10);

    const zoomLevel = getOptimalZoomLevel(paddedSpan, containerWidth);
    const unitCount = Math.ceil(paddedSpan / zoomLevel.unit);
    const unitWidth = Math.max(zoomLevel.minWidth, Math.floor(containerWidth / unitCount));

    window.currentZoomLevel = zoomLevel;
    window.timelineStartOffset = Math.max(0, minStart - 2);
    document.documentElement.style.setProperty("--unit-width", `${unitWidth}px`);
  }, [phases]);

  useEffect(() => {
    const t = setTimeout(() => autoFitTimeline(), 120);
    return () => clearTimeout(t);
  }, [phases, autoFitTimeline]);

  useEffect(() => {
    if (selectedPhase) {
      const fresh = phases.find((p) => p.id === selectedPhase.id);
      if (fresh) setSelectedPhase(fresh);
    }
  }, [phases]); // eslint-disable-line

  useEffect(() => {
    // Backfill missing hourly rates based on role/region
    const needs = phases.some((p) =>
      (p.resources || []).some((r) => !r.hourlyRate && r.region && r.role)
    );
    if (needs) {
      setPhases((prev) =>
        prev.map((p) => ({
          ...p,
          resources: (p.resources || []).map((r) => {
            if (!r.hourlyRate && r.region && r.role) {
              const rate = RESOURCE_CATALOG[r.region]?.positions[r.role]?.rate || 0;
              return { ...r, hourlyRate: rate };
            }
            return r;
          })
        }))
      );
    }
  }, [phases]); // eslint-disable-line

  useEffect(() => {
  // Force timeline refresh when holidays change
  if (phases.length > 0) {
    const t = setTimeout(() => autoFitTimeline(), 50);
    return () => clearTimeout(t);
  }
}, [holidays, autoFitTimeline]);

// Add this useEffect to clean up any existing holidays without names
useEffect(() => {
  const hasInvalidHolidays = holidays.some(h => !h.name || h.name.trim() === '');
  if (hasInvalidHolidays) {
    setHolidays(prev => 
      prev.map(h => ({
        ...h,
        name: (h.name && h.name.trim()) || `Holiday on ${formatDateElegant(new Date(h.date))}`
      }))
    );
  }
}, [holidays]);

  // Add keyboard shortcut for client mode toggle
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setClientPresentationMode(!clientPresentationMode);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [clientPresentationMode]);

  const getPhasePosition = (phase) => {
    const unitWidth =
      parseInt(getComputedStyle(document.documentElement).getPropertyValue("--unit-width")) || 80;
    const zoomLevel = window.currentZoomLevel || { unit: 1 };
    const offset = window.timelineStartOffset ?? 0;
    const relativeStart = Math.max(0, phase.startBusinessDay - offset);
    const left = Math.floor(relativeStart / zoomLevel.unit) * unitWidth;
    const width = Math.ceil(phase.workingDays / zoomLevel.unit) * unitWidth;
    return { left: `${left}px`, width: `${Math.max(unitWidth * 0.8, width)}px` };
  };

  /* ==========================
     HELPERS FOR RENDER
     ========================== */
  const initials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const avgAllocation = (resources = []) =>
    resources.length
      ? Math.round(resources.reduce((s, r) => s + (r.allocation || 0), 0) / resources.length)
      : 0;

  /* ==========================
     SUGGESTIONS
     ========================== */
  const [suggestions, setSuggestions] = useState([]);
  useEffect(() => {
    const next = [];
    if (!phases.length)
      next.push({
        id: "first-phase",
        icon: "🚀",
        title: "Start your project",
        text: "Create your first phase to begin planning",
        action: "Create Phase",
        onAction: () => addPhase()
      });
    setSuggestions(next);
  }, [phases.length]);

  const dismissSuggestion = (id) =>
    setSuggestions((prev) => prev.filter((s) => s.id !== id));

  /* ==========================
     CSV EXPORT
     ========================== */
  const exportToCSV = () => {
    if (!phases.length) return;
    const startDate = getProjectStartDate();
    const endDate = getProjectEndDate();
    if (!startDate || !endDate) return;

    const weeks = [];
    let currentWeek = new Date(startDate);
    currentWeek.setDate(currentWeek.getDate() - ((currentWeek.getDay() + 6) % 7)); // back to Monday
    while (currentWeek <= endDate) {
      const weekEnd = new Date(currentWeek);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weeks.push({
        start: new Date(currentWeek),
        end: weekEnd,
        label: `${currentWeek.getDate()}/${currentWeek.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`
      });
      currentWeek.setDate(currentWeek.getDate() + 7);
    }

    const roleSet = new Set();
    phases.forEach((phase) => {
      (phase.resources || []).forEach((resource) => {
        if (resource.role) roleSet.add(resource.role);
      });
    });
    const roles = Array.from(roleSet).sort();

    const csvData = [];
    const headers = ["Role", ...weeks.map((w) => w.label)];
    csvData.push(headers);

    roles.forEach((role) => {
      const row = [role];
      weeks.forEach((week) => {
        let weeklyPersonDays = 0;
        phases.forEach((phase) => {
          const phaseStart = businessDayToDate(phase.startBusinessDay, holidays, true, BUSINESS_DAY_BASE_DATE);
          const phaseEnd = calculateEndDate(
            phaseStart,
            phase.workingDays,
            holidays,
            phase.skipHolidays
          );
          if (phaseStart <= week.end && phaseEnd >= week.start) {
            (phase.resources || []).forEach((resource) => {
              if (resource.role === role) {
                const overlapStart = new Date(Math.max(phaseStart.getTime(), week.start.getTime()));
                const overlapEnd = new Date(Math.min(phaseEnd.getTime(), week.end.getTime()));
                const overlapDays = Math.max(0, Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1);
                const businessDaysInOverlap = Math.min(overlapDays, 5);
                const personDays = (businessDaysInOverlap * (resource.allocation || 0)) / 100;
                weeklyPersonDays += personDays;
              }
            });
          }
        });
        row.push(weeklyPersonDays.toFixed(1));
      });
      csvData.push(row);
    });

    const csvContent = csvData
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `project_timeline_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ==========================
     RESOURCE HANDLERS
     ========================== */
  const updateResource = (phaseId, resId, updates) => {
    setPhases((prev) =>
      prev.map((p) =>
        p.id === phaseId
          ? {
              ...p,
              resources: (p.resources || []).map((r) =>
                r.id === resId ? { ...r, ...updates } : r
              )
            }
          : p
      )
    );
  };

  /* ==========================
     PATCH 5: SAP PACKAGE SELECTOR
     ========================== */

  /* ==========================
     Project Location Setup Modal
     ========================== */
  const ProjectLocationModal = () => {
    const [localProjectLocation, setLocalProjectLocation] = useState(projectLocation);
    useEffect(() => {
      if (projectLocationOpen) setLocalProjectLocation(projectLocation);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectLocationOpen]);

    if (!projectLocationOpen) return null;

    const saveProjectLocation = () => {
      setProjectLocation(localProjectLocation);
      setProjectLocationOpen(false);
      addNotification("Project location updated", "success", 2000);
    };

    return (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.6)", zIndex: 10000,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20
      }}>
        <div style={{
          background: "white", borderRadius: 16, width: "90vw", maxWidth: 600,
          padding: "24px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
        }}>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ margin: "0 0 8px 0", fontSize: 22, fontWeight: 900 }}>Project Location Setup</h2>
            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 13 }}>
              Configure project location to automatically calculate Out-of-Pocket Expenses (OPE)
            </p>
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label className="form-label">Client City</label>
                <input
                  className="form-input"
                  placeholder="e.g., Kuala Lumpur, Penang, Singapore"
                  value={localProjectLocation.city}
                  onChange={(e) => setLocalProjectLocation({...localProjectLocation, city: e.target.value})}
                />
              </div>
              <div>
                <label className="form-label">Distance from KL (hours by car)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  step="0.5"
                  value={localProjectLocation.distanceFromKL}
                  onChange={(e) => setLocalProjectLocation({...localProjectLocation, distanceFromKL: Number(e.target.value)})}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Project Address</label>
              <input
                className="form-input"
                placeholder="Full address for OPE calculation"
                value={localProjectLocation.address}
                onChange={(e) => setLocalProjectLocation({...localProjectLocation, address: e.target.value})}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={localProjectLocation.requiresFlights}
                  onChange={(e) => setLocalProjectLocation({...localProjectLocation, requiresFlights: e.target.checked})}
                />
                Requires flights (over 4 hours drive or international)
              </label>
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={localProjectLocation.isRemote}
                  onChange={(e) => setLocalProjectLocation({...localProjectLocation, isRemote: e.target.checked})}
                />
                Fully remote project (no OPE)
              </label>
            </div>

            {/* OPE Preview */}
            {!clientPresentationMode && (
              <div style={{
                padding: "12px",
                background: "linear-gradient(135deg, #F8FAFF 0%, #F0F4FF 100%)",
                borderRadius: "8px",
                border: "1px solid rgba(0,122,255,0.1)"
              }}>
                <div style={{ fontWeight: 700, marginBottom: "8px", fontSize: "14px" }}>OPE Preview (per consultant per day):</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {localProjectLocation.isRemote ? (
                    "No OPE for remote work"
                  ) : localProjectLocation.distanceFromKL <= 2 ? (
                    `Within KL: ~${formatCurrency(70, selectedCatalogRegion)}/day (parking + travel)`
                  ) : (
                    `Outside KL: ~${formatCurrency(450, selectedCatalogRegion)}/day (accommodation + travel + per diem)`
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
            <button className="secondary-action" onClick={() => setProjectLocationOpen(false)}>
              Cancel
            </button>
            <button className="primary-action" onClick={saveProjectLocation}>
              Save Location
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ==========================
     RESOURCE MANAGEMENT MODAL
     ========================== */
  const ResourceManagementModal = () => {
    if (!resourceManagementOpen || !selectedPhase) return null;

    const [localResources, setLocalResources] = useState(selectedPhase?.resources || []);
    const [selectedTemplate, setSelectedTemplate] = useState("");

    const teamTemplates = {
      "finance-small": {
        name: "Finance Team (Small)",
        resources: [
          { role: "Manager", region: selectedCatalogRegion, allocation: 50 },
          { role: "Senior Consultant", region: selectedCatalogRegion, allocation: 100 },
          { role: "Consultant", region: selectedCatalogRegion, allocation: 80 },
          { role: "Analyst", region: selectedCatalogRegion, allocation: 60 }
        ]
      },
      "scm-standard": {
        name: "SCM Team (Standard)",
        resources: [
          { role: "Senior Manager", region: selectedCatalogRegion, allocation: 40 },
          { role: "Senior Consultant", region: selectedCatalogRegion, allocation: 100 },
          { role: "Senior Consultant", region: selectedCatalogRegion, allocation: 100 },
          { role: "Consultant", region: selectedCatalogRegion, allocation: 80 },
          { role: "Consultant", region: selectedCatalogRegion, allocation: 60 }
        ]
      },
      "technical-heavy": {
        name: "Technical Team (Heavy)",
        resources: [
          { role: "Manager", region: selectedCatalogRegion, allocation: 30 },
          { role: "Senior Consultant", region: selectedCatalogRegion, allocation: 100 },
          { role: "Senior Consultant", region: selectedCatalogRegion, allocation: 100 },
          { role: "Consultant", region: selectedCatalogRegion, allocation: 100 },
          { role: "Consultant", region: selectedCatalogRegion, allocation: 80 },
          { role: "Analyst", region: selectedCatalogRegion, allocation: 60 }
        ]
      }
    };

    const applyTemplate = (key) => {
      setSelectedTemplate(key);
      const template = teamTemplates[key];
      const newResources = template.resources.map((r, i) => ({
        id: Date.now() + i,
        name: `${r.role} ${i + 1}`,
        role: r.role,
        region: r.region,
        allocation: r.allocation,
        hourlyRate: RESOURCE_CATALOG[r.region]?.positions[r.role]?.rate || 0,
        includeOPE: false
      }));
      setLocalResources(newResources);
    };

    const addResourceRow = () => {
      const region = selectedCatalogRegion;
      const defaultPos = Object.keys(RESOURCE_CATALOG[region].positions)[0];
      const defaultRate = RESOURCE_CATALOG[region].positions[defaultPos]?.rate || 0;
      const newResource = {
        id: Date.now(),
        name: `Team Member ${localResources.length + 1}`,
        role: defaultPos,
        region,
        allocation: 80,
        hourlyRate: defaultRate,
        includeOPE: false
      };
      setLocalResources((prev) => [...prev, newResource]);
    };

    const updateLocalResource = (id, updates) => {
      setLocalResources((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    };

    const deleteLocalResource = (id) => {
      setLocalResources((prev) => prev.filter((r) => r.id !== id));
    };

    const saveChanges = () => {
      updatePhase(selectedPhase.id, { resources: localResources });
      setResourceManagementOpen(false);
    };

    // Modal totals include OPE
    const totalCost = localResources.reduce((sum, r) => {
      const pd = Math.round((selectedPhase.workingDays * (r.allocation || 0)) / 100);
      const dailyRate = (r.hourlyRate || 0) * 8;
      const localCost = pd * dailyRate;
      const opeLocal = calculateResourceOPE(r, selectedPhase);
      const totalLocal = localCost + opeLocal;
      return sum + convertCurrency(totalLocal, r.region || "ABMY", selectedCatalogRegion);
    }, 0);

    const totalPD = localResources.reduce(
      (sum, r) => sum + Math.round((selectedPhase.workingDays * (r.allocation || 0)) / 100),
      0
    );

    return (
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 16,
            width: "90vw",
            maxWidth: 1200,
            height: "85vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
          }}
        >
{/* Header */}
<div
  style={{
    padding: "20px 28px",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }}
>
  <div>
    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Team Management</h2>
    <p style={{ margin: "4px 0 0 0", color: "var(--text-secondary)", fontSize: 13 }}>
      {selectedPhase.name} • {selectedPhase.workingDays} days
    </p>
    {selectedCatalogRegion !== "ABMY" && (
      <div style={{ 
        marginTop: "8px", 
        fontSize: "12px", 
        color: "var(--warning)",
        background: "rgba(255,149,0,0.1)",
        padding: "4px 8px",
        borderRadius: "4px",
        border: "1px solid rgba(255,149,0,0.3)"
      }}>
        ⚠️ Non-ABMY resources may have inaccurate rates
      </div>
    )}
  </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ textAlign: "right" }}>
                {!clientPresentationMode && (
                  <div style={{ fontSize: 18, fontWeight: 900, color: "var(--primary)" }}>
                    {formatCurrency(totalCost, selectedCatalogRegion, { abbreviate: true })}
                  </div>
                )}
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{totalPD} person-days</div>
              </div>
              <button className="secondary-action" onClick={() => setResourceManagementOpen(false)}>
                Cancel
              </button>
              <button className="primary-action" onClick={saveChanges}>
                Save Changes
              </button>
              {!clientPresentationMode && (
                <button 
                  className="secondary-action" 
                  onClick={() => setProjectLocationOpen(true)}
                  style={{ marginLeft: "8px" }}
                >
                  Project Location / OPE
                </button>
              )}
            </div>
          </div>

          {/* Templates */}
          <div
            style={{
              padding: "12px 28px",
              background: "linear-gradient(135deg, #F8FAFF 0%, #F0F4FF 100%)",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap"
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-secondary)" }}>
              QUICK TEAMS:
            </span>
            {Object.entries(teamTemplates).map(([key, template]) => (
              <button
                key={key}
                onClick={() => applyTemplate(key)}
                className="secondary-action"
                style={{
                  borderColor: selectedTemplate === key ? "var(--primary)" : "var(--border)",
                  color: selectedTemplate === key ? "var(--primary)" : "var(--text-primary)"
                }}
              >
                {template.name}
              </button>
            ))}
            <button onClick={addResourceRow} className="primary-action" style={{ marginLeft: "auto" }}>
              + Add Individual
            </button>
          </div>

          {/* Grid */}
          <div style={{ flex: 1, overflow: "auto", padding: "0 28px" }}>
            {/* Header row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: clientPresentationMode 
                  ? "2fr 1.5fr 80px 100px 100px 60px"
                  : "2fr 1.5fr 1fr 80px 100px 100px 1fr 1fr 60px",
                gap: 12,
                padding: "14px 0",
                borderBottom: "2px solid var(--border)",
                fontSize: 12,
                fontWeight: 800,
                color: "var(--text-secondary)",
                position: "sticky",
                top: 0,
                background: "white",
                zIndex: 10
              }}
            >
              <div>NAME</div>
              <div>ROLE & REGION</div>
              {!clientPresentationMode && <div>RATE/HR</div>}
              <div>OPE</div>
              <div>ALLOC</div>
              <div>P-DAYS</div>
              {!clientPresentationMode && (
                <>
                  <div>PHASE COST</div>
                  <div>OPE PREVIEW</div>
                </>
              )}
              <div></div>
            </div>

            {/* Rows */}
            {localResources.map((resource) => {
              const pd = Math.round(
                (selectedPhase.workingDays * (resource.allocation || 0)) / 100
              );
              const dailyRate = (resource.hourlyRate || 0) * 8;
              const localCost = pd * dailyRate;
              const convertedCost = convertCurrency(
                localCost,
                resource.region || "ABMY",
                selectedCatalogRegion
              );
              const opeLocalPreview = calculateResourceOPE(resource, selectedPhase);
              const opeConvertedPreview = convertCurrency(
                opeLocalPreview,
                resource.region || "ABMY",
                selectedCatalogRegion
              );

              return (
                <div
                  key={resource.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: clientPresentationMode 
                      ? "2fr 1.5fr 80px 100px 100px 60px"
                      : "2fr 1.5fr 1fr 80px 100px 100px 1fr 1fr 60px",
                    gap: 12,
                    padding: "14px 0",
                    borderBottom: "1px solid var(--border)",
                    alignItems: "center"
                  }}
                >
<input
  className="form-input"
  value={resource.name || ""}
  onChange={(e) => updateLocalResource(resource.id, { name: e.target.value })}
  placeholder="Team member name"
  style={{ width: "100%" }}
/>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <RolePicker
                        selectedRole={resource.role}
                        selectedRegion={resource.region}
                        onSelect={(role, region, rate) =>
                          updateLocalResource(resource.id, {
                            role, region, hourlyRate: rate
                          })
                        }
                        RESOURCE_CATALOG={RESOURCE_CATALOG}
                        formatCurrency={formatCurrency}
                      />
                    </div>
                  </div>
                  {!clientPresentationMode && (
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      value={resource.hourlyRate || 0}
                      onChange={(e) => updateLocalResource(resource.id, { hourlyRate: Number(e.target.value) || 0 })}
                    />
                  )}
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={!!resource.includeOPE}
                    onChange={(e) => updateLocalResource(resource.id, { includeOPE: e.target.checked })}
                    title="Include OPE for this resource"
                  />
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
  {/* Slider */}
  <input
    type="range"
    min="0"
    max="100"
    step="5"
    value={resource.allocation || 0}
    onChange={(e) => updateLocalResource(resource.id, { allocation: Number(e.target.value) })}
    style={{
      width: "100%",
      height: "6px",
      borderRadius: "3px",
      background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${resource.allocation || 0}%, var(--border) ${resource.allocation || 0}%, var(--border) 100%)`,
      outline: "none",
      cursor: "pointer",
      appearance: "none",
      WebkitAppearance: "none"
    }}
  />
  {/* Value display */}
  <div style={{ 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center",
    fontSize: "11px",
    color: "var(--text-secondary)"
  }}>
    <span>0%</span>
    <span style={{ 
      fontWeight: 800, 
      color: "var(--primary)",
      background: "rgba(0,122,255,0.1)",
      padding: "2px 6px",
      borderRadius: "4px",
      fontSize: "12px"
    }}>
      {resource.allocation || 0}%
    </span>
    <span>100%</span>
  </div>
</div>
                  <div style={{ fontWeight: 800 }}>
                    {pd}
                  </div>
                  {!clientPresentationMode && (
                    <>
                      <div style={{ fontWeight: 800, color: "var(--primary)" }}>
                        {formatCurrency(convertedCost, selectedCatalogRegion)}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        {resource.includeOPE ? `${formatCurrency(opeConvertedPreview, selectedCatalogRegion)} est.` : "—"}
                      </div>
                    </>
                  )}
                  <button className="secondary-action" onClick={() => deleteLocalResource(resource.id)}>✕</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

// Add this component before the main render function (around line 1500)

const ForexRateModal = () => {
  const [localCustomRates, setLocalCustomRates] = useState(customRates);
  const [localUseCustom, setLocalUseCustom] = useState(useCustomRates);
  
  if (!forexModalOpen) return null;

  const baseCurrency = selectedCatalogRegion;
  const targetCurrencies = CURRENCY_OPTIONS.filter(c => c !== baseCurrency);
  
  const saveRates = () => {
    setCustomRates(localCustomRates);
    setUseCustomRates(localUseCustom);
    setForexModalOpen(false);
    addNotification("Exchange rates updated", "success", 2000);
  };

  const resetToLive = () => {
    setLocalCustomRates({});
    setLocalUseCustom(false);
    addNotification("Reset to live rates", "success", 2000);
  };

  const getCurrentRate = (from, to) => {
    if (localUseCustom && localCustomRates[from]?.[to]) {
      return localCustomRates[from][to];
    }
    const rates = liveRates || FALLBACK_RATES;
    return rates[from]?.[to] || 1;
  };

  const updateCustomRate = (from, to, rate) => {
    setLocalCustomRates(prev => ({
      ...prev,
      [from]: {
        ...prev[from],
        [to]: parseFloat(rate) || 0
      }
    }));
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.7)",
      zIndex: 10000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      backdropFilter: "blur(8px)"
    }}>
      <div style={{
        background: "linear-gradient(145deg, #ffffff, #f8f9fa)",
        borderRadius: 24,
        width: "90vw",
        maxWidth: 800,
        maxHeight: "85vh",
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.5)",
        border: "1px solid rgba(255,255,255,0.8)"
      }}>
        {/* Elegant Header */}
        <div style={{
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          padding: "32px 40px",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          position: "relative"
        }}>
          <div style={{ textAlign: "center" }}>
            <h2 style={{
              margin: "0 0 8px 0",
              fontSize: "28px",
              fontWeight: 900,
              color: "#1d1d1f",
              letterSpacing: "-0.5px"
            }}>
              Exchange Rates
            </h2>
            <p style={{
              margin: 0,
              fontSize: "15px",
              color: "#6e6e73",
              fontWeight: 400,
              lineHeight: "1.4"
            }}>
              Configure custom exchange rates for {getCurrencyMeta(baseCurrency).code} conversions
            </p>
          </div>
          
          {/* Close button */}
          <button
            onClick={() => setForexModalOpen(false)}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "none",
              background: "rgba(0,0,0,0.05)",
              color: "#6e6e73",
              fontSize: "18px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(0,0,0,0.1)";
              e.target.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(0,0,0,0.05)";
              e.target.style.transform = "scale(1)";
            }}
          >
            ×
          </button>
        </div>

        {/* Toggle Section */}
        <div style={{
          padding: "24px 40px",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          background: "white"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            background: "linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)",
            borderRadius: "16px",
            border: "1px solid rgba(0,122,255,0.1)"
          }}>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#1d1d1f", marginBottom: "4px" }}>
                Custom Rate Override
              </div>
              <div style={{ fontSize: "13px", color: "#6e6e73" }}>
                {localUseCustom ? "Using your custom rates" : `Using ${ratesLastUpdated ? 'live' : 'fallback'} rates`}
              </div>
            </div>
            
            {/* iOS-style toggle */}
            <div
              onClick={() => setLocalUseCustom(!localUseCustom)}
              style={{
                width: "60px",
                height: "32px",
                borderRadius: "16px",
                background: localUseCustom ? "#007AFF" : "#e5e5e7",
                position: "relative",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                boxShadow: localUseCustom ? "0 0 20px rgba(0,122,255,0.3)" : "inset 0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "white",
                position: "absolute",
                top: "2px",
                left: localUseCustom ? "30px" : "2px",
                transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
              }} />
            </div>
          </div>
        </div>

        {/* Rates Grid */}
        <div style={{
          padding: "0 40px",
          maxHeight: "400px",
          overflowY: "auto",
          background: "white"
        }}>
          <div style={{
            padding: "24px 0",
            display: "grid",
            gap: "16px"
          }}>
            {targetCurrencies.map(targetCurrency => {
              const currentRate = getCurrentRate(baseCurrency, targetCurrency);
              const fromMeta = getCurrencyMeta(baseCurrency);
              const toMeta = getCurrencyMeta(targetCurrency);
              
              return (
                <div key={targetCurrency} style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr 1fr",
                  gap: "20px",
                  alignItems: "center",
                  padding: "20px 24px",
                  background: "linear-gradient(135deg, #fafafa 0%, #f5f5f7 100%)",
                  borderRadius: "16px",
                  border: "1px solid rgba(0,0,0,0.06)",
                  transition: "all 0.2s ease"
                }}>
                  {/* From Currency */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      fontSize: "24px",
                      fontWeight: 900,
                      color: "#1d1d1f",
                      marginBottom: "4px"
                    }}>
                      {fromMeta.symbol}1
                    </div>
                    <div style={{
                      fontSize: "12px",
                      color: "#6e6e73",
                      fontWeight: 600,
                      letterSpacing: "0.5px"
                    }}>
                      {fromMeta.code}
                    </div>
                  </div>

                  {/* Rate Input */}
                  <div style={{ position: "relative" }}>
                    <input
                      type="number"
                      step="0.0001"
                      placeholder={currentRate.toFixed(4)}
                      value={localCustomRates[baseCurrency]?.[targetCurrency] || ''}
                      onChange={(e) => updateCustomRate(baseCurrency, targetCurrency, e.target.value)}
                      disabled={!localUseCustom}
                      style={{
                        width: "100%",
                        padding: "16px 20px",
                        fontSize: "18px",
                        fontWeight: 600,
                        textAlign: "center",
                        border: localUseCustom ? "2px solid #007AFF" : "2px solid #e5e5e7",
                        borderRadius: "12px",
                        background: localUseCustom ? "white" : "#f5f5f7",
                        color: localUseCustom ? "#1d1d1f" : "#6e6e73",
                        outline: "none",
                        transition: "all 0.2s ease"
                      }}
                      onFocus={(e) => {
                        if (localUseCustom) {
                          e.target.style.borderColor = "#007AFF";
                          e.target.style.boxShadow = "0 0 0 4px rgba(0,122,255,0.1)";
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    
                    {/* Current rate indicator */}
                    <div style={{
                      position: "absolute",
                      bottom: "-20px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "11px",
                      color: "#6e6e73",
                      fontWeight: 500
                    }}>
                      Current: {currentRate.toFixed(4)}
                    </div>
                  </div>

                  {/* To Currency */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#6e6e73",
                      marginBottom: "4px"
                    }}>
                      {toMeta.symbol}
                    </div>
                    <div style={{
                      fontSize: "12px",
                      color: "#6e6e73",
                      fontWeight: 600,
                      letterSpacing: "0.5px"
                    }}>
                      {toMeta.code}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Bar */}
        <div style={{
          padding: "24px 40px 32px",
          background: "linear-gradient(180deg, white 0%, #fafafa 100%)",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          display: "flex",
          gap: "16px",
          justifyContent: "flex-end"
        }}>
          <button
            onClick={resetToLive}
            style={{
              padding: "14px 24px",
              fontSize: "15px",
              fontWeight: 600,
              border: "2px solid #e5e5e7",
              borderRadius: "12px",
              background: "white",
              color: "#6e6e73",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = "#007AFF";
              e.target.style.color = "#007AFF";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "#e5e5e7";
              e.target.style.color = "#6e6e73";
            }}
          >
            Reset to Live
          </button>
          
          <button
            onClick={saveRates}
            style={{
              padding: "14px 32px",
              fontSize: "15px",
              fontWeight: 700,
              border: "none",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #007AFF 0%, #0056CC 100%)",
              color: "white",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(0,122,255,0.3)",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 24px rgba(0,122,255,0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 16px rgba(0,122,255,0.3)";
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

  /* ==========================
     PATCH 3: Header Controls
     ========================== */
  const HeaderControls = () => (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
<button 
  className="secondary-action" 
  onClick={() => setSapScopeOpen(true)}
  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px" }}
>
  📑 SAP Scope Builder
</button>

      <button 
        className="secondary-action" 
        onClick={() => { setSelectedPhase(null); setDetailPanelOpen(true); }}
        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px" }}
      >
        🎉 Holidays
      </button>

      <button 
        className="secondary-action" 
        onClick={exportToCSV}
        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px" }}
      >
        📤 Export CSV
      </button>

      <button 
        className="primary-action" 
        onClick={addPhase}
        style={{ 
          padding: "10px 20px", 
          fontWeight: "700",
          fontSize: "14px"
        }}
      >
        + Add Phase
      </button>

      {/* CONDITIONALLY SHOW CURRENCY SELECTOR */}
{!clientPresentationMode && (
  <select
    value={selectedCatalogRegion}
    onChange={(e) => {
      if (e.target.value === "RATE_CHECK") {
        setForexModalOpen(true);
        // Reset to current selection
        e.target.value = selectedCatalogRegion;
      } else {
        setSelectedCatalogRegion(e.target.value);
      }
    }}
    style={{
      padding: "8px 12px",
      fontSize: "13px",
      fontWeight: "600",
      border: "1px solid var(--border)",
      borderRadius: "8px",
      background: "white",
      color: "var(--text-secondary)",
      minWidth: "100px",
      cursor: "pointer"
    }}
  >
    {CURRENCY_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
    <option value="RATE_CHECK" style={{ fontStyle: "italic", color: "var(--primary)" }}>
      📊 Rate Check
    </option>
  </select>
)}

      {/* EYE TOGGLE COMPONENT - Positioned below currency selector */}
      <EyeToggle 
        isInternal={!clientPresentationMode}
        onClick={() => setClientPresentationMode(!clientPresentationMode)}
      />
    </div>
  );


  
const CurrencyWarning = () => {
  if (selectedCatalogRegion === "ABMY") return null;
  
  return (
    <div style={{
      background: "rgba(255,149,0,0.1)",
      border: "1px solid var(--warning)",
      borderRadius: "8px",
      padding: "8px 12px",
      marginBottom: "12px",
      fontSize: "13px",
      color: "var(--warning)",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    }}>
      ⚠️ <strong>Currency Warning:</strong> Only ABMY/MYR rates are fully supported. 
      <button 
        className="secondary-action" 
        onClick={() => setSelectedCatalogRegion("ABMY")}
        style={{ marginLeft: "auto", padding: "4px 8px", fontSize: "12px" }}
      >
        Switch to ABMY
      </button>
    </div>
  );
};

  /* ==========================
     DETAIL PANEL (Phase / Holidays)
     ========================== */
  const DetailPanel = () => {
    const isHolidayPanel = !selectedPhase;
    return (
      <div className={`detail-panel ${detailPanelOpen ? "open" : ""}`}>
        <div className="detail-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 className="detail-title">{isHolidayPanel ? "Holidays" : selectedPhase?.name || "Phase"}</h3>
              {!isHolidayPanel ? (
  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
    <div style={{ position: "relative" }}>
      <svg width="60" height="60" style={{ filter: "drop-shadow(0 4px 12px rgba(0,122,255,0.2))" }}>
        <circle
          cx="30" cy="30" r="26" fill="transparent"
          stroke="rgba(0,122,255,0.1)" strokeWidth="4"
        />
        <circle
          cx="30" cy="30" r="26" fill="transparent"
          stroke="var(--primary)" strokeWidth="4"
          strokeDasharray={`${(selectedPhase.workingDays / 30) * 163} 163`}
          strokeLinecap="round" transform="rotate(-90 30 30)"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        <text x="30" y="35" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--primary)">
          {selectedPhase.workingDays}d
        </text>
      </svg>
    </div>
    <div>
      <h3 
        className="detail-title phase-title-editable" 
        onClick={() => {
          const newName = prompt("Enter new phase name:", selectedPhase.name);
          if (newName && newName.trim()) updatePhase(selectedPhase.id, { name: newName.trim() });
        }}
        style={{ margin: "0 0 4px 0", cursor: "pointer", borderBottom: "1px dashed rgba(0,122,255,0.3)" }}
      >
        {selectedPhase?.name || "Phase"} ✏️
      </h3>
      <p className="detail-subtitle" style={{ margin: 0 }}>
        Ends {formatDateElegant(calculateEndDate(
          businessDayToDate(selectedPhase.startBusinessDay, holidays, true, BUSINESS_DAY_BASE_DATE),
          selectedPhase.workingDays, holidays, selectedPhase.skipHolidays
        ))} • {calculatePhasePersonDays(selectedPhase)} person-days
        {!clientPresentationMode && ` • ${formatCurrency(calculatePhaseCost(selectedPhase), selectedCatalogRegion)}`}
      </p>
    </div>
  </div>
) : (
  <>
    <h3 className="detail-title">Holidays</h3>
    <p className="detail-subtitle">Project holiday calendar within the selected timeline</p>
  </>
)}
            </div>
            <button className="secondary-action" onClick={closePhaseDetail}>Close</button>
          </div>
        </div>

        <div className="detail-content">
          {isHolidayPanel ? (
            <div className="detail-section">
              <h3 className="section-title">Holiday Management</h3>
              
              {/* Holiday List */}
              <div style={{ 
                maxHeight: "200px", 
                overflowY: "auto", 
                border: "1px solid var(--border)", 
                borderRadius: "8px", 
                marginBottom: "16px" 
              }}>
                {holidays.length > 0 ? holidays.map(h => (
            <div key={h.id} style={{ 
              padding: "16px", 
              borderBottom: "1px solid var(--border)", 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              transition: "background 0.2s ease"
            }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: "15px", marginBottom: "4px" }}>
              {(h.name && h.name.trim()) || `Holiday on ${formatDateElegant(new Date(h.date))}`}
                  </div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
              {formatDateElegant(new Date(h.date))}
            </div>
            </div>
                    <button 
                      onClick={() => setHolidays(prev => prev.filter(holiday => holiday.id !== h.id))}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--danger)",
                        cursor: "pointer",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "16px",
                        fontWeight: "700"
                      }}
                      title="Remove holiday"
                    >
                      ×
                    </button>
                  </div>
                )) : (
                  <div style={{ padding: "20px", textAlign: "center", color: "var(--text-secondary)" }}>
                    No holidays configured
                  </div>
                )}
              </div>

              {/* Add Holiday Form - Steve Jobs Style */}
              <div style={{
                background: "linear-gradient(135deg, #FAFBFF 0%, #F0F4FF 100%)",
                border: "1px solid rgba(0,122,255,0.1)",
                borderRadius: "16px",
                padding: "24px",
                marginTop: "20px"
              }}>
                <div style={{ 
                  fontSize: "16px", 
                  fontWeight: 800, 
                  marginBottom: "20px", 
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  ✨ Add New Holiday
                </div>
  
                <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "16px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ 
                      display: "block", 
                      fontSize: "13px", 
                      fontWeight: 700, 
                      marginBottom: "8px", 
                      color: "var(--text-secondary)" 
                    }}>
                      DATE
                    </label>
                    <input 
                      type="date" 
                      className="form-input" 
                      id="holiday-date-input"
                      style={{ 
                        width: "100%",
                        padding: "12px 16px",
                        fontSize: "15px",
                        border: "2px solid var(--border)",
                        borderRadius: "12px",
                        transition: "all 0.2s ease",
                        background: "white"
                      }}
                      onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                      onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                    />
                  </div>
    
                  <div>
                    <label style={{ 
                      display: "block", 
                      fontSize: "13px", 
                      fontWeight: 700, 
                      marginBottom: "8px", 
                      color: "var(--text-secondary)" 
                    }}>
                      HOLIDAY NAME
                    </label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g., Christmas Day, Independence Day..." 
                      id="holiday-name-input"
                      style={{ 
                        width: "100%",
                        padding: "12px 16px",
                        fontSize: "15px",
                        border: "2px solid var(--border)",
                        borderRadius: "12px",
                        transition: "all 0.2s ease",
                        background: "white"
                      }}
                      onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                      onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          document.querySelector('#add-holiday-btn').click();
                        }
                      }}
                    />
                  </div>
                </div>
  
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ 
                    fontSize: "12px", 
                    color: "var(--text-secondary)", 
                    fontStyle: "italic",
                    maxWidth: "300px",
                    lineHeight: "1.4"
                  }}>
                    Holidays automatically exclude business days when "Skip holidays" is enabled
                  </div>
                  
                  <button
                    id="add-holiday-btn"
                    onClick={() => {
                const dateEl = document.getElementById("holiday-date-input");
                const nameEl = document.getElementById("holiday-name-input");
  
                  // Get and validate inputs
                  const dateValue = dateEl?.value?.trim();
                  const nameValue = nameEl?.value?.trim();
                  
                  // Enhanced validation
                  if (!dateValue || !nameValue) {
                    addNotification("Please enter both date and holiday name", "error", 3000);
                    return;
                  }
                  
                  // Validate date
                  const testDate = new Date(dateValue);
                  if (isNaN(testDate.getTime())) {
                    addNotification("Please enter a valid date", "error", 3000);
                    return;
                  }
  
                  // Check for duplicate dates
                  const existingHoliday = holidays.find(h => h.date === dateValue);
                  if (existingHoliday) {
                    addNotification("A holiday already exists on this date", "error", 3000);
                    return;
                  }
                  
                  // Add the holiday with proper validation
                  setHolidays(prev => [...prev, { 
                    id: Date.now(), 
                    date: dateValue, 
                    name: nameValue
                  }]);
  
                        // Clear inputs
                        dateEl.value = "";
                        nameEl.value = "";
                        addNotification("Holiday added successfully", "success", 2000);
                      }}
                            style={{
                              background: "var(--primary)",
                              color: "white",
                              border: "none",
                              padding: "14px 28px",
                              borderRadius: "12px",
                              fontSize: "14px",
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              boxShadow: "0 4px 12px rgba(0,122,255,0.3)"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = "translateY(-2px)";
                              e.target.style.boxShadow = "0 6px 20px rgba(0,122,255,0.4)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = "translateY(0)";
                              e.target.style.boxShadow = "0 4px 12px rgba(0,122,255,0.3)";
                            }}
                          >
                            Add Holiday
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                  <div className="detail-section" style={{ padding: "4px" }}>
                    <h3 className="section-title">General</h3>
  
             {/* Duration Controls - Moved from grid */}
<div style={{ marginBottom: "20px" }}>
  <label className="form-label" style={{ marginBottom: "12px", fontSize: "14px", fontWeight: 600 }}>
    Duration: {selectedPhase.workingDays} working days
  </label>
  
  <div style={{ marginBottom: "12px" }}>
  {/* Slider with integrated text input */}
  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
    <input
      type="range"
      min="1"
      max="60"
      value={selectedPhase.workingDays}
      onChange={(e) => updatePhase(selectedPhase.id, { workingDays: parseInt(e.target.value) })}
      style={{
        flex: 1,
        height: "8px",
        borderRadius: "4px",
        outline: "none",
        appearance: "none",
        background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${(selectedPhase.workingDays/60)*100}%, var(--border) ${(selectedPhase.workingDays/60)*100}%, var(--border) 100%)`
      }}
    />
  <input
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  placeholder="Days"
  defaultValue={selectedPhase.workingDays}
  onBlur={(e) => {
    const value = parseInt(e.target.value) || 1;
    const clampedValue = Math.min(60, Math.max(1, value));
    updatePhase(selectedPhase.id, { workingDays: clampedValue });
    e.target.value = clampedValue; // Update display to show clamped value
  }}
  onKeyPress={(e) => {
    if (e.key === 'Enter') {
      e.target.blur(); // Trigger validation
    }
    // Allow only numbers
    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
      e.preventDefault();
    }
  }}
  style={{
    width: "70px",
    padding: "6px 8px",
    fontSize: "14px",
    fontWeight: "700",
    textAlign: "center",
    border: "2px solid var(--border)",
    borderRadius: "6px",
    background: "white",
    color: "var(--primary)"
  }}
/>
  </div>
  
  <div style={{ 
    display: "flex", justifyContent: "space-between",
    fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600
  }}>
    <span>1 day</span>
    <span>2 weeks</span>
    <span>1 month</span>
    <span>2 months</span>
  </div>
</div>
  
  <div style={{ 
    display: "flex", justifyContent: "space-between", padding: "12px",
    background: "rgba(0,122,255,0.05)", borderRadius: "8px",
    fontSize: "13px", fontWeight: 600
  }}>
    <div style={{ textAlign: "center" }}>
      <div style={{ color: "var(--primary)" }}>{selectedPhase.workingDays}</div>
      <div style={{ color: "var(--text-secondary)", fontSize: "11px" }}>Working Days</div>
    </div>
    <div style={{ color: "var(--text-secondary)" }}>→</div>
    <div style={{ textAlign: "center" }}>
      <div style={{ color: "var(--text-secondary)" }}>{Math.ceil(selectedPhase.workingDays * 1.4)}</div>
      <div style={{ color: "var(--text-secondary)", fontSize: "11px" }}>Calendar Days</div>
    </div>
  </div>
</div>     
  
{/* Date & Duration Grid - Fixed layout */}
<div style={{ 
  display: "grid", 
  gridTemplateColumns: "1fr 1fr", // Increased from 140px to 160px
  gap: "16px", 
  marginBottom: "20px",
  alignItems: "end"
}}>
  <div>
    <label className="form-label" style={{ marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>Start Date</label>
    <input
      className="form-input"
      type="date"
      min={new Date().toISOString().split("T")[0]}
      value={businessDayToDate(selectedPhase.startBusinessDay, holidays, true, BUSINESS_DAY_BASE_DATE).toISOString().split("T")[0]}
      onChange={(e) => {
        const newStartBD = dateToBusinessDay(e.target.value, holidays, selectedPhase.skipHolidays, BUSINESS_DAY_BASE_DATE);
        updatePhase(selectedPhase.id, { startBusinessDay: Math.max(0, newStartBD) });
      }}
      style={{ 
        padding: "12px 16px", 
        fontSize: "15px", 
        minHeight: "44px",
        borderRadius: "8px",
        border: "2px solid var(--border)",
        transition: "border-color 0.2s ease"
      }}
    />
  </div>
  
  <div>
    <label className="form-label" style={{ marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>End Date</label>
    <input
      className="form-input"
      type="date"
      min={businessDayToDate(selectedPhase.startBusinessDay, holidays, true, BUSINESS_DAY_BASE_DATE).toISOString().split("T")[0]}
      value={calculateEndDate(
        businessDayToDate(selectedPhase.startBusinessDay, holidays, true, BUSINESS_DAY_BASE_DATE),
        selectedPhase.workingDays,
        holidays,
        selectedPhase.skipHolidays
      ).toISOString().split("T")[0]}
      onChange={(e) => {
        const endDate = new Date(e.target.value);
        const startDate = businessDayToDate(selectedPhase.startBusinessDay, holidays, true, BUSINESS_DAY_BASE_DATE);
        if (endDate >= startDate) {
          const newDuration = dateToBusinessDay(endDate, holidays, selectedPhase.skipHolidays, BUSINESS_DAY_BASE_DATE) - selectedPhase.startBusinessDay + 1;
          updatePhase(selectedPhase.id, { workingDays: Math.max(1, newDuration) });
        }
      }}
      style={{ 
        padding: "12px 16px", 
        fontSize: "15px", 
        minHeight: "44px",
        borderRadius: "8px",
        border: "2px solid var(--border)",
        transition: "border-color 0.2s ease"
      }}
    />
  </div>
  

</div>

  {/* Skip Holidays Checkbox - Properly spaced */}
  <div style={{ 
    marginTop: "16px",
    padding: "12px 16px",
    background: "rgba(0,122,255,0.05)",
    borderRadius: "8px",
    border: "1px solid rgba(0,122,255,0.1)"
  }}>
    <label className="form-checkbox" style={{ margin: 0, fontSize: "15px", fontWeight: 500 }}>
      <input
        className="checkbox"
        type="checkbox"
        checked={!!selectedPhase.skipHolidays}
        onChange={(e) => updatePhase(selectedPhase.id, { skipHolidays: e.target.checked })}
        style={{ width: "18px", height: "18px" }}
      />
      Skip holidays when calculating end date
    </label>
  </div>
</div>
              <div className="detail-section">
                <h3 className="section-title">Resources</h3>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  {!clientPresentationMode && (
                    <button className="primary-action" onClick={() => setResourceManagementOpen(true)}>Manage Team</button>
                  )}
                  <button className="secondary-action" onClick={() => duplicatePhase(selectedPhase.id)}>Duplicate Phase</button>
                  <button className="secondary-action" onClick={() => deletePhase(selectedPhase.id)}>Delete Phase</button>
                </div>
               {(selectedPhase.resources || []).length === 0 ? (
  <div style={{ 
    padding: "24px", 
    textAlign: "center", 
    color: "var(--text-secondary)",
    background: "var(--background)",
    borderRadius: "12px",
    border: "1px solid var(--border)"
  }}>
    <div style={{ fontSize: "14px", marginBottom: "8px" }}>No team members assigned</div>
    <div style={{ fontSize: "12px" }}>Click "Manage Team" to add resources</div>
  </div>
) : ( 
  <div style={{
    padding: "16px",
    background: "linear-gradient(135deg, #F8FAFF 0%, #F0F4FF 100%)",
    borderRadius: "12px",
    border: "1px solid rgba(0,122,255,0.1)"
  }}>
    <div style={{ fontSize: "14px", fontWeight: 800, marginBottom: "12px", color: "var(--primary)" }}>
      Team Overview
    </div>
    
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px", marginBottom: "12px" }}>
      <div style={{ textAlign: "center", padding: "12px", background: "#fff", borderRadius: "8px", border: "1px solid var(--border)" }}>
        <div style={{ fontSize: "20px", fontWeight: 900, color: "var(--primary)" }}>
          {selectedPhase.resources.length}
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 700 }}>MEMBERS</div>
      </div>
      
      <div style={{ textAlign: "center", padding: "12px", background: "#fff", borderRadius: "8px", border: "1px solid var(--border)" }}>
        <div style={{ fontSize: "20px", fontWeight: 900, color: "var(--success)" }}>
          {calculatePhasePersonDays(selectedPhase)}
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 700 }}>PERSON-DAYS</div>
      </div>
      
      <div style={{ textAlign: "center", padding: "12px", background: "#fff", borderRadius: "8px", border: "1px solid var(--border)" }}>
        <div style={{ fontSize: "20px", fontWeight: 900, color: "var(--warning)" }}>
          {avgAllocation(selectedPhase.resources)}%
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 700 }}>AVG ALLOC</div>
      </div>
      
      {!clientPresentationMode && (
        <div style={{ textAlign: "center", padding: "12px", background: "#fff", borderRadius: "8px", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: "20px", fontWeight: 900, color: "var(--danger)" }}>
            {formatCurrency(calculatePhaseCost(selectedPhase), selectedCatalogRegion, { abbreviate: true })}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 700 }}>PHASE COST</div>
        </div>
      )}
    </div>
    
    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>ROLES:</span>
      {Array.from(new Set(selectedPhase.resources.map(r => r.role))).slice(0, 4).map((role, idx) => (
        <span key={idx} style={{
          fontSize: "11px",
          padding: "2px 8px",
          background: "rgba(0,122,255,0.1)",
          color: "var(--primary)",
          borderRadius: "4px",
          fontWeight: 600
        }}>
          {role}
        </span>
      ))}
      {Array.from(new Set(selectedPhase.resources.map(r => r.role))).length > 4 && (
        <span style={{
          fontSize: "11px",
          padding: "2px 8px",
          background: "var(--border)",
          color: "var(--text-secondary)",
          borderRadius: "4px",
          fontWeight: 600
        }}>
          +{Array.from(new Set(selectedPhase.resources.map(r => r.role))).length - 4} more
        </span>
      )}
    </div>
  </div>
)}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  /* ==========================
     PATCH 1: Header + Controls
     ========================== */
  const Header = () => (
    <div className="header">
      <div style={{ flex: 1 }}>
        <h1 className="title">
          {operatingMode === 'proposal_review' && sapSelection?.clientData?.companyName 
            ? `${sapSelection.clientData.companyName} - Project Timeline`
            : clientProfile?.companyName 
            ? `${clientProfile.companyName} - Project Timeline`
            : "Project Timeline"}
        </h1>
        
        {/* Project scope and date info */}
        <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>📅 Today:</span>
            <span style={{ fontWeight: 700 }}>{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
          
          {sapSelection?.packages?.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span>📦 Scope:</span>
              <span style={{ fontWeight: 700 }}>{sapSelection.packages.length} SAP packages selected</span>
            </div>
          )}
          
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
  <span>🏖️ Holidays:</span>
  <span style={{ fontWeight: 700 }}>{getHolidaysInRange().length} scheduled</span>
</div>
        </div>
      </div>
      
      <HeaderControls />
    </div>
  );

  /* ==========================
     RENDER
     ========================== */
  const { businessDays } = memoizedTimelineData;
  const projectDuration = calculateProjectDuration();
  const projectCost = calculateProjectCost();
  const blendedRate = calculateBlendedRate();

  return (
    <div className="app">
      <style>{styles}</style>

      <Header />



      {/* Suggestions */}
      {suggestions.map((s) => (
        <div key={s.id} className="suggestions">
          <div className="suggestion-icon">{s.icon}</div>
          <div className="suggestion-content">
            <div className="suggestion-title">{s.title}</div>
            <p className="suggestion-text">{s.text}</p>
          </div>
          <button className="suggestion-action" onClick={() => { s.onAction?.(); dismissSuggestion(s.id); }}>
            {s.action}
          </button>
        </div>
      ))}

      {/* Enhanced metrics */}
      <div className="project-status-bar" style={{ marginBottom: 12 }}>
        <div className="status-metric">
          🚩 <span className="status-metric-value">{formatDateElegant(getProjectStartDate())}</span>
        </div>
        <div className="status-separator" />
        <div className="status-metric">
          🏁 <span className="status-metric-value">{formatDateElegant(getProjectEndDate())}</span>
        </div>
        <div className="status-separator" />
        <div className="status-metric">
          ⏱️ <span className="status-metric-value">{projectDuration?.formatted || "—"}</span>
        </div>
        
        {/* CONDITIONALLY SHOW COST METRICS */}
        {!clientPresentationMode && (
          <>
            <div className="status-separator" />
            <div className="status-metric">
              💰 <span className="status-metric-value">{formatCurrency(projectCost, selectedCatalogRegion)}</span>
            </div>
            <div className="status-separator" />
            <div className="status-metric">
              🧮 <span className="status-metric-value">{formatCurrency(blendedRate, selectedCatalogRegion, { abbreviate: false })}/PD</span>
            </div>
          </>
        )}
      </div>

      {/* Timeline */}
      <div className="timeline-container">
        <div className="timeline-header">
          <div className="timeline-header-inner">
            <div className="timeline-scale">
              {businessDays.map((d, idx) => (
                <div key={idx} className={`scale-unit ${d.isToday ? "today" : ""} ${d.isHoliday ? "holiday" : ""}`}>
                  <div className="date-line-1">{d.label?.line1}</div>
                  <div className="date-line-2">{d.label?.line2}</div>
                  {d.label?.line3 ? <div className="date-line-3">{d.label?.line3}</div> : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="timeline-body">
          <div className="timeline-content">
            {/* Grid */}
            <div className="timeline-grid">
              {businessDays.map((d, idx) => (
                <div key={idx} className={`grid-line ${d.isToday ? "today" : ""} ${d.isHoliday ? "holiday" : ""}`} />
              ))}
            </div>

            {/* Phases */}
            <div className="phases-container">
              {!phases.length ? (
                <div className="empty-state">
                  <div className="empty-icon">📜</div>
                  <div className="empty-title">No phases yet</div>
                  <div className="empty-subtitle">Add your first phase or use the SAP Scope builder to auto-generate a project plan.</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="primary-action" onClick={addPhase}>+ Add Phase</button>
                    <button className="secondary-action" onClick={() => setOperatingMode('client_facing')}>Open SAP Scope</button>
                  </div>
                </div>
              ) : (
  phases.map((p) => (
    <div key={p.id} className="phase-row">
      <div
        className={`phase-bar ${selectedPhase?.id === p.id ? "selected" : ""}`}
        style={{ 
          ...getPhasePosition(p), 
          ...colorVars(p.color || getCategoryColor(p.category || "Configuration")),
          position: "relative"
        }}
        onClick={() => openPhaseDetail(p)}
      >
        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Delete "${p.name}"?`)) {
              setPhases(prev => prev.filter(phase => phase.id !== p.id));
              if (selectedPhase?.id === p.id) closePhaseDetail();
            }
          }}
          style={{
            position: "absolute",
            top: "-8px",
            right: "-8px",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "var(--danger)",
            color: "white",
            border: "2px solid white",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 11,
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            opacity: 0,
            transition: "opacity 0.2s ease"
          }}
          className="phase-delete-btn"
          title="Delete phase"
        >
          ×
        </button>

        <div className="phase-content">
          <div className="phase-title">{p.name}</div>
          <div className="phase-meta">
            <div className="phase-duration">{p.workingDays}d</div>
          </div>
        </div>

        {/* Resource avatars */}
<div className="resource-avatars">
  {(p.resources || []).slice(0, 3).map((r) => (
    <div key={r.id} className="resource-avatar" title={`${r.name} (${r.role})`}>
      {initials(r.name)}
    </div>
  ))}
  {(p.resources || []).length > 3 && (
    <div 
      className="resource-avatar" 
      style={{
        fontSize: "9px",
        background: "rgba(255,255,255,0.7)",
        color: "var(--primary)",
        fontWeight: "900"
      }}
      title={`+${(p.resources || []).length - 3} more team members`}
    >
      +{(p.resources || []).length - 3}
    </div>
  )}
</div>

        {/* Capacity bar */}
        <div className="resource-capacity">
          <div className="resource-fill" style={{ width: `${avgAllocation(p.resources)}%` }} />
        </div>

        {/* Hover tooltip */}
        <div className="phase-info-tooltip">
          {p.description || "No description"} • {calculatePhasePersonDays(p)} PD
          {!clientPresentationMode && ` • ${formatCurrency(calculatePhaseCost(p), selectedCatalogRegion)}`}
        </div>
      </div>
    </div>
  ))
)}

            </div>
          </div>
        </div>
      </div>

      {/* PATCH 4: Improved SAP Scope Builder Modal */}

      {/* Backdrop */}
      <div className={`backdrop ${detailPanelOpen ? "open" : ""}`} onClick={closePhaseDetail} />

{/* Panels & Modals */}
<DetailPanel />
<ResourceManagementModal />
<ProjectLocationModal />
<ForexRateModal />

{/* SAP Scope Modal */}
{sapScopeOpen && (
  <div style={{
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.6)",
    zIndex: 10000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  }}>
    <div style={{
      background: "white",
      borderRadius: 16,
      width: "95vw",
      height: "95vh",
      overflow: "hidden",
      boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      position: "relative"
    }}>
      <div style={{ 
        padding: "16px 24px", 
        borderBottom: "1px solid var(--border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "linear-gradient(135deg, #F8FAFF 0%, #F0F4FF 100%)"
      }}>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 900 }}>SAP Implementation Scope Builder</h2>
        <button 
          className="secondary-action" 
          onClick={() => setSapScopeOpen(false)}
        >
          Close
        </button>
      </div>
      <div style={{ height: "calc(95vh - 80px)", overflow: "auto" }}>
        <SAPScopeApp />
      </div>
    </div>
  </div>
)}

<NotificationStack />
    </div>
  );
}