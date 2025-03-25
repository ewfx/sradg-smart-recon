
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Info, FileText, FileWarning } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface MatchStatusStats {
  [key: string]: number;
}

export interface ReconciliationStats {
  catalyst_rows: number;
  impact_rows: number;
  total_issue_count: number;
  match_status_stats: MatchStatusStats;
}

interface ReconciliationStatsCardProps {
  stats: ReconciliationStats | null;
}

const ReconciliationStatsCard: React.FC<ReconciliationStatsCardProps> = ({ stats }) => {
  if (!stats) {
    return null;
  }

  const { catalyst_rows, impact_rows, total_issue_count, match_status_stats } = stats;
  
  // Calculate percentages for visualization
  const matchedCount = catalyst_rows + impact_rows - total_issue_count;
  const matchPercentage = Math.round((matchedCount / (catalyst_rows + impact_rows)) * 100);
  const issuePercentage = Math.round((total_issue_count / (catalyst_rows + impact_rows)) * 100);
  
  // Generate colors for different match statuses
  const getStatusColor = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('only')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    if (statusLower.includes('break')) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <Info className="mr-2 h-5 w-5 text-blue-500" />
          Reconciliation Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <FileText className="h-8 w-8 text-blue-500 mb-2" />
            <span className="text-2xl font-bold">{catalyst_rows}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Catalyst Rows</span>
          </div>
          
          <div className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <FileText className="h-8 w-8 text-purple-500 mb-2" />
            <span className="text-2xl font-bold">{impact_rows}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Impact Rows</span>
          </div>
          
          <div className="flex flex-col items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <FileWarning className="h-8 w-8 text-red-500 mb-2" />
            <span className="text-2xl font-bold">{total_issue_count}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Issues</span>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">Match Status</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(match_status_stats).map(([status, count]) => (
              <Badge key={status} className={`px-2 py-1 ${getStatusColor(status)}`}>
                {status.replace('_', ' ')}: {count}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <span className="font-medium">Match Rate</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
              <div 
                className="bg-green-500 h-2.5 rounded-full" 
                style={{ width: `${matchPercentage}%` }}
              ></div>
            </div>
            <div className="text-right text-sm text-gray-500 dark:text-gray-400">
              {matchPercentage}% Matched
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="font-medium">Issue Rate</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
              <div 
                className="bg-red-500 h-2.5 rounded-full" 
                style={{ width: `${issuePercentage}%` }}
              ></div>
            </div>
            <div className="text-right text-sm text-gray-500 dark:text-gray-400">
              {issuePercentage}% Issues
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReconciliationStatsCard;
