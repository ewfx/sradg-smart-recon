
import React from 'react';
import { File, XCircle } from 'lucide-react';
import { useFileUpload } from './FileUploadContext';

interface SelectedFilesListProps {
  type: 'current' | 'historical';
}

const SelectedFilesList: React.FC<SelectedFilesListProps> = ({ type }) => {
  const { currentFiles, historicalFiles, removeFile } = useFileUpload();
  
  const files = type === 'current' ? currentFiles : historicalFiles;
  
  if (files.length === 0) return null;
  
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'csv':
        return <File className="h-5 w-5 text-green-500" />;
      case 'xlsx':
      case 'xls':
        return <File className="h-5 w-5 text-blue-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="mt-6 animate-fade-in">
      <h3 className="text-lg font-medium mb-4">
        {type === 'current' ? 'Selected Current Files' : 'Selected Historical Files'} ({files.length})
      </h3>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-4 mb-4">
        <ul className="divide-y dark:divide-gray-800">
          {files.map((file, index) => (
            <li key={index} className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                {getFileIcon(file.name)}
                <span className="ml-3 text-sm font-medium">{file.name}</span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  ({(file.size / 1024).toFixed(2)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index, type)}
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SelectedFilesList;
