import React, { useState } from "react";
import { X, Plus, Trash2, Users, Calendar, Clock, DollarSign } from "lucide-react";

const PhaseDetailPanel = ({ 
  phase, 
  isOpen, 
  onClose, 
  updatePhase, 
  deletePhase, 
  duplicatePhase, 
  holidays, 
  clientPresentationMode, 
  BUSINESS_DAY_BASE_DATE, 
  formatDateElegant, 
  calculatePhasePersonDays, 
  calculatePhaseCost, 
  formatCurrency, 
  selectedCatalogRegion,
  RESOURCE_CATALOG 
}) => {
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [resourceForm, setResourceForm] = useState({
    name: '',
    role: 'Developer',
    allocation: 100,
    hourlyRate: 800
  });

  if (!phase || !isOpen) return null;

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

  // Format date for display (DD/MM/YYYY)
  const formatDateForDisplay = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Parse date from DD/MM/YYYY format
  const parseDateFromDisplay = (dateStr) => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    return isNaN(date.getTime()) ? null : date;
  };

  const handleStartDateChange = (dateStr) => {
    const date = parseDateFromDisplay(dateStr);
    if (date) {
      const newStartDay = dateToBusinessDay(date, holidays, true, BUSINESS_DAY_BASE_DATE);
      updatePhase(phase.id, { startBusinessDay: newStartDay });
    }
  };

  const handleEndDateChange = (dateStr) => {
    const date = parseDateFromDisplay(dateStr);
    if (date) {
      const startDate = businessDayToDate(phase.startBusinessDay, holidays, true, BUSINESS_DAY_BASE_DATE);
      if (date >= startDate) {
        const newDuration = dateToBusinessDay(date, holidays, phase.skipHolidays, BUSINESS_DAY_BASE_DATE) - phase.startBusinessDay + 1;
        updatePhase(phase.id, { workingDays: Math.max(1, newDuration) });
      }
    }
  };

  const handleSetToday = (field) => {
    const today = new Date();
    if (field === 'start') {
      const newStartDay = dateToBusinessDay(today, holidays, true, BUSINESS_DAY_BASE_DATE);
      updatePhase(phase.id, { startBusinessDay: newStartDay });
    } else if (field === 'end') {
      const startDate = businessDayToDate(phase.startBusinessDay, holidays, true, BUSINESS_DAY_BASE_DATE);
      if (today >= startDate) {
        const newDuration = dateToBusinessDay(today, holidays, phase.skipHolidays, BUSINESS_DAY_BASE_DATE) - phase.startBusinessDay + 1;
        updatePhase(phase.id, { workingDays: Math.max(1, newDuration) });
      }
    }
  };

  const addResource = () => {
    if (!resourceForm.name.trim()) return;
    
    const newResource = {
      id: Date.now(),
      ...resourceForm,
      hourlyRate: RESOURCE_CATALOG[selectedCatalogRegion]?.positions[resourceForm.role]?.rate || resourceForm.hourlyRate
    };
    
    const resources = phase.resources || [];
    updatePhase(phase.id, { resources: [...resources, newResource] });
    
    setResourceForm({
      name: '',
      role: 'Developer',
      allocation: 100,
      hourlyRate: 800
    });
    setShowResourceModal(false);
  };

  const removeResource = (resourceId) => {
    const resources = (phase.resources || []).filter(r => r.id !== resourceId);
    updatePhase(phase.id, { resources });
  };

  const updateResource = (resourceId, updates) => {
    const resources = (phase.resources || []).map(r => 
      r.id === resourceId ? { ...r, ...updates } : r
    );
    updatePhase(phase.id, { resources });
  };

  const startDate = businessDayToDate(phase.startBusinessDay, holidays, true, BUSINESS_DAY_BASE_DATE);
  const endDate = calculateEndDate(startDate, phase.workingDays, holidays, phase.skipHolidays);

  return (
    <>
      <div className={`detail-panel ${isOpen ? "open" : ""}`} style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '420px',
        height: '100vh',
        background: 'white',
        boxShadow: '-8px 0 25px rgba(0,0,0,0.15)',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.45s cubic-bezier(0.175,0.885,0.32,1.275)',
        zIndex: 100,
        overflowY: 'auto'
      }}>
        <div className="detail-header" style={{
          padding: '20px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          background: 'linear-gradient(135deg, white 0%, #F8F9FB 100%)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 900 }}>{phase?.name || "Phase"}</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#8E8E93' }}>
                {formatDateElegant(endDate)} • {calculatePhasePersonDays(phase)} person-days
                {!clientPresentationMode && ` • ${formatCurrency(calculatePhaseCost(phase), selectedCatalogRegion)}`}
              </p>
            </div>
            <button 
              onClick={onClose}
              style={{
                background: 'white',
                border: '1px solid rgba(0,0,0,0.06)',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              Close
            </button>
          </div>
        </div>

        <div className="detail-content" style={{ padding: '20px' }}>
          {/* Timeline Section */}
          <div className="detail-section" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 900, margin: '0 0 10px 0' }}>Timeline</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>
                  Start Date
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={formatDateForDisplay(startDate)}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    style={{
                      width: '100%',
                      padding: '10px',
                      paddingRight: '70px',
                      border: '1px solid rgba(0,0,0,0.06)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    onClick={() => handleSetToday('start')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: '#007AFF',
                      color: 'white',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Today
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>
                  End Date
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={formatDateForDisplay(endDate)}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    style={{
                      width: '100%',
                      padding: '10px',
                      paddingRight: '70px',
                      border: '1px solid rgba(0,0,0,0.06)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    onClick={() => handleSetToday('end')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: '#007AFF',
                      color: 'white',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Today
                  </button>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>
                Working Days
              </label>
              <input
                type="number"
                value={phase.workingDays}
                onChange={(e) => updatePhase(phase.id, { workingDays: Math.max(1, parseInt(e.target.value) || 1) })}
                min="1"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginTop: "16px" }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={!!phase.skipHolidays}
                  onChange={(e) => updatePhase(phase.id, { skipHolidays: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#007AFF' }}
                />
                Skip holidays when calculating end date
              </label>
            </div>
          </div>

          {/* Resources Section */}
          <div className="detail-section" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 900, margin: 0 }}>
                <Users size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Team & Resources
              </h3>
              <button
                onClick={() => setShowResourceModal(true)}
                style={{
                  background: '#007AFF',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Plus size={14} />
                Add Resource
              </button>
            </div>

            {(phase.resources || []).length === 0 ? (
              <p style={{ color: '#8E8E93', fontSize: '14px', textAlign: 'center', padding: '20px', background: '#F2F2F7', borderRadius: '8px' }}>
                No resources assigned. Click "Add Resource" to build your team.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {phase.resources.map((resource) => (
                  <div key={resource.id} style={{
                    padding: '12px',
                    background: '#F2F2F7',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.06)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, marginBottom: '4px' }}>{resource.name}</div>
                        <div style={{ fontSize: '12px', color: '#8E8E93', marginBottom: '8px' }}>
                          {resource.role} • {resource.allocation}% allocation
                        </div>
                        {!clientPresentationMode && (
                          <div style={{ fontSize: '12px', color: '#007AFF', fontWeight: 600 }}>
                            {formatCurrency(resource.hourlyRate * 8, selectedCatalogRegion)}/day
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeResource(resource.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#FF3B30',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    {/* Inline resource editing */}
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                      <select
                        value={resource.role}
                        onChange={(e) => {
                          const newRole = e.target.value;
                          const newRate = RESOURCE_CATALOG[selectedCatalogRegion]?.positions[newRole]?.rate || resource.hourlyRate;
                          updateResource(resource.id, { role: newRole, hourlyRate: newRate });
                        }}
                        style={{
                          flex: 1,
                          padding: '6px',
                          fontSize: '12px',
                          border: '1px solid rgba(0,0,0,0.06)',
                          borderRadius: '4px',
                          background: 'white'
                        }}
                      >
                        {Object.keys(RESOURCE_CATALOG[selectedCatalogRegion]?.positions || {}).map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={resource.allocation}
                        onChange={(e) => updateResource(resource.id, { allocation: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                        min="0"
                        max="100"
                        style={{
                          width: '80px',
                          padding: '6px',
                          fontSize: '12px',
                          border: '1px solid rgba(0,0,0,0.06)',
                          borderRadius: '4px'
                        }}
                        placeholder="%"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions Section */}
          <div className="detail-section">
            <h3 style={{ fontSize: '15px', fontWeight: 900, margin: '0 0 10px 0' }}>Actions</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button 
                onClick={() => duplicatePhase(phase.id)}
                style={{
                  flex: 1,
                  background: 'white',
                  border: '1px solid rgba(0,0,0,0.06)',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Duplicate Phase
              </button>
              <button 
                onClick={() => deletePhase(phase.id)}
                style={{
                  flex: 1,
                  background: '#FF3B30',
                  color: 'white',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Delete Phase
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Modal */}
      {showResourceModal && (
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
          zIndex: 200
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '400px',
            maxWidth: '90%'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 900 }}>Add Team Member</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>
                Name
              </label>
              <input
                type="text"
                value={resourceForm.name}
                onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })}
                placeholder="Enter team member name"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>
                Role
              </label>
              <select
                value={resourceForm.role}
                onChange={(e) => {
                  const role = e.target.value;
                  const rate = RESOURCE_CATALOG[selectedCatalogRegion]?.positions[role]?.rate || 800;
                  setResourceForm({ ...resourceForm, role, hourlyRate: rate });
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                {Object.keys(RESOURCE_CATALOG[selectedCatalogRegion]?.positions || {}).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>
                Allocation (%)
              </label>
              <input
                type="number"
                value={resourceForm.allocation}
                onChange={(e) => setResourceForm({ ...resourceForm, allocation: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                min="0"
                max="100"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            {!clientPresentationMode && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>
                  Daily Rate
                </label>
                <div style={{
                  padding: '10px',
                  background: '#F2F2F7',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  {formatCurrency(resourceForm.hourlyRate * 8, selectedCatalogRegion)}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={addResource}
                disabled={!resourceForm.name.trim()}
                style={{
                  flex: 1,
                  background: resourceForm.name.trim() ? '#007AFF' : '#E5E5EA',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: resourceForm.name.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Add Resource
              </button>
              <button
                onClick={() => {
                  setShowResourceModal(false);
                  setResourceForm({
                    name: '',
                    role: 'Developer',
                    allocation: 100,
                    hourlyRate: 800
                  });
                }}
                style={{
                  flex: 1,
                  background: 'white',
                  border: '1px solid rgba(0,0,0,0.06)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhaseDetailPanel;
