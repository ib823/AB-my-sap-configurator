import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Calendar, Clock, Users, DollarSign, Plus, Settings, Download, X, Trash2, Copy, GripVertical, Package } from 'lucide-react';

export default function ProjectTimeline() {
  // State
  const [phases, setPhases] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [unitWidth, setUnitWidth] = useState(80); // Dynamic unit width
  const timelineBodyRef = useRef(null);

  // Constants
  const BASE_DATE = new Date('2025-01-27'); // Fixed Monday
  
  // Simple date functions
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const formatDate = (date) => {
    if (!(date instanceof Date)) return '';
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Auto-fit timeline to container width
  const autoFitTimeline = useCallback(() => {
    if (!timelineBodyRef.current) return;
    
    const containerWidth = timelineBodyRef.current.clientWidth - 48; // Minus padding
    
    if (phases.length === 0) {
      // Default view when no phases
      const idealWidth = containerWidth / 30; // Show 30 days by default
      setUnitWidth(Math.max(60, Math.min(120, idealWidth)));
      return;
    }
    
    // Calculate timeline span needed
    const maxEndDay = Math.max(...phases.map(p => p.startDay + p.duration), 30);
    const timelineSpan = maxEndDay + 5; // Add some padding
    
    // Calculate optimal unit width
    const idealWidth = containerWidth / timelineSpan;
    
    // Set bounds: minimum 40px (very compressed), maximum 120px (very expanded)
    const newUnitWidth = Math.max(40, Math.min(120, idealWidth));
    setUnitWidth(newUnitWidth);
  }, [phases]);

  // Auto-fit on mount and when phases change
  useEffect(() => {
    autoFitTimeline();
    
    const handleResize = () => autoFitTimeline();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [autoFitTimeline]);

  // Phase management
  const addPhase = () => {
    const lastPhaseEnd = phases.length > 0 
      ? Math.max(...phases.map(p => p.startDay + p.duration))
      : 0;
      
    const newPhase = {
      id: Date.now(),
      name: 'New Phase',
      startDay: lastPhaseEnd,
      duration: 5,
      color: '#007AFF',
      category: 'Configuration'
    };
    
    setPhases([...phases, newPhase]);
    
    // Auto-fit after adding
    setTimeout(() => autoFitTimeline(), 50);
  };

  const updatePhase = (id, updates) => {
    setPhases(phases.map(p => p.id === id ? { ...p, ...updates } : p));
    if (selectedPhase?.id === id) {
      setSelectedPhase({ ...selectedPhase, ...updates });
    }
    
    // Auto-fit after updating
    setTimeout(() => autoFitTimeline(), 50);
  };

  const deletePhase = (id) => {
    setPhases(phases.filter(p => p.id !== id));
    if (selectedPhase?.id === id) {
      setDetailPanelOpen(false);
      setSelectedPhase(null);
    }
    
    // Auto-fit after deleting
    setTimeout(() => autoFitTimeline(), 50);
  };

  // Generate timeline days based on zoom level
  const timelineDays = useMemo(() => {
    const days = [];
    const visibleDays = phases.length > 0 
      ? Math.max(...phases.map(p => p.startDay + p.duration), 30) + 5
      : 30;
    
    for (let i = 0; i < visibleDays; i++) {
      const date = addDays(BASE_DATE, i);
      days.push({
        index: i,
        date: date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }
    return days;
  }, [phases]);

  // Calculate which row each phase should be in
  const phaseRows = useMemo(() => {
    const rows = {};
    const sortedPhases = [...phases].sort((a, b) => a.startDay - b.startDay);
    const rowEndDays = [];
    
    sortedPhases.forEach(phase => {
      const phaseStart = phase.startDay;
      const phaseEnd = phase.startDay + phase.duration;
      
      // Find first available row
      let assignedRow = -1;
      for (let r = 0; r < rowEndDays.length; r++) {
        if (rowEndDays[r] <= phaseStart) {
          assignedRow = r;
          rowEndDays[r] = phaseEnd;
          break;
        }
      }
      
      // If no row available, create new one
      if (assignedRow === -1) {
        assignedRow = rowEndDays.length;
        rowEndDays.push(phaseEnd);
      }
      
      rows[phase.id] = assignedRow;
    });
    
    return rows;
  }, [phases]);

  // Calculate phase position with proper row assignment
  const getPhaseStyle = (phase) => {
    const row = phaseRows[phase.id] || 0;
    const left = phase.startDay * unitWidth;
    const width = phase.duration * unitWidth;
    const top = 20 + row * 60;
    
    return {
      position: 'absolute',
      left: `${left}px`,
      width: `${width}px`,
      top: `${top}px`,
      backgroundColor: phase.color || '#007AFF',
      borderRadius: '8px',
      padding: unitWidth < 60 ? '8px' : '12px',
      cursor: 'pointer',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      zIndex: 1
    };
  };

  // Calculate timeline height based on rows needed
  const timelineHeight = useMemo(() => {
    if (phases.length === 0) return 300;
    const maxRow = Math.max(...Object.values(phaseRows), 0);
    return Math.max(300, 80 + (maxRow + 1) * 60);
  }, [phases, phaseRows]);

  return (
    <div style={{ 
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>
            SAP Implementation Timeline
          </h1>
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            marginTop: '8px',
            fontSize: '14px',
            color: '#666'
          }}>
            <span>📅 {phases.length} Phases</span>
            <span>⏱️ {Math.max(0, ...phases.map(p => p.startDay + p.duration), 0)} Days</span>
            <span>📐 Zoom: {Math.round((unitWidth / 80) * 100)}%</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={addPhase}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} />
            Add Phase
          </button>
          <button
            onClick={autoFitTimeline}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f0f0f0',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Settings size={16} />
            Auto Fit
          </button>
        </div>
      </div>

      {/* Timeline Container */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Timeline Header */}
        <div style={{
          borderBottom: '1px solid #e5e5e5',
          overflowX: 'auto',
          overflowY: 'hidden'
        }}>
          <div style={{ 
            display: 'flex',
            minWidth: `${timelineDays.length * unitWidth}px`,
            paddingLeft: '24px',
            paddingRight: '24px'
          }}>
            {timelineDays.map(day => (
              <div
                key={day.index}
                style={{
                  width: `${unitWidth}px`,
                  minWidth: `${unitWidth}px`,
                  padding: '12px 4px',
                  textAlign: 'center',
                  borderRight: '1px solid #e5e5e5',
                  fontSize: unitWidth < 60 ? '10px' : '12px',
                  backgroundColor: day.isWeekend ? '#f8f9fa' : 'white'
                }}
              >
                <div style={{ fontWeight: 700 }}>{day.dayName}</div>
                <div style={{ 
                  fontSize: unitWidth < 60 ? '14px' : '16px', 
                  fontWeight: 700, 
                  margin: '2px 0' 
                }}>
                  {day.dayNum}
                </div>
                {unitWidth >= 50 && (
                  <div style={{ color: '#666' }}>{day.month}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Body */}
        <div 
          ref={timelineBodyRef}
          style={{ 
            position: 'relative',
            minHeight: `${timelineHeight}px`,
            overflowX: 'auto',
            overflowY: 'hidden',
            backgroundColor: '#f8f9fa'
          }}
        >
          <div style={{
            position: 'relative',
            minWidth: `${timelineDays.length * unitWidth}px`,
            minHeight: `${timelineHeight}px`,
            paddingLeft: '24px',
            paddingRight: '24px'
          }}>
            {/* Grid lines */}
            {timelineDays.map(day => (
              <div
                key={day.index}
                style={{
                  position: 'absolute',
                  left: `${24 + day.index * unitWidth}px`,
                  top: 0,
                  bottom: 0,
                  width: `${unitWidth}px`,
                  borderRight: '1px solid #e5e5e5',
                  backgroundColor: day.isWeekend ? 'rgba(0,0,0,0.02)' : 'transparent'
                }}
              />
            ))}

            {/* Phases */}
            {phases.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '250px',
                color: '#999'
              }}>
                <Package size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                  No phases yet
                </div>
                <div style={{ fontSize: '14px' }}>
                  Click "Add Phase" to start building your timeline
                </div>
              </div>
            ) : (
              phases.map((phase) => (
                <div
                  key={phase.id}
                  style={getPhaseStyle(phase)}
                  onClick={() => {
                    setSelectedPhase(phase);
                    setDetailPanelOpen(true);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    e.currentTarget.style.zIndex = '10';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    e.currentTarget.style.zIndex = '1';
                  }}
                >
                  <div style={{ 
                    color: 'white',
                    fontWeight: 600,
                    fontSize: unitWidth < 60 ? '12px' : '14px',
                    marginBottom: unitWidth < 60 ? '2px' : '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {phase.name}
                  </div>
                  {unitWidth >= 50 && (
                    <div style={{ 
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: unitWidth < 60 ? '10px' : '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Clock size={unitWidth < 60 ? 10 : 12} />
                      {phase.duration}d
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {detailPanelOpen && selectedPhase && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              zIndex: 99
            }}
            onClick={() => setDetailPanelOpen(false)}
          />
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '400px',
            height: '100vh',
            backgroundColor: 'white',
            boxShadow: '-4px 0 16px rgba(0,0,0,0.1)',
            zIndex: 100,
            overflowY: 'auto'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e5e5e5',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>{selectedPhase.name}</h2>
              <button
                onClick={() => setDetailPanelOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px'
                }}>
                  Phase Name
                </label>
                <input
                  type="text"
                  value={selectedPhase.name}
                  onChange={(e) => updatePhase(selectedPhase.id, { name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px'
                }}>
                  Duration (days)
                </label>
                <input
                  type="number"
                  value={selectedPhase.duration}
                  onChange={(e) => updatePhase(selectedPhase.id, { duration: parseInt(e.target.value) || 1 })}
                  min="1"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px'
                }}>
                  Start Day
                </label>
                <input
                  type="number"
                  value={selectedPhase.startDay}
                  onChange={(e) => updatePhase(selectedPhase.id, { startDay: parseInt(e.target.value) || 0 })}
                  min="0"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px'
                }}>
                  Color
                </label>
                <input
                  type="color"
                  value={selectedPhase.color || '#007AFF'}
                  onChange={(e) => updatePhase(selectedPhase.id, { color: e.target.value })}
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                />
              </div>

              <button
                onClick={() => {
                  if (confirm(`Delete "${selectedPhase.name}"?`)) {
                    deletePhase(selectedPhase.id);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#ff3b30',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={16} />
                Delete Phase
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
