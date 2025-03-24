
import { useState, useCallback } from 'react';
import { DynamicColumnData } from '@/lib/csv-parser';
import { AnomalyItem, UseAnomalyDetectionProps } from '@/types/anomaly';
import { useAnomalyInsights } from './useAnomalyInsights';
import { useAnomalyProgress } from './useAnomalyProgress';
import { useAnomalyFileDownload } from './useAnomalyFileDownload';
import { useAnomalyStats } from './useAnomalyStats';
import { useAnomalyApiClient } from './useAnomalyApiClient';

export const useAnomalyDetection = ({ 
  onAnomalyDataReceived, 
  onAnomalyInsightsReceived,
  onAnomalyStatsChange
}: UseAnomalyDetectionProps = {}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  
  // Use smaller, focused hooks for different aspects of anomaly detection
  const { progress, completeProgress } = useAnomalyProgress({ isDetecting });
  const { resultFile, setDownloadFile, downloadFile } = useAnomalyFileDownload();
  const { 
    totalAnomaliesCount, 
    totalImpactValue, 
    hasAnomalies, 
    updateAnomalyStats,
    refreshStats
  } = useAnomalyStats({
    onStatsChange: onAnomalyStatsChange
  });
  
  const { 
    isGeneratingInsights, 
    generateInsights, 
    insightsData 
  } = useAnomalyInsights({ 
    onAnomalyInsightsReceived,
  });

  // API client hook with enhanced callback handling
  const { callAnomalyDetectionApi } = useAnomalyApiClient({
    onAnomalyDataReceived,
    onAnomalyInsightsReceived,
    updateAnomalyStats,
    setDownloadFile,
    completeProgress
  });

  // Main function to detect anomalies
  const detectAnomalies = useCallback(async () => {
    setIsDetecting(true);
    
    try {
      await callAnomalyDetectionApi();
    } finally {
      setIsDetecting(false);
    }
  }, [callAnomalyDetectionApi]);

  return {
    isDetecting,
    isGeneratingInsights,
    resultFile,
    detectAnomalies,
    generateInsights,
    downloadFile,
    progress,
    hasAnomalies,
    insightsData,
    totalAnomaliesCount,
    totalImpactValue,
    refreshStats
  };
};
