import React from 'react';
import { SAPAppProvider } from './components/AppProvider';
import { SAPScopeApp } from './components/SAPScopeApp';

function App() {
  return (
    
      <SAPScopeApp />
    </SAPAppProvider>
  );
}


// Add this after your state declarations
const [holidayManagerOpen, setHolidayManagerOpen] = useState(false);

// Add auto-zoom functionality
const autoFitTimeline = useCallback(() => {
  if (!phases.length) return;
  
  const minStart = Math.min(...phases.map(p => p.startBusinessDay));
  const maxEnd = Math.max(...phases.map(p => p.startBusinessDay + p.workingDays));
  const totalSpan = maxEnd - minStart;
  
  // Adjust timeline view based on span
  console.log(`Timeline span: ${totalSpan} days`);
}, [phases]);

useEffect(() => {
  autoFitTimeline();
}, [phases, autoFitTimeline]);

<button onClick={() => setHolidayManagerOpen(true)} style={buttonStyle}>
  <Calendar size={16} /> Holidays
</button>

export default App;
