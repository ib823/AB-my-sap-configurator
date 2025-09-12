import { useState, useCallback, useRef, useEffect } from 'react';
import { aiAdapter } from '../adapters/ai/AIAdapter';
import type { EstimationRequest, EstimationResult, AICapabilities } from '../adapters/ai/types';

interface UseAIEstimationState {
  isLoading: boolean;
  result: EstimationResult | null;
  error: string | null;
  capabilities: AICapabilities | null;
  currentProvider: string | null;
}

export function useAIEstimation() {
  const [state, setState] = useState<UseAIEstimationState>({
    isLoading: false,
    result: null,
    error: null,
    capabilities: null,
    currentProvider: 'Rule-based'
  });

  const abortControllerRef = useRef<AbortController>();

  useEffect(() => {
    const initializeCapabilities = async () => {
      try {
        const capabilities = aiAdapter.getCapabilities();
        setState(prev => ({ 
          ...prev, 
          capabilities,
          currentProvider: 'Rule-based Estimation'
        }));
      } catch (error) {
        console.warn('AI capabilities detection failed:', error);
      }
    };

    initializeCapabilities();
  }, []);

  const estimateEffort = useCallback(async (
    packages: any[],
    clientProfile: any,
    integrations?: any[],
    customRequirements?: string[]
  ) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null 
    }));

    try {
      const request: EstimationRequest = {
        packages: packages.map(pkg => typeof pkg === 'string' ? pkg : pkg.id),
        clientProfile,
        integrations,
        customRequirements
      };

      const result = await aiAdapter.estimateProject(request);

      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        result,
        error: null
      }));

      return result;
    } catch (error) {
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'AI estimation failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        result: null
      }));
      
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearResult = useCallback(() => {
    setState(prev => ({ ...prev, result: null }));
  }, []);

  return {
    isLoading: state.isLoading,
    result: state.result,
    error: state.error,
    capabilities: state.capabilities,
    currentProvider: state.currentProvider,
    estimateEffort,
    clearError,
    clearResult,
    hasResult: !!state.result,
    hasError: !!state.error,
    availableProviders: ['fallback-rules'],
    estimatedLatency: 100
  };
}
