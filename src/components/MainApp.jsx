import React, { useState } from 'react';
import AppProvider from './AppProvider';
import SAPScopeApp from './SAPScopeApp';

function MainApp() {
  return (
    <AppProvider>
      <div style={{ minHeight: '100vh', background: '#F2F2F7' }}>
        <SAPScopeApp />
      </div>
    </AppProvider>
  );
}

export default MainApp;
