// Recommendation Model
export interface Recommendation {
  priority: 'Crítica' | 'Alta' | 'Media' | 'Baja';
  type: string;
  message: string;
}

// Gender Career Analysis
export interface GenderStats {
  avgScore: number;
  applicantCount: number;
  withQuota: number;
  quotaRate: number;
  quotaShare?: number;
}

export interface GenderGap {
  gap: number;
  percentGap: number;
  higherPerforming: string;
  lowerPerforming: string;
}

export interface GenderCareerItem {
  career: string;
  genderData: {
    HOMBRE?: GenderStats;
    MUJER?: GenderStats;
    [key: string]: GenderStats | undefined;
  };
  genderGap: GenderGap;
  gapType: 'Brecha Significativa' | 'Brecha Moderada' | 'Equitativo';
  totalApplicants: number;
  recommendations: Recommendation[];
}

export interface GenderCareerSummary {
  totalCareers: number;
  careersWithSignificantGap: number;
  careersWithModerateGap: number;
  equitableCareers: number;
  mainRecommendation: string;
}

export interface GenderCareerData {
  careers: GenderCareerItem[];
  summary: GenderCareerSummary;
}

export interface GenderCareerResponse {
  success: boolean;
  data: GenderCareerData;
}

// Disability Impact Analysis
export interface WithoutDisabilityStats {
  avgScore: number;
  studentCount: number;
  quotaRate: number;
}

export interface DisabilityTypeItem {
  disabilityType: string;
  avgScore: number;
  minScore: number;
  maxScore: number;
  studentCount: number;
  stdDev: number;
  quotaRate: number;
  gapVsNoDisability: number;
  percentGap: number;
  performanceClassification: 'Mejor desempeño' | 'Peor desempeño' | 'Similar';
  performanceColor: 'green' | 'red' | 'yellow';
  recommendations: Recommendation[];
}

export interface DisabilityImpactSummary {
  totalWithDisability: number;
  totalWithoutDisability: number;
  percentageWithDisability: number;
  averageGap: number;
  disabilityTypes: number;
  mainRecommendation: string;
}

export interface DisabilityImpactData {
  withoutDisability: WithoutDisabilityStats;
  byDisabilityType: DisabilityTypeItem[];
  summary: DisabilityImpactSummary;
}

export interface DisabilityImpactResponse {
  success: boolean;
  data: DisabilityImpactData;
}

// Response Strategy Analysis
export interface ResponseStrategyByComponent {
  component: string;
  avgCorrect: number;
  avgIncorrect: number;
  avgUnanswered: number;
  avgScore: number;
  totalAttempts: number;
  recommendations: Recommendation[];
}

export interface ResponseStrategyByStrategy {
  strategyType: 'Conservative' | 'Aggressive' | 'Balanced';
  avgScore: number;
  studentCount: number;
  avgCorrect: number;
  avgIncorrect: number;
  avgUnanswered: number;
}

export interface ResponseStrategySummary {
  totalComponents: number;
  bestStrategy: string;
  bestStrategyScore: number;
  mainRecommendation: string;
}

export interface ResponseStrategyData {
  byComponent: ResponseStrategyByComponent[];
  byStrategy: ResponseStrategyByStrategy[];
  summary: ResponseStrategySummary;
}

export interface ResponseStrategyResponse {
  success: boolean;
  data: ResponseStrategyData;
}
