#!/bin/bash
echo "🔧 Part 5: Adding timeline zoom and export functionality..."

cat >> src/components/App.jsx << 'APPEOF'

  /* ==========================
     TIMELINE ZOOM & LAYOUT
     ========================== */
  const getOptimalZoomLevel = (totalBusinessDays, containerWidth) => {
    const zoomLevels = [
      { name: "daily", unit: 1, minWidth: 80, label: "Daily" },
      { name: "weekly", unit: 5, minWidth: 100, label: "Weekly" },
      { name: "monthly", unit: 20, minWidth: 120, label: "Monthly" }
    ];

    for (let level of zoomLevels) {
      const unitsNeeded = Math.ceil(totalBusinessDays / level.unit);
      const unitWidth = containerWidth / unitsNeeded;
      if (unitWidth >= level.minWidth) {
        return level;
      }
    }
    return zoomLevels[zoomLevels.length - 1];
  };

  const generateZoomedBusinessDays = (baseDate, totalDays, zoomLevel) => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < Math.ceil(totalDays / zoomLevel.unit); i++) {
      const dayIndex = i * zoomLevel.unit;
      const currentDate = businessDayToDate(dayIndex, holidays, true, baseDate);
      const isToday = currentDate.toDateString() === today.toDateString();
      
      let label = "";
      if (zoomLevel.name === "daily") {
        label = currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      } else if (zoomLevel.name === "weekly") {
        const weekEnd = new Date(currentDate);
        weekEnd.setDate(weekEnd.getDate() + 4);
        label = `Week of ${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
      } else {
        label = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
      
      days.push({
        index: i,
        businessDay: dayIndex,
        date: currentDate,
        label,
        isToday,
        isWeekend: false,
        isHoliday: isHoliday(currentDate, holidays)
      });
    }
    
    return days;
  };

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

  const getPhasePosition = (phase) => {
    const unitWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--unit-width")) || 80;
    const zoomLevel = window.currentZoomLevel || { unit: 1 };
    const offset = window.timelineStartOffset ?? 0;
    const adjustedStart = phase.startBusinessDay - offset;
    const left = (adjustedStart / zoomLevel.unit) * unitWidth;
    const width = Math.max(unitWidth * 0.8, (phase.workingDays / zoomLevel.unit) * unitWidth);
    return { left, width };
  };

  /* ==========================
     EXPORT & IMPORT
     ========================== */
  const exportToCSV = () => {
    if (!phases.length) {
      addNotification("No phases to export", "warning");
      return;
    }

    const startDate = getProjectStartDate();
    const endDate = getProjectEndDate();
    if (!startDate || !endDate) return;

    const weeks = [];
    const currentWeek = new Date(startDate);
    currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1);
    
    while (currentWeek <= endDate) {
      const weekEnd = new Date(currentWeek);
      weekEnd.setDate(weekEnd.getDate() + 4);
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
          const phaseEnd = calculateEndDate(phaseStart, phase.workingDays, holidays, phase.skipHolidays);
          
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
APPEOF

echo "✅ Part 5 complete! Run restore-part-6.sh next"
