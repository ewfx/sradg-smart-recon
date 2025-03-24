
import { useState } from 'react';

export const useAnomalyFileDownload = () => {
  const [resultFile, setResultFile] = useState<string | null>(null);

  const setDownloadFile = (url: string) => {
    setResultFile(url);
  };

  const downloadFile = () => {
    if (resultFile) {
      const link = document.createElement('a');
      link.href = resultFile;
      link.download = `anomaly-results-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return {
    resultFile,
    setDownloadFile,
    downloadFile
  };
};
