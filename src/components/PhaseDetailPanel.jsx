import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Plus, Calendar } from 'lucide-react';

const PhaseDetailPanel = ({ 
  phase, 
  onUpdate, 
  onClose, 
  onDelete, 
  resourceCatalog, 
  selectedRegion,
  holidays,
  BUSINESS_DAY_BASE_DATE
}) => {
  const [localPhase, setLocalPhase] = useState({ ...phase, resources: phase.resources || [] });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Date calculation functions
  const businessDayToDate = (businessDay, baseDate = BUSINESS_DAY_BASE_DATE) => {
    let date = new Date(baseDate);
    let daysAdded = 0;
    const holidaySet = new Set((holidays || []).map(h => h.date));
    
    while (daysAdded < businessDay) {
      const dow = date.getDay();
      const dateStr = date.toISOString().split("T")[0];
      if (dow >= 1 && dow <= 5 && !holidaySet.has(dateStr)) {
        daysAdded++;
      }
      if (daysAdded < businessDay) {
        date.setDate(date.getDate() + 1);
      }
    }
    return date;
  };

  const dateToBusinessDay = (date, baseDate = BUSINESS_DAY_BASE_DATE) => {
    let businessDays = 0;
    let current = new Date(baseDate);
    const target = new Date(date);
    const holidaySet = new Set((holidays || []).map(h => h.date));
    
    while (current < target) {
      const dow = current.getDay();
      const dateStr = current.toISOString().split("T")[0];
      if (dow >= 1 && dow <= 5 && !holidaySet.has(dateStr)) {
        businessDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    return businessDays;
  };

  const calculateWorkingDays = (start, end) => {
    let workingDays = 0;
    let current = new Date(start);
    const endDate = new Date(end);
    const holidaySet = new Set((holidays || []).map(h => h.date));
    
    while (current <= endDate) {
      const dow = current.getDay();
      const dateStr = current.toISOString().split("T")[0];
      if (dow >= 1 && dow <= 5 && !holidaySet.has(dateStr)) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    return workingDays;
  };

  // Initialize dates
  useEffect(() => {
    const phaseStartDate = businessDayToDate(localPhase.startBusinessDay);
    const phaseEndDate = new Date(phaseStartDate);
    let daysAdded = 0;
    const holidaySet = new Set((holidays || []).map(h => h.date));
    
    while (daysAdded < localPhase.workingDays - 1) {
      phaseEndDate.setDate(phaseEndDate.getDate() + 1);
      const dow = phaseEndDate.getDay();
      const dateStr = phaseEndDate.toISOString().split("T")[0];
      if (dow >= 1 && dow <= 5 && !holidaySet.has(dateStr)) {
        daysAdded++;
      }
    }
    
    setStartDate(phaseStartDate.toISOString().split('T')[0]);
    setEndDate(phaseEndDate.toISOString().split('T')[0]);
  }, [localPhase.startBusinessDay, localPhase.workingDays]);

  // Handle date changes
  const handleStartDateChange = (newStartDate) => {
    setStartDate(newStartDate);
    const businessDay = dateToBusinessDay(newStartDate);
    const workingDays = calculateWorkingDays(newStartDate, endDate);
    setLocalPhase({ ...localPhase, startBusinessDay: businessDay, workingDays: Math.max(1, workingDays) });
  };

  const handleEndDateChange = (newEndDate) => {
    setEndDate(newEndDate);
    const workingDays = calculateWorkingDays(startDate, newEndDate);
    setLocalPhase({ ...localPhase, workingDays: Math.max(1, workingDays) });
  };

  const handleWorkingDaysChange = (days) => {
    const newWorkingDays = Math.max(1, parseInt(days) || 1);
    setLocalPhase({ ...localPhase, workingDays: newWorkingDays });
    
    // Update end date based on working days
    const phaseStartDate = new Date(startDate);
    let phaseEndDate = new Date(phaseStartDate);
    let daysAdded = 0;
    const holidaySet = new Set((holidays || []).map(h => h.date));
    
    while (daysAdded < newWorkingDays - 1) {
      phaseEndDate.setDate(phaseEndDate.getDate() + 1);
      const dow = phaseEndDate.getDay();
      const dateStr = phaseEndDate.toISOString().split("T")[0];
      if (dow >= 1 && dow <= 5 && !holidaySet.has(dateStr)) {
        daysAdded++;
      }
    }
    setEndDate(phaseEndDate.toISOString().split('T')[0]);
  };

  // Resource management
  const addResource = () => {
    const newResource = {
      id: Date.now(),
      name: "",
      role: "Consultant",
      allocation: 100,
      region: selectedRegion || "ABMY",
      hourlyRate: resourceCatalog[selectedRegion || "ABMY"]?.positions?.Consultant?.rate || 260
    };
    setLocalPhase({ ...localPhase, resources: [...localPhase.resources, newResource] });
  };

  const updateResource = (resourceId, updates) => {
    const updatedResources = localPhase.resources.map(r => {
      if (r.id === resourceId) {
        const updated = { ...r, ...updates };
        // Update hourly rate when role or region changes
        if (updates.role || updates.region) {
          const region = updates.region || r.region;
          const role = updates.role || r.role;
          updated.hourlyRate = resourceCatalog[region]?.positions?.[role]?.rate || 0;
        }
        return updated;
      }
      return r;
    });
    setLocalPhase({ ...localPhase, resources: updatedResources });
  };

  const deleteResource = (resourceId) => {
    const updatedResources = localPhase.resources.filter(r => r.id !== resourceId);
    setLocalPhase({ ...localPhase, resources: updatedResources });
  };

  const handleSave = () => {
    onUpdate(localPhase);
    onClose();
  };

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

  return (
    <div style={{
      position: "fixed",
      right: 0,
      top: 0,
      bottom: 0,
      width: "500px",
      background: "white",
      boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
      zIndex: 999,
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Header */}
      <div style={{
        padding: "24px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "linear-gradient(to bottom, #f9fafb, #ffffff)"
      }}>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#111827" }}>
          Phase Details
        </h2>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
        {/* Phase Name */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "#111827" }}>
            Phase Name
          </label>
          <input
            type="text"
            value={localPhase.name}
            onChange={(e) => setLocalPhase({ ...localPhase, name: e.target.value })}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              transition: "border-color 0.2s",
              outline: "none"
            }}
            onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
            onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
          />
        </div>

        {/* Date Fields */}
        <div style={{ 
          background: "#f9fafb", 
          padding: "16px", 
          borderRadius: "8px", 
          marginBottom: "24px" 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Calendar size={18} color="#6b7280" />
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>Timeline Settings</span>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "500", color: "#6b7280" }}>
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "13px",
                  background: "white"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "500", color: "#6b7280" }}>
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "13px",
                  background: "white"
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "500", color: "#6b7280" }}>
              Working Days (excluding weekends & holidays)
            </label>
            <input
              type="number"
              value={localPhase.workingDays}
              onChange={(e) => handleWorkingDaysChange(e.target.value)}
              min="1"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "13px",
                background: "white"
              }}
            />
          </div>
        </div>

        {/* Color Selection */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "#111827" }}>
            Phase Color
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            {colors.map(color => (
              <button
                key={color}
                onClick={() => setLocalPhase({ ...localPhase, color })}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: color,
                  border: localPhase.color === color ? "3px solid #1f2937" : "3px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              />
            ))}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "#111827" }}>
            Description
          </label>
          <textarea
            value={localPhase.description || ""}
            onChange={(e) => setLocalPhase({ ...localPhase, description: e.target.value })}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              minHeight: "100px",
              resize: "vertical",
              fontFamily: "inherit"
            }}
            placeholder="Add phase description..."
          />
        </div>

        {/* Resources Section */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
              Resources
            </label>
            <button 
              onClick={addResource}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer"
              }}
            >
              <Plus size={16} /> Add Resource
            </button>
          </div>
          
          {localPhase.resources.length === 0 ? (
            <div style={{ 
              padding: "32px", 
              background: "#f9fafb", 
              borderRadius: "8px",
              textAlign: "center",
              color: "#9ca3af",
              fontSize: "14px",
              border: "1px dashed #e5e7eb"
            }}>
              No resources assigned
            </div>
          ) : (
            <div>
              {localPhase.resources.map((resource, idx) => (
                <div key={resource.id} style={{
                  padding: "16px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  border: "1px solid #e5e7eb"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        placeholder="Resource Name (optional)"
                        value={resource.name || ""}
                        onChange={(e) => updateResource(resource.id, { name: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "13px",
                          marginBottom: "8px",
                          background: "white"
                        }}
                      />
                      <select
                        value={resource.role}
                        onChange={(e) => updateResource(resource.id, { role: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "13px",
                          background: "white"
                        }}
                      >
                        {Object.keys(resourceCatalog[resource.region]?.positions || {}).map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                    <button 
                      onClick={() => deleteResource(resource.id)}
                      style={{ 
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#ef4444",
                        padding: "4px",
                        marginLeft: "8px"
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                    <div>
                      <label style={{ fontSize: "11px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
                        Allocation %
                      </label>
                      <input
                        type="number"
                        value={resource.allocation}
                        onChange={(e) => updateResource(resource.id, { allocation: parseInt(e.target.value) || 0 })}
                        min="0"
                        max="100"
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "13px",
                          background: "white"
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "11px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
                        Region
                      </label>
                      <select
                        value={resource.region}
                        onChange={(e) => updateResource(resource.id, { region: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "13px",
                          background: "white"
                        }}
                      >
                        {Object.keys(resourceCatalog).map(region => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: "11px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
                        Rate/Hour
                      </label>
                      <input
                        type="number"
                        value={resource.hourlyRate}
                        onChange={(e) => updateResource(resource.id, { hourlyRate: parseFloat(e.target.value) || 0 })}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "13px",
                          background: "white"
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "24px",
        borderTop: "1px solid #e5e7eb",
        display: "flex",
        gap: "12px",
        background: "linear-gradient(to top, #f9fafb, #ffffff)"
      }}>
        <button 
          onClick={handleSave}
          style={{
            flex: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "12px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          <Save size={18} /> Save Changes
        </button>
        <button 
          onClick={onDelete}
          style={{
            flex: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "12px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          <Trash2 size={18} /> Delete Phase
        </button>
      </div>
    </div>
  );
};

export default PhaseDetailPanel;