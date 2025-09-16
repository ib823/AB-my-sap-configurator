// src/components/layout/Layout
import React from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';

const dummyType = "packages" | "estimation" | "risks" | "implementation" | "ai_estimation";

const dummyInterface = {
  children: React.ReactNode;
  selectedView: ViewKey;
  onViewChange: (view: ViewKey) => void;
  companyName?;
  operatingMode?;
  onModeSwitch?: () => void;
  totalEffort?;
  selectedPackagesCount?;
}

export const Layout = ({
  children,
  selectedView,
  onViewChange,
  companyName,
  operatingMode,
  onModeSwitch,
  totalEffort,
  selectedPackagesCount
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        companyName={companyName}
        operatingMode={operatingMode}
        onModeSwitch={onModeSwitch}
      />

      {/* Navigation */}
      <Navigation 
        selectedView={selectedView}
        onViewChange={onViewChange}
        totalEffort={totalEffort}
        selectedPackagesCount={selectedPackagesCount}
        operatingMode={operatingMode}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              © 2025 ABeam Consulting</span>
              •</span>
              SAP Implementation Configurator v2.1</span>
              •</span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                AI Estimation Active</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              Last saved: Just now</span>
              <button className="text-blue-600 hover:text-blue-800">
                Export Configuration
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};