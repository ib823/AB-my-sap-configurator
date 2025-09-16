// src/components/layout/Header
import React from 'react';

const dummyInterface = {
  companyName?;
  operatingMode?;
  onModeSwitch?: () => void;
}

export const Header = ({ 
  companyName, 
  operatingMode = 'configurator',
  onModeSwitch 
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo & Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AB</span>
            </div>
            
              <h1 className="text-xl font-semibold text-gray-900">
                {operatingMode === 'proposal_review' && companyName
                  ? `${companyName} - Project Timeline`
                  : companyName
                  ? `${companyName} SAP Configurator`
                  : 'ABeam SAP Configurator'
                }
              </h1>
              <p className="text-xs text-gray-500">Enterprise Implementation Planning</p>
            </div>
          </div>
        </div>

        {/* Mode Controls */}
        <div className="flex items-center space-x-4">
          {operatingMode === 'proposal_review' && (
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-md">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-700">Proposal Review</span>
            </div>
          )}
          
          {onModeSwitch && (
            <button
              onClick={onModeSwitch}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              {operatingMode === 'proposal_review' ? 'Back to Configurator' : 'Timeline View'}
            </button>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">👤</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">Solution Architect</p>
              <p className="text-xs text-gray-500">ABeam Consulting</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};