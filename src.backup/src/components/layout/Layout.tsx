// src/components/layout/Layout.tsx
import React from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';

type ViewKey = "packages" | "estimation" | "risks" | "implementation" | "ai_estimation";

interface LayoutProps {
  children: React.ReactNode;
  selectedView: ViewKey;
  onViewChange: (view: ViewKey) => void;
  companyName?: string;
  operatingMode?: string;
  onModeSwitch?: () => void;
  totalEffort?: number;
  selectedPackagesCount?: number;
}

export const Layout: React.FC<LayoutProps> = ({
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
              <span>© 2025 ABeam Consulting</span>
              <span>•</span>
              <span>SAP Implementation Configurator v2.1</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>AI Estimation Active</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Last saved: Just now</span>
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