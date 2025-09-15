import { useMemo } from 'react';
import { Phase } from '@/types';

export const useProjectCalculations = (
  phases: Phase[],
  selectedCatalogRegion: string,
  convertCurrency: (amount: number, from: string, to: string) => number
) => {
  return useMemo(() => {
    const projectCost = phases.reduce((total, phase) => {
      return total + phase.resources.reduce((phaseTotal, resource) => {
        const personDays = Math.round((phase.workingDays * (resource.allocation || 0)) / 100);
        const dailyRate = (resource.hourlyRate || 0) * 8;
        const localCost = personDays * dailyRate;
        return phaseTotal + convertCurrency(localCost, resource.region, selectedCatalogRegion);
      }, 0);
    }, 0);

    const totalPersonDays = phases.reduce((total, phase) => {
      return total + phase.resources.reduce((phaseTotal, resource) => {
        return phaseTotal + Math.round((phase.workingDays * (resource.allocation || 0)) / 100);
      }, 0);
    }, 0);

    const blendedRate = totalPersonDays > 0 ? projectCost / totalPersonDays : 0;

    return {
      projectCost,
      totalPersonDays,
      blendedRate
    };
  }, [phases, selectedCatalogRegion, convertCurrency]);
};
