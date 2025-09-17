import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Filter, Package, ChevronDown, ChevronRight, Calculator, Download, Settings, TrendingUp, Shield, CheckCircle, AlertCircle, Plus, Minus, X, Save, Eye, EyeOff, Edit3, Copy, Upload, Trash2, Grid, List, Users, Building, MapPin, FileText, Database, BarChart3, Zap, Clock, DollarSign } from 'lucide-react';

// Import all components and utilities
import { EXTENDED_PACKAGES } from '../data/ExtendedPackages';
import { MALAYSIA_FORMS_LIBRARY } from '../data/MalaysiaForms';
import ExcelExporter from '../utils/ExcelExport';
import { TimelineGenerator } from './TimelineGenerator';
import DependencyValidator from '../utils/DependencyValidator';
import PDFReportGenerator from '../utils/PDFGenerator';
import { IntegrationBuilder } from './IntegrationBuilder';
import { ResourcePlanner } from './ResourcePlanner';
import { RiskAssessment } from './RiskAssessment';
import { BudgetBreakdown } from './BudgetBreakdown';

// Main Enhanced App Component
export default function EnhancedApp() {
  // Combine packages
  const ALL_PACKAGES = [...COMPLETE_PACKAGE_LIBRARY, ...EXTENDED_PACKAGES];
  
  const [packages, setPackages] = useState(ALL_PACKAGES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [adminMode, setAdminMode] = useState(false);
  const [activeTab, setActiveTab] = useState('packages');
  const [resources, setResources] = useState([]);
  const [malaysiaForms, setMalaysiaForms] = useState(MALAYSIA_FORMS_LIBRARY);
  
  const [clientProfile, setClientProfile] = useState({
    company_name: '',
    industry: 'services',
    company_size: 'sme',
    system_landscape: 'greenfield',
    client_maturity: 'sap_experienced',
    legal_entities: 1
  });

  // Admin mode shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setAdminMode(!adminMode);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [adminMode]);

  // Categories with counts
  const categories = useMemo(() => {
    const cats = Array.from(new Set(packages.map(p => p.category)));
    return ['all', ...cats];
  }, [packages]);

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || pkg.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [packages, searchQuery, selectedCategory]);

  // Calculate totals
  const totals = useMemo(() => {
    let effort = 0;
    let cost = 0;
    let moduleCount = 0;
    let packageCount = 0;

    packages.forEach(pkg => {
      if (pkg.selected) {
        effort += pkg.total_effort_pd;
        cost += pkg.sgd_price;
        packageCount++;
        moduleCount += pkg.modules.length;
      } else {
        const selectedModules = pkg.modules.filter(m => m.selected);
        selectedModules.forEach(m => {
          effort += m.effort_pd;
          moduleCount++;
        });
        cost += (selectedModules.length / pkg.modules.length) * pkg.sgd_price;
      }
    });

    // Add forms effort
    const formsEffort = malaysiaForms.filter(f => f.selected).reduce((sum, f) => sum + f.effort_pd, 0);
    effort += formsEffort;

    return { effort, cost, moduleCount, packageCount };
  }, [packages, malaysiaForms]);

  // Package selection with dependency validation
  const togglePackage = (packageId) => {
    const validation = DependencyValidator.validatePackageSelection(
      packages, 
      packageId, 
      packages.find(p => p.id === packageId)?.selected ? 'deselect' : 'select'
    );

    if (!validation.valid) {
      alert(validation.errors.map(e => e.message).join('\n'));
      return;
    }

    if (validation.warnings.length > 0) {
      const proceed = window.confirm(
        'Warnings:\n' + validation.warnings.map(w => w.message).join('\n') + 
        '\n\nContinue anyway?'
      );
      if (!proceed) return;
    }

    setPackages(prev => prev.map(pkg => {
      if (pkg.id === packageId) {
        const newSelected = !pkg.selected;
        return {
          ...pkg,
          selected: newSelected,
          modules: pkg.modules.map(m => ({ ...m, selected: false }))
        };
      }
      return pkg;
    }));
  };

  // Module selection
  const toggleModule = (packageId, moduleId) => {
    const pkg = packages.find(p => p.id === packageId);
    const validation = DependencyValidator.validateModuleSelection(pkg, moduleId, packages);

    if (!validation.valid) {
      alert(validation.errors.map(e => e.message).join('\n'));
      return;
    }

    setPackages(prev => prev.map(p => {
      if (p.id === packageId && !p.selected) {
        return {
          ...p,
          modules: p.modules.map(m => 
            m.id === moduleId ? { ...m, selected: !m.selected } : m
          )
        };
      }
      return p;
    }));
  };

  // Toggle package expansion
  const toggleExpanded = (packageId) => {
    setPackages(prev => prev.map(pkg => 
      pkg.id === packageId ? { ...pkg, expanded: !pkg.expanded } : pkg
    ));
  };

  // Export handlers
  const handleExcelExport = () => {
    ExcelExporter.downloadExcel(packages, totals, clientProfile);
  };

  const handlePDFExport = () => {
    const timeline = []; // Generate timeline first
    PDFReportGenerator.downloadPDF(packages, totals, clientProfile, timeline);
  };

  // Tab navigation
  const tabs = [
    { id: 'packages', label: 'Package Selection', icon: Package },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'resources', label: 'Resources', icon: Users },
    { id: 'integration', label: 'Integration', icon: Zap },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'risk', label: 'Risk', icon: AlertCircle },
    { id: 'forms', label: 'Malaysia Forms', icon: FileText }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#1a202c' }}>
              SAP Implementation Configurator Pro
            </h1>
            <p style={{ margin: '8px 0 0', color: '#718096', fontSize: '14px' }}>
              ABeam Consulting - Complete Edition {adminMode && <span style={{color: '#e53e3e'}}>(ADMIN MODE)</span>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleExcelExport}
              style={{
                padding: '10px 20px',
                background: '#48bb78',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600'
              }}
            >
              <Download size={18} />
              Export Excel
            </button>
            <button
              onClick={handlePDFExport}
              style={{
                padding: '10px 20px',
                background: '#ed8936',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600'
              }}
            >
              <FileText size={18} />
              Generate PDF
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 20px',
                  background: activeTab === tab.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f7fafc',
                  color: activeTab === tab.id ? 'white' : '#4a5568',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Statistics Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginTop: '20px'
        }}>
          <div style={{
            padding: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={24} />
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{totals.packageCount}</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Packages Selected</div>
              </div>
            </div>
          </div>
          <div style={{
            padding: '15px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Grid size={24} />
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{totals.moduleCount}</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Modules Selected</div>
              </div>
            </div>
          </div>
          <div style={{
            padding: '15px',
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={24} />
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{totals.effort.toFixed(1)}</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Person Days</div>
              </div>
            </div>
          </div>
          <div style={{
            padding: '15px',
            background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <DollarSign size={24} />
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>
                  ${(totals.cost / 1000).toFixed(0)}K
                </div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>SGD Estimate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'packages' && (
        <div>
          {/* Search and Filters */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            display: 'flex',
            gap: '10px'
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: '#a0aec0' }} />
              <input
                type="text"
                placeholder="Search packages or modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '12px 20px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                outline: 'none',
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

          {/* Package Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '20px'
          }}>
            {filteredPackages.map(pkg => (
              <div
                key={pkg.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: pkg.selected ? '0 20px 40px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.08)',
                  transform: pkg.selected ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.3s ease',
                  border: pkg.selected ? '2px solid #667eea' : '2px solid transparent'
                }}
              >
                {/* Package Header */}
                <div
                  style={{
                    padding: '20px',
                    background: pkg.selected 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
                    color: pkg.selected ? 'white' : '#2d3748',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => togglePackage(pkg.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '24px' }}>{pkg.icon}</span>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{pkg.name}</h3>
                      </div>
                      <p style={{ 
                        margin: '0 0 10px', 
                        fontSize: '13px', 
                        opacity: pkg.selected ? 0.95 : 0.7 
                      }}>
                        {pkg.description}
                      </p>
                      <div style={{ display: 'flex', gap: '15px', fontSize: '13px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          background: pkg.selected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)',
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}>
                          {pkg.total_effort_pd} PD
                        </span>
                        <span style={{ 
                          padding: '4px 8px', 
                          background: pkg.selected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)',
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}>
                          SGD ${(pkg.sgd_price / 1000).toFixed(0)}K
                        </span>
                        <span style={{ 
                          padding: '4px 8px', 
                          background: pkg.selected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)',
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}>
                          {pkg.category}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {pkg.malaysia_verified && (
                        <Shield size={20} style={{ color: pkg.selected ? '#48bb78' : '#48bb78' }} />
                      )}
                      {pkg.critical_path && (
                        <AlertCircle size={20} style={{ color: pkg.selected ? '#f6e05e' : '#ed8936' }} />
                      )}
                      {pkg.selected && <CheckCircle size={24} />}
                    </div>
                  </div>
                </div>

                {/* Modules Section */}
                <div style={{ padding: '0 20px 20px' }}>
                  <button
                    onClick={() => toggleExpanded(pkg.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '10px 0',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#4a5568',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    {pkg.expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    Modules ({pkg.modules.length})
                  </button>
                  
                  {pkg.expanded && (
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {pkg.modules.map(module => (
                        <div
                          key={module.id}
                          style={{
                            padding: '12px',
                            background: module.selected ? '#edf2f7' : '#f7fafc',
                            borderRadius: '8px',
                            border: module.selected ? '1px solid #cbd5e0' : '1px solid #e2e8f0',
                            cursor: pkg.selected ? 'not-allowed' : 'pointer',
                            opacity: pkg.selected ? 0.6 : 1,
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => !pkg.selected && toggleModule(pkg.id, module.id)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748', marginBottom: '4px' }}>
                                {module.name}
                              </div>
                              <div style={{ fontSize: '12px', color: '#718096' }}>
                                {module.description}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ 
                                fontSize: '13px', 
                                fontWeight: '500', 
                                color: '#4a5568',
                                padding: '2px 6px',
                                background: '#edf2f7',
                                borderRadius: '4px'
                              }}>
                                {module.effort_pd} PD
                              </span>
                              {module.selected && <CheckCircle size={18} style={{ color: '#48bb78' }} />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'timeline' && <TimelineGenerator packages={packages} totals={totals} />}
      {activeTab === 'resources' && <ResourcePlanner packages={packages} totals={totals} timeline={[]} />}
      {activeTab === 'integration' && <IntegrationBuilder packages={packages} />}
      {activeTab === 'budget' && <BudgetBreakdown packages={packages} totals={totals} resources={resources} clientProfile={clientProfile} />}
      {activeTab === 'risk' && <RiskAssessment packages={packages} totals={totals} clientProfile={clientProfile} resources={resources} />}
      
      {activeTab === 'forms' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '24px', fontWeight: '600' }}>
            Malaysia Regulatory Forms
          </h2>
          
          <div style={{ display: 'grid', gap: '10px' }}>
            {malaysiaForms.map(form => (
              <div
                key={form.id}
                style={{
                  padding: '15px',
                  background: form.selected ? '#edf2f7' : '#f7fafc',
                  borderRadius: '8px',
                  border: form.selected ? '1px solid #667eea' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => {
                  setMalaysiaForms(prev => prev.map(f => 
                    f.id === form.id ? { ...f, selected: !f.selected } : f
                  ));
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                      {form.form_name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#718096' }}>
                      {form.description} • {form.regulatory_body} • {form.effort_pd} PD
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {form.mandatory && (
                      <span style={{
                        padding: '2px 6px',
                        background: '#fed7d7',
                        color: '#c53030',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        Mandatory
                      </span>
                    )}
                    {form.selected && <CheckCircle size={18} style={{ color: '#48bb78' }} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
