#!/bin/bash
echo "🔧 Part 2: Adding state management and utilities..."

cat >> src/components/App.jsx << 'APPEOF'

/* ==========================
   MAIN COMPONENT START
   ========================== */
export default function ProjectTimeline() {
  /* ==========================
     STATE MANAGEMENT
     ========================== */
  const [phases, setPhases] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [holidays, setHolidays] = useState([
    { id: 1, date: "2024-01-01", name: "New Year's Day" },
    { id: 2, date: "2024-02-10", name: "Chinese New Year" },
    { id: 3, date: "2024-02-11", name: "Chinese New Year Holiday" },
    { id: 4, date: "2024-05-01", name: "Labour Day" },
    { id: 5, date: "2024-05-22", name: "Vesak Day" },
    { id: 6, date: "2024-06-17", name: "Hari Raya Haji" },
    { id: 7, date: "2024-08-31", name: "Merdeka Day" },
    { id: 8, date: "2024-09-16", name: "Malaysia Day" },
    { id: 9, date: "2024-10-31", name: "Deepavali" },
    { id: 10, date: "2024-12-25", name: "Christmas Day" }
  ]);
  const [clientProfile, setClientProfile] = useState({
    companyName: "",
    industry: "",
    region: "ABMY",
    size: "medium",
    complexity: "standard",
    timeline: "normal",
    employees: 500,
    annualRevenueMYR: 200000000
  });
  const [operatingMode, setOperatingMode] = useState("timeline");
  const [sapSelection, setSapSelection] = useState(null);
  const [showSAPModal, setShowSAPModal] = useState(false);
  const [selectedCatalogRegion, setSelectedCatalogRegion] = useState("ABMY");
  const [clientPresentationMode, setClientPresentationMode] = useState(false);
  const [projectLocation, setProjectLocation] = useState({
    city: "Kuala Lumpur",
    distanceFromKL: 0,
    isRemote: false,
    requiresFlights: false
  });
  const [errors, setErrors] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  /* ==========================
     UTILITY FUNCTIONS
     ========================== */
  const convertCurrency = (amount, fromRegion, toRegion) => {
    if (fromRegion === toRegion) return amount;
    const rate = CURRENCY_RATES[fromRegion]?.[toRegion];
    if (!rate) return amount;
    const fromCatalog = RESOURCE_CATALOG[fromRegion];
    const toCatalog = RESOURCE_CATALOG[toRegion];
    const normalizedAmount = amount / (fromCatalog?.multiplier || 1);
    const convertedAmount = normalizedAmount * rate * (toCatalog?.multiplier || 1);
    return Math.round(convertedAmount * 100) / 100;
  };

  const addNotification = (message, type = "info", duration = 3000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Foundation": "#007AFF",
      "Configuration": "#34C759",
      "Advanced Configuration": "#5856D6",
      "HR Setup": "#FF9500",
      "SCM Setup": "#FF3B30",
      "Technical": "#AF52DE",
      "Project Management": "#5AC8FA",
      "Change Management": "#FFCC00"
    };
    return colors[category] || "#8E8E93";
  };

  /* ==========================
     DATE & BUSINESS DAY FUNCTIONS
     ========================== */
  const isHoliday = (date, holidayList = holidays) => {
    const dateStr = date.toISOString().split('T')[0];
    return holidayList.some(h => h.date === dateStr);
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const isBusinessDay = (date, holidayList = holidays) => {
    return !isWeekend(date) && !isHoliday(date, holidayList);
  };

  const dateToBusinessDay = (date, holidayList = holidays, skipHolidays = true, baseDate = BUSINESS_DAY_BASE_DATE) => {
    if (!skipHolidays) {
      const msPerDay = 24 * 60 * 60 * 1000;
      return Math.floor((date - baseDate) / msPerDay);
    }
    let businessDayCount = 0;
    const current = new Date(baseDate);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    
    while (current < target) {
      if (isBusinessDay(current, holidayList)) {
        businessDayCount++;
      }
      current.setDate(current.getDate() + 1);
    }
    return businessDayCount;
  };

  const businessDayToDate = (businessDay, holidayList = holidays, skipHolidays = true, baseDate = BUSINESS_DAY_BASE_DATE) => {
    if (!skipHolidays) {
      const result = new Date(baseDate);
      result.setDate(result.getDate() + businessDay);
      return result;
    }
    const result = new Date(baseDate);
    let daysToAdd = businessDay;
    
    while (daysToAdd > 0) {
      result.setDate(result.getDate() + 1);
      if (isBusinessDay(result, holidayList)) {
        daysToAdd--;
      }
    }
    return result;
  };

  const calculateEndDate = (startDate, workingDays, holidayList = holidays, skipHolidays = true) => {
    if (!skipHolidays) {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + workingDays - 1);
      return endDate;
    }
    let endDate = new Date(startDate);
    let daysAdded = 0;
    
    while (daysAdded < workingDays - 1) {
      endDate.setDate(endDate.getDate() + 1);
      if (isBusinessDay(endDate, holidayList)) {
        daysAdded++;
      }
    }
    return endDate;
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
APPEOF

echo "✅ Part 2 complete! Run restore-part-3.sh next"
