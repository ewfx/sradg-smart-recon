
import { useState, useEffect } from 'react';

export interface UseAnomalyProgressProps {
  isDetecting: boolean;
}

export const useAnomalyProgress = ({ isDetecting }: UseAnomalyProgressProps) => {
  const [progress, setProgress] = useState(0);

  // Reset progress when detection starts/stops
  useEffect(() => {
    if (!isDetecting) {
      setProgress(0);
    }
  }, [isDetecting]);
  
  // Simulate progress for better UX during API call
  useEffect(() => {
    let interval: number | undefined;
    
    if (isDetecting && progress < 95) {
      interval = window.setInterval(() => {
        // Gradually slow down progress as it gets closer to 95%
        const increment = Math.max(1, Math.floor((95 - progress) / 10));
        setProgress(Math.min(95, progress + increment));
      }, 500);
    }
    
    return () => {
      if (interval !== undefined) {
        window.clearInterval(interval);
      }
    };
  }, [isDetecting, progress]);

  // Set progress to 100% when API call completes
  const completeProgress = () => {
    setProgress(100);
  };

  return {
    progress,
    completeProgress
  };
};
