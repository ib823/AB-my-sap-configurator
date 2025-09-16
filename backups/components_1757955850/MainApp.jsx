import React, { useState } from 'react';
import AppProvider from './AppProvider';
import ProjectTimeline from './App';
import SAPScopeApp from './SAPScopeApp';

function MainApp() {
  const [currentView, setCurrentView] = useState('timeline');

  return (
    <AppProvider>
      <div style={{ minHeight: '100vh', background: '#F2F2F7' }}>
        {/* Navigation */}
        <div style={{
          background: 'white',
          borderBottom: '1px solid #e5e5e7',
          padding: '12px 24px',
          display: 'flex',
          gap: '24px'
        }}>
          <button
            onClick={() => setCurrentView('timeline')}
            style={{
              background: currentView === 'timeline' ? '#007AFF' : 'transparent',
              color: currentView === 'timeline' ? 'white' : '#000',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Timeline
          </button>
          <button
            onClick={() => setCurrentView('packages')}
            style={{
              background: currentView === 'packages' ? '#007AFF' : 'transparent',
              color: currentView === 'packages' ? 'white' : '#000',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Package Selection
          </button>
        </div>

        {/* Content */}
        {currentView === 'timeline' ? <ProjectTimeline /> : <SAPScopeApp />}
      </div>
    </AppProvider>
  );
}

export default MainApp;
