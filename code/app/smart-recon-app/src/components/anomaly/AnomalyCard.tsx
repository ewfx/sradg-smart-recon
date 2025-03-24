
import React from 'react';
import { Calendar, DollarSign, Info, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export interface AnomalyItem {
  id: number;
  title: string;
  description: string;
  severity: string;
  category: string;
  date: string;
  impact: string;
  status: string;
  // Fields for the AI insights
  bucket?: string;
  anomalyCount?: number;
  rootCauses?: string[];
  suggestedActions?: string[];
  sampleRecords?: AnomalySampleRecord[];
}

export interface AnomalySampleRecord {
  company?: string;
  account?: string;
  primaryAccount?: string;
  secondaryAccount?: string;
  glBalance?: string | number;
  iHubBalance?: string | number;
  anomalyScore?: number;
  balanceDifference?: number | string;
}

interface AnomalyCardProps {
  anomaly: AnomalyItem;
  getCategoryIcon: (category: string) => JSX.Element;
  getSeverityColor: (severity: string) => string;
}

const AnomalyCard: React.FC<AnomalyCardProps> = ({ 
  anomaly, 
  getCategoryIcon, 
  getSeverityColor 
}) => {
  // Function to format currency values
  const formatCurrency = (value: string | number | undefined): string => {
    if (value === undefined) return '';
    return typeof value === 'number' 
      ? `$${value.toLocaleString()}`
      : value.toString();
  };
  
  const hasDetailedInsights = anomaly.bucket || anomaly.rootCauses?.length || anomaly.sampleRecords?.length;
  
  return (
    <div 
      key={anomaly.id}
      className="p-4 rounded-lg border bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium flex items-center">
            {getCategoryIcon(anomaly.category)}
            <span className="ml-2">{anomaly.title}</span>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {anomaly.description}
          </p>
        </div>
        <Badge 
          className={cn(
            "ml-2",
            getSeverityColor(anomaly.severity)
          )}
        >
          {anomaly.severity} priority
        </Badge>
      </div>
      
      {hasDetailedInsights && (
        <Accordion type="single" collapsible className="mt-3">
          <AccordionItem value="item-1" className="border-none">
            <AccordionTrigger className="py-2 text-sm font-medium">
              <span className="flex items-center text-blue-600 dark:text-blue-400">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                AI Insights
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm">
                {anomaly.bucket && (
                  <div className="mb-2">
                    <span className="font-medium">Anomaly Bucket:</span> {anomaly.bucket}
                    {anomaly.anomalyCount !== undefined && (
                      <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                        {anomaly.anomalyCount} anomalies
                      </span>
                    )}
                  </div>
                )}
                
                {anomaly.sampleRecords && anomaly.sampleRecords.length > 0 && (
                  <div className="mb-2">
                    <div className="font-medium mb-1">Sample Records:</div>
                    <div className="bg-white dark:bg-gray-900 p-2 rounded border text-xs">
                      {anomaly.sampleRecords.map((record, idx) => (
                        <div key={idx} className="mb-2 last:mb-0">
                          {record.company && <div><span className="font-medium">Company:</span> {record.company}</div>}
                          {record.account && <div><span className="font-medium">Account:</span> {record.account}</div>}
                          {record.primaryAccount && <div><span className="font-medium">Primary Account:</span> {record.primaryAccount}</div>}
                          {record.secondaryAccount && <div><span className="font-medium">Secondary Account:</span> {record.secondaryAccount}</div>}
                          <div className="flex flex-wrap gap-x-4 mt-1">
                            {record.glBalance !== undefined && (
                              <div><span className="font-medium">GL Balance:</span> {formatCurrency(record.glBalance)}</div>
                            )}
                            {record.iHubBalance !== undefined && (
                              <div><span className="font-medium">iHub Balance:</span> {formatCurrency(record.iHubBalance)}</div>
                            )}
                            {record.balanceDifference !== undefined && (
                              <div><span className="font-medium">Difference:</span> {formatCurrency(record.balanceDifference)}</div>
                            )}
                            {record.anomalyScore !== undefined && (
                              <div><span className="font-medium">Score:</span> {record.anomalyScore.toFixed(4)}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {anomaly.rootCauses && anomaly.rootCauses.length > 0 && (
                  <div className="mb-2">
                    <div className="font-medium mb-1">Potential Root Causes:</div>
                    <ul className="list-disc list-inside text-xs">
                      {anomaly.rootCauses.map((cause, idx) => (
                        <li key={idx}>{cause}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {anomaly.suggestedActions && anomaly.suggestedActions.length > 0 && (
                  <div>
                    <div className="font-medium mb-1">Suggested Actions:</div>
                    <ul className="list-disc list-inside text-xs">
                      {anomaly.suggestedActions.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      
      <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <span className="flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            {anomaly.date}
          </span>
          <span className="flex items-center">
            <DollarSign className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            {anomaly.impact}
          </span>
        </div>
        <Badge variant={anomaly.status === 'resolved' ? 'outline' : 'destructive'}>
          {anomaly.status}
        </Badge>
      </div>
    </div>
  );
};

export default AnomalyCard;
