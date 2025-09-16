#!/bin/bash
echo "🔧 Part 4: Adding resource management and cost calculations..."

cat >> src/components/App.jsx << 'APPEOF'

  /* ==========================
     RESOURCE MANAGEMENT
     ========================== */
  const addResource = (phaseId) => {
    const phase = phases.find(p => p.id === phaseId);
    if (!phase) return;
    
    const newResource = {
      id: Date.now() + Math.random(),
      role: "Consultant",
      allocation: 100,
      region: selectedCatalogRegion,
      hourlyRate: RESOURCE_CATALOG[selectedCatalogRegion]?.positions["Consultant"]?.rate || 0,
      includeOPE: false
    };
    
    setPhases(prev => prev.map(p => 
      p.id === phaseId 
        ? { ...p, resources: [...(p.resources || []), newResource] }
        : p
    ));
  };

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

  const removeResource = (phaseId, resId) => {
    setPhases(prev => prev.map(p =>
      p.id === phaseId
        ? { ...p, resources: (p.resources || []).filter(r => r.id !== resId) }
        : p
    ));
  };

  /* ==========================
     COST CALCULATIONS
     ========================== */
  const calculateResourceOPE = (resource, phase, projectLoc = projectLocation) => {
    if (!resource?.includeOPE) return 0;
    const region = resource.region || "ABMY";
    const rates = OPE_RATES[region] || OPE_RATES.ABMY;
    const workingDays = Math.round((phase.workingDays * (resource.allocation || 0)) / 100);
    let opeTotal = 0;
    
    if (projectLoc.isRemote) return 0;

    if (projectLoc.distanceFromKL <= 2) {
      opeTotal += workingDays * rates.parking;
      opeTotal += workingDays * 50;
    } else {
      if (projectLoc.requiresFlights) {
        opeTotal += rates.flightDomestic;
        opeTotal += rates.taxiAirport;
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

  /* ==========================
     PROJECT METRICS
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
APPEOF

echo "✅ Part 4 complete! Run restore-part-5.sh next"
