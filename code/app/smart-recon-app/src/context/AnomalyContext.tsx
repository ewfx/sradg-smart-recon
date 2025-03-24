import React, { createContext, useContext, useState, ReactNode, useRef, useCallback } from 'react';
import { AnomalyItem } from '@/types/anomaly';

interface AnomalyContextType {
  anomalyStats: {
    totalAnomalies: number;
    totalImpact: number;
    resolvedCount: number;
    totalCount: number;
  };
  anomalyData: AnomalyItem[];
  insightsData: AnomalyItem[];
  updateAnomalyStats: (count: number, impact: number) => void;
  updateAnomalyData: (data: AnomalyItem[]) => void;
  updateInsightsData: (data: AnomalyItem[]) => void;
  refreshStats: () => void;
}

const defaultContext: AnomalyContextType = {
  anomalyStats: {
    totalAnomalies: 0,
    totalImpact: 0,
    resolvedCount: 0,
    totalCount: 0
  },
  anomalyData: [],
  insightsData: [],
  updateAnomalyStats: () => {},
  updateAnomalyData: () => {},
  updateInsightsData: () => {},
  refreshStats: () => {}
};

const AnomalyContext = createContext<AnomalyContextType>(defaultContext);

export const useAnomalyContext = () => useContext(AnomalyContext);

export const AnomalyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [anomalyStats, setAnomalyStats] = useState({
    totalAnomalies: 0,
    totalImpact: 0,
    resolvedCount: 0,
    totalCount: 0
  });
  const [anomalyData, setAnomalyData] = useState<AnomalyItem[]>([]);
  const [insightsData, setInsightsData] = useState<AnomalyItem[]>([]);
  
  const prevStatsRef = useRef({ count: 0, impact: 0 });
  const prevDataRef = useRef({ dataLength: 0, insightsLength: 0 });

  const updateAnomalyStats = useCallback((count: number, impact: number) => {
    if (prevStatsRef.current.count === count && prevStatsRef.current.impact === impact) {
      console.log('AnomalyContext - Skipping redundant update:', { count, impact });
      return;
    }
    
    console.log('AnomalyContext - Updating stats:', { count, impact });
    setAnomalyStats(prev => ({
      ...prev,
      totalAnomalies: count,
      totalImpact: impact,
      totalCount: Math.max(count, prev.totalCount)
    }));
    
    prevStatsRef.current = { count, impact };
  }, []);

  const updateAnomalyData = useCallback((data: AnomalyItem[]) => {
    if (data.length === 0 || (data.length === prevDataRef.current.dataLength && data.length === anomalyData.length)) {
      console.log('AnomalyContext - Skipping redundant data update:', { count: data.length });
      return;
    }
    
    console.log('AnomalyContext - Updating data:', { count: data.length });
    setAnomalyData(data);
    
    const resolvedCount = data.filter(item => item.status === 'resolved').length;
    setAnomalyStats(prev => ({
      ...prev,
      resolvedCount,
      totalCount: Math.max(data.length, prev.totalCount)
    }));
    
    prevDataRef.current = { ...prevDataRef.current, dataLength: data.length };
  }, [anomalyData.length]);
  
  const updateInsightsData = useCallback((data: AnomalyItem[]) => {
    if (data.length === 0 || (data.length === prevDataRef.current.insightsLength && data.length === insightsData.length)) {
      console.log('AnomalyContext - Skipping redundant insights update:', { count: data.length });
      return;
    }
    
    console.log('AnomalyContext - Updating insights data:', { count: data.length });
    setInsightsData(data);
    
    if (anomalyData.length === 0 && data.length > 0) {
      console.log('AnomalyContext - Also updating anomaly data from insights:', { count: data.length });
      setAnomalyData(data);
      
      const resolvedCount = data.filter(item => item.status === 'resolved').length;
      setAnomalyStats(prev => ({
        ...prev,
        resolvedCount,
        totalCount: Math.max(data.length, prev.totalCount)
      }));
      
      prevDataRef.current = { ...prevDataRef.current, dataLength: data.length };
    }
    
    prevDataRef.current = { ...prevDataRef.current, insightsLength: data.length };
  }, [anomalyData.length, insightsData.length]);

  const refreshStats = useCallback(() => {
    console.log('AnomalyContext - Forcing refresh of stats');
    
    setAnomalyStats(prev => ({ ...prev }));
    
    if (anomalyData.length > 0) {
      console.log('AnomalyContext - Refreshing anomaly data');
      setAnomalyData(prev => [...prev]);
    }
    
    if (insightsData.length > 0) {
      console.log('AnomalyContext - Refreshing insights data');
      setInsightsData(prev => [...prev]);
    }
  }, [anomalyData.length, insightsData.length]);

  return (
    <AnomalyContext.Provider value={{
      anomalyStats,
      anomalyData,
      insightsData,
      updateAnomalyStats,
      updateAnomalyData,
      updateInsightsData,
      refreshStats
    }}>
      {children}
    </AnomalyContext.Provider>
  );
};
