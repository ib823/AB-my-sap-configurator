import React, { useState, useMemo } from 'react';
import { useApp } from './AppProvider'; // Import your existing context
import { ChevronDown, ChevronRight, Plus, Minus, AlertTriangle } from 'lucide-react';

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

const SAPScopeAppEnhanced: React.FC = () => {
  const {
    state,
    updatePackage,
    updateClientProfile,
    updateMalaysiaForm,
    updateProjectService,
    validatePrerequisites,
    calculateTotalEffort,
    generateRiskAssessment
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(state.packages.map(p => p.category)));
    return ['all', ...cats];
  }, [state.packages]);

  // Filter packages
  const filteredPackages = useMemo(() => {
    return state.packages.filter(pkg => {
      const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || pkg.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [state.packages, searchQuery, selectedCategory]);

  const handlePackageToggle = (packageId: string) => {
    const pkg = state.packages.find(p => p.id === packageId);
    if (!pkg) return;

    const validation = validatePrerequisites(packageId);
    if (!validation.valid && !pkg.selected) {
      alert(`Missing prerequisites: ${validation.missing.join(', ')}`);
      return;
    }

    updatePackage(packageId, { 
      selected: !pkg.selected,
      modules: pkg.modules.map(m => ({ ...m, selected: false }))
    });
  };

  const handleModuleToggle = (packageId: string, moduleId: string) => {
    const pkg = state.packages.find(p => p.id === packageId);
    if (!pkg || pkg.selected) return;

    const moduleValidation = validatePrerequisites(packageId, moduleId);
    const module = pkg.modules.find(m => m.id === moduleId);
    
    if (!moduleValidation.valid && module && !module.selected) {
      alert(`Missing module prerequisites: ${moduleValidation.missing.join(', ')}`);
      return;
    }

    const updatedModules = pkg.modules.map(m => 
      m.id === moduleId ? { ...m, selected: !m.selected } : m
    );
    
    updatePackage(packageId, { modules: updatedModules });
  };

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

      {/* Search and Filter */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
        <input
          type="text"
          placeholder="Search packages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '2px solid #e5e5e7',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '2px solid #e5e5e7',
            borderRadius: '8px',
            fontSize: '14px',
            minWidth: '200px'
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Package Selection */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>
          SAP Packages ({filteredPackages.length})
        </h2>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredPackages.map(pkg => {
            const isSelected = pkg.selected;
            const selectedModules = pkg.modules.filter(m => m.selected);
            const hasPartialSelection = selectedModules.length > 0 && selectedModules.length < pkg.modules.length;
            const validation = validatePrerequisites(pkg.id);

            return (
              <div
                key={pkg.id}
                style={{
                  border: `2px solid ${!validation.valid ? '#ff3b30' : isSelected ? '#007AFF' : '#e5e5e7'}`,
                  borderRadius: '12px',
                  background: isSelected ? 'linear-gradient(135deg, #f0f4ff 0%, #e6f2ff 100%)' : 'white'
                }}
              >
                <div
                  onClick={() => handlePackageToggle(pkg.id)}
                  style={{
                    padding: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '24px' }}>{pkg.icon}</span>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
                        {pkg.name}
                      </h3>
                      
                      {pkg.malaysia_verified && (
                        <span style={{
                          padding: '4px 8px',
                          background: '#34c759',
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          MY
                        </span>
                      )}
                      
                      {pkg.critical_path && (
                        <span style={{
                          padding: '4px 8px',
                          background: '#ff9500',
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          Critical
                        </span>
                      )}
                    </div>

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

                    <p style={{ fontSize: '14px', color: '#6e6e73', margin: '0 0 12px 0' }}>
                      {pkg.description}
                    </p>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#8e8e93' }}>
                      <span><strong>{pkg.total_effort_pd}</strong> person-days</span>
                      <span><strong>{pkg.modules.length}</strong> modules</span>
                    </div>

                    {!validation.valid && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        background: 'rgba(255,59,48,0.1)',
                        border: '1px solid rgba(255,59,48,0.3)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#ff3b30'
                      }}>
                        <AlertTriangle style={{ width: '12px', height: '12px', display: 'inline', marginRight: '4px' }} />
                        Missing prerequisites: {validation.missing.join(', ')}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: isSelected ? '#007AFF' : hasPartialSelection ? '#ff9500' : '#e5e5e7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '700'
                    }}>
                      {isSelected ? '✓' : hasPartialSelection ? selectedModules.length : ''}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updatePackage(pkg.id, { expanded: !pkg.expanded });
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '16px',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      {pkg.expanded ? <ChevronDown /> : <ChevronRight />}
                    </button>
                  </div>
                </div>

                {/* Module Selection */}
                {pkg.expanded && (
                  <div style={{
                    borderTop: '1px solid #e5e5e7',
                    padding: '16px 20px',
                    background: 'rgba(0,0,0,0.02)'
                  }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>
                      Individual Modules:
                    </h4>
                    
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {pkg.modules.map(module => {
                        const isModuleSelected = module.selected;
                        const isDisabled = pkg.selected;
                        
                        return (
                          <div
                            key={module.id}
                            onClick={() => !isDisabled && handleModuleToggle(pkg.id, module.id)}
                            style={{
                              padding: '12px',
                              border: `1px solid ${isModuleSelected ? '#007AFF' : '#e5e5e7'}`,
                              borderRadius: '8px',
                              background: isModuleSelected ? 'rgba(0,122,255,0.05)' : 'white',
                              cursor: isDisabled ? 'not-allowed' : 'pointer',
                              opacity: isDisabled ? 0.5 : 1,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '600' }}>
                                {module.name}
                              </div>
                              <div style={{ fontSize: '12px', color: '#6e6e73' }}>
                                {module.description}
                              </div>
                              {module.prerequisites.length > 0 && (
                                <div style={{ fontSize: '11px', color: '#ff9500', marginTop: '4px' }}>
                                  Requires: {module.prerequisites.join(', ')}
                                </div>
                              )}
                            </div>
                            
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '12px', fontWeight: '600', color: '#8e8e93' }}>
                                {module.effort_pd} PD
                              </div>
                              <div style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                background: isModuleSelected ? '#007AFF' : '#e5e5e7',
                                marginTop: '4px',
                                marginLeft: 'auto'
                              }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Malaysia Forms Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>
          Malaysia Compliance Forms
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
          {state.malaysiaForms.map(form => {
            const isSelected = form.selected;
            
            return (
              <div
                key={form.id}
                onClick={() => updateMalaysiaForm(form.id, { selected: !form.selected })}
                style={{
                  padding: '16px',
                  border: `2px solid ${isSelected ? '#007AFF' : '#e5e5e7'}`,
                  borderRadius: '8px',
                  background: isSelected ? 'rgba(0,122,255,0.05)' : 'white',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                      {form.form_name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6e6e73', marginBottom: '8px' }}>
                      {form.description}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{
                        padding: '2px 6px',
                        background: form.mandatory ? 'rgba(255,59,48,0.1)' : 'rgba(0,122,255,0.1)',
                        color: form.mandatory ? '#ff3b30' : '#007AFF',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {form.mandatory ? 'Mandatory' : 'Optional'}
                      </span>
                      <span style={{ fontSize: '12px', color: '#8e8e93' }}>
                        {form.effort_pd} PD
                      </span>
                    </div>
                  </div>
                  
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: isSelected ? '#007AFF' : '#e5e5e7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    {isSelected ? '✓' : ''}
                  </div>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0' }}>
              Implementation Summary
            </h3>
            <div style={{ fontSize: '14px', color: '#6e6e73' }}>
              <strong>{state.packages.filter(p => p.selected).length}</strong> packages • 
              <strong> {state.packages.flatMap(p => p.modules.filter(m => m.selected)).length}</strong> modules • 
              <strong> {state.malaysiaForms.filter(f => f.selected).length}</strong> forms • 
              <strong> {totalEffort.toFixed(1)}</strong> person-days • 
              <strong> {riskAssessment.overall_risk}</strong> risk
            </div>
          </div>

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
                ? 'linear-gradient(135deg, #007AFF 0%, #0056CC 100%)' 
                : '#e5e5e7',
              color: totalEffort > 0 ? 'white' : '#8e8e93',
              cursor: totalEffort > 0 ? 'pointer' : 'not-allowed',
              boxShadow: totalEffort > 0 ? '0 4px 16px rgba(0,122,255,0.3)' : 'none'
            }}
          >
            Export to Timeline
          </button>
        </div>

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

export default SAPScopeAppEnhanced;