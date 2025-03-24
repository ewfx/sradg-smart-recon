
import React, { useEffect } from 'react';
import { AlertTriangle, DollarSign, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAnomalyContext } from '@/context/AnomalyContext';

const AnomalySummaryCards: React.FC = () => {
  const { anomalyStats } = useAnomalyContext();
  const { totalAnomalies, totalImpact, resolvedCount, totalCount } = anomalyStats;
  
  // Format the impact value
  const formattedImpact = totalImpact !== 0
    ? `$${Math.abs(totalImpact).toLocaleString()}`
    : '$0.00';
  
  // Calculate resolution rate
  const resolutionRate = totalCount > 0 
    ? `${Math.round((resolvedCount / totalCount) * 100)}%` 
    : '0%';
  
  // Add debugging to track context changes
  useEffect(() => {
    console.log('AnomalySummaryCards received from context:', { 
      totalAnomalies, totalImpact, resolutionRate, resolvedCount, totalCount 
    });
  }, [totalAnomalies, totalImpact, resolutionRate, resolvedCount, totalCount]);
  
  return (
    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-in" data-testid="anomaly-summary-cards">
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
            Total Anomalies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold" data-testid="anomaly-count">{totalAnomalies}</div>
          <p className="text-sm text-muted-foreground">Across all accounts</p>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
            Total Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold" data-testid="impact-value">{formattedImpact}</div>
          <p className="text-sm text-muted-foreground">Combined financial impact</p>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-5 w-5 mr-2 text-green-500" />
            Resolution Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{resolutionRate}</div>
          <p className="text-sm text-muted-foreground">{resolvedCount} of {totalCount} anomalies resolved</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnomalySummaryCards;
