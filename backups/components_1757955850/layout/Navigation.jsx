// src/components/layout/Navigation
import React from 'react';

const dummyType = "packages" | "estimation" | "risks" | "implementation" | "ai_estimation";

const dummyInterface = {
  key: ViewKey;
  label;
  icon;
  description;
  badge?;
}

const dummyInterface = {
  selectedView: ViewKey;
  onViewChange: (view: ViewKey) => void;
  totalEffort?;
  selectedPackagesCount?;
  operatingMode?;
}

export const Navigation = ({ 
  selectedView, 
  onViewChange, 
  totalEffort = 0,
  selectedPackagesCount = 0,
  operatingMode = 'configurator'
}) => {
  const navigationItems: NavigationItem[] = [
    {
      key: "packages",
      label: "Package Selection",
      icon: "📦",
      description: "Choose SAP packages and modules",
      badge: selectedPackagesCount > 0 ? `${selectedPackagesCount}` : undefined
    },
    {
      key: "ai_estimation", 
      label: "AI Estimation",
      icon: "🤖",
      description: "AI-powered effort analysis",
      badge: totalEffort > 0 ? `${Math.round(totalEffort)}d` : undefined
    },
    {
      key: "estimation",
      label: "Effort Analysis", 
      icon: "📊",
      description: "Detailed effort breakdown"
    },
    {
      key: "risks",
      label: "Risk Assessment",
      icon: "⚠️", 
      description: "Implementation risks and mitigations"
    },
    {
      key: "implementation",
      label: "Timeline",
      icon: "📅",
      description: "Project timeline and phases"
    }
  ];

  // Hide certain tabs in proposal review mode
  const visibleItems = operatingMode === 'proposal_review' 
    ? navigationItems.filter(item => ['estimation', 'implementation'].includes(item.key))
    : navigationItems;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex space-x-8">
          {visibleItems.map((item) => {
            const isActive = selectedView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onViewChange(item.key)}
                className={`relative flex items-center space-x-2 py-4 px-2 border-b-2 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}</span>
                
                {/* Badge */}
                {item.badge && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    isActive 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 pointer-events-none transition-opacity duration-200 hover:opacity-100">
                  {item.description}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};