
import React from 'react';
import { FileUp, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFileUpload } from './FileUploadContext';

interface FileUploadAreaProps {
  type: 'current' | 'historical';
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({ type }) => {
  const { step, addFiles } = useFileUpload();
  
  const isDisabled = type === 'historical' && step === 'current';

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles, type);
    }
  };

  return (
    <div className={cn(
      "flex flex-col items-center p-8 border rounded-xl bg-white dark:bg-gray-800 shadow-sm transition-all",
      isDisabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"
    )}>
      <div className={cn(
        "h-16 w-16 rounded-full flex items-center justify-center mb-4",
        type === 'current' ? "bg-blue-100 dark:bg-blue-900/30" : "bg-purple-100 dark:bg-purple-900/30"
      )}>
        {type === 'current' ? (
          <FileUp className="h-8 w-8 text-blue-500" />
        ) : (
          <History className="h-8 w-8 text-purple-500" />
        )}
      </div>
      <h3 className="text-xl font-medium mb-2">
        {type === 'current' ? 'Current/Realtime Data' : 'Historical Data'}
      </h3>
      <p className="text-sm text-muted-foreground text-center mb-6">
        {type === 'current' 
          ? 'Upload the most recent data files for reconciliation' 
          : 'Upload past data files for historical analysis'}
      </p>
      <Button 
        size="lg" 
        onClick={() => {
          document.getElementById(`file-upload-${type}`)?.click();
        }}
        disabled={isDisabled}
        className={cn(
          "w-full",
          type === 'current' 
            ? "bg-blue-500 hover:bg-blue-600" 
            : "bg-purple-500 hover:bg-purple-600"
        )}
      >
        Select Files
      </Button>
      <input
        id={`file-upload-${type}`}
        type="file"
        multiple
        accept=".csv,.xlsx,.xls"
        className="sr-only"
        onChange={onFileChange}
        disabled={isDisabled}
      />
    </div>
  );
};

export default FileUploadArea;
