
import React from 'react';
import FileUploadSection from './upload/FileUploadSection';
import { DynamicColumnData } from '@/lib/csv-parser';

export interface ReconciliationData {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  status: 'Reconciled' | 'Pending' | 'Unmatched';
  source: string;
}

interface FileUploadProps {
  onDataProcessed?: (currentData: DynamicColumnData[], historicalData: DynamicColumnData[], headers: string[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataProcessed }) => {
  return <FileUploadSection onDataProcessed={onDataProcessed} />;
};

export default FileUpload;
