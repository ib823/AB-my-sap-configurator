import React, { useState, useEffect } from 'react';
import { Package, Settings, Download, BarChart3, Users, FileText } from 'lucide-react';
import AppProvider, { useApp } from './AppProvider';
import PackageSelector from './PackageSelector';

// ======================== DASHBOARD COMPONENTS ========================

const DashboardStats: React.FC = () => {
  const { state, calculateTotalEffort, getSelectedPackages } = useApp();
  
  const selectedPackages = getSelectedPackages();
  const totalEffort = calculateTotalEffort();
  const selectedModulesCount = state.packages.reduce((sum, pkg) => 
    sum + pkg.modules.filter(m => m.selected).length, 0
  );

  const stats = [
    {
      icon: Package,
      label: 'Selected Packages',
      value: selectedPackages.length,
      color: 'blue'
    },
    {
      icon: Settings,
      label: 'Selected Modules',
      value: selectedModulesCount,
      color: 'green'
    },
    {
      icon: BarChart3,
      label: 'Total Effort (PD)',
      value: totalEffort,
      color: 'purple'
    },
    {
      icon: Users,
      label: 'Integrations',
      value: state.integrations.length,
      color: 'orange'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <Icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TabNavigation: React.FC<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
}> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'packages', label: 'Package Selection', icon: Package },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'export', label: 'Export & Timeline', icon: Download },
  ];

  return (
    <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

const AdminModeToggle: React.FC = () => {
  const { state, setAdminMode } = useApp();

  if (!state.adminMode) return null;

  return (
    <div className="bg-red-900 text-white px-4 py-2 text-center text-sm font-medium mb-4 rounded-lg">
      🔒 ADMIN MODE ACTIVE - Package Management Enabled
      <button
        onClick={() => setAdminMode(false)}
        className="ml-4 px-2 py-1 bg-red-700 rounded text-xs hover:bg-red-600 transition-colors"
      >
        Exit Admin
      </button>
    </div>
  );
};

const ExportView: React.FC = () => {
  const { state, getSelectedPackages, calculateTotalEffort } = useApp();
  
  const selectedPackages = getSelectedPackages();
  const totalEffort = calculateTotalEffort();

  const handleExportToTimeline = () => {
    // Create export data
    const exportData = {
      packages: selectedPackages,
      totalEffort,
      integrations: state.integrations,
      clientProfile: state.clientProfile,
      timestamp: new Date().toISOString()
    };

    // Dispatch custom event for timeline integration
    window.dispatchEvent(new CustomEvent('sapScopeExport', {
      detail: exportData
    }));

    // Also trigger download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sap-scope-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Export to Timeline</h3>
        <p className="text-slate-600 mb-6">
          Export your selected packages and configuration to integrate with the project timeline.
        </p>

        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-slate-900 mb-3">Export Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Selected Packages:</span>
              <span className="font-medium ml-2">{selectedPackages.length}</span>
            </div>
            <div>
              <span className="text-slate-600">Total Effort:</span>
              <span className="font-medium ml-2">{totalEffort} PD</span>
            </div>
            <div>
              <span className="text-slate-600">Integrations:</span>
              <span className="font-medium ml-2">{state.integrations.length}</span>
            </div>
            <div>
              <span className="text-slate-600">Client:</span>
              <span className="font-medium ml-2">{state.clientProfile.company_name || 'Not specified'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleExportToTimeline}
          disabled={selectedPackages.length === 0}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-5 h-5" />
          Export to Timeline
        </button>
      </div>

      {selectedPackages.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Selected Packages</h3>
          <div className="space-y-3">
            {selectedPackages.map(pkg => (
              <div key={pkg.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{pkg.icon}</span>
                  <div>
                    <div className="font-medium text-slate-900">{pkg.name}</div>
                    <div className="text-sm text-slate-600">{pkg.total_effort_pd} PD</div>
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  {pkg.selected ? 'Full Package' : `${pkg.modules.filter(m => m.selected).length} modules`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ======================== MAIN SAP SCOPE APP ========================

const SAPScopeAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('packages');

  // Listen for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        // Admin mode toggle is handled in AppProvider
        return;
      }
      
      // Tab shortcuts
      if (event.ctrlKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            setActiveTab('packages');
            break;
          case '2':
            event.preventDefault();
            setActiveTab('dashboard');
            break;
          case '3':
            event.preventDefault();
            setActiveTab('export');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'packages':
        return <PackageSelector />;
      case 'dashboard':
        return (
          <div className="space-y-6">
            <DashboardStats />
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Overview</h3>
              <p className="text-slate-600">
                Use the dashboard to monitor your SAP package selection progress and get insights 
                into your project scope. Switch to the Package Selection tab to make changes, 
                or go to Export to generate timeline data.
              </p>
            </div>
          </div>
        );
      case 'export':
        return <ExportView />;
      default:
        return <PackageSelector />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            SAP Scope Configurator
          </h1>
          <p className="text-slate-600">
            Configure your SAP implementation scope with precision and confidence
          </p>
        </div>

        {/* Admin Mode Toggle */}
        <AdminModeToggle />

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        {renderTabContent()}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div>
              SAP Scope Configurator v2.1.0 | ABeam Consulting
            </div>
            <div className="flex items-center gap-4">
              <span>Ctrl+Shift+A: Admin Mode</span>
              <span>Ctrl+1/2/3: Switch Tabs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ======================== ROOT COMPONENT WITH PROVIDER ========================

const SAPScopeApp: React.FC = () => {
  return (
    <AppProvider>
      <SAPScopeAppContent />
    </AppProvider>
  );
};

export default SAPScopeApp;