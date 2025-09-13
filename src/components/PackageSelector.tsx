import React, { useState, useMemo } from 'react';
import { useApp } from './AppProvider';
import { ChevronDown, ChevronRight, Package, Search, Filter, AlertTriangle, Check, X } from 'lucide-react';

// ======================== TYPES ========================
interface PackageSelectorProps {
  className?: string;
  onSelectionChange?: (selectedCount: number) => void;
}

interface PackageCardProps {
  package: any;
  onPackageToggle: (packageId: string) => void;
  onModuleToggle: (packageId: string, moduleId: string) => void;
  onExpandToggle: (packageId: string) => void;
  validatePrerequisites: (packageId: string, moduleId?: string) => { valid: boolean; missing: string[] };
}

// ======================== SUB-COMPONENTS ========================

/**
 * 1. PackageSearchFilter - Search and category filtering
 */
const PackageSearchFilter: React.FC<{
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
  packageCount: number;
}> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  packageCount
}) => {
  return (
    <div className="package-search-filter">
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
          <Search 
            size={20} 
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8e8e93'
            }}
          />
          <input
            type="text"
            placeholder="Search packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 44px',
              border: '2px solid #e5e5e7',
              borderRadius: '12px',
              fontSize: '16px',
              background: 'white',
              transition: 'border-color 0.2s ease',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#007AFF'}
            onBlur={(e) => e.target.style.borderColor = '#e5e5e7'}
          />
        </div>

        {/* Category Filter */}
        <div style={{ position: 'relative', minWidth: '200px' }}>
          <Filter 
            size={16} 
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8e8e93'
            }}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 36px',
              border: '2px solid #e5e5e7',
              borderRadius: '12px',
              fontSize: '16px',
              background: 'white',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="all">All Categories</option>
            {categories.filter(cat => cat !== 'all').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Package Count */}
        <div style={{
          padding: '12px 16px',
          background: 'rgba(0,122,255,0.1)',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#007AFF'
        }}>
          {packageCount} packages
        </div>
      </div>
    </div>
  );
};

/**
 * 2. PackageCard - Individual package card with modules
 */
