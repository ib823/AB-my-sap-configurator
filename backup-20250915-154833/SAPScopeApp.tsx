import React from 'react';
import AppProvider from './AppProvider.tsx';
import SAPScopeApp from './SAPScopeApp.tsx';

function App() {
  return (
    <AppProvider>
      <SAPScopeApp />
    </AppProvider>
  );
}

export default App;