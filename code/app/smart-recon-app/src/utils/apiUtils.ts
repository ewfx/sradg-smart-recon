// API base URL configuration (keep in sync with other files)
export const API_BASE_URL = 'http://127.0.0.1:8000';

// Timeout configuration for large file uploads (5 minutes - increased from 3 minutes)
export const UPLOAD_TIMEOUT = 300000;

// Upload file to API with timeout and error handling
export const uploadFileToAPI = async (file: File, endpoint: string): Promise<boolean> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);
  
  try {
    console.log(`Uploading file ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB) to ${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      // Recommended for large file uploads
      headers: {
        // Don't set content-type header, it will be set automatically with boundary
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      let errorMessage = 'Unknown error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        errorMessage = `Server error (${response.status}): ${response.statusText}`;
      }
      console.error(`Error sending data to ${endpoint}:`, errorMessage);
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log(`Successfully sent data to ${endpoint}:`, result);
    return true;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.error(`Request timeout for ${file.name}`);
      throw new Error(`Upload timeout for ${file.name}. The file may be too large or the server is unresponsive.`);
    }
    
    console.error(`API error with ${endpoint}:`, error);
    // Check if the error is a network error (like CORS, server down, etc.)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Network error: Cannot connect to the server at ${API_BASE_URL}. Please check if the API server is running.`);
    }
    
    throw error;
  }
};
