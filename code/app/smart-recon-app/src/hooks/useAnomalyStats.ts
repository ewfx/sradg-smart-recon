
import { useState, useCallback, useEffect, useRef } from 'react';

export interface UseAnomalyStatsProps {
  onStatsChange?: (count: number, impact: number) => void;
}

export const useAnomalyStats = ({ onStatsChange }: UseAnomalyStatsProps = {}) => {
  const [stats, setStats] = useState({
    totalAnomaliesCount: 0,
    totalImpactValue: 0,
    hasAnomalies: false
  });

  const { totalAnomaliesCount, totalImpactValue, hasAnomalies } = stats;
  
  // Use this ref to prevent infinite update loops
  const prevStatsRef = useRef({ count: 0, impact: 0 });

  // Log state updates for debugging and call the callback
  useEffect(() => {
    console.log('useAnomalyStats - State updated:', { totalAnomaliesCount, totalImpactValue });
    
    // Only call onStatsChange when values actually change
    if (onStatsChange && 
        (prevStatsRef.current.count !== totalAnomaliesCount || 
         prevStatsRef.current.impact !== totalImpactValue)) {
      
      console.log('Calling onStatsChange from useEffect with:', { count: totalAnomaliesCount, impact: totalImpactValue });
      onStatsChange(totalAnomaliesCount, totalImpactValue);
      
      // Update ref with current values to prevent future calls with the same data
      prevStatsRef.current = { count: totalAnomaliesCount, impact: totalImpactValue };
    }
  }, [totalAnomaliesCount, totalImpactValue, onStatsChange]);

  // State update function with direct callback
  const updateAnomalyStats = useCallback((count: number, impact: number) => {
    console.log(`Setting anomaly stats - count: ${count}, impact: ${impact}`);
    
    // Skip update if values are the same
    if (count === prevStatsRef.current.count && impact === prevStatsRef.current.impact) {
      console.log('Skipping redundant stats update');
      return;
    }
    
    // Update state
    setStats({
      totalAnomaliesCount: count,
      totalImpactValue: impact,
      hasAnomalies: count > 0
    });
    
    // Update ref with new values
    prevStatsRef.current = { count, impact };
    
    // Direct callback is handled in useEffect to avoid duplicates
  }, []);

  // Add a direct refresh method that components can call
  const refreshStats = useCallback(() => {
    console.log('Manually refreshing stats:', { totalAnomaliesCount, totalImpactValue });
    if (onStatsChange) {
      onStatsChange(totalAnomaliesCount, totalImpactValue);
    }
  }, [totalAnomaliesCount, totalImpactValue, onStatsChange]);

  return {
    totalAnomaliesCount,
    totalImpactValue,
    hasAnomalies,
    updateAnomalyStats,
    refreshStats
  };
};
