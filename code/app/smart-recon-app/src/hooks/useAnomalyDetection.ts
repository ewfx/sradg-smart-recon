
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
  onAnomalyStatsChange,
  apiKey = null
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
    apiKey
  });

  // API client hook with enhanced callback handling
  const { callAnomalyDetectionApi } = useAnomalyApiClient({
    onAnomalyDataReceived,
    onAnomalyInsightsReceived,
    updateAnomalyStats,
    setDownloadFile,
    completeProgress,
    apiKey
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

  // Allow passing apiKey directly to generateInsights
  const generateInsightsWithKey = useCallback((key?: string) => {
    // Use provided key or fallback to the one from props
    const keyToUse = key || apiKey;
    return generateInsights(keyToUse);
  }, [generateInsights, apiKey]);

  return {
    isDetecting,
    isGeneratingInsights,
    resultFile,
    detectAnomalies,
    generateInsights: generateInsightsWithKey,
    downloadFile,
    progress,
    hasAnomalies,
    insightsData,
    totalAnomaliesCount,
    totalImpactValue,
    refreshStats
  };
};
