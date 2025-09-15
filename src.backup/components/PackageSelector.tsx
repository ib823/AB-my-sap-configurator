import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Plus, Minus, Search, Filter, AlertTriangle, CheckCircle } from 'lucide-react';
import { useApp, SAPPackage, SAPModule } from './AppProvider';

// ======================== PACKAGE SELECTOR COMPONENTS ========================

const PackageSearchAndFilter: React.FC<{
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
}> = ({ searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, categories }) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search packages and modules..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
        />
      </div>

      {/* Category Filter */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full pl-10 pr-8 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm appearance-none"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
      </div>
    </div>
  );
};

const ModuleRow: React.FC<{
  module: SAPModule;
  packageId: string;
  isPackageSelected: boolean;
  onToggleModule: (moduleId: string) => void;
  validation: { valid: boolean; missing: string[] };
}> = ({ module, packageId, isPackageSelected, onToggleModule, validation }) => {
  const isDisabled = isPackageSelected;
  const hasValidationError = !validation.valid && !module.selected;

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
        module.selected 
          ? 'border-blue-200 bg-blue-50/50' 
          : hasValidationError
          ? 'border-red-200 bg-red-50/30'
          : 'border-slate-200 bg-white hover:bg-slate-50/50'
      } ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h5 className="font-medium text-slate-900 text-sm">{module.name}</h5>
          {module.malaysia_verified && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              MY
            </span>
          )}
          {module.critical_path && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
              Critical
            </span>
          )}
        </div>
        <p className="text-xs text-slate-600 mb-2">{module.description}</p>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>{module.effort_pd} PD</span>
          {hasValidationError && (
            <div className="flex items-center gap-1 text-red-600">
              <AlertTriangle className="w-3 h-3" />
              <span>Missing prerequisites</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => onToggleModule(module.id)}
        disabled={isDisabled}
        className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
          isDisabled
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : module.selected
            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            : hasValidationError
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        {module.selected ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
      </button>
    </div>
  );
};

const PackageCard: React.FC<{ package: SAPPackage }> = ({ package: pkg }) => {
  const { updatePackage, validatePrerequisites } = useApp();

  const selectedModules = pkg.modules.filter(m => m.selected).length;
  const hasPartialSelection = selectedModules > 0 && selectedModules < pkg.modules.length;
  const packageValidation = validatePrerequisites(pkg.id);

  const handleToggleExpand = () => {
    updatePackage(pkg.id, { expanded: !pkg.expanded });
  };

  const handleTogglePackage = () => {
    if (!packageValidation.valid && !pkg.selected) {
      alert(`Missing prerequisites: ${packageValidation.missing.join(', ')}`);
      return;
    }

    const newSelected = !pkg.selected;
    const updatedModules = pkg.modules.map(m => ({ ...m, selected: false }));
    updatePackage(pkg.id, { selected: newSelected, modules: updatedModules });
  };

  const handleToggleModule = (moduleId: string) => {
    if (pkg.selected) return;

    const moduleValidation = validatePrerequisites(pkg.id, moduleId);
    const module = pkg.modules.find(m => m.id === moduleId);

    if (!moduleValidation.valid && module && !module.selected) {
      alert(`Missing module prerequisites: ${moduleValidation.missing.join(', ')}`);
      return;
    }

    const updatedModules = pkg.modules.map(m => 
      m.id === moduleId ? { ...m, selected: !m.selected } : m
    );
    updatePackage(pkg.id, { modules: updatedModules });
  };

  return (
    <div className="border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Package Header */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl flex-shrink-0">{pkg.icon}</div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-slate-900 text-lg truncate">{pkg.name}</h3>
              {pkg.malaysia_verified && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  MY
                </span>
              )}
              {pkg.critical_path && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                  Critical
                </span>
              )}
            </div>
            
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">{pkg.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-slate-700">
                <span className="font-medium">{pkg.total_effort_pd} PD</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-500">{pkg.modules.length} modules</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleTogglePackage}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pkg.selected 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : hasPartialSelection 
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      : !packageValidation.valid
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {pkg.selected ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Full Package
                    </div>
                  ) : hasPartialSelection ? (
                    `Partial (${selectedModules})`
                  ) : !packageValidation.valid ? (
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Prerequisites
                    </div>
                  ) : (
                    'Add Package'
                  )}
                </button>

                <button
                  onClick={handleToggleExpand}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
                >
                  {pkg.expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module List */}
      {pkg.expanded && (
        <div className="border-t border-slate-200 bg-slate-50/50">
          <div className="p-6 space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 mb-4">Individual Modules</h4>
            <div className="space-y-3">
              {pkg.modules.map(module => {
                const moduleValidation = validatePrerequisites(pkg.id, module.id);
                return (
                  <ModuleRow
                    key={module.id}
                    module={module}
                    packageId={pkg.id}
                    isPackageSelected={pkg.selected}
                    onToggleModule={handleToggleModule}
                    validation={moduleValidation}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SelectionSummary: React.FC = () => {
  const { state, calculateTotalEffort, getSelectedPackages } = useApp();
  
  const selectedPackages = getSelectedPackages();
  const totalEffort = calculateTotalEffort();
  const selectedModulesCount = state.packages.reduce((sum, pkg) => 
    sum + pkg.modules.filter(m => m.selected).length, 0
  );

  if (selectedPackages.length === 0 && selectedModulesCount === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">Selection Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-900">{selectedPackages.length}</div>
          <div className="text-sm text-blue-700">Packages</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-900">{selectedModulesCount}</div>
          <div className="text-sm text-blue-700">Modules</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-900">{totalEffort}</div>
          <div className="text-sm text-blue-700">Total PD</div>
        </div>
        <div className="text-center">
          <button
            onClick={() => {
              // Dispatch custom event for export
              window.dispatchEvent(new CustomEvent('sapScopeExport', {
                detail: { packages: selectedPackages, totalEffort }
              }));
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Export to Timeline
          </button>
        </div>
      </div>
    </div>
  );
};

// ======================== MAIN PACKAGE SELECTOR COMPONENT ========================

const PackageSelector: React.FC = () => {
  const { state } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Generate categories from available packages
  const categories = useMemo(() => {
    const cats = ['all', ...Array.from(new Set(state.packages.map(p => p.category)))];
    return cats.sort();
  }, [state.packages]);

  // Filter packages based on search and category
  const filteredPackages = useMemo(() => {
    return state.packages.filter(pkg => {
      const matchesSearch = searchQuery === '' || 
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.modules.some(m => 
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory = selectedCategory === 'all' || pkg.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [state.packages, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">SAP Package Selection</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Choose the SAP packages and modules that best fit your business requirements. 
          Use search and filters to find exactly what you need.
        </p>
      </div>

      {/* Selection Summary */}
      <SelectionSummary />

      {/* Search and Filter */}
      <PackageSearchAndFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
      />

      {/* Package List */}
      <div className="space-y-4">
        {filteredPackages.map(pkg => (
          <PackageCard key={pkg.id} package={pkg} />
        ))}

        {filteredPackages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No packages found</h3>
            <p className="text-slate-600">
              Try adjusting your search terms or category filter to find the packages you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackageSelector;