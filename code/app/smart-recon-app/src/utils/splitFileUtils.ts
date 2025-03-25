
import { DynamicColumnData } from '@/lib/csv-parser';
import { API_BASE_URL } from './apiUtils';

export const processSplitFileResponse = async (response: Response): Promise<{
  file1Data: DynamicColumnData[],
  file2Data: DynamicColumnData[],
  headers: string[],
  actions: any[]
}> => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server error (${response.status}): ${errorText}`);
  }
  
  const result = await response.json();
  
  // Extract the two files data from the response
  const file1Data = result.file1Data || [];
  const file2Data = result.file2Data || [];
  
  // Extract headers from the first file or second file if first is empty
  let headers: string[] = [];
  if (file1Data.length > 0) {
    headers = Object.keys(file1Data[0]);
  } else if (file2Data.length > 0) {
    headers = Object.keys(file2Data[0]);
  }
  
  // Extract actions from the response
  const actions = result.actions || [];
  
  return {
    file1Data,
    file2Data,
    headers,
    actions
  };
};

export const fetchSplitFiles = async (): Promise<{
  file1Data: DynamicColumnData[],
  file2Data: DynamicColumnData[],
  headers: string[],
  actions: any[]
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-split-files`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    return processSplitFileResponse(response);
  } catch (error) {
    console.error('Error fetching split files:', error);
    throw error;
  }
};