const PackageCard: React.FC<PackageCardProps> = ({
  package: pkg,
  onPackageToggle,
  onModuleToggle,
  onExpandToggle,
  validatePrerequisites
}) => {
  const selectedModules = pkg.modules.filter((m: any) => m.selected);
  const hasPartialSelection = selectedModules.length > 0 && selectedModules.length < pkg.modules.length;
  const validation = validatePrerequisites(pkg.id);

  return (
    <div
      className="package-card"
      style={{
        border: `2px solid ${!validation.valid ? '#ff3b30' : pkg.selected ? '#007AFF' : hasPartialSelection ? '#ff9500' : '#e5e5e7'}`,
        borderRadius: '16px',
        background: pkg.selected ? 'linear-gradient(135deg, #f0f4ff 0%, #e6f2ff 100%)' : 'white',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        boxShadow: pkg.selected ? '0 8px 25px rgba(0,122,255,0.15)' : '0 2px 8px rgba(0,0,0,0.05)'
      }}
    >
      {/* Package Header */}
      <div
        onClick={() => onPackageToggle(pkg.id)}
        style={{
          padding: '20px',
          cursor: validation.valid || pkg.selected ? 'pointer' : 'not-allowed',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          opacity: validation.valid || pkg.selected ? 1 : 0.6
        }}
      >
        <div style={{ flex: 1 }}>
          {/* Title Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '24px' }}>{pkg.icon || '📦'}</span>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#1d1d1f' }}>
              {pkg.name}
            </h3>
            
            {/* Badges */}
            {pkg.malaysia_verified && (
              <span style={{
                padding: '4px 8px',
                background: '#34c759',
                color: 'white',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                MY ✓
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

          {/* Category Badge */}
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: 'rgba(0,122,255,0.1)',
            color: '#007AFF',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '12px'
          }}>
            {pkg.category}
          </div>

          {/* Description */}
          <p style={{ fontSize: '14px', color: '#6e6e73', margin: '0 0 16px 0', lineHeight: '1.4' }}>
            {pkg.description}
          </p>

          {/* Metrics */}
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#8e8e93', flexWrap: 'wrap' }}>
            <span><strong>{pkg.total_effort_pd || 0}</strong> person-days</span>
            <span><strong>{pkg.modules?.length || 0}</strong> modules</span>
            {pkg.prerequisites?.length > 0 && (
              <span>Requires: {pkg.prerequisites.join(', ')}</span>
            )}
          </div>

          {/* Prerequisites Warning */}
          {!validation.valid && (
            <div style={{
              marginTop: '12px',
              padding: '8px 12px',
              background: 'rgba(255,59,48,0.1)',
              border: '1px solid rgba(255,59,48,0.3)',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#ff3b30',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangle size={16} />
              Missing prerequisites: {validation.missing.join(', ')}
            </div>
          )}
        </div>

        {/* Right Side Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Selection Indicator */}
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: pkg.selected ? '#007AFF' : hasPartialSelection ? '#ff9500' : '#e5e5e7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: '700'
          }}>
            {pkg.selected ? <Check size={16} /> : hasPartialSelection ? selectedModules.length : ''}
          </div>

          {/* Expand Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpandToggle(pkg.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#007AFF'
            }}
          >
            {pkg.expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
      </div>

      {/* Module Selection */}
      {pkg.expanded && (
        <div style={{
          borderTop: '1px solid #e5e5e7',
          padding: '20px',
          background: 'rgba(0,0,0,0.02)'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: '#1d1d1f' }}>
            Individual Modules ({pkg.modules?.length || 0}):
          </h4>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {(pkg.modules || []).map((module: any) => {
              const isModuleSelected = module.selected;
              const isDisabled = pkg.selected; // If package is selected, modules are auto-selected
              
              return (
                <div
                  key={module.id}
                  onClick={() => !isDisabled && onModuleToggle(pkg.id, module.id)}
                  style={{
                    padding: '16px',
                    border: `1px solid ${isModuleSelected ? '#007AFF' : '#e5e5e7'}`,
                    borderRadius: '12px',
                    background: isModuleSelected ? 'rgba(0,122,255,0.05)' : 'white',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.5 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h5 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0', color: '#1d1d1f' }}>
                        {module.name}
                      </h5>
                      <p style={{ fontSize: '12px', color: '#6e6e73', margin: '0 0 8px 0' }}>
                        {module.description}
                      </p>
                      <div style={{ fontSize: '11px', color: '#8e8e93' }}>
                        <span><strong>{module.effort_pd || 0}</strong> person-days</span>
                        {module.prerequisites?.length > 0 && (
                          <span style={{ marginLeft: '12px' }}>
                            Requires: {module.prerequisites.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: isModuleSelected ? '#007AFF' : '#e5e5e7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: '12px'
                    }}>
                      {isModuleSelected && <Check size={12} color="white" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 3. PackageGrid - Grid layout for package cards
 */
const PackageGrid: React.FC<{
  packages: any[];
  onPackageToggle: (packageId: string) => void;
  onModuleToggle: (packageId: string, moduleId: string) => void;
  onExpandToggle: (packageId: string) => void;
  validatePrerequisites: (packageId: string, moduleId?: string) => { valid: boolean; missing: string[] };
}> = ({
  packages,
  onPackageToggle,
  onModuleToggle,
  onExpandToggle,
  validatePrerequisites
}) => {
  if (packages.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: '#8e8e93'
      }}>
        <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
          No packages found
        </h3>
        <p style={{ fontSize: '14px', margin: 0 }}>
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {packages.map(pkg => (
        <PackageCard
          key={pkg.id}
          package={pkg}
          onPackageToggle={onPackageToggle}
          onModuleToggle={onModuleToggle}
          onExpandToggle={onExpandToggle}
          validatePrerequisites={validatePrerequisites}
        />
      ))}
    </div>
  );
};

/**
 * 4. PackageStats - Selection statistics and summary
 */
const PackageStats: React.FC<{
  totalPackages: number;
  selectedPackages: number;
  totalEffort: number;
}> = ({
  totalPackages,
  selectedPackages,
  totalEffort
}) => {
  const selectionRate = totalPackages > 0 ? (selectedPackages / totalPackages) * 100 : 0;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      {/* Selected Packages */}
      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
        borderRadius: '16px',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>
          {selectedPackages}
        </div>
        <div style={{ fontSize: '14px', opacity: 0.9 }}>
          Selected Packages
        </div>
      </div>

      {/* Total Effort */}
      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #34C759 0%, #30B22A 100%)',
        borderRadius: '16px',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>
          {Math.round(totalEffort)}
        </div>
        <div style={{ fontSize: '14px', opacity: 0.9 }}>
          Person-Days
        </div>
      </div>

      {/* Selection Rate */}
      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #FF9500 0%, #FF6B00 100%)',
        borderRadius: '16px',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>
          {Math.round(selectionRate)}%
        </div>
        <div style={{ fontSize: '14px', opacity: 0.9 }}>
          Coverage
        </div>
      </div>
    </div>
  );
};

/**
 * 5. MAIN PackageSelector Component
 */
const PackageSelector: React.FC<PackageSelectorProps> = ({
  className = '',
  onSelectionChange
}) => {
  const {
    state,
    updatePackage,
    validatePrerequisites,
    calculateTotalEffort
  } = useApp();

  // Local state for search and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(state.packages.map(p => p.category)));
    return ['all', ...cats.sort()];
  }, [state.packages]);

  // Filter packages
  const filteredPackages = useMemo(() => {
    return state.packages.filter(pkg => {
      const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           pkg.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || pkg.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [state.packages, searchQuery, selectedCategory]);

  // Package selection stats
  const selectedPackages = useMemo(() => {
    return state.packages.filter(p => p.selected || p.modules.some(m => m.selected));
  }, [state.packages]);

  const totalEffort = calculateTotalEffort();

  // Event handlers
  const handlePackageToggle = (packageId: string) => {
    const pkg = state.packages.find(p => p.id === packageId);
    if (!pkg) return;

    const validation = validatePrerequisites(packageId);
    if (!validation.valid && !pkg.selected) {
      alert(`Missing prerequisites: ${validation.missing.join(', ')}`);
      return;
    }

    const newSelected = !pkg.selected;
    updatePackage(packageId, { 
      selected: newSelected,
      // If package is selected, clear individual module selections
      modules: newSelected ? pkg.modules.map(m => ({ ...m, selected: false })) : pkg.modules
    });

    onSelectionChange?.(newSelected ? selectedPackages.length + 1 : selectedPackages.length - 1);
  };

  const handleModuleToggle = (packageId: string, moduleId: string) => {
    const pkg = state.packages.find(p => p.id === packageId);
    if (!pkg || pkg.selected) return; // Can't select individual modules if package is selected

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
    onSelectionChange?.(selectedPackages.length);
  };

  const handleExpandToggle = (packageId: string) => {
    const pkg = state.packages.find(p => p.id === packageId);
    if (!pkg) return;

    updatePackage(packageId, { expanded: !pkg.expanded });
  };

  return (
    <div className={`package-selector ${className}`}>
      {/* Statistics */}
      <PackageStats
        totalPackages={state.packages.length}
        selectedPackages={selectedPackages.length}
        totalEffort={totalEffort}
      />

      {/* Search and Filter */}
      <PackageSearchFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        packageCount={filteredPackages.length}
      />

      {/* Package Grid */}
      <PackageGrid
        packages={filteredPackages}
        onPackageToggle={handlePackageToggle}
        onModuleToggle={handleModuleToggle}
        onExpandToggle={handleExpandToggle}
        validatePrerequisites={validatePrerequisites}
      />
    </div>
  );
};

// Also export sub-components for potential individual use
export {
  PackageSearchFilter,
  PackageCard,
  PackageGrid,
  PackageStats
};

export default PackageSelector;