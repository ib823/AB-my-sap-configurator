import React from 'react';
import RealExcelExporter from '../utils/RealExcelExport';
import RealPDFGenerator from '../utils/RealPDFGenerator';

// Add to your existing EnhancedApp component
export const ExportButtons = ({ packages, totals, clientProfile, timeline, resources }) => {
  const handleRealExcelExport = () => {
    try {
      RealExcelExporter.generateExcel(packages, totals, clientProfile, timeline, resources);
      console.log('Excel export successful');
    } catch (error) {
      console.error('Excel export failed:', error);
      alert('Failed to export Excel. Please try again.');
    }
  };

  const handleRealPDFExport = () => {
    try {
      RealPDFGenerator.generatePDF(packages, totals, clientProfile, timeline);
      console.log('PDF export successful');
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleDetailedPDFExport = () => {
    try {
      const risks = []; // Get from your risk assessment
      RealPDFGenerator.generateDetailedPDF(packages, totals, clientProfile, timeline, resources, risks);
      console.log('Detailed PDF export successful');
    } catch (error) {
      console.error('Detailed PDF export failed:', error);
      alert('Failed to generate detailed PDF. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <button
        onClick={handleRealExcelExport}
        style={{
          padding: '10px 20px',
          background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: '600',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        📊 Export Excel
      </button>
      
      <button
        onClick={handleRealPDFExport}
        style={{
          padding: '10px 20px',
          background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: '600',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        📄 Generate PDF
      </button>
      
      <button
        onClick={handleDetailedPDFExport}
        style={{
          padding: '10px 20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: '600',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        📚 Detailed Report
      </button>
    </div>
  );
};

export default ExportButtons;
