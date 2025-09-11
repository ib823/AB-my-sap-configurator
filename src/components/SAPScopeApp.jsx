import React, { useState } from 'react';

// Simple SAP package definitions that match your timeline app's expectations
const SIMPLE_SAP_PACKAGES = {
  Finance_1: {
    id: "Finance_1",
    name: "Financial Master Data Management",
    description: "Foundation for all financial reporting - chart of accounts, cost centers, profit centers",
    mandays: 193,
    category: "Finance Core",
    icon: "💰"
  },
  Finance_2: {
    id: "Finance_2", 
    name: "Procurement & Inventory Accounting",
    description: "Automate procurement approvals, vendor payments, and inventory valuation",
    mandays: 90,
    category: "Finance Core",
    icon: "📦"
  },
  Finance_21: {
    id: "Finance_21",
    name: "Project & Resource Management", 
    description: "Track project costs, resource allocation, and profitability analysis",
    mandays: 129,
    category: "Finance Advanced",
    icon: "📊"
  },
  HCM_1: {
    id: "HCM_1",
    name: "Core HR (EC)",
    description: "Central employee database, organizational management, personnel administration", 
    mandays: 180,
    category: "HR Core",
    icon: "👥"
  },
  SCM_2: {
    id: "SCM_2",
    name: "Plan to Fulfil",
    description: "Demand planning, production scheduling, inventory optimization",
    mandays: 257,
    category: "Supply Chain",
    icon: "🏭"
  }
};

const INDUSTRIES = [
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'services', label: 'Professional Services' },
  { value: 'retail', label: 'Retail & Distribution' },
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Financial Services' }
];

const COMPANY_SIZES = [
  { value: 'small', label: 'Small (< 100 employees)' },
  { value: 'medium', label: 'Medium (100-1000 employees)' },
  { value: 'large', label: 'Large (1000+ employees)' },
  { value: 'enterprise', label: 'Enterprise (5000+ employees)' }
];

