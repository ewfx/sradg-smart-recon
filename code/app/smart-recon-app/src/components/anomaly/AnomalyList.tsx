
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import AnomalyCard, { AnomalyItem } from './AnomalyCard';

interface AnomalyListProps {
  filteredAnomalies: AnomalyItem[];
  getCategoryIcon: (category: string) => JSX.Element;
  getSeverityColor: (severity: string) => string;
}

const AnomalyList: React.FC<AnomalyListProps> = ({ 
  filteredAnomalies, 
  getCategoryIcon, 
  getSeverityColor 
}) => {
  // Calculate total anomalies from all categories - handle different data formats
  const totalAnomalyCount = filteredAnomalies.reduce(
    (total, anomaly) => {
      // Handle various formats of anomalyCount (number, string, undefined, null)
      if (typeof anomaly.anomalyCount === 'number' && !isNaN(anomaly.anomalyCount)) {
        return total + anomaly.anomalyCount;
      } else if (typeof anomaly.anomalyCount === 'string') {
        const parsed = parseInt(anomaly.anomalyCount, 10);
        return !isNaN(parsed) ? total + parsed : total;
      }
      return total;
    }, 
    0
  );
  
  if (filteredAnomalies.length > 0) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground mb-2">
          Showing {filteredAnomalies.length} anomaly {filteredAnomalies.length === 1 ? 'category' : 'categories'} 
          {totalAnomalyCount > 0 && ` with a total of ${totalAnomalyCount} detected anomalies`}
        </div>
        {filteredAnomalies.map(anomaly => (
          <AnomalyCard 
            key={anomaly.id}
            anomaly={anomaly}
            getCategoryIcon={getCategoryIcon}
            getSeverityColor={getSeverityColor}
          />
        ))}
      </div>
    );
  } 
  
  return (
    <div className="text-center py-12">
      <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No anomalies found</h3>
      <p className="text-muted-foreground">
        Try changing your filters to see more results
      </p>
    </div>
  );
};

export default AnomalyList;
