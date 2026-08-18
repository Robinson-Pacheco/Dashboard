// Statistical Distribution Models

// Base Response Interface
export interface StatisticalDistributionResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ============ DISTRIBUTION ANALYSIS MODELS ============

// Atypical Score Detail (from backend)
export interface AtypicalScoreDetail {
  studentId: string;
  studentName: string;
  score: number;
  zScore: number;
  percentile: number;
  deviationFromMean: number;
}

// Outliers Data (from backend)
export interface Outliers {
  total: number;
  percentage: number;
  details: AtypicalScoreDetail[];
}

// Normal Distribution Data (from backend)
export interface NormalDistributionData {
  withinOneStdDev: {
    count: number;
    percentage: number;
  };
  withinTwoStdDev: {
    count: number;
    percentage: number;
  };
  withinThreeStdDev: {
    count: number;
    percentage: number;
  };
}

// Statistics (from backend)
export interface Statistics {
  mean: number;
  median: number;
  mode: number;
  variance: number;
  standardDeviation: number;
  min: number;
  max: number;
  range: number;
  q1: number;
  q3: number;
  iqr: number;
}

// Atypical Scores (from backend)
export interface AtypicalScores {
  total: number;
  percentage: number;
  details: AtypicalScoreDetail[];
}

// Main Distribution Analysis Data (from backend)
// Note: Backend returns an array with one object
export type DistributionAnalysisResponse = DistributionAnalysisData[];

export interface DistributionAnalysisData {
  componente: string;
  quiz: string;
  totalStudents: number;
  statistics: Statistics;
  normalDistribution: NormalDistributionData;
  outliers: Outliers;
  atypicalScores: AtypicalScores;
}

// ============ COMPONENTS LIST MODELS ============

export interface ComponentItem {
  componente: string;
  count: number;
  averageScore: number;
  maxScore: number;
  minScore: number;
  quiz: string;
  period: string;
  year: number;
}

export type ComponentsListData = ComponentItem[];

// ============ COMPARATIVE ANALYSIS MODELS ============

export interface ComparativePeriodStats {
  period: string;
  count: number;
  mean: number;
  variance: number;
  standardDeviation: number;
  min: number;
  max: number;
  median: number;
}

export interface ComparativeDifferences {
  meanDifference: number;
  meanChangePercent: number;
  stdDevDifference: number;
  countDifference: number;
}

export interface ComparativeAnalysisData {
  componente: string;
  comparison: {
    period1: ComparativePeriodStats;
    period2: ComparativePeriodStats;
    differences: ComparativeDifferences;
  };
}

// ============ MEDIAN DISTRIBUTION MODELS ============

// Student sample data
export interface StudentSample {
  studentId: string;
  studentName: string;
  totalScore: number;
}

// Segmentation data
export interface Segmentation {
  aboveMedian: {
    count: number;
    percentage: number;
    sampleStudents: StudentSample[];
  };
  belowMedian: {
    count: number;
    percentage: number;
    sampleStudents: StudentSample[];
  };
  equalMedian: {
    count: number;
    percentage: number;
  };
}

// Score distribution bin
export interface ScoreDistributionBin {
  range: string;
  midPoint: number;
  count: number;
  percentage: number;
}

// Normal curve data
export interface NormalCurveData {
  mean: number;
  stdDev: number;
  withinOneStdDev: {
    expected: number;
    min: number;
    max: number;
  };
  withinTwoStdDev: {
    expected: number;
    min: number;
    max: number;
  };
  withinThreeStdDev: {
    expected: number;
    min: number;
    max: number;
  };
}

// Statistics for median distribution
export interface MedianStatistics {
  median: number;
  mean: number;
  standardDeviation: number;
  variance: number;
  minScore: number;
  maxScore: number;
  range: number;
}

// Main median distribution data
export interface MedianDistributionData {
  totalStudents: number;
  statistics: MedianStatistics;
  segmentation: Segmentation;
  scoreDistribution: ScoreDistributionBin[];
  normalCurveData: NormalCurveData;
}
