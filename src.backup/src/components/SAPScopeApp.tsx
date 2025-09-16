import React, { useState, useMemo } from 'react';
import { useApp } from './AppProvider';
import { ChevronDown, ChevronRight, Plus, Minus, AlertTriangle, Search, Filter, Package, FileText, DollarSign, AlertCircle } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'packages' | 'forms' | 'services'>('packages');

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
      alert(\`Missing prerequisites: \${validation.missing.join(', ')}\`);
      return;
    }

    updatePackage(packageId, { 
      selected: !pkg.selected,
      modules: pkg.modules.map(m => ({ ...m, selected: !pkg.selected }))
    });
  };

  const handleModuleToggle = (packageId: string, moduleId: string) => {
    const pkg = state.packages.find(p => p.id === packageId);
    if (!pkg || pkg.selected) return;

    const moduleValidation = validatePrerequisites(packageId, moduleId);
    const module = pkg.modules.find(m => m.id === moduleId);
    
    if (!moduleValidation.valid && module && !module.selected) {
      alert(\`Missing module prerequisites: \${moduleValidation.missing.join(', ')}\`);
      return;
    }

    const updatedModules = pkg.modules.map(m => 
      m.id === moduleId ? { ...m, selected: !m.selected } : m
    );

    updatePackage(packageId, { modules: updatedModules });
  };

  const totalEffort = calculateTotalEffort();
  const complexityMultiplier = state.clientProfile.company_size === 'enterprise' ? 1.2 : 1.0;
  const adjustedEffort = Math.round(totalEffort * complexityMultiplier);
  const estimatedCostSGD = Math.round(adjustedEffort * 2800);
  const estimatedCostMYR = Math.round(adjustedEffort * 2450);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">SAP Implementation Scope Builder</h1>
              <p className="text-sm text-slate-600 mt-1">Configure your SAP S/4HANA implementation scope</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-slate-600">Total Effort</div>
                <div className="text-2xl font-bold text-blue-600">{adjustedEffort} PD</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-600">Estimated Cost</div>
                <div className="text-2xl font-bold text-green-600">SGD \${estimatedCostSGD.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Client Profile Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={state.clientProfile.company_name}
                onChange={(e) => updateClientProfile({ company_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter company name..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
              <select
                value={state.clientProfile.industry}
                onChange={(e) => updateClientProfile({ industry: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {INDUSTRIES.map(ind => (
                  <option key={ind.value} value={ind.value}>{ind.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Size</label>
              <select
                value={state.clientProfile.company_size}
                onChange={(e) => updateClientProfile({ company_size: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {COMPANY_SIZES.map(size => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('packages')}
              className={\`flex-1 px-6 py-3 text-sm font-medium transition-colors \${
                activeTab === 'packages'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }\`}
            >
              <Package className="w-4 h-4 inline-block mr-2" />
              SAP Packages
            </button>
            <button
              onClick={() => setActiveTab('forms')}
              className={\`flex-1 px-6 py-3 text-sm font-medium transition-colors \${
                activeTab === 'forms'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }\`}
            >
              <FileText className="w-4 h-4 inline-block mr-2" />
              Malaysia Forms
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={\`flex-1 px-6 py-3 text-sm font-medium transition-colors \${
                activeTab === 'services'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }\`}
            >
              <DollarSign className="w-4 h-4 inline-block mr-2" />
              Project Services
            </button>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'packages' && (
          <>
            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search packages..."
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="text-slate-400 w-5 h-5" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Packages List */}
            <div className="space-y-4">
              {filteredPackages.map(pkg => (
                <div
                  key={pkg.id}
                  className={\`bg-white rounded-xl shadow-sm border-2 transition-all \${
                    pkg.selected ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'
                  }\`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{pkg.icon}</span>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {pkg.name}
                              {pkg.malaysia_verified && (
                                <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                  MY Verified
                                </span>
                              )}
                              {pkg.critical_path && (
                                <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                                  Critical Path
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1">{pkg.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-slate-500">
                                Category: <span className="font-medium">{pkg.category}</span>
                              </span>
                              <span className="text-sm text-slate-500">
                                Effort: <span className="font-medium">{pkg.total_effort_pd} PD</span>
                              </span>
                              <span className="text-sm text-slate-500">
                                Price: <span className="font-medium">SGD \${pkg.sgd_price.toLocaleString()}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updatePackage(pkg.id, { expanded: !pkg.expanded })}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          {pkg.expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => handlePackageToggle(pkg.id)}
                          className={\`px-4 py-2 rounded-lg font-medium transition-colors \${
                            pkg.selected
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }\`}
                        >
                          {pkg.selected ? 'Selected' : 'Select Package'}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Modules */}
                    {pkg.expanded && pkg.modules.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">Modules</h4>
                        <div className="space-y-2">
                          {pkg.modules.map(module => (
                            <div
                              key={module.id}
                              className={\`flex items-center justify-between p-3 rounded-lg \${
                                module.selected ? 'bg-blue-100' : 'bg-slate-50'
                              } \${pkg.selected ? 'opacity-50 cursor-not-allowed' : ''}\`}
                            >
                              <div className="flex-1">
                                <div className="font-medium text-sm text-slate-900">{module.name}</div>
                                <div className="text-xs text-slate-600">{module.description}</div>
                                <div className="text-xs text-slate-500 mt-1">Effort: {module.effort_pd} PD</div>
                              </div>
                              <button
                                onClick={() => handleModuleToggle(pkg.id, module.id)}
                                disabled={pkg.selected}
                                className={\`px-3 py-1 rounded text-sm font-medium transition-colors \${
                                  module.selected
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-slate-700 border border-slate-300'
                                } \${pkg.selected ? 'cursor-not-allowed' : 'hover:bg-blue-700 hover:text-white'}\`}
                              >
                                {module.selected ? 'Selected' : 'Select'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Malaysia Forms Tab */}
        {activeTab === 'forms' && (
          <div className="space-y-4">
            {state.malaysiaForms.map(form => (
              <div
                key={form.id}
                className={\`bg-white rounded-xl shadow-sm border-2 p-6 transition-all \${
                  form.selected ? 'border-green-500 bg-green-50/30' : 'border-slate-200 hover:border-slate-300'
                }\`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {form.form_name}
                      {form.mandatory && (
                        <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                          Mandatory
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">{form.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-slate-500">
                        Category: <span className="font-medium">{form.category}</span>
                      </span>
                      <span className="text-sm text-slate-500">
                        Effort: <span className="font-medium">{form.effort_pd} PD</span>
                      </span>
                      <span className="text-sm text-slate-500">
                        Regulatory: <span className="font-medium">{form.regulatory_body}</span>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => updateMalaysiaForm(form.id, { selected: !form.selected })}
                    className={\`px-4 py-2 rounded-lg font-medium transition-colors \${
                      form.selected
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }\`}
                  >
                    {form.selected ? 'Selected' : 'Select Form'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Project Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            {state.projectServices.map(service => (
              <div
                key={service.id}
                className={\`bg-white rounded-xl shadow-sm border-2 p-6 transition-all \${
                  service.selected ? 'border-purple-500 bg-purple-50/30' : 'border-slate-200 hover:border-slate-300'
                }\`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {service.service_name}
                      {service.mandatory && (
                        <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                          Mandatory
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">{service.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-slate-500">
                        Category: <span className="font-medium">{service.category}</span>
                      </span>
                      <span className="text-sm text-slate-500">
                        Effort: <span className="font-medium">{service.effort_pd} PD</span>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => updateProjectService(service.id, { selected: !service.selected })}
                    className={\`px-4 py-2 rounded-lg font-medium transition-colors \${
                      service.selected
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }\`}
                  >
                    {service.selected ? 'Selected' : 'Select Service'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SAPScopeApp;