const SAPScopeApp = () => {
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [clientProfile, setClientProfile] = useState({
    company_name: '',
    industry: 'services',
    company_size: 'medium',
    employees: 500,
    annualRevenueMYR: 200000000
  });

  const togglePackage = (packageId) => {
    setSelectedPackages(prev => {
      const isSelected = prev.includes(packageId);
      if (isSelected) {
        return prev.filter(id => id !== packageId);
      } else {
        return [...prev, packageId];
      }
    });
  };

  const exportToTimeline = () => {
    // Create the exact format your timeline app expects
    const exportData = {
      packages: selectedPackages.map(id => SIMPLE_SAP_PACKAGES[id]),
      clientProfile,
      totalEffort: selectedPackages.reduce((sum, id) => sum + SIMPLE_SAP_PACKAGES[id].mandays, 0),
      integrations: [],
      malaysiaForms: false,
      projectServices: []
    };

    console.log('Exporting to timeline:', exportData);

    // Dispatch the event your timeline app is listening for
    window.dispatchEvent(new CustomEvent('sapScopeExport', {
      detail: exportData
    }));
  };

  const totalMandays = selectedPackages.reduce((sum, id) => sum + SIMPLE_SAP_PACKAGES[id].mandays, 0);
  const estimatedDuration = Math.ceil(totalMandays / 25); // Assuming 5-person team working 5 days/week

  return (
    <div style={{ 
      padding: '32px', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      background: 'white'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '900', 
          margin: '0 0 12px 0',
          color: '#1d1d1f',
          letterSpacing: '-0.5px'
        }}>
          SAP Implementation Scope Builder
        </h1>
        <p style={{ 
          fontSize: '18px', 
          color: '#6e6e73', 
          margin: 0,
          fontWeight: '400'
        }}>
          Select SAP packages and generate your project timeline
        </p>
      </div>

      {/* Client Profile Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        border: '1px solid rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '800', 
          marginBottom: '20px',
          color: '#1d1d1f'
        }}>
          Client Information
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '16px' 
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#1d1d1f'
            }}>
              Company Name
            </label>
            <input
              type="text"
              value={clientProfile.company_name}
              onChange={(e) => setClientProfile({...clientProfile, company_name: e.target.value})}
              placeholder="Enter company name"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e5e7',
                borderRadius: '8px',
                fontSize: '16px',
                background: 'white',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007AFF'}
              onBlur={(e) => e.target.style.borderColor = '#e5e5e7'}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#1d1d1f'
            }}>
              Industry
            </label>
            <select
              value={clientProfile.industry}
              onChange={(e) => setClientProfile({...clientProfile, industry: e.target.value})}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e5e7',
                borderRadius: '8px',
                fontSize: '16px',
                background: 'white',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {INDUSTRIES.map(industry => (
                <option key={industry.value} value={industry.value}>
                  {industry.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#1d1d1f'
            }}>
              Company Size
            </label>
            <select
              value={clientProfile.company_size}
              onChange={(e) => setClientProfile({...clientProfile, company_size: e.target.value})}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e5e7',
                borderRadius: '8px',
                fontSize: '16px',
                background: 'white',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {COMPANY_SIZES.map(size => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Package Selection */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '800', 
          marginBottom: '20px',
          color: '#1d1d1f'
        }}>
          Select SAP Packages
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '16px' 
        }}>
          {Object.values(SIMPLE_SAP_PACKAGES).map(pkg => {
            const isSelected = selectedPackages.includes(pkg.id);
            return (
              <div
                key={pkg.id}
                onClick={() => togglePackage(pkg.id)}
                style={{
                  padding: '20px',
                  border: `2px solid ${isSelected ? '#007AFF' : '#e5e5e7'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: isSelected ? 'linear-gradient(135deg, #f0f4ff 0%, #e6f2ff 100%)' : 'white',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.target.style.borderColor = '#007AFF';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0,122,255,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.target.style.borderColor = '#e5e5e7';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {/* Selection indicator */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: isSelected ? '#007AFF' : '#e5e5e7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '700'
                }}>
                  {isSelected ? '✓' : ''}
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{pkg.icon}</div>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    margin: '0 0 8px 0',
                    color: '#1d1d1f',
                    paddingRight: '40px'
                  }}>
                    {pkg.name}
                  </h3>
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    background: 'rgba(0,122,255,0.1)',
                    color: '#007AFF',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    {pkg.category}
                  </div>
                </div>

                <p style={{ 
                  fontSize: '14px', 
                  color: '#6e6e73', 
                  margin: '0 0 12px 0',
                  lineHeight: '1.4'
                }}>
                  {pkg.description}
                </p>

                <div style={{ 
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#8e8e93'
                }}>
                  {pkg.mandays} person-days
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary and Export */}
      <div style={{
        background: 'linear-gradient(135deg, #f0f4ff 0%, #e6f2ff 100%)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(0,122,255,0.2)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '800', 
              margin: '0 0 8px 0',
              color: '#1d1d1f'
            }}>
              Implementation Summary
            </h3>
            <div style={{ fontSize: '14px', color: '#6e6e73' }}>
              <strong>{selectedPackages.length}</strong> packages selected • 
              <strong> {totalMandays}</strong> person-days • 
              <strong> ~{estimatedDuration}</strong> weeks estimated
            </div>
          </div>

          <button
            onClick={exportToTimeline}
            disabled={selectedPackages.length === 0}
            style={{
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: '700',
              border: 'none',
              borderRadius: '12px',
              background: selectedPackages.length > 0 
                ? 'linear-gradient(135deg, #007AFF 0%, #0056CC 100%)' 
                : '#e5e5e7',
              color: selectedPackages.length > 0 ? 'white' : '#8e8e93',
              cursor: selectedPackages.length > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              boxShadow: selectedPackages.length > 0 ? '0 4px 16px rgba(0,122,255,0.3)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (selectedPackages.length > 0) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 24px rgba(0,122,255,0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedPackages.length > 0) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(0,122,255,0.3)';
              }
            }}
          >
            Export to Timeline
          </button>
        </div>

        {selectedPackages.length === 0 && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: 'rgba(255,149,0,0.1)',
            border: '1px solid rgba(255,149,0,0.3)',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#ff9500'
          }}>
            Please select at least one SAP package to continue
          </div>
        )}
      </div>
    </div>
  );
};

export default SAPScopeApp;