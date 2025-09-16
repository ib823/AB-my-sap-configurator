#!/bin/bash
echo "🔧 Part 6: Adding Effects and starting UI components..."

cat >> src/components/App.jsx << 'APPEOF'

  /* ==========================
     EFFECTS
     ========================== */
  useEffect(() => {
    const t = setTimeout(() => autoFitTimeline(), 120);
    return () => clearTimeout(t);
  }, [phases, autoFitTimeline]);

  useEffect(() => {
    if (selectedPhase) {
      const fresh = phases.find((p) => p.id === selectedPhase.id);
      if (fresh) setSelectedPhase(fresh);
    }
  }, [phases]);

  useEffect(() => {
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
  }, [phases]);

  useEffect(() => {
    if (phases.length > 0) {
      const t = setTimeout(() => autoFitTimeline(), 50);
      return () => clearTimeout(t);
    }
  }, [holidays, autoFitTimeline]);

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

  /* ==========================
     STYLES
     ========================== */
  const styles = `
    :root {
      --primary: #007AFF;
      --success: #34C759;
      --warning: #FF9500;
      --danger: #FF3B30;
      --background: #F2F2F7;
      --surface: #FFFFFF;
      --text-primary: #000000;
      --text-secondary: #8E8E93;
      --text-tertiary: #C7C7CC;
      --border: rgba(0,0,0,0.06);
      --border-strong: rgba(0,0,0,0.12);
      --shadow-soft: 0 1px 3px rgba(0,0,0,0.12);
      --shadow-medium: 0 8px 25px rgba(0,0,0,0.15);
      --shadow-strong: 0 16px 40px rgba(0,0,0,0.25);
      --radius: 12px;
      --transition: cubic-bezier(0.25,0.46,0.45,0.94);
      --spring: cubic-bezier(0.175,0.885,0.32,1.275);
      --unit-width: 80px;
      --transition-zoom: 0.2s ease-out;
    }
    
    * { box-sizing: border-box; }
    
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      background: var(--background);
      color: var(--text-primary);
    }
    
    .app {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
      min-height: 100vh;
    }
    
    .timeline-container {
      background: var(--surface);
      border-radius: var(--radius);
      box-shadow: var(--shadow-soft);
      overflow: hidden;
      position: relative;
    }
    
    .timeline-header {
      border-bottom: 1px solid var(--border);
      background: linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    
    .timeline-body {
      position: relative;
      overflow-x: auto;
      min-height: 400px;
    }
    
    .phase-bar {
      position: absolute;
      top: 16px;
      height: 60px;
      background: linear-gradient(135deg, var(--phase-color) 0%, var(--phase-color-dark) 100%);
      border-radius: 12px;
      cursor: pointer;
      box-shadow: 0 2px 12px rgba(0,0,0,0.12);
      overflow: hidden;
      min-width: 80px;
      border: 2px solid transparent;
      transition: all var(--transition-zoom);
    }
    
    .phase-bar:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.18);
      border-color: rgba(255,255,255,0.4);
    }
    
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideIn 0.3s var(--spring);
      z-index: 1000;
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      font-size: 14px;
    }
    
    .btn-primary {
      background: var(--primary);
      color: white;
    }
    
    .btn-primary:hover {
      background: #0056CC;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,122,255,0.3);
    }
    
    .btn-secondary {
      background: var(--surface);
      color: var(--text-primary);
      border: 1px solid var(--border-strong);
    }
    
    .btn-secondary:hover {
      background: #F8F8F8;
      transform: translateY(-1px);
    }
    
    .detail-panel {
      position: fixed;
      right: 0;
      top: 0;
      width: 420px;
      height: 100vh;
      background: white;
      box-shadow: -4px 0 24px rgba(0,0,0,0.12);
      transform: translateX(100%);
      transition: transform 0.3s var(--spring);
      z-index: 100;
      overflow-y: auto;
    }
    
    .detail-panel.open {
      transform: translateX(0);
    }
    
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 200;
    }
    
    .modal-content {
      background: white;
      border-radius: 16px;
      max-width: 800px;
      max-height: 90vh;
      overflow: auto;
      box-shadow: var(--shadow-strong);
    }
  `;
APPEOF

echo "✅ Part 6 complete! Run restore-part-7.sh next"
