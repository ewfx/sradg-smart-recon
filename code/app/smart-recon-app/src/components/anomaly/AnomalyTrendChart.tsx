
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useAnomalyContext } from '@/context/AnomalyContext';

interface ChartDataPoint {
  date: string;
  anomalies: number;
  amount: number;
}

interface AnomalyTrendChartProps {
  chartData?: ChartDataPoint[];
}

const AnomalyTrendChart: React.FC<AnomalyTrendChartProps> = ({ chartData: externalChartData }) => {
  const [localChartData, setLocalChartData] = useState<ChartDataPoint[]>(externalChartData || []);
  const [renderKey, setRenderKey] = useState(0);
  
  // Get anomaly data from context
  const { anomalyStats, anomalyData } = useAnomalyContext();
  
  // Generate chart data from anomaly data when either context data or props change
  useEffect(() => {
    console.log('AnomalyTrendChart - Context update:', { 
      anomaliesCount: anomalyData.length,
      totalAnomalies: anomalyStats.totalAnomalies,
      totalImpact: anomalyStats.totalImpact,
      externalDataLength: externalChartData?.length || 0
    });
    
    // If we have anomaly data from context, generate chart data
    if (anomalyData.length > 0) {
      // Group anomalies by date
      const anomaliesByDate = anomalyData.reduce<Record<string, { count: number, impact: number }>>(
        (acc, anomaly) => {
          const date = anomaly.date?.substring(5) || 'unknown'; // Get MM/DD format
          const impact = parseFloat(anomaly.impact?.replace(/[^0-9.-]+/g, '') || '0');
          
          if (!acc[date]) {
            acc[date] = { count: 0, impact: 0 };
          }
          
          acc[date].count += anomaly.anomalyCount || 1;
          acc[date].impact += isNaN(impact) ? 0 : impact;
          
          return acc;
        }, {}
      );
      
      // Convert to chart data format
      const newChartData: ChartDataPoint[] = Object.entries(anomaliesByDate).map(
        ([date, { count, impact }]) => ({
          date,
          anomalies: count,
          amount: Math.round(impact)
        })
      );
      
      // Add any missing days to ensure at least 7 data points
      if (newChartData.length < 7) {
        const today = new Date();
        for (let i = 0; i < 7 - newChartData.length; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - (i + 1));
          const dateStr = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
          
          // Only add if not already in chart data
          if (!newChartData.some(item => item.date === dateStr)) {
            newChartData.push({
              date: dateStr,
              anomalies: 0,
              amount: 0
            });
          }
        }
      }
      
      // Sort by date
      newChartData.sort((a, b) => {
        const [aMonth, aDay] = a.date.split('/').map(Number);
        const [bMonth, bDay] = b.date.split('/').map(Number);
        return aMonth === bMonth ? aDay - bDay : aMonth - bMonth;
      });
      
      console.log('Generated new chart data:', newChartData);
      setLocalChartData(newChartData);
      setRenderKey(prev => prev + 1);
    } 
    // Fall back to external chart data if available and no context data
    else if (externalChartData && externalChartData.length > 0 && localChartData.length === 0) {
      console.log('Using external chart data:', externalChartData);
      setLocalChartData(externalChartData);
      setRenderKey(prev => prev + 1);
    }
  }, [anomalyData, anomalyStats, externalChartData, localChartData.length]);

  return (
    <div className="lg:col-span-1 animate-fade-in animate-delay-100">
      <Card className="glass-card h-full" key={`anomaly-trend-chart-${renderKey}`}>
        <CardHeader>
          <CardTitle>Anomaly Trend</CardTitle>
          <CardDescription>
            Daily anomaly count and financial impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={localChartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorAnomalies" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => [
                    value, 
                    name === 'anomalies' ? 'Anomalies' : 'Amount ($)'
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="anomalies"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorAnomalies)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="amount"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnomalyTrendChart;
