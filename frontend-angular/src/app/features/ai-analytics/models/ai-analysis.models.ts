/**
 * AI Analysis Models
 * Models for AI-powered analytics responses
 */

// ==================== BASE MODELS ====================

export interface AIMetadata {
  provider: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// ==================== QUARTILES ANALYSIS ====================

export interface QuartilesStatistics {
  q1: number;
  median: number;
  q3: number;
  iqr: number;
  min: number;
  max: number;
}

export interface QuartilesAnalysisRequest {
  component: string;
  period?: string;
  year?: number;
  statistics: QuartilesStatistics;
}

export interface QuartilesAnalysisData {
  component: string;
  analysis: string;
  metadata: AIMetadata;
}

export type QuartilesAnalysisResponse = AIResponse<QuartilesAnalysisData>;

// ==================== PREDICTIONS ====================

export interface HistoricalDataPoint {
  period: string;
  mean: number;
  count: number;
}

export interface PredictionRequest {
  component: string;
  periodsToPredict: number;
  historicalData: HistoricalDataPoint[];
}

export interface PredictionData {
  component: string;
  predictions: {
    period: string;
    predictedMean: number;
    predictedCount: number;
    confidence: number;
  }[];
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendations: string[];
  metadata: AIMetadata;
}

export type PredictionResponse = AIResponse<PredictionData>;

// ==================== OUTLIERS ====================

export interface OutlierData {
  studentName: string;
  score: number;
  zScore: number;
}

export interface OutlierStatistics {
  mean: number;
  standardDeviation: number;
}

export interface OutliersAnalysisRequest {
  component: string;
  outliers: OutlierData[];
  statistics: OutlierStatistics;
}

export interface OutliersAnalysisData {
  component: string;
  analysis: string;
  recommendations: {
    category: string;
    description: string;
  }[];
  metadata: AIMetadata;
}

export type OutliersAnalysisResponse = AIResponse<OutliersAnalysisData>;

// ==================== PERIOD COMPARISON ====================

export interface PeriodData {
  period: string;
  mean: number;
  median: number;
  standardDeviation: number;
  count: number;
}

export interface ComparePeriodsRequest {
  component: string;
  period1: PeriodData;
  period2: PeriodData;
}

export interface ComparePeriodsData {
  component: string;
  comparison: {
    keyFindings: string[];
    performanceChange: 'improved' | 'declined' | 'stable';
    statisticalSignificance: boolean;
    recommendations: string[];
  };
  metadata: AIMetadata;
}

export type ComparePeriodsResponse = AIResponse<ComparePeriodsData>;

// ==================== NARRATIVE REPORT ====================

export interface NormalDistributionData {
  mean: number;
  standardDeviation: number;
}

export interface NarrativeReportRequest {
  data: {
    component: string;
    totalStudents: number;
    statistics: QuartilesStatistics;
    normalDistribution: NormalDistributionData;
  };
}

export interface NarrativeReportData {
  component: string;
  report: string;
  sections: {
    title: string;
    content: string;
  }[];
  metadata: AIMetadata;
}

export type NarrativeReportResponse = AIResponse<NarrativeReportData>;

// ==================== ANOMALIES ====================

export interface AnomaliesDetectionRequest {
  currentData: any[];
  historicalData: any[];
}

export interface Anomaly {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  recommendation?: string;
}

export interface AnomaliesDetectionData {
  anomalies: Anomaly[];
  summary: string;
  metadata: AIMetadata;
}

export type AnomaliesDetectionResponse = AIResponse<AnomaliesDetectionData>;

// ==================== CHART GENERATION ====================

export interface ChartGenerationRequest {
  prompt: string;
}

export interface ChartConfig {
  type: 'bar' | 'line' | "pie" | 'doughnut' | 'radar' | 'polarArea';
  title?: string;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string[] | string;
      borderColor?: string;
      fill?: boolean;
    }[];
  };
  options?: Record<string, any>;
}

export interface ChartGenerationData {
  text: string;
  chart: ChartConfig | null;
  metadata: AIMetadata;
}

export type GenerateChartResponse = AIResponse<ChartGenerationData>;

// ==================== PROVIDER STATUS ====================

export interface ProviderStatusData {
  status: 'connected' | 'disconnected' | 'error';
  provider: string;
  availableModels?: string[];
  message: string;
}

export type ProviderStatusResponse = AIResponse<ProviderStatusData>;
