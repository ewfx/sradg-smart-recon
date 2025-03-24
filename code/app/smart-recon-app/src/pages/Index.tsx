import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import FileUploadSection from '@/components/upload/FileUploadSection';
import DynamicTable from '@/components/DynamicTable';
import AnomalySection from '@/components/AnomalySection';
import InsightsPanel from '@/components/InsightsPanel';
import AnomalyDetectionButton from '@/components/anomaly/AnomalyDetectionButton';
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DynamicColumnData } from '@/lib/csv-parser';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { AnomalyItem } from '@/types/anomaly';
import { toast } from 'sonner';
import { useAnomalyContext } from '@/context/AnomalyContext';

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentData, setCurrentData] = useState<DynamicColumnData[]>([]);
  const [historicalData, setHistoricalData] = useState<DynamicColumnData[]>([]);
  const [anomalyData, setAnomalyData] = useState<DynamicColumnData[]>([]);
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [showTable, setShowTable] = useState(false);
  
  const { updateAnomalyStats } = useAnomalyContext();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleDataProcessed = (
    currentData: DynamicColumnData[], 
    historicalData: DynamicColumnData[], 
    headers: string[]
  ) => {
    setCurrentData(currentData);
    setHistoricalData(historicalData);
    setTableHeaders(headers);
    setShowTable(true);
    
    // Scroll to the data table section
    setTimeout(() => {
      document.getElementById('data')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleAnomalyDataReceived = (data: DynamicColumnData[], headers: string[]) => {
    console.log('Index - Anomaly data received:', data.length);
    setAnomalyData(data);
    
    // Merge new headers with existing ones
    const allHeaders = [...new Set([...tableHeaders, ...headers])];
    setTableHeaders(allHeaders);
    
    // If we have anomaly data but not showing tables yet, show them
    if (data.length > 0 && !showTable) {
      setShowTable(true);
      // Scroll to the data table section
      setTimeout(() => {
        document.getElementById('data')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };
  
  const handleAnomalyStatsChange = useCallback((count: number, impact: number) => {
    console.log('Index - Anomaly stats changed:', { count, impact });
    
    // Update global context
    updateAnomalyStats(count, impact);
    
    // Display toast notification for first detection
    if (count > 0) {
      toast.success(`Detected ${count} anomalies with total impact of $${Math.abs(impact).toLocaleString()}`);
    }
  }, [updateAnomalyStats]);
  
  const handleAnomalyInsightsReceived = useCallback((anomalies: AnomalyItem[]) => {
    console.log('Index - Insights received:', anomalies.length);
    
    // Display toast notification about insights
    if (anomalies.length > 0) {
      toast.success(`Generated ${anomalies.length} AI insights from anomaly data`);
      
      // Scroll to insights section
      setTimeout(() => {
        document.getElementById('insights')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className={`max-w-6xl mx-auto text-center transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0 transform translate-y-10'}`}>
          <div className="inline-block mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
              Financial Reconciliation Platform
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            Smart-Recon
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Smarter Reconciliation and Anomaly Detection using Gen AI
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="px-8 py-6 rounded-full text-lg" onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-6 rounded-full text-lg" asChild>
              <Link to="/learn-more">Learn More</Link>
            </Button>
          </div>

          <div className="mt-24 animate-bounce">
            <a href="#upload" className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all">
              <ArrowDown className="h-6 w-6 text-blue-500" />
            </a>
          </div>
        </div>
      </section>
      
      {/* File Upload Section */}
      <section id="upload" className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto animate-fade-in-up">
          <FileUploadSection onDataProcessed={handleDataProcessed} />
        </div>
      </section>
      
      {/* Data Table Section */}
      <section id="data" className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto animate-fade-in-up">
          {showTable || anomalyData.length > 0 ? (
            <div className="space-y-8">
              <div className="flex justify-center mb-8">
                <AnomalyDetectionButton 
                  onAnomalyDataReceived={handleAnomalyDataReceived} 
                  onAnomalyInsightsReceived={handleAnomalyInsightsReceived}
                  onAnomalyStatsChange={handleAnomalyStatsChange}
                />
              </div>
            
              <Tabs defaultValue="current" className="w-full">
                <div className="flex justify-center mb-6">
                  <TabsList>
                    <TabsTrigger value="current" className="px-6">Current Data</TabsTrigger>
                    <TabsTrigger value="historical" className="px-6">Historical Data</TabsTrigger>
                    <TabsTrigger value="anomaly" className="px-6">Anomaly Data</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="current">
                  <h2 className="text-2xl font-medium text-center mb-6">Current/Realtime Data</h2>
                  {currentData.length > 0 ? (
                    <DynamicTable data={currentData} headers={tableHeaders} />
                  ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <h3 className="text-xl font-medium mb-2">No Current Data Available</h3>
                      <p className="text-muted-foreground max-w-xl mx-auto mb-4">
                        Please upload current data files to view them here.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="historical">
                  <h2 className="text-2xl font-medium text-center mb-6">Historical Data</h2>
                  {historicalData.length > 0 ? (
                    <DynamicTable data={historicalData} headers={tableHeaders} />
                  ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <h3 className="text-xl font-medium mb-2">No Historical Data Available</h3>
                      <p className="text-muted-foreground max-w-xl mx-auto mb-4">
                        Please upload historical data files to view them here.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="anomaly">
                  <h2 className="text-2xl font-medium text-center mb-6">Anomaly Detection Data</h2>
                  {anomalyData.length > 0 ? (
                    <DynamicTable data={anomalyData} headers={tableHeaders} />
                  ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <h3 className="text-xl font-medium mb-2">No Anomaly Data Available</h3>
                      <p className="text-muted-foreground max-w-xl mx-auto mb-4">
                        Click the "Detect Anomalies" button above to generate anomaly data.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-medium mb-4">No Reconciliation Data Yet</h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                Upload your CSV files in the section above to view your reconciliation data here.
              </p>
              <Button onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}>
                Go to Upload Section
              </Button>
            </div>
          )}
        </div>
      </section>
      
      {/* Anomaly Detection Section */}
      <section id="anomalies" className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto animate-fade-in-up">
          <AnomalySection />
        </div>
      </section>
      
      {/* AI Insights Section */}
      <section id="insights" className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto animate-fade-in-up">
          <InsightsPanel />
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                Smart-Recon
              </span>
              <p className="mt-2 text-gray-400 text-sm">
                Smarter Reconciliation and Anomaly Detection using Gen AI
              </p>
              <p className="mt-1 text-gray-400 text-sm">
                Developed By: Sujeet Kumar
              </p>
            </div>
            <div className="flex space-x-8">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">About</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Smart-Recon. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
