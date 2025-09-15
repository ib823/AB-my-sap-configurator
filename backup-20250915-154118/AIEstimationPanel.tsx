import React, { useState, useEffect } from 'react';
import { useAIEstimation } from '../hooks/useAIEstimation';

interface AIEstimationPanelProps {
  selectedPackages: any[];
  clientProfile: any;
  onEstimationUpdate?: (result: any) => void;
  className?: string;
}

export const AIEstimationPanel: React.FC<AIEstimationPanelProps> = ({
  selectedPackages,
  clientProfile,
  onEstimationUpdate,
  className = ""
}) => {
  const {
    isLoading,
    result,
    error,
    currentProvider,
    estimateEffort,
    clearError
  } = useAIEstimation();

  useEffect(() => {
    if (selectedPackages.length > 0 && clientProfile?.company_name) {
      const timer = setTimeout(() => {
        handleEstimate();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [selectedPackages, clientProfile]);

  useEffect(() => {
    if (result && onEstimationUpdate) {
      onEstimationUpdate(result);
    }
  }, [result, onEstimationUpdate]);

  const handleEstimate = async () => {
    if (selectedPackages.length === 0) return;

    try {
      await estimateEffort(selectedPackages, clientProfile, [], []);
    } catch (err) {
      console.error('Estimation failed:', err);
    }
  };

  const formatEffort = (effort: number) => {
    return `${Math.round(effort)} person-days`;
  };

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`bg-white border rounded-lg shadow-sm ${className}`}>
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">🤖 AI Estimation</h3>
            <p className="text-sm text-gray-600">
              Provider: {currentProvider} • Ready for estimation
            </p>
          </div>
          <button
            onClick={handleEstimate}
            disabled={isLoading || selectedPackages.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Analyzing...
              </div>
            ) : (
              'Estimate'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-red-500 mr-2">⚠️</div>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-900">
                {formatEffort(result.totalEffort)}
              </div>
              <div className="text-sm text-blue-600">Total Effort</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-900">
                {formatConfidence(result.confidence)}
              </div>
              <div className="text-sm text-green-600">Confidence</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Effort Breakdown</h4>
            <div className="space-y-2">
              {result.breakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{item.packageId}</div>
                    <div className="text-xs text-gray-600 mt-1">{item.reasoning}</div>
                    {item.riskFactors.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.riskFactors.map((risk, riskIdx) => (
                          <span
                            key={riskIdx}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800"
                          >
                            ⚠️ {risk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-semibold text-gray-900">
                      {formatEffort(item.effort)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {result.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
              <div className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-md border ${getPriorityColor(rec.priority)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-xs font-medium uppercase tracking-wide mr-2">
                            {rec.type}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full font-medium bg-opacity-50">
                            {rec.priority}
                          </span>
                        </div>
                        <p className="mt-1 text-sm">{rec.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.alternativeScenarios && result.alternativeScenarios.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Alternative Scenarios</h4>
              <div className="grid gap-3">
                {result.alternativeScenarios.map((scenario, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-sm text-gray-900">{scenario.scenario}</h5>
                      <span className="font-semibold text-blue-600">
                        {formatEffort(scenario.effort)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {scenario.tradeoffs.map((tradeoff, tradeoffIdx) => (
                        <div key={tradeoffIdx} className="text-xs text-gray-600 flex items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                          {tradeoff}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedPackages.length === 0 && !result && (
        <div className="p-8 text-center text-gray-500">
          <div className="text-4xl mb-4">📦</div>
          <p className="text-lg font-medium mb-2">No packages selected</p>
          <p className="text-sm">Select SAP packages to get AI-powered effort estimation</p>
        </div>
      )}
    </div>
  );
};
