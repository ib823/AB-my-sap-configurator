import React, { useState } from 'react';
import { useApp } from './AppProvider';
import PackageSelector from './PackageSelector';

const INDUSTRIES = [
  { value: 'services', label: 'Professional Services' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'financial_services', label: 'Financial Services' },
  { value: 'government', label: 'Government' },
  { value: 'retail', label: 'Retail' }
];

const COMPANY_SIZES = [
  { value: 'sme', label: 'SME (< 100 employees)' },
  { value: 'mid_market', label: 'Mid Market (100-1000 employees)' },
  { value: 'large', label: 'Large (1000+ employees)' },
  { value: 'enterprise', label: 'Enterprise (5000+ employees)' }
];

const SAPScopeApp: React.FC = () => {
  const {
    state,
    updateClientProfile,
    updateMalaysiaForm,
    updateProjectService,
    calculateTotalEffort,
    generateRiskAssessment
  } = useApp();

  // Local state for UI management
  const [activeTab, setActiveTab] = useState<'packages' | 'forms' | 'services'>('packages');

  const exportToTimeline = () => {
    const selectedPackages = state.packages.filter(p => 
      p.selected || p.modules.some(m => m.selected)
    );

    const selectedForms = state.malaysiaForms.filter(f => f.selected);
    const selectedServices = state.projectServices.filter(s => s.selected);

    const exportData = {
      packages: selectedPackages,
      clientProfile: state.clientProfile,
      totalEffort: calculateTotalEffort(),
      integrations: state.integrations,
      malaysiaForms: selectedForms,
      projectServices: selectedServices
    };

    console.log('Exporting to timeline:', exportData);
    window.dispatchEvent(new CustomEvent('sapScopeExport', { detail: exportData }));
  };

  const totalEffort = calculateTotalEffort();
  const riskAssessment = generateRiskAssessment();
  const selectedPackageCount = state.packages.filter(p => p.selected || p.modules.some(m => m.selected)).length;
  const selectedModuleCount = state.packages.flatMap(p => p.modules.filter(m => m.selected)).length;

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 12px 0' }}>
          SAP Implementation Scope Builder
        </h1>
        <p style={{ fontSize: '18px', color: '#6e6e73', margin: 0 }}>
          Configure your SAP implementation scope with detailed package and module selection
        </p>
      </div>

      {/* Client Profile Section */}
      <div style={{
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>
          Client Information
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              Company Name
            </label>
            <input
              type="text"
              value={state.clientProfile.company_name}
              onChange={(e) => updateClientProfile({ company_name: e.target.value })}
              placeholder="Enter company name"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e5e7',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              Industry
            </label>
            <select
              value={state.clientProfile.industry}
              onChange={(e) => updateClientProfile({ industry: e.target.value as any })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e5e7',
                borderRadius: '8px',
                fontSize: '16px'
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
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              Company Size
            </label>
            <select
              value={state.clientProfile.company_size}
              onChange={(e) => updateClientProfile({ company_size: e.target.value as any })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e5e7',
                borderRadius: '8px',
                fontSize: '16px'
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

      {/* Tab Navigation */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', borderBottom: '2px solid #e5e5e7' }}>
          {[
            { id: 'packages', label: 'SAP Packages', icon: '📦' },
            { id: 'forms', label: 'Malaysia Forms', icon: '📋' },
            { id: 'services', label: 'Project Services', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '16px 24px',
                border: 'none',
                background: 'none',
                fontSize: '16px',
                fontWeight: '600',
                color: activeTab === tab.id ? '#007AFF' : '#8e8e93',
                borderBottom: activeTab === tab.id ? '3px solid #007AFF' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ marginBottom: '40px' }}>
        {/* 🎯 PHASE 4B: REPLACED MONOLITHIC PACKAGE SELECTION WITH PACKAGESELECTOR */}
        {activeTab === 'packages' && (
          <PackageSelector 
            className="main-package-selector"
            onSelectionChange={(selectedCount) => {
              console.log(`Package selection changed: ${selectedCount} packages selected`);
            }}
          />
        )}

        {/* Malaysia Forms Tab */}
        {activeTab === 'forms' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>
              Malaysia Compliance Forms
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {state.malaysiaForms.map(form => {
                const isSelected = form.selected;
                
                return (
                  <div
                    key={form.id}
                    onClick={() => updateMalaysiaForm(form.id, { selected: !form.selected })}
                    style={{
                      padding: '20px',
                      border: `2px solid ${isSelected ? '#007AFF' : '#e5e5e7'}`,
                      borderRadius: '12px',
                      background: isSelected ? 'linear-gradient(135deg, #f0f4ff 0%, #e6f2ff 100%)' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: isSelected ? '0 4px 16px rgba(0,122,255,0.15)' : '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#1d1d1f' }}>
                          {form.form_name}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6e6e73', marginBottom: '12px', lineHeight: '1.4' }}>
                          {form.description}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <span style={{
                            padding: '4px 8px',
                            background: form.mandatory ? 'rgba(255,59,48,0.1)' : 'rgba(0,122,255,0.1)',
                            color: form.mandatory ? '#ff3b30' : '#007AFF',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {form.mandatory ? 'Mandatory' : 'Optional'}
                          </span>
                          <span style={{ fontSize: '13px', color: '#8e8e93', fontWeight: '600' }}>
                            <strong>{form.effort_pd}</strong> person-days
                          </span>
                        </div>
                      </div>
                      
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: isSelected ? '#007AFF' : '#e5e5e7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '700',
                        marginLeft: '16px'
                      }}>
                        {isSelected ? '✓' : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Project Services Tab */}
        {activeTab === 'services' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>
              Project Services
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>
              {state.projectServices.map(service => {
                const isSelected = service.selected;
                
                return (
                  <div
                    key={service.id}
                    onClick={() => updateProjectService(service.id, { selected: !service.selected })}
                    style={{
                      padding: '20px',
                      border: `2px solid ${isSelected ? '#007AFF' : '#e5e5e7'}`,
                      borderRadius: '12px',
                      background: isSelected ? 'linear-gradient(135deg, #f0f4ff 0%, #e6f2ff 100%)' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: isSelected ? '0 4px 16px rgba(0,122,255,0.15)' : '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#1d1d1f' }}>
                          {service.service_name}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6e6e73', marginBottom: '12px', lineHeight: '1.4' }}>
                          {service.description}
                        </div>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <span style={{
                            padding: '4px 8px',
                            background: 'rgba(52,199,89,0.1)',
                            color: '#34c759',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {service.service_type}
                          </span>
                          <span style={{ fontSize: '13px', color: '#8e8e93', fontWeight: '600' }}>
                            <strong>{service.effort_pd}</strong> person-days
                          </span>
                        </div>
                      </div>
                      
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: isSelected ? '#007AFF' : '#e5e5e7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '700',
                        marginLeft: '16px'
                      }}>
                        {isSelected ? '✓' : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Summary Dashboard */}
      <div style={{
        background: 'linear-gradient(135deg, #1d1d1f 0%, #2d2d2f 100%)',
        borderRadius: '20px',
        padding: '32px',
        color: 'white',
        marginBottom: '32px'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', textAlign: 'center' }}>
          Implementation Summary
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: '900', marginBottom: '8px', color: '#007AFF' }}>
              {selectedPackageCount}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>Selected Packages</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: '900', marginBottom: '8px', color: '#34C759' }}>
              {selectedModuleCount}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>Selected Modules</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: '900', marginBottom: '8px', color: '#FF9500' }}>
              {state.malaysiaForms.filter(f => f.selected).length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>Compliance Forms</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: '900', marginBottom: '8px', color: '#AF52DE' }}>
              {Math.round(totalEffort)}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>Total Person-Days</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: '900', marginBottom: '8px', color: '#FF6B6B' }}>
              {Math.ceil(totalEffort / 8)}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>Estimated Weeks</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '36px', 
              fontWeight: '900', 
              marginBottom: '8px',
              color: riskAssessment.overall_risk === 'HIGH' ? '#ff3b30' : 
                     riskAssessment.overall_risk === 'MEDIUM' ? '#ff9500' : '#34c759'
            }}>
              {riskAssessment.overall_risk}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>Project Risk</div>
          </div>
        </div>

        {/* Risk Details */}
        {riskAssessment.specific_risks.length > 0 && (
          <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', opacity: 0.9 }}>
              Key Risk Factors:
            </div>
            <div style={{ fontSize: '13px', opacity: 0.8, lineHeight: '1.4' }}>
              {riskAssessment.specific_risks.slice(0, 3).map(risk => risk.risk).join(' • ')}
            </div>
          </div>
        )}
      </div>

      {/* Export Section */}
      <div style={{
        background: 'linear-gradient(135deg, #f0f4ff 0%, #e6f2ff 100%)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(0,122,255,0.2)',
        textAlign: 'center'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 16px 0', color: '#1d1d1f' }}>
          Ready to Build Your Timeline?
        </h3>
        
        <p style={{ fontSize: '14px', color: '#6e6e73', margin: '0 0 20px 0' }}>
          Export your scope configuration to create a detailed project timeline with phases, resources, and milestones.
        </p>

        <button
          onClick={exportToTimeline}
          disabled={totalEffort === 0}
          style={{
            padding: '16px 32px',
            fontSize: '16px',
            fontWeight: '700',
            border: 'none',
            borderRadius: '12px',
            background: totalEffort > 0 
              ? 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)' 
              : '#e5e5e7',
            color: totalEffort > 0 ? 'white' : '#8e8e93',
            cursor: totalEffort > 0 ? 'pointer' : 'not-allowed',
            boxShadow: totalEffort > 0 ? '0 8px 25px rgba(0,122,255,0.3)' : 'none',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (totalEffort > 0) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,122,255,0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (totalEffort > 0) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,122,255,0.3)';
            }
          }}
        >
          🚀 Export to Project Timeline
        </button>

        {totalEffort === 0 && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: 'rgba(255,149,0,0.1)',
            border: '1px solid rgba(255,149,0,0.3)',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#ff9500'
          }}>
            Please select at least one SAP package, module, or form to continue
          </div>
        )}
      </div>
    </div>
  );
};

export default SAPScopeApp;