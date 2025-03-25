import { useCallback } from 'react';
import { toast } from 'sonner';
import { DynamicColumnData } from '@/lib/csv-parser';
import { API_BASE_URL, parseCsvForTable } from '@/utils/anomalyUtils';

export interface UseAnomalyApiClientProps {
  onAnomalyDataReceived?: (data: DynamicColumnData[], headers: string[]) => void;
  onAnomalyInsightsReceived?: (anomalies: any[]) => void;
  updateAnomalyStats: (count: number, impact: number) => void;
  setDownloadFile: (url: string) => void;
  completeProgress: () => void;
  apiKey?: string | null;
}

export const useAnomalyApiClient = ({ 
  onAnomalyDataReceived, 
  onAnomalyInsightsReceived,
  updateAnomalyStats,
  setDownloadFile,
  completeProgress,
  apiKey = null
}: UseAnomalyApiClientProps) => {

  const callAnomalyDetectionApi = useCallback(async () => {
    try {
      toast.info('Starting anomaly detection process with AI insights...');
      
      // Increased timeout for anomaly detection - 300 seconds (5 minutes)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000);
      
      try {
        // Build the URL with API key as a query parameter if provided
        let apiUrl = `${API_BASE_URL}/test`;
        
        // Add API key to URL if provided
        if (apiKey) {
          apiUrl += `?openai_key=${encodeURIComponent(apiKey)}`;
          console.log('Using provided API key for API call via URL parameter');
        }
        
        // Prepare headers - no API key in headers now
        const headers: HeadersInit = {
          'Accept': 'application/json, text/csv, */*',
          'Cache-Control': 'no-cache'
        };
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          signal: controller.signal,
          headers
        });
        
        clearTimeout(timeoutId);
        
        // Set to 100% when we get the response
        completeProgress();
        
        // Handle non-200 responses properly
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error (${response.status}): ${errorText}`);
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        
        // Check content type to determine how to handle the response
        const contentType = response.headers.get('content-type');
        console.log(`Response content type: ${contentType}`);
        
        if (contentType && contentType.includes('text/csv')) {
          // Handle CSV response
          const csvData = await response.text();
          
          // Create blob and download link
          const blob = new Blob([csvData], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          setDownloadFile(url);
          
          // Parse CSV data for the UI table
          const hasData = parseCsvForTable(csvData, 
            (data, headers) => {
              if (onAnomalyDataReceived) {
                console.log('Processing anomaly data with headers:', headers);
                
                // Filter out any rows with all empty values
                const filteredData = data.filter(row => 
                  Object.values(row).some(value => 
                    value !== null && value !== undefined && value !== ''
                  )
                );
                
                // Set the anomaly count based on the filtered data
                const anomaliesCount = filteredData.length;
                console.log(`Setting totalAnomaliesCount to ${anomaliesCount}`);
                
                // Update the stats IMMEDIATELY
                updateAnomalyStats(anomaliesCount, 0);
                
                // Call the data callback with a slight delay to ensure stats are updated first
                setTimeout(() => {
                  if (onAnomalyDataReceived) {
                    onAnomalyDataReceived(filteredData, headers);
                  }
                }, 50);
              }
            }, 
            onAnomalyInsightsReceived
          );
          
          // Set hasAnomalies based on data presence (additional call to ensure visibility)
          if (hasData) {
            updateAnomalyStats(1, 0);
          }
          
          toast.success('Anomaly detection completed with AI insights! CSV file is ready for download.');
        } else {
          // Handle JSON response
          try {
            const result = await response.json();
            console.log('Anomaly detection API response:', result);
            
            // Extract data from the API response
            if (result) {
              // Get the anomaly count and impact values directly
              const count = typeof result.anomaly_count === 'number' ? result.anomaly_count : 0;
              const impact = typeof result.total_impact === 'number' ? result.total_impact : 0;
              
              console.log(`Received anomaly_count: ${count}`);
              console.log(`Received total_impact: ${impact}`);
              
              // CRITICAL: Update stats immediately with values from API
              updateAnomalyStats(count, impact);
              
              // Toast to confirm data was received
              toast.success(`Found ${count} anomalies with total impact of $${Math.abs(impact).toLocaleString()}`);
              
              // Process data with delay to ensure stats are updated first
              if (result.data && Array.isArray(result.data)) {
                setTimeout(() => {
                  if (onAnomalyDataReceived) {
                    // Transform data to match expected format
                    const jsonData = result.data.map((item: any, index: number) => ({
                      id: `anomaly-${index}`,
                      source: 'Anomaly Detection',
                      status: 'Unmatched',
                      dataType: 'anomaly',
                      ...item
                    }));
                    
                    // Extract headers from the first item if available
                    const headers = result.data.length > 0 
                      ? Object.keys(result.data[0]).filter(key => key !== '__proto__')
                      : [];
                    
                    onAnomalyDataReceived(jsonData, headers);
                  }
                }, 50);
                
                toast.success(`Anomaly detection completed! Found ${count} anomalies.`);
              } else {
                throw new Error('Invalid data structure in API response');
              }
            }
          } catch (jsonError) {
            console.error('Error parsing or processing JSON response:', jsonError);
            const textContent = await response.text();
            console.log('Raw response content:', textContent.substring(0, 200) + '...');
            throw new Error('Invalid response format from server');
          }
        }
        
        return true;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.error('Anomaly detection error:', error);
      
      if (error.name === 'AbortError') {
        toast.error('Anomaly detection request timed out.');
      } else {
        toast.error(`Anomaly detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      return false;
    }
  }, [onAnomalyDataReceived, onAnomalyInsightsReceived, updateAnomalyStats, setDownloadFile, completeProgress, apiKey]);

  return {
    callAnomalyDetectionApi
  };
};
