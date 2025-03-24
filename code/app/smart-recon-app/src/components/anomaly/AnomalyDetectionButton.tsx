import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Download, Sparkles, Brain, RefreshCw } from 'lucide-react';
import { DynamicColumnData } from '@/lib/csv-parser';
import { useAnomalyDetection } from '@/hooks/useAnomalyDetection';
import { Progress } from '@/components/ui/progress';
import { AnomalyItem } from '@/types/anomaly';
import { toast } from 'sonner';
import { useAnomalyContext } from '@/context/AnomalyContext';

interface AnomalyDetectionButtonProps {
  onAnomalyDataReceived?: (data: DynamicColumnData[], headers: string[]) => void;
  onAnomalyInsightsReceived?: (anomalies: AnomalyItem[]) => void;
  onAnomalyStatsChange?: (count: number, impact: number) => void;
}

const AnomalyDetectionButton: React.FC<AnomalyDetectionButtonProps> = ({ 
  onAnomalyDataReceived,
  onAnomalyInsightsReceived,
  onAnomalyStatsChange
}) => {
  // Use context instead of local state
  const { updateAnomalyStats, refreshStats, anomalyStats } = useAnomalyContext();
  
  // Define handler that will update context and call the original callback
  const handleAnomalyStatsChange = (count: number, impact: number) => {
    console.log('AnomalyDetectionButton - Stats changed:', { count, impact });
    updateAnomalyStats(count, impact);
    
    // Call original callback
    if (onAnomalyStatsChange) {
      onAnomalyStatsChange(count, impact);
    }
  };
  
  const { 
    isDetecting, 
    isGeneratingInsights,
    resultFile, 
    detectAnomalies, 
    generateInsights,
    downloadFile,
    progress,
    hasAnomalies,
    totalAnomaliesCount,
    totalImpactValue
  } = useAnomalyDetection({ 
    onAnomalyDataReceived,
    onAnomalyInsightsReceived,
    onAnomalyStatsChange: handleAnomalyStatsChange
  });

  const handleUpdateStats = () => {
    console.log('Manually updating stats from button click');
    
    // If we have stats from the hook, update the context
    if (totalAnomaliesCount > 0 || totalImpactValue !== 0) {
      updateAnomalyStats(totalAnomaliesCount, totalImpactValue);
    }
    
    // Trigger context refresh to propagate changes
    refreshStats();
    
    toast.success(`Updated stats: ${totalAnomaliesCount} anomalies, impact of $${Math.abs(totalImpactValue).toLocaleString()}`);
  };

  const handleGenerateInsights = () => {
    generateInsights();
    setTimeout(() => {
      // After generating insights, refresh stats
      refreshStats();
    }, 500);
  };

  const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={detectAnomalies}
        disabled={isDetecting}
        size="lg"
        className="bg-amber-600 hover:bg-amber-700"
      >
        {isDetecting ? (
          <>
            <LoadingSpinner />
            Detecting Anomalies...
          </>
        ) : (
          <>
            <AlertTriangle className="mr-2 h-5 w-5" />
            Detect Anomalies
          </>
        )}
      </Button>
      
      {hasAnomalies && !isDetecting && (
        <Button
          onClick={handleUpdateStats}
          size="sm"
          variant="outline"
          className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Statistics
        </Button>
      )}
      
      {hasAnomalies && !isDetecting && (
        <Button
          onClick={handleGenerateInsights}
          disabled={isGeneratingInsights}
          size="lg"
          variant="outline"
          className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
        >
          {isGeneratingInsights ? (
            <>
              <LoadingSpinner />
              Generating Insights...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate AI Insights
            </>
          )}
        </Button>
      )}
      
      {isDetecting && (
        <div className="w-full max-w-md mt-2 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <Brain className="mr-2 h-5 w-5 text-blue-600 animate-pulse" />
              <span className="text-sm font-medium">Detecting anomalies using GenAI...</span>
            </div>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      {resultFile && (
        <Button 
          onClick={downloadFile}
          variant="outline"
          className="mt-2"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Results
        </Button>
      )}
    </div>
  );
};

// Include the original onAnomalyStatsChange prop for backward compatibility
interface AnomalyDetectionButtonProps {
  onAnomalyStatsChange?: (count: number, impact: number) => void;
}

export default AnomalyDetectionButton;
