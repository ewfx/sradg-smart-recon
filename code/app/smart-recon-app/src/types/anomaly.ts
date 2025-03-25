import { DynamicColumnData } from '@/lib/csv-parser';

// Response type for insights API
export interface InsightResponse {
  bucket_id: number;
  bucket_description: string;
  anomaly_count: number;
  sample_companies: string[];
  root_cause: string;
  recommendation: string;
}

// API response with total numbers and insights array
export interface InsightsApiResponse {
  total_anomalies: number;
  total_impact: number;
  insights: InsightResponse[];
  message?: string;
}

// Sample record type for anomaly data
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

// Anomaly item type for display
export interface AnomalyItem {
  id: number;
  title: string;
  description: string;
  severity: string;
  category: string;
  date: string;
  impact: string;
  status: string;
  bucket?: string;
  anomalyCount?: number;
  rootCauses?: string[];
  suggestedActions?: string[];
  sampleRecords?: AnomalySampleRecord[];
}

// Props for the anomaly detection hook
export interface UseAnomalyDetectionProps {
  onAnomalyDataReceived?: (data: DynamicColumnData[], headers: string[]) => void;
  onAnomalyInsightsReceived?: (anomalies: AnomalyItem[]) => void;
  onAnomalyStatsChange?: (count: number, impact: number) => void;
  apiKey?: string | null;
}

// Props for the anomaly insights hook
export interface UseAnomalyInsightsProps {
  onAnomalyInsightsReceived?: (anomalies: AnomalyItem[]) => void;
  apiKey?: string | null;
}
