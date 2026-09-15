// Recommendation Model
export interface Recommendation {
  priority: 'Crítica' | 'Alta' | 'Media' | 'Baja';
  type: string;
  message: string;
}

// Component Analysis
export interface ComponentAnalysisItem {
  component: string;
  avgPerformance: number;
  minPerformance: number;
  q1: number;         // First quartile (25th percentile)
  median: number;     // Second quartile (50th percentile - median)
  q3: number;         // Third quartile (75th percentile)
  maxPerformance: number;
  stdDev: number;
  totalAttempts: number;
  performanceLevel: 'Excelente' | 'Bueno' | 'Regular' | 'Bajo';
  variability: 'Baja' | 'Media' | 'Alta';
  outliers: number[]; // Array of outlier values
  recommendations: Recommendation[];
}

export interface ComponentAnalysisSummary {
  totalComponents: number;
  criticalComponents: number;
  componentsNeedingImprovement: number;
  mainRecommendation: string;
}

export interface ComponentAnalysisData {
  overallAverage: number;
  components: ComponentAnalysisItem[];
  summary: ComponentAnalysisSummary;
}

export interface ComponentAnalysisResponse {
  success: boolean;
  data: ComponentAnalysisData;
}

// Institution Analysis
export interface InstitutionAnalysisItem {
  institution: string;
  type: string;
  avgScore: number;
  minScore: number;
  q1?: number;
  median?: number;
  q3?: number;
  maxScore: number;
  studentCount: number;
  stdDev: number;
  outliers?: number[];
  performanceLevel: 'Excelente' | 'Bueno' | 'Regular' | 'Bajo';
  recommendations: Recommendation[];
}

export interface InstitutionTypeGroup {
  type: string;
  institutions: Array<{
    institution: string;
    avgScore: number;
    studentCount: number;
  }>;
  totalStudents: number;
  avgScore: number;
  avgScoreFormatted: number;
}

export interface SectorRiskAnalysis {
  public: {
    count: number;
    avgScore: number;
    riskLevel: string;
  };
  private: {
    count: number;
    avgScore: number;
    riskLevel: string;
  };
  gap: number;
  dominantSector: string;
}

export interface InstitutionAnalysisData {
  overallAverage: number;
  institutions: InstitutionAnalysisItem[];
  groupByType?: InstitutionTypeGroup[];
  riskConcentration?: SectorRiskAnalysis;
}

export interface InstitutionAnalysisResponse {
  success: boolean;
  data: InstitutionAnalysisData;
}

// Geographic Analysis
export interface GeographicAnalysisItem {
  province: string;
  canton: string;
  avgScore: number;
  minScore: number;
  maxScore: number;
  studentCount: number;
  stdDev: number;
  riskIndex: number;
  riskLevel: 'Riesgo Alto' | 'Riesgo Medio' | 'Riesgo Bajo';
  performanceLevel: 'Excelente' | 'Bueno' | 'Regular' | 'Bajo';
  recommendations: Recommendation[];
}

export interface GeographicAnalysisSummary {
  totalLocations: number;
  highRiskZones: number;
  mediumRiskZones: number;
  percentageHighRisk: string;
  mainRecommendation: string;
}

export interface GeographicAnalysisData {
  overallAverage: number;
  locations: GeographicAnalysisItem[];
  summary: GeographicAnalysisSummary;
}

export interface GeographicAnalysisResponse {
  success: boolean;
  data: GeographicAnalysisData;
}

// Difficulty Analysis
export interface DifficultyAnalysisItem {
  component: string;
  avgSuccessRate: number;
  minSuccessRate: number;
  maxSuccessRate: number;
  difficultyIndex: number;
  difficultyLevel: 'Muy Difícil' | 'Difícil' | 'Moderado' | 'Fácil';
  totalAttempts: number;
  recommendations: Recommendation[];
}

export interface DifficultyAnalysisSummary {
  totalComponents: number;
  veryDifficultComponents: number;
  difficultComponents: number;
  mainRecommendation: string;
}

export interface DifficultyAnalysisData {
  components: DifficultyAnalysisItem[];
  summary: DifficultyAnalysisSummary;
}

export interface DifficultyAnalysisResponse {
  success: boolean;
  data: DifficultyAnalysisData;
}

// Career Analysis
export interface CareerAnalysisItem {
  career: string;
  avgScore: number;
  minScore: number;
  maxScore: number;
  applicantCount: number;
  withQuota: number;
  withoutQuota?: number;
  quotaRate: number;
  stdDev: number;
  performanceLevel: 'Excelente' | 'Bueno' | 'Regular' | 'Bajo';
  competitiveness: 'Muy Alta' | 'Alta' | 'Media' | 'Baja';
  recommendations: Recommendation[];
}

export interface NoQuotaCareerItem {
  career: string;
  avgScore: number;
  applicantCount: number;
}

export interface NoQuotaSegment {
  bestPerforming: NoQuotaCareerItem[];
  lowestPerforming: NoQuotaCareerItem[];
}

export interface CareerSummaryItem {
  career: string;
  applicants?: number;
  quotaRate?: number;
  avgScore?: number;
}

export interface CareerAnalysisSummary {
  totalCareers: number;
  totalApplicants: number;
  mostCompetitiveCareers: CareerSummaryItem[];
  highestPerformanceCareers: CareerSummaryItem[];
  lowestQuotaRateCareers: CareerSummaryItem[];
  mainRecommendation: string;
}

export interface CareerAnalysisData {
  overallAverage: number;
  careers: CareerAnalysisItem[];
  noQuotaSegment?: NoQuotaSegment;
  summary: CareerAnalysisSummary;
}

export interface CareerAnalysisResponse {
  success: boolean;
  data: CareerAnalysisData;
}
