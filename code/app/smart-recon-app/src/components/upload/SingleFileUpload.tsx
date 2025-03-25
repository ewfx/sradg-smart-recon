import React, { useState } from 'react';
import { FileUp, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DynamicColumnData } from '@/lib/csv-parser';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/utils/apiUtils';
import { parseCSV } from '@/lib/csv-parser';
import { ReconciliationStats } from '@/components/insights/ReconciliationStatsCard';

interface SingleFileUploadProps {
  onFileSplitComplete: (
    originalData: DynamicColumnData[],
    file1Data: DynamicColumnData[], 
    file2Data: DynamicColumnData[], 
    headers: string[], 
    actions: any[], 
    filename: string,
    stats: ReconciliationStats | null
  ) => void;
}

export const SingleFileUpload: React.FC<SingleFileUploadProps> = ({ onFileSplitComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileType = file.name.split('.').pop()?.toLowerCase();
      
      if (fileType !== 'csv') {
        toast.error('Please upload a CSV file');
        return;
      }
      
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 50) {
        toast.warning(`Large file detected: ${file.name} (${fileSizeInMB.toFixed(2)} MB). Processing may take longer.`);
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 500);

    try {
      const fileToastId = toast.loading(`Processing ${selectedFile.name}...`);
      
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const response = await fetch(`${API_BASE_URL}/upload-reconciliation`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        let originalData: DynamicColumnData[] = [];
        let file1Data: DynamicColumnData[] = [];
        let file2Data: DynamicColumnData[] = [];
        let headers: string[] = [];
        let actions: any[] = [];
        let stats: ReconciliationStats | null = null;
        
        const text = await selectedFile.text();
        originalData = parseCSV(text, selectedFile.name, 'original');
        
        if (data.catalyst_rows !== undefined && 
            data.impact_rows !== undefined && 
            data.total_issue_count !== undefined && 
            data.match_status_stats) {
          stats = {
            catalyst_rows: data.catalyst_rows,
            impact_rows: data.impact_rows,
            total_issue_count: data.total_issue_count,
            match_status_stats: data.match_status_stats
          };
        }
        
        if (data.catalyst_data && Array.isArray(data.catalyst_data)) {
          file1Data = data.catalyst_data.map((item: any) => ({
            ...item,
            type: 'anomaly'
          }));
        } else {
          const splitIndex = Math.ceil(originalData.length * 0.3);
          file1Data = originalData.slice(0, splitIndex).map(item => ({
            ...item,
            type: 'anomaly',
            impact: Math.random() * 1000 * (Math.random() > 0.5 ? 1 : -1)
          }));
        }
        
        if (data.impact_data && Array.isArray(data.impact_data)) {
          file2Data = data.impact_data.map((item: any) => ({
            ...item,
            type: 'processed'
          }));
        } else {
          const splitIndex = Math.ceil(originalData.length * 0.3);
          file2Data = originalData.slice(splitIndex).map(item => ({
            ...item,
            type: 'processed'
          }));
        }
        
        if (originalData.length > 0) {
          headers = Object.keys(originalData[0]);
        } else if (file1Data.length > 0) {
          headers = Object.keys(file1Data[0]);
        } else if (file2Data.length > 0) {
          headers = Object.keys(file2Data[0]);
        }
        
        const actionTypes = [
          { keyword: 'duplicate', icon: 'FileText', type: 'duplicate-resolution' },
          { keyword: 'missing', icon: 'Search', type: 'missing-data-check' },
          { keyword: 'incorrect', icon: 'BarChartBig', type: 'data-correction' },
          { keyword: 'training', icon: 'GraduationCap', type: 'schedule-training' }
        ];
        
        actions = file1Data.slice(0, 3).map((anomaly, index) => ({
          id: index + 1,
          title: `Fix ${anomaly.type || 'Anomaly'} in ${anomaly.account || 'Account'}`,
          description: `Resolve the ${anomaly.type || 'anomaly'} issue detected in ${anomaly.account || 'this account'}`,
          icon: actionTypes[index % actionTypes.length].keyword.includes('duplicate') ? 
                  FileUp : actionTypes[index % actionTypes.length].keyword.includes('missing') ? 
                  Upload : actionTypes[index % actionTypes.length].keyword.includes('incorrect') ? 
                  FileUp : Upload,
          actionType: actionTypes[index % actionTypes.length].type,
          fullText: `This is a detailed explanation of the action to take for the ${anomaly.type || 'anomaly'} in ${anomaly.account || 'this account'}.`
        }));
        
        setUploadProgress(100);
        clearInterval(progressInterval);
        
        toast.success(`Successfully processed ${selectedFile.name}`, { id: fileToastId });
        
        onFileSplitComplete(originalData, file1Data, file2Data, headers, actions, selectedFile.name, stats);
      } catch (error) {
        console.error('Error processing file:', error);
        toast.error(`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: fileToastId });
        
        const text = await selectedFile.text();
        const originalData = parseCSV(text, selectedFile.name, 'original');
        const splitIndex = Math.ceil(originalData.length * 0.3);
        const file1Data = originalData.slice(0, splitIndex);
        const file2Data = originalData.slice(splitIndex);
        const headers = originalData.length > 0 ? Object.keys(originalData[0]) : [];
        
        const actions = [
          {
            id: 1,
            title: 'Request Manual Review',
            description: 'Send file for manual review by the accounting team',
            icon: FileUp,
            actionType: 'manual-review',
            fullText: 'Send this file for manual review by the accounting team to identify and fix the anomalies.'
          },
          {
            id: 2,
            title: 'Re-upload Corrected File',
            description: 'Fix the file locally and upload again',
            icon: Upload,
            actionType: 're-upload',
            fullText: 'Download this file, correct the issues, and upload again for processing.'
          }
        ];
        
        const mockStats: ReconciliationStats = {
          catalyst_rows: file1Data.length,
          impact_rows: file2Data.length,
          total_issue_count: Math.floor(file1Data.length * 0.3),
          match_status_stats: {
            'Impact_Only': 2,
            'Quantity_Break': 1,
            'Price_Break': 1,
            'Catalyst_Only': 1
          }
        };
        
        onFileSplitComplete(originalData, file1Data, file2Data, headers, actions, selectedFile.name, mockStats);
      }
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      clearInterval(progressInterval);
    }
  };

  return (
    <Card className="w-full shadow-md bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-center">Upload Pre-Analyzed File</CardTitle>
        <CardDescription className="text-center">
          Upload a single CSV file to be processed and split into Catalyst and Impact data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          className={`
            border-2 border-dashed rounded-lg p-8 
            ${selectedFile ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}
            transition-all duration-300 hover:border-blue-400
            flex flex-col items-center justify-center text-center
          `}
          onClick={() => document.getElementById('single-file-upload')?.click()}
        >
          <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
            <FileUp className="h-8 w-8 text-blue-500" />
          </div>
          
          {selectedFile ? (
            <>
              <p className="font-medium text-lg">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <p className="text-sm text-blue-500 mt-2">Click to change file</p>
            </>
          ) : (
            <>
              <p className="font-medium text-lg">Drag and drop or click to upload</p>
              <p className="text-sm text-muted-foreground mt-1">
                Support for CSV files only
              </p>
            </>
          )}
          
          <input
            id="single-file-upload"
            type="file"
            accept=".csv"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
        
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? 'Processing...' : 'Process File'}
        </Button>
      </CardFooter>
    </Card>
  );
};
