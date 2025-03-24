
import { useState, useEffect, useCallback } from 'react';
import { Lightbulb, MessageSquare, Brain, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { mockInsights, suggestedActions } from '@/data/insightsData';
import InsightsList from './insights/InsightsList';
import InsightContent from './insights/InsightContent';
import ActionsList from './insights/ActionsList';
import { useAnomalyInsights } from '@/hooks/useAnomalyInsights';
import { AnomalyItem } from '@/types/anomaly';
import { useAnomalyContext } from '@/context/AnomalyContext';

const InsightsPanel = () => {
  const [insights, setInsights] = useState<any[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key for force re-rendering
  
  // Use the anomaly context to get the latest stats and insights
  const { anomalyStats, insightsData, updateInsightsData } = useAnomalyContext();
  const { totalAnomalies: contextTotalAnomalies } = anomalyStats;
  
  // Create a callback for processing received insights
  const handleInsightsReceived = useCallback((anomalies: AnomalyItem[]) => {
    console.log(`Received ${anomalies.length} anomaly insights for display`);
    
    // Update the context with the new insights
    updateInsightsData(anomalies);
    
    // Convert AnomalyItems to the insight format needed for display
    const formattedInsights = anomalies.map(anomaly => ({
      id: anomaly.id,
      title: anomaly.title,
      description: anomaly.description,
      category: anomaly.category,
      content: `
Bucket ID: ${anomaly.bucket?.split(':')[0].replace('Bucket ', '')}
Anomaly Count: ${anomaly.anomalyCount || 0}
Severity: ${anomaly.severity}
Impact: ${anomaly.impact}

Root Cause:
${anomaly.rootCauses?.join('\n') || 'No root cause analysis available'}

Suggested Actions:
${anomaly.suggestedActions?.join('\n') || 'No suggested actions available'}

Sample Companies:
${anomaly.sampleRecords?.map(record => record.company).join(', ') || 'No sample companies available'}
      `.trim()
    }));
    
    if (formattedInsights.length > 0) {
      console.log('Setting formatted insights:', formattedInsights.length);
      setInsights(formattedInsights);
      setSelectedInsight(formattedInsights[0]);
      setRefreshKey(prev => prev + 1); // Force re-render after setting insights
    }
  }, [updateInsightsData]);
  
  const { 
    isGeneratingInsights, 
    generateInsights, 
    totalAnomalies: apiTotalAnomalies 
  } = useAnomalyInsights({
    onAnomalyInsightsReceived: handleInsightsReceived
  });

  // Initialize with insights from context if available
  useEffect(() => {
    console.log('InsightsPanel - Checking context insights:', insightsData.length);
    if (insightsData.length > 0 && insights.length === 0) {
      console.log('Loading insights from context:', insightsData.length);
      handleInsightsReceived(insightsData);
    }
  }, [insightsData, insights.length, handleInsightsReceived]);

  // Update total anomalies whenever context totalAnomalies or apiTotalAnomalies changes
  useEffect(() => {
    console.log('InsightsPanel context update:', { 
      contextTotalAnomalies, 
      apiTotalAnomalies,
      contextInsights: insightsData.length
    });
    
    // Force re-render when context data changes
    if (contextTotalAnomalies > 0 || apiTotalAnomalies > 0 || insightsData.length > 0) {
      setRefreshKey(prev => prev + 1);
    }
  }, [contextTotalAnomalies, apiTotalAnomalies, insightsData]);

  // Log state changes for debugging
  useEffect(() => {
    console.log('InsightsPanel state updated:', { 
      insightsCount: insights.length, 
      selectedInsightId: selectedInsight?.id,
      totalAnomalies: contextTotalAnomalies || apiTotalAnomalies,
      refreshKey,
      contextInsightsCount: insightsData.length
    });
  }, [insights, selectedInsight, contextTotalAnomalies, apiTotalAnomalies, refreshKey, insightsData]);

  const handleCopyInsight = () => {
    if (selectedInsight) {
      navigator.clipboard.writeText(selectedInsight.content);
      toast.success('Insight copied to clipboard');
    }
  };

  const handleGenerateMoreInsights = () => {
    console.log('Generating more insights...');
    generateInsights();
  };

  const handleExecuteAction = (actionType: string) => {
    toast.success(`Action "${actionType}" initiated`);
  };

  const renderInsightIcon = (category: string) => {
    switch (category) {
      case 'analysis':
        return <Lightbulb className="h-5 w-5 text-blue-500" />;
      case 'alert':
        return <MessageSquare className="h-5 w-5 text-red-500" />;
      case 'suggestion':
        return <Brain className="h-5 w-5 text-purple-500" />;
      case 'training':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'compliance':
        return <CheckCircle className="h-5 w-5 text-orange-500" />;
      case 'balance':
      case 'missing':
      case 'timing':
      case 'duplicate':
      case 'unclassified':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-center mb-2">AI-Powered Insights</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto">
          Get intelligent recommendations and insights for your reconciliation data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Insight list */}
        <div className="lg:col-span-1 animate-fade-in animate-delay-100">
          <InsightsList 
            key={`insights-list-${refreshKey}`} // Force re-render when refreshKey changes
            insights={insights}
            selectedInsightId={selectedInsight?.id}
            onSelectInsight={setSelectedInsight}
            onGenerateMore={handleGenerateMoreInsights}
            loading={isGeneratingInsights}
            totalAnomalies={contextTotalAnomalies || apiTotalAnomalies}
          />
        </div>

        {/* Right column - Selected insight + actions */}
        <div className="lg:col-span-2 space-y-6 animate-fade-in animate-delay-200">
          {/* Selected insight */}
          {selectedInsight ? (
            <InsightContent
              key={`insight-content-${selectedInsight.id}-${refreshKey}`} // Force re-render when insight or refreshKey changes
              insight={selectedInsight}
              renderInsightIcon={renderInsightIcon}
              onCopy={handleCopyInsight}
            />
          ) : (
            <div className="rounded-lg border p-6 text-center text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No Insights Selected</h3>
              <p>Generate insights using the button on the left panel to view AI-powered analysis.</p>
            </div>
          )}

          {/* Suggested actions */}
          <ActionsList 
            actions={suggestedActions}
            onExecuteAction={handleExecuteAction}
          />
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;
