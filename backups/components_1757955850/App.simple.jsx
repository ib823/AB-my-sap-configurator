import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>SAP Configurator</h1>
      <div style={{ marginTop: '20px' }}>
        <h2>Project Timeline</h2>
        <p>Welcome to the SAP Configuration Tool</p>
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Quick Stats:</h3>
          <ul>
            <li>Total Packages: 0</li>
            <li>Selected Packages: 0</li>
            <li>Total Effort: 0 PD</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
