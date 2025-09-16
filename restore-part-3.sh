#!/bin/bash
echo "🔧 Part 3: Adding phase management and SAP integration..."

cat >> src/components/App.jsx << 'APPEOF'

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
        ? Math.max(minStartDay, ...phases.map((p) => p.startBusinessDay + p.workingDays))
        : minStartDay,
      workingDays: 5,
      color: "#007AFF",
      description: "",
      skipHolidays: true,
      resources: []
    };
    setPhases((p) => [...p, newPhase]);
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
     SAP INTEGRATION
     ========================== */
  const calculateResourceRequirements = (sapPackage, profile) => {
    const cat = sapPackage.category || "Configuration";
    const region = profile?.region || "ABMY";
    const baseResources = {
      "Finance Core": [
        { role: "Manager", allocation: 100 },
        { role: "Senior Consultant", allocation: 100 },
        { role: "Consultant", allocation: 200 }
      ],
      "Configuration": [
        { role: "Senior Consultant", allocation: 100 },
        { role: "Consultant", allocation: 100 }
      ],
      "HR Setup": [
        { role: "Manager", allocation: 100 },
        { role: "Senior Consultant", allocation: 100 },
        { role: "Consultant", allocation: 100 }
      ],
      "SCM Setup": [
        { role: "Manager", allocation: 100 },
        { role: "Senior Consultant", allocation: 200 },
        { role: "Consultant", allocation: 200 }
      ]
    };

    const resources = baseResources[cat] || baseResources["Configuration"];
    return resources.map(r => ({
      id: Date.now() + Math.random(),
      ...r,
      region,
      hourlyRate: RESOURCE_CATALOG[region]?.positions[r.role]?.rate || 0
    }));
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
    return Math.max(2, Math.min(team, 10));
  };

  const buildFoundationPhases = (profile) => [
    {
      id: Date.now() + Math.random(),
      name: "Project Kickoff",
      phaseKey: "Project Kickoff",
      status: "idle",
      startBusinessDay: 0,
      workingDays: 2,
      color: getCategoryColor("Foundation"),
      description: "Initial project setup and team mobilization",
      skipHolidays: true,
      resources: [
        {
          id: Date.now() + Math.random(),
          role: "Partner",
          allocation: 50,
          region: profile.region || "ABMY",
          hourlyRate: RESOURCE_CATALOG[profile.region || "ABMY"]?.positions["Partner"]?.rate || 1200
        },
        {
          id: Date.now() + Math.random(),
          role: "Manager",
          allocation: 100,
          region: profile.region || "ABMY",
          hourlyRate: RESOURCE_CATALOG[profile.region || "ABMY"]?.positions["Manager"]?.rate || 600
        }
      ],
      category: "Foundation",
      dependencies: []
    },
    {
      id: Date.now() + Math.random(),
      name: "System Landscape Setup",
      phaseKey: "System Landscape Setup",
      status: "idle",
      startBusinessDay: 2,
      workingDays: 3,
      color: getCategoryColor("Foundation"),
      description: "SAP environment setup and configuration",
      skipHolidays: true,
      resources: calculateResourceRequirements({ category: "Configuration" }, profile),
      category: "Foundation",
      dependencies: ["Project Kickoff"]
    }
  ];

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

    const all = [...foundation, ...functionalPhases];
    return { phases: all, profile };
  };

  const importSAPTimeline = (sapPackages, clientData) => {
    const { phases: generatedPhases, profile } = generateTimelineFromSAPSelection(sapPackages, clientData);
    setPhases(generatedPhases);
    setSapSelection({ packages: sapPackages, clientData: profile });
    setClientProfile(profile);
    setOperatingMode("proposal_review");
    requestAnimationFrame(() => autoFitTimeline());
  };
APPEOF

echo "✅ Part 3 complete! Run restore-part-4.sh next"
