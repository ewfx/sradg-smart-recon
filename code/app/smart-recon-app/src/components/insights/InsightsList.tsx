
import React, { useEffect, useState } from 'react';
import { Brain } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InsightItem from './InsightItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAnomalyContext } from '@/context/AnomalyContext';

interface InsightsListProps {
  insights: Array<{
    id: number;
    title: string;
    description: string;
    category: string;
    content?: string;
  }>;
  selectedInsightId: number | null;
  onSelectInsight: (insight: any) => void;
  loading: boolean;
  totalAnomalies?: number;
}

const InsightsList: React.FC<InsightsListProps> = ({
  insights,
  selectedInsightId,
  onSelectInsight,
  loading,
  totalAnomalies = 0
}) => {
  const [localInsights, setLocalInsights] = useState(insights);
  const [localTotalAnomalies, setLocalTotalAnomalies] = useState(totalAnomalies);
  const [renderKey, setRenderKey] = useState(0);
  
  // Get anomaly data from context as a fallback
  const { anomalyStats } = useAnomalyContext();
  
  // Update local state when props change
  useEffect(() => {
    console.log('InsightsList received props:', {
      insightsCount: insights.length,
      selectedInsightId,
      loading,
      totalAnomalies,
      contextAnomalies: anomalyStats.totalAnomalies
    });
    
    // Only update if we have valid data
    if (insights.length > 0) {
      setLocalInsights(insights);
      setRenderKey(prev => prev + 1);
    }
    
    // Use context data if available and prop is not
    const anomalyCount = totalAnomalies > 0 ? 
      totalAnomalies : 
      (anomalyStats.totalAnomalies > 0 ? anomalyStats.totalAnomalies : 0);
    
    if (anomalyCount > 0) {
      setLocalTotalAnomalies(anomalyCount);
      setRenderKey(prev => prev + 1);
    }
  }, [insights, selectedInsightId, loading, totalAnomalies, anomalyStats]);

  return (
    <Card className="glass-card h-full" key={`insights-list-card-${renderKey}`}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="h-5 w-5 mr-2 text-blue-500" />
          AI Insights
        </CardTitle>
        <CardDescription>
          {localInsights.length > 0 
            ? `Showing ${localInsights.length} insights with ${localTotalAnomalies} total anomalies`
            : 'No insights available yet'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="px-6 h-[400px]">
          <div className="space-y-2">
            {localInsights.length > 0 ? (
              localInsights.map((insight) => (
                <InsightItem
                  key={`insight-${insight.id}-${renderKey}`}
                  insight={insight}
                  isSelected={selectedInsightId === insight.id}
                  onSelect={() => onSelectInsight(insight)}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No insights available. Use the "Generate AI Insights" button from the anomaly detection section.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      {/* Card footer with generate more button has been removed */}
    </Card>
  );
};

export default InsightsList;
