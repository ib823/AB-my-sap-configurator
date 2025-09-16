import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Calendar, Clock, Users, DollarSign, AlertCircle, Check, Trash2, Plus, ChevronDown, ChevronUp, Settings, Download, Upload, Copy, Search, Filter, BarChart2, TrendingUp, Package, Zap, Shield, Grid, List, Eye, EyeOff, Edit2, Save, X, ChevronRight, Moon, Sun, Briefcase, Target, MapPin, Building, Hash, Mail, Phone, Percent, User, UserPlus, UserMinus, Move, GripVertical } from 'lucide-react';

export default function ProjectTimeline() {
  /* ===========================
     DESIGN SYSTEM & GLOBAL CSS
     =========================== */
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
      --border: rgba(0, 0, 0, 0.06);
      --border-strong: rgba(0, 0, 0, 0.12);
      --shadow-soft: 0 1px 3px rgba(0, 0, 0, 0.12);
      --shadow-medium: 0 8px 25px rgba(0, 0, 0, 0.15);
      --shadow-strong: 0 16px 40px rgba(0, 0, 0, 0.25);
      --radius: 12px;
      --transition: cubic-bezier(0.25, 0.46, 0.45, 0.94);
      --spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
      --unit-width: 80px;
    }

    * {
      box-sizing: border-box;
    }

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

    /* Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .title {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.3px;
      margin: 0;
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .project-status-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 6px;
      flex-wrap: wrap;
    }

    .status-metric {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--text-secondary);
      font-weight: 600;
    }

    .status-metric-value {
      color: var(--text-primary);
      font-weight: 800;
    }

    .status-separator {
      width: 1px;
      height: 18px;
      background: var(--border);
    }

    /* Buttons */
    .primary-action {
      background: var(--primary);
      color: #fff;
      border: none;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all .3s var(--spring);
      box-shadow: var(--shadow-soft);
      display: inline-flex;
      align-items: center;
    }

    .primary-action:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-medium);
    }

    .secondary-action {
      background: var(--surface);
      color: var(--text-primary);
      border: 1px solid var(--border);
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
    }

    /* Timeline Container */
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
      backdrop-filter: blur(8px);
    }

    .timeline-header-inner {
      padding: 0 24px;
      overflow-x: auto;
      scrollbar-width: none;
    }

    .timeline-header-inner::-webkit-scrollbar {
      display: none;
    }

    .timeline-scale {
      display: flex;
      min-width: max-content;
    }

    .scale-unit {
      min-width: var(--unit-width);
      width: var(--unit-width);
      text-align: center;
      border-right: 1px solid var(--border);
      position: relative;
      padding: 8px 4px;
      flex-shrink: 0;
    }

    .scale-unit.today {
      background: rgba(0, 122, 255, 0.10);
    }

    .scale-unit.holiday {
      background: rgba(255, 149, 0, 0.10);
      border-left: 3px solid var(--warning);
    }

    .date-line-1 {
      font-size: 12px;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1.2;
    }

    .date-line-2 {
      font-size: 11px;
      color: var(--text-secondary);
      font-weight: 700;
      line-height: 1.2;
      margin-top: 2px;
    }

    .date-line-3 {
      font-size: 10px;
      color: var(--text-tertiary);
      font-weight: 700;
      line-height: 1.2;
      margin-top: 1px;
    }

    /* Timeline Body */
    .timeline-body {
      position: relative;
      overflow-x: auto;
    }

    .timeline-content {
      position: relative;
      min-width: max-content;
    }

    .timeline-grid {
      position: absolute;
      top: 0;
      left: 24px;
      right: 24px;
      bottom: 0;
      display: flex;
      pointer-events: none;
      min-width: max-content;
    }

    .grid-line {
      border-right: 1px solid var(--border);
      min-width: var(--unit-width);
      width: var(--unit-width);
      flex-shrink: 0;
    }

    .grid-line.today {
      background: rgba(0, 122, 255, 0.06);
    }

    .grid-line.holiday {
      background: rgba(255, 149, 0, 0.04);
    }

    .timeline-phases {
      position: relative;
      padding: 24px;
      min-height: 200px;
      min-width: max-content;
    }

    /* Phase Bars */
    .phase-bar {
      position: absolute;
      min-height: 52px;
      border-radius: 10px;
      padding: 0;
      transition: all 0.3s var(--spring);
      box-shadow: var(--shadow-soft);
      cursor: pointer;
      user-select: none;
      overflow: visible;
    }

    .phase-bar:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
      z-index: 5;
    }

    .phase-bar.dragging {
      opacity: 0.8;
      z-index: 1000;
      cursor: grabbing;
    }

    /* Drag Handle */
    .phase-drag-handle {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 20px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 10px 0 0 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .phase-bar:hover .phase-drag-handle {
      opacity: 1;
    }

    .phase-drag-handle:hover {
      background: rgba(0, 0, 0, 0.2);
    }

    /* Phase Content */
    .phase-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 12px 12px 32px;
      min-height: 52px;
      position: relative;
      z-index: 1;
    }

    .phase-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .phase-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .phase-info {
      flex: 1;
    }

    .phase-title {
      font-size: 14px;
      font-weight: 900;
      margin: 0;
      line-height: 1.2;
      color: #fff;
    }

    .phase-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }

    .phase-duration {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(255, 255, 255, 0.2);
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: 700;
    }

    /* Resource Avatars */
    .resource-avatars {
      display: flex;
      margin-left: 8px;
    }

    .resource-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid #fff;
      margin-left: -8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 900;
      color: #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .resource-avatar:first-child {
      margin-left: 0;
    }

    .resource-count {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.8);
      border: 2px solid #fff;
      margin-left: -8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 900;
      color: #fff;
    }

    /* Delete Button */
    .phase-delete-btn {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #ff3b30;
      color: #fff;
      border: 2px solid #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: all 0.2s ease;
      z-index: 10;
      box-shadow: 0 2px 8px rgba(255, 59, 48, 0.4);
    }

    .phase-bar:hover .phase-delete-btn {
      opacity: 1;
    }

    .phase-delete-btn:hover {
      background: #ff1744;
      transform: scale(1.1);
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      min-height: 200px;
    }

    .empty-icon {
      width: 48px;
      height: 48px;
      color: var(--text-tertiary);
      margin-bottom: 12px;
    }

    .empty-title {
      font-size: 18px;
      font-weight: 800;
      margin-bottom: 6px;
    }

    .empty-subtitle {
      font-size: 14px;
      text-align: center;
      margin-bottom: 16px;
      max-width: 360px;
      line-height: 1.4;
      color: var(--text-secondary);
    }

    /* Detail Panel */
    .detail-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 420px;
      height: 100vh;
      background: var(--surface);
      box-shadow: -8px 0 25px rgba(0, 0, 0, 0.15);
      transform: translateX(100%);
      transition: transform .45s var(--spring);
      z-index: 100;
      overflow-y: auto;
    }

    .detail-panel.open {
      transform: translateX(0);
    }

    .detail-header {
      padding: 20px;
      border-bottom: 1px solid var(--border);
      background: linear-gradient(135deg, var(--surface) 0%, #F8F9FB 100%);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .detail-title {
      font-size: 20px;
      font-weight: 900;
      margin: 0 0 4px 0;
    }

    .detail-subtitle {
      font-size: 13px;
      color: var(--text-secondary);
      margin: 0;
    }

    .detail-content {
      padding: 20px;
    }

    .detail-section {
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 15px;
      font-weight: 900;
      margin: 0 0 10px 0;
    }

    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 800;
      margin-bottom: 6px;
      color: var(--text-primary);
    }

    .form-input,
    .form-select {
      width: 100%;
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 14px;
      background: var(--surface);
    }

    .form-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .checkbox {
      width: 16px;
      height: 16px;
      accent-color: var(--primary);
    }

    .backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      opacity: 0;
      pointer-events: none;
      transition: opacity .45s var(--transition);
      z-index: 99;
    }

    .backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }

    /* Notifications */
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    /* Drag Ghost */
    .drag-ghost {
      position: absolute;
      pointer-events: none;
      opacity: 0.5;
      border: 2px dashed var(--primary);
      border-radius: 10px;
      background: rgba(0, 122, 255, 0.1);
      z-index: 999;
    }
  `;

  /* ==========================
     CONSTANTS & CONFIG
     ========================== */
  const BUSINESS_DAY_BASE_DATE = new Date('2025-01-20');
  const DEFAULT_HOLIDAYS = [
    { date: '2025-01-25', name: 'Chinese New Year Eve', type: 'public' },
    { date: '2025-01-26', name: 'Chinese New Year', type: 'public' },
    { date: '2025-01-27', name: 'Chinese New Year Holiday', type: 'public' },
    { date: '2025-02-10', name: 'Thaipusam', type: 'public' },
    { date: '2025-03-31', name: 'Hari Raya Puasa', type: 'public' },
    { date: '2025-04-01', name: 'Hari Raya Puasa Holiday', type: 'public' },
    { date: '2025-05-01', name: 'Labour Day', type: 'public' },
    { date: '2025-05-12', name: 'Wesak Day', type: 'public' },
    { date: '2025-06-02', name: "King's Birthday", type: 'public' },
    { date: '2025-06-07', name: 'Hari Raya Haji', type: 'public' },
    { date: '2025-08-31', name: 'National Day', type: 'public' },
    { date: '2025-09-16', name: 'Malaysia Day', type: 'public' },
    { date: '2025-10-22', name: 'Deepavali', type: 'public' },
    { date: '2025-12-25', name: 'Christmas Day', type: 'public' }
  ];

  const RESOURCE_RATES = {
    'Project Manager': 750,
    'Solution Architect': 850,
    'Technical Consultant': 650,
    'Functional Consultant': 600,
    'Developer': 550,
    'Business Analyst': 500,
    'Tester': 400,
    'Change Manager': 600
  };

  /* ==========================
     STATE MANAGEMENT
     ========================== */
  const [phases, setPhases] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [holidays, setHolidays] = useState(DEFAULT_HOLIDAYS);
  const [notifications, setNotifications] = useState([]);
  const [errors, setErrors] = useState({});
  
  // Drag & Drop States
  const [draggedPhase, setDraggedPhase] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);

  /* ==========================
     UTILITY FUNCTIONS
     ========================== */
  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const isHoliday = (date, holidayList = holidays) => {
    const dateStr = date.toISOString().split('T')[0];
    return holidayList.some(h => h.date === dateStr);
  };

  const isBusinessDay = (date, holidayList = holidays) => {
    return !isWeekend(date) && !isHoliday(date, holidayList);
  };

  const addBusinessDays = (startDate, days, holidayList = holidays) => {
    const date = new Date(startDate);
    let remainingDays = days;
    
    while (remainingDays > 0) {
      date.setDate(date.getDate() + 1);
      if (isBusinessDay(date, holidayList)) {
        remainingDays--;
      }
    }
    
    return date;
  };

  const businessDaysBetween = (startDate, endDate, holidayList = holidays) => {
    let count = 0;
    const current = new Date(startDate);
    
    while (current < endDate) {
      if (isBusinessDay(current, holidayList)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  };

  const dateToBusinessDay = (date, holidayList = holidays, skipHolidays = true, baseDate = BUSINESS_DAY_BASE_DATE) => {
    if (date < baseDate) return 0;
    
    if (skipHolidays) {
      return businessDaysBetween(baseDate, date, holidayList);
    } else {
      const msPerDay = 1000 * 60 * 60 * 24;
      return Math.floor((date - baseDate) / msPerDay);
    }
  };

  const businessDayToDate = (businessDay, holidayList = holidays, skipHolidays = true, baseDate = BUSINESS_DAY_BASE_DATE) => {
    if (businessDay <= 0) return new Date(baseDate);
    
    if (skipHolidays) {
      return addBusinessDays(baseDate, businessDay, holidayList);
    } else {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + businessDay);
      return date;
    }
  };

  const calculateEndDate = (startDate, workingDays, holidayList = holidays, skipHolidays = true) => {
    if (skipHolidays) {
      return addBusinessDays(startDate, workingDays - 1, holidayList);
    } else {
      const date = new Date(startDate);
      date.setDate(date.getDate() + workingDays - 1);
      return date;
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateElegant = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Project Management': '#007AFF',
      'Technical Setup': '#5856D6',
      'Configuration': '#34C759',
      'Development': '#FF9500',
      'Testing': '#FF3B30',
      'Training': '#AF52DE',
      'Deployment': '#FF2D55',
      'Change Management': '#00C7BE'
    };
    return colors[category] || '#007AFF';
  };

  /* ==========================
     TIMELINE ZOOM & RENDERING
     ========================== */
  const getOptimalZoomLevel = (totalBusinessDays, containerWidth) => {
    const levels = [
      { name: 'daily', unit: 1, minWidth: 80, label: 'Daily' },
      { name: 'weekly', unit: 5, minWidth: 100, label: 'Weekly' },
      { name: 'biweekly', unit: 10, minWidth: 120, label: 'Bi-weekly' },
      { name: 'monthly', unit: 20, minWidth: 140, label: 'Monthly' },
      { name: 'quarterly', unit: 60, minWidth: 160, label: 'Quarterly' }
    ];
    
    // Special case: if timeline exceeds 10 years, allow scrolling
    if (totalBusinessDays > 2600) {
      const level = levels[4]; // quarterly
      document.documentElement.style.setProperty('--unit-width', `${level.minWidth}px`);
      return level;
    }
    
    // Find the best fit level
    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];
      const unitsNeeded = Math.ceil(totalBusinessDays / level.unit);
      const totalWidth = unitsNeeded * level.minWidth;
      
      if (totalWidth <= containerWidth || i === levels.length - 1) {
        const unitWidth = Math.max(level.minWidth, containerWidth / unitsNeeded);
        document.documentElement.style.setProperty('--unit-width', `${unitWidth}px`);
        return level;
      }
    }
    
    return levels[levels.length - 1];
  };

  const autoFitTimeline = useCallback(() => {
    const bodyScroll = document.querySelector('.timeline-body');
    if (!bodyScroll) return;
    
    if (!phases.length) {
      document.documentElement.style.setProperty('--unit-width', '80px');
      return;
    }
    
    const containerWidth = bodyScroll.clientWidth - 48;
    const minStart = Math.min(...phases.map(p => p.startBusinessDay));
    const maxEnd = Math.max(...phases.map(p => p.startBusinessDay + p.workingDays));
    const totalBusinessDays = maxEnd - minStart + 10; // Add padding
    
    getOptimalZoomLevel(totalBusinessDays, containerWidth);
  }, [phases]);

  const generateZoomedBusinessDays = (baseDate, totalDays, zoomLevel) => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < Math.ceil(totalDays / zoomLevel.unit); i++) {
      const startDay = i * zoomLevel.unit;
      const date = businessDayToDate(startDay, holidays, true, baseDate);
      const endDate = businessDayToDate(Math.min(startDay + zoomLevel.unit - 1, totalDays - 1), holidays, true, baseDate);
      
      // Check for holidays in the range based on zoom level
      let hasHoliday = false;
      if (zoomLevel.name === 'daily' || zoomLevel.name === 'weekly') {
        const tempDate = new Date(date);
        while (tempDate <= endDate) {
          if (isHoliday(tempDate, holidays)) {
            hasHoliday = true;
            break;
          }
          tempDate.setDate(tempDate.getDate() + 1);
        }
      } else if (zoomLevel.name === 'monthly') {
        let holidayCount = 0;
        const tempDate = new Date(date);
        while (tempDate <= endDate) {
          if (isHoliday(tempDate, holidays) && !isWeekend(tempDate)) {
            holidayCount++;
          }
          tempDate.setDate(tempDate.getDate() + 1);
        }
        hasHoliday = holidayCount >= 1;
      } else if (zoomLevel.name === 'quarterly') {
        let holidayCount = 0;
        const tempDate = new Date(date);
        while (tempDate <= endDate) {
          if (isHoliday(tempDate, holidays) && !isWeekend(tempDate)) {
            holidayCount++;
          }
          tempDate.setDate(tempDate.getDate() + 1);
        }
        hasHoliday = holidayCount > 3;
      }
      
      days.push({
        businessDay: startDay,
        date,
        endDate,
        isToday: date <= today && today <= endDate,
        isHoliday: hasHoliday,
        label: formatDateLabel(date, endDate, zoomLevel)
      });
    }
    
    return days;
  };

  const formatDateLabel = (startDate, endDate, zoomLevel) => {
    switch(zoomLevel.name) {
      case 'daily':
        return {
          line1: startDate.toLocaleDateString('en-US', { weekday: 'short' }),
          line2: startDate.getDate().toString(),
          line3: startDate.toLocaleDateString('en-US', { month: 'short' })
        };
      case 'weekly':
        return {
          line1: `Week ${Math.ceil(startDate.getDate() / 7)}`,
          line2: `${startDate.getDate()}-${endDate.getDate()}`,
          line3: startDate.toLocaleDateString('en-US', { month: 'short' })
        };
      case 'biweekly':
        return {
          line1: `${startDate.getDate()}-${endDate.getDate()}`,
          line2: startDate.toLocaleDateString('en-US', { month: 'short' }),
          line3: startDate.getFullYear().toString()
        };
      case 'monthly':
        return {
          line1: `${startDate.getDate()}-${endDate.getDate()}`,
          line2: startDate.toLocaleDateString('en-US', { month: 'short' }),
          line3: startDate.getFullYear().toString()
        };
      case 'quarterly':
        const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
        const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
        return {
          line1: `${startMonth}-${endMonth}`,
          line2: startDate.getFullYear().toString(),
          line3: ''
        };
      default:
        return { line1: '', line2: '', line3: '' };
    }
  };

  /* ==========================
     PHASE MANAGEMENT
     ========================== */
  const addPhase = () => {
    const todayBusinessDay = dateToBusinessDay(new Date(), holidays, true, BUSINESS_DAY_BASE_DATE);
    const minStartDay = Math.max(todayBusinessDay, 0);
    
    const newPhase = {
      id: Date.now(),
      name: "New Phase",
      status: "idle",
      startBusinessDay: phases.length
        ? Math.max(minStartDay, ...phases.map(p => p.startBusinessDay + p.workingDays))
        : minStartDay,
      workingDays: 5,
      color: '#007AFF',
      description: '',
      skipHolidays: true,
      resources: [],
      category: 'Configuration'
    };
    
    setPhases(prev => [...prev, newPhase]);
    setTimeout(() => autoFitTimeline(), 50);
  };

  const updatePhase = (id, updates) => {
    setPhases(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    
    if (selectedPhase?.id === id) {
      setSelectedPhase(prev => ({ ...prev, ...updates }));
    }
    
    setTimeout(() => autoFitTimeline(), 50);
  };

  const deletePhase = (id) => {
    setPhases(prev => prev.filter(p => p.id !== id));
    if (selectedPhase?.id === id) {
      closePhaseDetail();
    }
  };

  /* ==========================
     DRAG & DROP HANDLERS
     ========================== */
  const handleDragStart = (e, phase) => {
    setDraggedPhase(phase);
    setIsDragging(true);
    
    // Calculate offset from mouse to phase start
    const phaseElement = e.currentTarget;
    const rect = phaseElement.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    // Create transparent drag image
    const dragImage = new Image();
    dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    
    if (!draggedPhase) return;
    
    // Calculate new business day based on drop position
    const timelineBody = document.querySelector('.timeline-body');
    const rect = timelineBody.getBoundingClientRect();
    const scrollLeft = timelineBody.scrollLeft;
    const x = e.clientX - rect.left + scrollLeft - 24; // Adjust for padding
    
    const unitWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--unit-width'));
    const newBusinessDay = Math.max(0, Math.round(x / unitWidth));
    
    // Update phase position
    updatePhase(draggedPhase.id, { startBusinessDay: newBusinessDay });
    
    // Reset drag state
    setDraggedPhase(null);
    setIsDragging(false);
    
    addNotification(`Moved ${draggedPhase.name} to day ${newBusinessDay}`, 'success');
  };

  const handleDragEnd = () => {
    setDraggedPhase(null);
    setIsDragging(false);
  };

  /* ==========================
     CALCULATIONS
     ========================== */
  const calculatePhasePersonDays = (phase) => {
    const totalAllocation = (phase.resources || []).reduce(
      (sum, r) => sum + (r.allocation || 0) / 100,
      0
    );
    return Math.round(phase.workingDays * totalAllocation);
  };

  const calculatePhaseCost = (phase) => {
    const dailyCost = (phase.resources || []).reduce(
      (sum, r) => sum + ((RESOURCE_RATES[r.role] || 400) * 8 * (r.allocation || 0) / 100),
      0
    );
    return dailyCost * phase.workingDays;
  };

  const calculateTotalCost = () => {
    return phases.reduce((sum, phase) => sum + calculatePhaseCost(phase), 0);
  };

  const calculateTotalDuration = () => {
    if (!phases.length) return 0;
    const minStart = Math.min(...phases.map(p => p.startBusinessDay));
    const maxEnd = Math.max(...phases.map(p => p.startBusinessDay + p.workingDays));
    return maxEnd - minStart;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  /* ==========================
     RESOURCE MANAGEMENT
     ========================== */
  const addResource = (phaseId) => {
    const phase = phases.find(p => p.id === phaseId);
    if (!phase) return;
    
    const newResource = {
      id: Date.now(),
      name: `Team Member ${(phase.resources?.length || 0) + 1}`,
      role: 'Developer',
      allocation: 100
    };
    
    updatePhase(phaseId, {
      resources: [...(phase.resources || []), newResource]
    });
  };

  const updateResource = (phaseId, resourceId, updates) => {
    setPhases(prev => prev.map(p => 
      p.id === phaseId
        ? {
            ...p,
            resources: (p.resources || []).map(r =>
              r.id === resourceId ? { ...r, ...updates } : r
            )
          }
        : p
    ));
  };

  const deleteResource = (phaseId, resourceId) => {
    setPhases(prev => prev.map(p => 
      p.id === phaseId
        ? {
            ...p,
            resources: (p.resources || []).filter(r => r.id !== resourceId)
          }
        : p
    ));
  };

  /* ==========================
     NOTIFICATIONS
     ========================== */
  const addNotification = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const notification = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  };

  /* ==========================
     PHASE DETAIL PANEL
     ========================== */
  const openPhaseDetail = (phase) => {
    setSelectedPhase(phase);
    setDetailPanelOpen(true);
  };

  const closePhaseDetail = () => {
    setDetailPanelOpen(false);
    setTimeout(() => setSelectedPhase(null), 250);
  };

  /* ==========================
     EFFECTS
     ========================== */
  useEffect(() => {
    autoFitTimeline();
    
    const handleResize = () => {
      autoFitTimeline();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [autoFitTimeline]);

  /* ==========================
     MEMOIZED VALUES
     ========================== */
  const memoizedTimelineData = useMemo(() => {
    if (!phases.length) {
      const zoomLevel = { name: 'daily', unit: 1, minWidth: 80, label: 'Daily' };
      const totalBusinessDays = 30;
      const businessDays = generateZoomedBusinessDays(BUSINESS_DAY_BASE_DATE, totalBusinessDays, zoomLevel);
      
      return { businessDays, totalBusinessDays, zoomLevel };
    }
    
    const minStart = Math.min(...phases.map(p => p.startBusinessDay));
    const maxEnd = Math.max(...phases.map(p => p.startBusinessDay + p.workingDays));
    const startOffset = Math.max(0, minStart - 2);
    const totalBusinessDays = maxEnd - startOffset + 10;
    
    const container = document.querySelector('.timeline-body');
    const containerWidth = container ? container.clientWidth - 48 : 900;
    const zoomLevel = getOptimalZoomLevel(totalBusinessDays, containerWidth);
    
    const businessDays = generateZoomedBusinessDays(
      businessDayToDate(startOffset, holidays, true, BUSINESS_DAY_BASE_DATE),
      totalBusinessDays,
      zoomLevel
    );
    
    return { businessDays, totalBusinessDays, zoomLevel, startOffset };
  }, [phases, holidays]);

  /* ==========================
     PHASE POSITIONING
     ========================== */
  const getPhasePosition = useCallback((phase) => {
    const unitWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--unit-width')) || 80;
    const zoomLevel = memoizedTimelineData.zoomLevel || { unit: 1 };
    const startOffset = memoizedTimelineData.startOffset || 0;
    
    // Calculate position relative to the start offset
    const relativeBusinessDay = phase.startBusinessDay - startOffset;
    const left = (relativeBusinessDay / zoomLevel.unit) * unitWidth;
    const width = Math.max(40, (phase.workingDays / zoomLevel.unit) * unitWidth);
    
    // Calculate row to avoid overlaps
    const phaseIndex = phases.findIndex(p => p.id === phase.id);
    const row = phaseIndex % 3;
    const top = 20 + row * 70;
    
    return {
      position: 'absolute',
      left: `${left}px`,
      width: `${width}px`,
      top: `${top}px`,
      background: phase.color || getCategoryColor(phase.category || 'Configuration')
    };
  }, [phases, memoizedTimelineData]);

  /* ==========================
     RENDER
     ========================== */
  return (
    <>
      <style>{styles}</style>
      
      <div className="app">
        {/* Header */}
        <div className="header">
          <div>
            <h1 className="title">SAP Implementation Timeline</h1>
            <div className="project-status-bar">
              <div className="status-metric">
                <Calendar size={16} />
                <span>Duration: <span className="status-metric-value">{calculateTotalDuration()} days</span></span>
              </div>
              <div className="status-separator" />
              <div className="status-metric">
                <Users size={16} />
                <span>Phases: <span className="status-metric-value">{phases.length}</span></span>
              </div>
              <div className="status-separator" />
              <div className="status-metric">
                <DollarSign size={16} />
                <span>Budget: <span className="status-metric-value">{formatCurrency(calculateTotalCost())}</span></span>
              </div>
            </div>
          </div>
          
          <div className="header-controls">
            <button className="primary-action" onClick={addPhase}>
              <Plus size={16} style={{ marginRight: 4 }} />
              Add Phase
            </button>
            <button className="secondary-action" onClick={autoFitTimeline}>
              <Settings size={16} style={{ marginRight: 4 }} />
              Auto Fit
            </button>
            <button className="secondary-action">
              <Download size={16} style={{ marginRight: 4 }} />
              Export
            </button>
          </div>
        </div>
        
        {/* Timeline Container */}
        <div className="timeline-container">
          {/* Timeline Header */}
          <div className="timeline-header">
            <div className="timeline-header-inner">
              <div className="timeline-scale">
                {memoizedTimelineData.businessDays.map((day, index) => (
                  <div
                    key={index}
                    className={`scale-unit ${day.isToday ? 'today' : ''} ${day.isHoliday ? 'holiday' : ''}`}
                  >
                    <div className="date-line-1">{day.label.line1}</div>
                    <div className="date-line-2">{day.label.line2}</div>
                    {day.label.line3 && <div className="date-line-3">{day.label.line3}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Timeline Body */}
          <div className="timeline-body">
            <div className="timeline-content">
              {/* Grid Lines */}
              <div className="timeline-grid">
                {memoizedTimelineData.businessDays.map((day, index) => (
                  <div
                    key={index}
                    className={`grid-line ${day.isToday ? 'today' : ''} ${day.isHoliday ? 'holiday' : ''}`}
                  />
                ))}
              </div>
              
              {/* Timeline Phases */}
              <div 
                className="timeline-phases"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {phases.length === 0 ? (
                  <div className="empty-state">
                    <Package className="empty-icon" />
                    <div className="empty-title">No phases yet</div>
                    <div className="empty-subtitle">
                      Click "Add Phase" to start building your project timeline
                    </div>
                  </div>
                ) : (
                  phases.map((phase) => (
                    <div
                      key={phase.id}
                      className={`phase-bar ${isDragging && draggedPhase?.id === phase.id ? 'dragging' : ''}`}
                      style={getPhasePosition(phase)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, phase)}
                      onDragEnd={handleDragEnd}
                      onClick={() => openPhaseDetail(phase)}
                    >
                      {/* Drag Handle */}
                      <div className="phase-drag-handle">
                        <GripVertical size={14} color="rgba(255,255,255,0.8)" />
                      </div>
                      
                      {/* Phase Content */}
                      <div className="phase-content">
                        <div className="phase-left">
                          <div className="phase-info">
                            <div className="phase-title">{phase.name}</div>
                            <div className="phase-meta">
                              <div className="phase-duration">
                                <Clock size={10} />
                                {phase.workingDays}d
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="phase-right">
                          {/* Resource Avatars */}
                          {phase.resources && phase.resources.length > 0 && (
                            <div className="resource-avatars">
                              {phase.resources.slice(0, 3).map((resource, idx) => (
                                <div
                                  key={resource.id}
                                  className="resource-avatar"
                                  style={{
                                    background: `hsl(${(idx * 137.5) % 360}, 70%, 50%)`
                                  }}
                                  title={`${resource.name} (${resource.role})`}
                                >
                                  {resource.name ? resource.name.charAt(0).toUpperCase() : 'R'}
                                </div>
                              ))}
                              {phase.resources.length > 3 && (
                                <div className="resource-count">
                                  +{phase.resources.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Delete Button */}
                      <button
                        className="phase-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete "${phase.name}"?`)) {
                            deletePhase(phase.id);
                          }
                        }}
                        title="Delete phase"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Notifications */}
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }}>
          {notifications.map(notification => (
            <div
              key={notification.id}
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                background: notification.type === 'success' ? '#34C759' : 
                           notification.type === 'error' ? '#FF3B30' : '#007AFF',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                animation: 'slideInRight 0.3s ease-out'
              }}
            >
              {notification.message}
            </div>
          ))}
        </div>
      </div>
      
      {/* Detail Panel */}
      {selectedPhase && (
        <>
          <div className={`backdrop ${detailPanelOpen ? 'open' : ''}`} onClick={closePhaseDetail} />
          <div className={`detail-panel ${detailPanelOpen ? 'open' : ''}`}>
            <div className="detail-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="detail-title">{selectedPhase.name}</div>
                  <div className="detail-subtitle">
                    {formatDateElegant(businessDayToDate(selectedPhase.startBusinessDay, holidays, true, BUSINESS_DAY_BASE_DATE))} - 
                    {' '}{formatDateElegant(calculateEndDate(
                      businessDayToDate(selectedPhase.startBusinessDay, holidays, true, BUSINESS_DAY_BASE_DATE),
                      selectedPhase.workingDays,
                      holidays,
                      selectedPhase.skipHolidays
                    ))}
                  </div>
                </div>
                <button className="secondary-action" onClick={closePhaseDetail}>
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div className="detail-content">
              {/* Basic Info */}
              <div className="detail-section">
                <h3 className="section-title">Basic Information</h3>
                
                <label className="form-label">Phase Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={selectedPhase.name}
                  onChange={(e) => updatePhase(selectedPhase.id, { name: e.target.value })}
                  style={{ marginBottom: 12 }}
                />
                
                <label className="form-label">Working Days</label>
                <input
                  type="number"
                  className="form-input"
                  value={selectedPhase.workingDays}
                  onChange={(e) => updatePhase(selectedPhase.id, { workingDays: parseInt(e.target.value) || 1 })}
                  min="1"
                  style={{ marginBottom: 12 }}
                />
                
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={selectedPhase.category || 'Configuration'}
                  onChange={(e) => updatePhase(selectedPhase.id, { 
                    category: e.target.value,
                    color: getCategoryColor(e.target.value)
                  })}
                  style={{ marginBottom: 12 }}
                >
                  <option value="Project Management">Project Management</option>
                  <option value="Technical Setup">Technical Setup</option>
                  <option value="Configuration">Configuration</option>
                  <option value="Development">Development</option>
                  <option value="Testing">Testing</option>
                  <option value="Training">Training</option>
                  <option value="Deployment">Deployment</option>
                  <option value="Change Management">Change Management</option>
                </select>
                
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  value={selectedPhase.description || ''}
                  onChange={(e) => updatePhase(selectedPhase.id, { description: e.target.value })}
                  rows={3}
                  style={{ marginBottom: 12, resize: 'vertical' }}
                />
                
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={selectedPhase.skipHolidays}
                    onChange={(e) => updatePhase(selectedPhase.id, { skipHolidays: e.target.checked })}
                  />
                  Skip holidays and weekends
                </label>
              </div>
              
              {/* Resources */}
              <div className="detail-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <h3 className="section-title" style={{ margin: 0 }}>Resources</h3>
                  <button
                    className="primary-action"
                    onClick={() => addResource(selectedPhase.id)}
                    style={{ padding: '6px 10px', fontSize: 12 }}
                  >
                    <UserPlus size={14} style={{ marginRight: 4 }} />
                    Add
                  </button>
                </div>
                
                {selectedPhase.resources && selectedPhase.resources.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedPhase.resources.map((resource) => (
                      <div
                        key={resource.id}
                        style={{
                          padding: 12,
                          background: 'rgba(0,0,0,0.03)',
                          borderRadius: 8,
                          border: '1px solid var(--border)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <input
                            type="text"
                            value={resource.name}
                            onChange={(e) => updateResource(selectedPhase.id, resource.id, { name: e.target.value })}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              fontSize: 14,
                              fontWeight: 600,
                              flex: 1
                            }}
                          />
                          <button
                            onClick={() => deleteResource(selectedPhase.id, resource.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#FF3B30'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <div>
                            <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Role</label>
                            <select
                              value={resource.role}
                              onChange={(e) => updateResource(selectedPhase.id, resource.id, { role: e.target.value })}
                              style={{
                                width: '100%',
                                padding: 4,
                                fontSize: 12,
                                border: '1px solid var(--border)',
                                borderRadius: 4
                              }}
                            >
                              <option value="Project Manager">Project Manager</option>
                              <option value="Solution Architect">Solution Architect</option>
                              <option value="Technical Consultant">Technical Consultant</option>
                              <option value="Functional Consultant">Functional Consultant</option>
                              <option value="Developer">Developer</option>
                              <option value="Business Analyst">Business Analyst</option>
                              <option value="Tester">Tester</option>
                              <option value="Change Manager">Change Manager</option>
                            </select>
                          </div>
                          
                          <div>
                            <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Allocation %</label>
                            <input
                              type="number"
                              value={resource.allocation}
                              onChange={(e) => updateResource(selectedPhase.id, resource.id, { allocation: parseInt(e.target.value) || 0 })}
                              min="0"
                              max="100"
                              style={{
                                width: '100%',
                                padding: 4,
                                fontSize: 12,
                                border: '1px solid var(--border)',
                                borderRadius: 4
                              }}
                            />
                          </div>
                        </div>
                        
                        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                          Rate: {formatCurrency(RESOURCE_RATES[resource.role] || 400)}/hour • 
                          Daily: {formatCurrency((RESOURCE_RATES[resource.role] || 400) * 8 * (resource.allocation / 100))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                    No resources assigned
                  </div>
                )}
              </div>
              
              {/* Summary */}
              <div className="detail-section">
                <h3 className="section-title">Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Person Days:</span>
                    <strong>{calculatePhasePersonDays(selectedPhase)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Cost:</span>
                    <strong>{formatCurrency(calculatePhaseCost(selectedPhase))}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Start Date:</span>
                    <strong>{formatDate(businessDayToDate(selectedPhase.startBusinessDay, holidays, true, BUSINESS_DAY_BASE_DATE))}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>End Date:</span>
                    <strong>{formatDate(calculateEndDate(
                      businessDayToDate(selectedPhase.startBusinessDay, holidays, true, BUSINESS_DAY_BASE_DATE),
                      selectedPhase.workingDays,
                      holidays,
                      selectedPhase.skipHolidays
                    ))}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
