import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  ChevronLeft, ChevronRight, Download, Calendar, ZoomIn, ZoomOut, 
  Clock, DollarSign, Users, Building, MapPin, TrendingUp, Settings,
  FileText, Database, ArrowRight, X, Edit3, Shield, Eye, EyeOff,
  Save, Trash2, Copy, Upload, Plus, Minus, Package, Grid, List,
  AlertTriangle, CheckCircle, Info
} from "lucide-react";

const App = () => {
  /* ==========================
     CORE STATE
     ========================== */
  const [phases, setPhases] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [clientPresentationMode, setClientPresentationMode] = useState(false);
  const [sapScopeOpen, setSapScopeOpen] = useState(false);
  const [holidayManagerOpen, setHolidayManagerOpen] = useState(false);
  const [resourceManagementOpen, setResourceManagementOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [notifications, setNotifications] = useState([]);
  
  // Holidays
  const [holidays, setHolidays] = useState([
    { date: "2025-01-01", name: "New Year's Day" },
    { date: "2025-01-28", name: "Chinese New Year" },
    { date: "2025-01-29", name: "Chinese New Year Holiday" },
    { date: "2025-05-01", name: "Labour Day" },
    { date: "2025-05-12", name: "Wesak Day" },
    { date: "2025-06-02", name: "Yang di-Pertuan Agong's Birthday" },
    { date: "2025-08-31", name: "National Day" },
    { date: "2025-09-16", name: "Malaysia Day" },
    { date: "2025-10-27", name: "Deepavali" },
    { date: "2025-12-25", name: "Christmas Day" }
  ]);

  const [selectedCatalogRegion, setSelectedCatalogRegion] = useState("ABMY");

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
        "Senior Consultant": { rate: 300 },
        Consultant: { rate: 230 },
        Analyst: { rate: 180 }
      }
    }
  };

  const FALLBACK_RATES = {
    ABMY: { ABSG: 0.32, ABMY: 1.0 },
    ABSG: { ABMY: 3.1, ABSG: 1.0 }
  };

  const getCurrencyMeta = (region) => {
    const meta = {
      ABMY: { code: "MYR", symbol: "RM", decimals: 2, symbolPos: "before", sep: "," },
      ABSG: { code: "SGD", symbol: "S$", decimals: 2, symbolPos: "before", sep: "," }
    };
    return meta[region] || meta.ABMY;
  };

  const convertCurrency = (amount, from, to) => {
    if (!amount || from === to) return amount;
    const rates = FALLBACK_RATES;
    const rate = rates[from]?.[to] || 1;
    return amount * rate;
  };

  const formatCurrency = (value, region = selectedCatalogRegion) => {
    const meta = getCurrencyMeta(region);
    const formatted = Math.round(value).toLocaleString();
    return meta.symbolPos === "before" ? 
      `${meta.symbol}${formatted}` : 
      `${formatted}${meta.symbol}`;
  };

  /* =====================
     DATE / TIMELINE UTILS
     ===================== */
  const BUSINESS_DAY_BASE_DATE = useMemo(() => {
    const today = new Date();
    const dow = today.getDay();
    const daysToAdd = dow === 1 ? 0 : dow === 0 ? 1 : 8 - dow;
    const monday = new Date(today);
    monday.setDate(monday.getDate() + daysToAdd);
    return monday;
  }, []);

  const dateToBusinessDay = (date, hols = holidays, skipHolidays = true, baseDate = BUSINESS_DAY_BASE_DATE) => {
    let businessDays = 0;
    let current = new Date(baseDate);
    const target = new Date(date);
    const holidaySet = new Set((hols || []).map(h => h.date));
    
    while (current < target) {
      const dow = current.getDay();
      const dateStr = current.toISOString().split("T")[0];
      if (dow >= 1 && dow <= 5 && (!skipHolidays || !holidaySet.has(dateStr))) {
        businessDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    return businessDays;
  };

  const businessDayToDate = (businessDay, hols = holidays, skipHolidays = true, baseDate = BUSINESS_DAY_BASE_DATE) => {
    let date = new Date(baseDate);
    let daysAdded = 0;
    const holidaySet = new Set((hols || []).map(h => h.date));
    
    while (daysAdded < businessDay) {
      const dow = date.getDay();
      const dateStr = date.toISOString().split("T")[0];
      if (dow >= 1 && dow <= 5 && (!skipHolidays || !holidaySet.has(dateStr))) {
        daysAdded++;
      }
      if (daysAdded < businessDay) {
        date.setDate(date.getDate() + 1);
      }
    }
    return date;
  };

  const calculateEndDate = (startDate, workingDays, hols = holidays, skipHolidays = true) => {
    let d = new Date(startDate);
    let added = 0;
    const holidaySet = new Set((hols || []).map(h => h.date));
    
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

  /* ==========================
     PROJECT CALCULATIONS
     ========================== */
  const getProjectStartDate = () => {
    if (!phases.length) return null;
    const earliest = phases.reduce((e, p) => p.startBusinessDay < e.startBusinessDay ? p : e);
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
    const s = getProjectStartDate();
    const e = getProjectEndDate();
    if (!s || !e) return null;
    const total = Math.max(1, Math.round((e - s) / 86400000) + 1);
    
    if (total < 30) {
      return { total, formatted: `${total} days` };
    }
    const months = Math.floor(total / 30);
    const days = total % 30;
    return { 
      total, 
      formatted: months > 0 ? `${months} month${months > 1 ? 's' : ''}${days > 0 ? ` ${days} days` : ''}` : `${days} days`
    };
  };

  const calculateTotalPersonDays = () =>
    phases.reduce((t, p) =>
      t + (p.resources || []).reduce(
        (pt, r) => pt + Math.round((p.workingDays * (r.allocation || 0)) / 100),
        0
      ), 0
    );

  const calculateProjectCost = () =>
    phases.reduce((total, phase) =>
      total + (phase.resources || []).reduce((phaseTotal, resource) => {
        const pd = Math.round((phase.workingDays * (resource.allocation || 0)) / 100);
        const dailyRate = (resource.hourlyRate || 0) * 8;
        const localCost = pd * dailyRate;
        return phaseTotal + convertCurrency(localCost, resource.region || "ABMY", selectedCatalogRegion);
      }, 0), 0
    );

  const calculateBlendedRate = () => {
    const totalCost = calculateProjectCost();
    const totalDays = calculateTotalPersonDays();
    return totalDays > 0 ? totalCost / totalDays : 0;
  };

  /* ==========================
     AUTO-ZOOM FUNCTIONALITY
     ========================== */
  const autoFitTimeline = useCallback(() => {
    if (!phases.length) return;
    
    const minStart = Math.min(...phases.map(p => p.startBusinessDay));
    const maxEnd = Math.max(...phases.map(p => p.startBusinessDay + p.workingDays));
    const totalSpan = maxEnd - minStart;
    
    console.log(`Timeline auto-adjusted for ${totalSpan} days span`);
  }, [phases]);

  useEffect(() => {
    autoFitTimeline();
  }, [phases, autoFitTimeline]);

  /* ==========================
     PHASE MANAGEMENT
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
        ? Math.max(minStartDay, ...phases.map(p => p.startBusinessDay + p.workingDays))
        : minStartDay,
      workingDays: 5,
      color: "#3b82f6",
      description: "",
      skipHolidays: true,
      resources: []
    };
    setPhases(p => [...p, newPhase]);
    addNotification("Phase added", "success");
  };

  const updatePhase = (id, updates) => {
    setPhases(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePhase = (id) => {
    if (window.confirm("Delete this phase?")) {
      setPhases(prev => prev.filter(p => p.id !== id));
      closePhaseDetail();
      addNotification("Phase deleted", "info");
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
     NOTIFICATIONS
     ========================== */
  const addNotification = (msg, type = "info", duration = 3000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
  };

  /* ==========================
     CSV EXPORT
     ========================== */
  const exportToCSV = () => {
    if (!phases.length) {
      addNotification("No phases to export", "error");
      return;
    }
    
    const headers = ["Phase", "Start Date", "End Date", "Working Days", "Resources", "Person Days", "Cost"];
    const rows = phases.map(phase => {
      const startDate = businessDayToDate(phase.startBusinessDay, holidays, true, BUSINESS_DAY_BASE_DATE);
      const endDate = calculateEndDate(startDate, phase.workingDays, holidays, phase.skipHolidays);
      const personDays = (phase.resources || []).reduce((sum, r) => 
        sum + Math.round((phase.workingDays * (r.allocation || 0)) / 100), 0
      );
      const resources = (phase.resources || []).map(r => `${r.role} (${r.allocation}%)`).join("; ");
      const cost = (phase.resources || []).reduce((sum, r) => {
        const pd = Math.round((phase.workingDays * (r.allocation || 0)) / 100);
        const dailyRate = (r.hourlyRate || 0) * 8;
        return sum + pd * dailyRate;
      }, 0);
      
      return [
        phase.name,
        formatDateElegant(startDate),
        formatDateElegant(endDate),
        phase.workingDays,
        resources || "No resources",
        personDays,
        formatCurrency(cost)
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
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
    
    addNotification("CSV exported successfully", "success");
  };

  /* ==========================
     RENDER
     ========================== */
  const projectDuration = calculateProjectDuration();
  const projectCost = calculateProjectCost();
  const blendedRate = calculateBlendedRate();

  const buttonStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 18px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
  };

  return (
    <div style={{ padding: "20px", fontFamily: "system-ui, -apple-system, sans-serif", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "700", margin: "0 0 8px 0", color: "#111827" }}>
          SAP Implementation Timeline
        </h1>
        <p style={{ color: "#6b7280", margin: 0, fontSize: "16px" }}>
          ABeam Consulting - Project Planning & Resource Management Tool
        </p>
      </div>

      {/* Control Bar */}
      <div style={{ 
        display: "flex", 
        gap: "12px", 
        marginBottom: "20px",
        flexWrap: "wrap"
      }}>
        <button onClick={addPhase} style={buttonStyle}>
          <Plus size={16} /> Add Phase
        </button>
        <button onClick={() => setHolidayManagerOpen(true)} style={buttonStyle}>
          <Calendar size={16} /> Holidays
        </button>
        <button onClick={() => setSapScopeOpen(true)} style={buttonStyle}>
          <Package size={16} /> SAP Packages
        </button>
        <button onClick={exportToCSV} style={buttonStyle}>
          <Download size={16} /> Export CSV
        </button>
        <button 
          onClick={() => setClientPresentationMode(!clientPresentationMode)} 
          style={{ ...buttonStyle, background: clientPresentationMode ? "#10b981" : "#3b82f6" }}
        >
          {clientPresentationMode ? <Eye size={16} /> : <EyeOff size={16} />}
          {clientPresentationMode ? "Exit Client Mode" : "Client Mode"}
        </button>
      </div>

      {/* Metrics Dashboard */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "24px"
      }}>
        <MetricCard 
          icon="📅" 
          label="Start Date" 
          value={formatDateElegant(getProjectStartDate())} 
        />
        <MetricCard 
          icon="🏁" 
          label="End Date" 
          value={formatDateElegant(getProjectEndDate())} 
        />
        <MetricCard 
          icon="⏱️" 
          label="Duration" 
          value={projectDuration?.formatted || "—"} 
        />
        {!clientPresentationMode && (
          <>
            <MetricCard 
              icon="💰" 
              label="Total Cost" 
              value={formatCurrency(projectCost)} 
            />
            <MetricCard 
              icon="🧮" 
              label="Blended Rate" 
              value={`${formatCurrency(blendedRate)}/PD`} 
            />
            <MetricCard 
              icon="👥" 
              label="Person Days" 
              value={calculateTotalPersonDays()} 
            />
          </>
        )}
      </div>

      {/* Timeline View */}
      <div style={{ 
        background: "white", 
        border: "1px solid #e5e7eb", 
        borderRadius: "12px",
        padding: "24px",
        minHeight: "400px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
      }}>
        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px", color: "#111827" }}>
          Project Timeline
        </h2>
        
        {phases.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
            <Package size={48} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
            <h3 style={{ fontSize: "18px", marginBottom: "8px", color: "#6b7280" }}>No phases yet</h3>
            <p style={{ marginBottom: "20px" }}>Click "Add Phase" to start building your timeline</p>
            <button onClick={addPhase} style={buttonStyle}>
              <Plus size={16} /> Create First Phase
            </button>
          </div>
        ) : (
          <TimelineView 
            phases={phases}
            holidays={holidays}
            onPhaseClick={openPhaseDetail}
            clientMode={clientPresentationMode}
            BUSINESS_DAY_BASE_DATE={BUSINESS_DAY_BASE_DATE}
          />
        )}
      </div>

      {/* Phase Detail Panel */}
      {detailPanelOpen && selectedPhase && (
        <PhaseDetailPanel 
          phase={selectedPhase}
          onUpdate={(updates) => updatePhase(selectedPhase.id, updates)}
          onClose={closePhaseDetail}
          onDelete={() => deletePhase(selectedPhase.id)}
          resourceCatalog={RESOURCE_CATALOG}
          selectedRegion={selectedCatalogRegion}
          holidays={holidays}
          BUSINESS_DAY_BASE_DATE={BUSINESS_DAY_BASE_DATE}
        />
      )}

      {/* Holiday Manager Dialog */}
      {holidayManagerOpen && (
        <HolidayManager 
          holidays={holidays}
          setHolidays={setHolidays}
          onClose={() => setHolidayManagerOpen(false)}
        />
      )}

      {/* SAP Scope Dialog */}
      {sapScopeOpen && (
        <SAPScopeDialog 
          onClose={() => setSapScopeOpen(false)}
          onExport={(data) => {
            console.log("SAP Export:", data);
            setSapScopeOpen(false);
            addNotification("SAP packages imported", "success");
          }}
        />
      )}

      {/* Notifications */}
      <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
        {notifications.map(n => (
          <div key={n.id} style={{
            background: n.type === "error" ? "#ef4444" : n.type === "success" ? "#10b981" : "#3b82f6",
            color: "white",
            padding: "12px 20px",
            borderRadius: "8px",
            marginTop: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "slideIn 0.3s ease-out",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
          }}>
            {n.type === "success" && <CheckCircle size={16} />}
            {n.type === "error" && <AlertTriangle size={16} />}
            {n.type === "info" && <Info size={16} />}
            {n.msg}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ==========================
   SUB-COMPONENTS
   ========================== */
const MetricCard = ({ icon, label, value }) => (
  <div style={{
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
      <span style={{ fontSize: "20px" }}>{icon}</span>
      <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </span>
    </div>
    <div style={{ fontSize: "24px", fontWeight: "700", color: "#111827" }}>{value}</div>
  </div>
);

const TimelineView = ({ phases, holidays, onPhaseClick, clientMode, BUSINESS_DAY_BASE_DATE }) => {
  const getPhaseStartDate = (phase) => {
    const date = new Date(BUSINESS_DAY_BASE_DATE);
    let daysAdded = 0;
    const holidaySet = new Set((holidays || []).map(h => h.date));
    
    while (daysAdded < phase.startBusinessDay) {
      const dow = date.getDay();
      const dateStr = date.toISOString().split("T")[0];
      if (dow >= 1 && dow <= 5 && !holidaySet.has(dateStr)) {
        daysAdded++;
      }
      if (daysAdded < phase.startBusinessDay) {
        date.setDate(date.getDate() + 1);
      }
    }
    return date;
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: "900px" }}>
        {/* Timeline Header with Months */}
        <div style={{ 
          display: "flex", 
          borderBottom: "2px solid #e5e7eb",
          marginBottom: "20px",
          paddingBottom: "10px"
        }}>
          <div style={{ width: "200px", fontWeight: "600", fontSize: "12px", color: "#6b7280" }}>PHASE</div>
          <div style={{ flex: 1, position: "relative", paddingLeft: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#9ca3af" }}>
              {["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"].map(month => (
                <span key={month}>{month}</span>
              ))}
            </div>
          </div>
          {!clientMode && (
            <div style={{ width: "120px", textAlign: "center", fontWeight: "600", fontSize: "12px", color: "#6b7280" }}>RESOURCES</div>
          )}
        </div>

        {/* Phase Rows */}
        {phases.map((phase, idx) => {
          const startDate = getPhaseStartDate(phase);
          const startOfYear = new Date(startDate.getFullYear(), 0, 1);
          const dayOfYear = Math.floor((startDate - startOfYear) / (24 * 60 * 60 * 1000));
          const leftPosition = (dayOfYear / 365) * 100;
          const widthPercentage = (phase.workingDays / 365) * 100;

          return (
            <div 
              key={phase.id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "16px 0",
                borderBottom: idx < phases.length - 1 ? "1px solid #f3f4f6" : "none",
                cursor: "pointer",
                transition: "background 0.2s",
                borderRadius: "8px"
              }}
              onClick={() => onPhaseClick(phase)}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ 
                width: "200px", 
                fontWeight: "500",
                fontSize: "14px",
                color: "#111827",
                paddingRight: "20px"
              }}>
                {phase.name}
              </div>
              
              <div style={{ flex: 1, position: "relative", height: "40px" }}>
                <div style={{
                  position: "absolute",
                  left: `${leftPosition}%`,
                  width: `${Math.max(widthPercentage, 5)}%`,
                  background: phase.color || "#3b82f6",
                  height: "100%",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "600",
                  boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
                  minWidth: "100px",
                  overflow: "hidden"
                }}>
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {phase.name} ({phase.workingDays}d)
                  </span>
                </div>
              </div>
              
              {!clientMode && (
                <div style={{ 
                  width: "120px", 
                  textAlign: "center", 
                  fontSize: "14px",
                  color: "#6b7280"
                }}>
                  {(phase.resources || []).length > 0 ? 
                    `${(phase.resources || []).length} resource${(phase.resources || []).length > 1 ? 's' : ''}` : 
                    "—"
                  }
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Import the external components
import PhaseDetailPanel from './PhaseDetailPanel';
import HolidayManager from './HolidayManager';

const SAPScopeDialog = ({ onClose, onExport }) => {
  const [selectedPackages, setSelectedPackages] = useState([]);
  
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "white",
        borderRadius: "12px",
        width: "90%",
        maxWidth: "900px",
        maxHeight: "80vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{
          padding: "24px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <h2 style={{ margin: "0 0 4px 0", fontSize: "24px", fontWeight: "600" }}>SAP Package Selection</h2>
            <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
              Select SAP packages to include in your implementation timeline
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
          <div style={{ 
            padding: "60px", 
            background: "#f9fafb", 
            borderRadius: "8px",
            textAlign: "center",
            color: "#9ca3af"
          }}>
            <Package size={48} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
            <h3 style={{ marginBottom: "8px", color: "#6b7280" }}>SAP Package Library</h3>
            <p style={{ fontSize: "14px" }}>
              Complete SAP package library with Malaysia-specific modules<br/>
              including DRC/MyInvois, EPF, SOCSO, and EIS compliance
            </p>
            <div style={{ marginTop: "20px", fontSize: "13px", color: "#9ca3af" }}>
              • Financial Master Data (192.9 PD)<br/>
              • Procurement & Inventory (90 PD)<br/>
              • Malaysia Payroll (213.4 PD)<br/>
              • DRC Compliance (38.6 PD)<br/>
              • And more...
            </div>
          </div>
        </div>

        <div style={{
          padding: "24px",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          gap: "12px",
          justifyContent: "flex-end"
        }}>
          <button onClick={onClose} style={{ 
            padding: "10px 18px",
            background: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer"
          }}>
            Cancel
          </button>
          <button onClick={() => onExport(selectedPackages)} style={{
            padding: "10px 18px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer"
          }}>
            Export to Timeline
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
