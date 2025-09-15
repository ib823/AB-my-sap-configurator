import React from 'react';
import { SAPAppProvider } from './components/AppProvider';
import { SAPScopeApp } from './components/SAPScopeApp';

function App() {
  return (
    <SAPAppProvider>
      <SAPScopeApp />
    </SAPAppProvider>
  );
}

export default App;
