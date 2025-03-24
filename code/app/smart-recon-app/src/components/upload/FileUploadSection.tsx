
import React from 'react';
import { FileUploadProvider } from './FileUploadContext';
import FileUploadArea from './FileUploadArea';
import SelectedFilesList from './SelectedFilesList';
import UploadControls from './UploadControls';
import { DynamicColumnData } from '@/lib/csv-parser';

interface FileUploadSectionProps {
  onDataProcessed?: (currentData: DynamicColumnData[], historicalData: DynamicColumnData[], headers: string[]) => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({ onDataProcessed }) => {
  return (
    <FileUploadProvider onDataProcessed={onDataProcessed}>
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl font-medium text-center mb-2">Upload Reconciliation Files</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto">
            Upload both current and historical data files to start analyzing reconciliation data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <FileUploadArea type="current" />
          <FileUploadArea type="historical" />
        </div>

        <SelectedFilesList type="current" />
        <SelectedFilesList type="historical" />

        <UploadControls />
      </div>
    </FileUploadProvider>
  );
};

export default FileUploadSection;
