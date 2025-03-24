
import { useState, useEffect, useCallback, useRef } from 'react';
import { AlertTriangle, Filter, ArrowUpDown, FileText, DollarSign, Calendar, Clock, Briefcase, Layers, ArrowUp, ArrowDown, RefreshCw, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AnomalySummaryCards from './anomaly/AnomalySummaryCards';
import AnomalyTrendChart from './anomaly/AnomalyTrendChart';
import AnomalyList from './anomaly/AnomalyList';
import { AnomalyItem } from './anomaly/AnomalyCard';
import { useAnomalyDetection } from '@/hooks/useAnomalyDetection';
import { DynamicColumnData } from '@/lib/csv-parser';
import { toast } from 'sonner';
import { useAnomalyContext } from '@/context/AnomalyContext';

interface ChartDataPoint {
  date: string;
  anomalies: number;
  amount: number;
}

const mockChartData: ChartDataPoint[] = [
  { date: '01/01', anomalies: 5, amount: 2400 },
  { date: '01/02', anomalies: 7, amount: 1400 },
  { date: '01/03', anomalies: 3, amount: 4500 },
  { date: '01/04', anomalies: 8, amount: 3200 },
  { date: '01/05', anomalies: 12, amount: 6200 },
  { date: '01/06', anomalies: 6, amount: 2900 },
  { date: '01/07', anomalies: 4, amount: 1800 }
];

interface AnomalySectionProps {
  externalAnomalyStats?: {
    count: number;
    impact: number;
  };
}

const AnomalySection = ({ externalAnomalyStats }: AnomalySectionProps = {}) => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [renderKey, setRenderKey] = useState(0);
  
  // Correctly destructure the functions from context
  const { anomalyStats, anomalyData, updateAnomalyData, updateAnomalyStats, refreshStats } = useAnomalyContext();
  const processedExternalStats = useRef(false);
  
  useEffect(() => {
    if (externalAnomalyStats && 
        (externalAnomalyStats.count > 0 || externalAnomalyStats.impact !== 0) && 
        !processedExternalStats.current) {
      console.log('AnomalySection - Initializing with external stats:', externalAnomalyStats);
      updateAnomalyStats(externalAnomalyStats.count, externalAnomalyStats.impact);
      processedExternalStats.current = true;
    }
  }, [externalAnomalyStats, updateAnomalyStats]);
  
  useEffect(() => {
    console.log('AnomalySection - Context data updated:', {
      anomalyDataLength: anomalyData.length,
      totalAnomalies: anomalyStats.totalAnomalies
    });
    
    if (anomalyData.length > 0 || anomalyStats.totalAnomalies > 0) {
      setRenderKey(prev => prev + 1);
    }
  }, [anomalyData, anomalyStats]);

  const handleAnomalyDataReceived = useCallback((data: DynamicColumnData[], headers: string[]) => {
    console.log('Anomaly data received with length:', data.length);
    
    if (data.length === 0) return;
    
    const transformedData: AnomalyItem[] = data.map((item: DynamicColumnData, index) => {
      return {
        id: Number(item.id?.replace('anomaly-', '')) || index,
        title: item.title as string || `Anomaly ${index + 1}`,
        description: item.description as string || 'No description available',
        severity: item.severity as string || 'medium',
        category: item.category as string || 'unclassified',
        date: item.date as string || new Date().toISOString().split('T')[0],
        impact: item.impact as string || '$0.00',
        status: item.status as string || 'unresolved',
        bucket: item.bucket as string,
        anomalyCount: typeof item.anomalyCount === 'number' 
          ? item.anomalyCount 
          : typeof item.anomalyCount === 'string' 
            ? parseInt(item.anomalyCount, 10) 
            : undefined,
        rootCauses: Array.isArray(item.rootCauses) 
          ? item.rootCauses as string[] 
          : undefined,
        suggestedActions: Array.isArray(item.suggestedActions) 
          ? item.suggestedActions as string[] 
          : undefined,
        sampleRecords: Array.isArray(item.sampleRecords) 
          ? item.sampleRecords 
          : undefined,
      };
    });
    
    updateAnomalyData(transformedData);
    setRenderKey(prev => prev + 1);
  }, [updateAnomalyData]);

  const prevStatsRef = useRef({ count: 0, impact: 0 });
  
  const handleStatsChange = useCallback((count: number, impact: number) => {
    if (prevStatsRef.current.count === count && prevStatsRef.current.impact === impact) {
      return;
    }
    
    console.log('AnomalySection - Stats changed:', { count, impact });
    updateAnomalyStats(count, impact);
    
    prevStatsRef.current = { count, impact };
    setRenderKey(prev => prev + 1);
  }, [updateAnomalyStats]);

  const { detectAnomalies, isDetecting } = useAnomalyDetection({
    onAnomalyDataReceived: handleAnomalyDataReceived,
    onAnomalyStatsChange: handleStatsChange
  });

  const anomaliesData = anomalyData.length > 0 ? anomalyData : [];

  const uniqueBuckets = Array.from(
    new Set(anomaliesData.map(a => a.bucket?.split(':')[0]).filter(Boolean))
  );

  const filteredAnomalies = anomaliesData.filter(anomaly => {
    if (selectedTab === 'high' && anomaly.severity !== 'high') return false;
    if (selectedTab === 'resolved' && anomaly.status !== 'resolved') return false;
    if (selectedTab === 'unresolved' && anomaly.status !== 'unresolved') return false;
    if (selectedCategory && anomaly.category !== selectedCategory) return false;
    if (selectedBucket && (!anomaly.bucket || !anomaly.bucket.startsWith(selectedBucket))) return false;
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'balance':
        return <DollarSign className="h-4 w-4" />;
      case 'duplicate':
        return <FileText className="h-4 w-4" />;
      case 'missing':
        return <AlertTriangle className="h-4 w-4" />;
      case 'timing':
        return <Clock className="h-4 w-4" />;
      case 'unclassified':
        return <Calendar className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getBucketIcon = (bucket: string) => {
    if (bucket.includes('Bucket 1')) return <Layers className="h-4 w-4" />;
    if (bucket.includes('Bucket 2')) return <ArrowDown className="h-4 w-4" />;
    if (bucket.includes('Bucket 4')) return <Calendar className="h-4 w-4" />;
    if (bucket.includes('Bucket 5')) return <ArrowUp className="h-4 w-4" />;
    if (bucket.includes('Bucket 8')) return <RefreshCw className="h-4 w-4" />;
    if (bucket.includes('Bucket 11')) return <PieChart className="h-4 w-4" />;
    return <Briefcase className="h-4 w-4" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const handleRefresh = () => {
    console.log('AnomalySection - Manual refresh requested');
    refreshStats();
    setRenderKey(prev => prev + 1);
    toast.info('Refreshing anomaly data...');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-center mb-2">AI-Enhanced Anomaly Detection</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto">
          Identify and resolve reconciliation anomalies and discrepancies with AI-powered insights
        </p>
        <div className="flex justify-center mt-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="flex items-center gap-1">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <AnomalySummaryCards key={`summary-cards-${renderKey}`} />

        <AnomalyTrendChart key={`trend-chart-${renderKey}`} chartData={mockChartData} />

        <div className="lg:col-span-2 animate-fade-in animate-delay-200">
          <Card className="glass-card h-full" key={`anomaly-insights-${renderKey}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Anomaly Insights</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="h-8">
                    <Filter className="h-3.5 w-3.5 mr-1" />
                    <span>Filter</span>
                  </Button>
                  <Button variant="outline" size="sm" className="h-8">
                    <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
                    <span>Sort</span>
                  </Button>
                </div>
              </div>
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="high">High Priority</TabsTrigger>
                  <TabsTrigger value="unresolved">Unresolved</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved</TabsTrigger>
                </TabsList>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="text-xs font-medium text-muted-foreground mr-1 mt-1">Categories:</div>
                  {['balance', 'duplicate', 'missing', 'timing', 'unclassified'].map(category => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      className="cursor-pointer capitalize"
                      onClick={() => 
                        setSelectedCategory(selectedCategory === category ? null : category)
                      }
                    >
                      {getCategoryIcon(category)}
                      <span className="ml-1">{category}</span>
                    </Badge>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  <div className="text-xs font-medium text-muted-foreground mr-1 mt-1">AI Buckets:</div>
                  {uniqueBuckets.map((bucket) => (
                    <Badge
                      key={bucket as string}
                      variant={selectedBucket === bucket ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => 
                        setSelectedBucket(selectedBucket === bucket ? null : bucket as string)
                      }
                    >
                      {getBucketIcon(bucket as string)}
                      <span className="ml-1">{bucket}</span>
                    </Badge>
                  ))}
                </div>
                
                <TabsContent value="all" className="space-y-4 mt-2">
                  <AnomalyList 
                    filteredAnomalies={filteredAnomalies}
                    getCategoryIcon={getCategoryIcon}
                    getSeverityColor={getSeverityColor}
                  />
                </TabsContent>
                
                <TabsContent value="high" className="space-y-4 mt-2">
                  <AnomalyList 
                    filteredAnomalies={filteredAnomalies}
                    getCategoryIcon={getCategoryIcon}
                    getSeverityColor={getSeverityColor}
                  />
                </TabsContent>
                
                <TabsContent value="unresolved" className="space-y-4 mt-2">
                  <AnomalyList 
                    filteredAnomalies={filteredAnomalies}
                    getCategoryIcon={getCategoryIcon}
                    getSeverityColor={getSeverityColor}
                  />
                </TabsContent>
                
                <TabsContent value="resolved" className="space-y-4 mt-2">
                  <AnomalyList 
                    filteredAnomalies={filteredAnomalies}
                    getCategoryIcon={getCategoryIcon}
                    getSeverityColor={getSeverityColor}
                  />
                </TabsContent>
              </Tabs>
            </CardHeader>
            <CardContent>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Export Anomaly Insights</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnomalySection;
