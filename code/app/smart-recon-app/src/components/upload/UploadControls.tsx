
import React from 'react';
import { Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFileUpload } from './FileUploadContext';

const UploadControls: React.FC = () => {
  const { currentFiles, historicalFiles, isUploading, processFiles } = useFileUpload();
  
  if (currentFiles.length === 0 && historicalFiles.length === 0) {
    return null;
  }

  return (
    <div className="flex justify-center mt-6">
      <Button 
        onClick={processFiles} 
        disabled={isUploading}
        className="px-6"
      >
        {isUploading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <Server className="mr-2 h-4 w-4" />
            Process All Files
          </>
        )}
      </Button>
    </div>
  );
};

export default UploadControls;
