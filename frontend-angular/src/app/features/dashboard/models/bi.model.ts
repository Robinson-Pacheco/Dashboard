export interface BIStatistics {
  totalApplications: number;
  averageScore: number;
  maxScore: number;
  minScore: number;
  admitidosCount: number;
  noAdmitidosCount: number;
}

export interface BITrend {
  period: string;
  year: number;
  totalApplications: number;
  averageScore: string;
  admitidosCount: number;
  noAdmitidosCount: number;
}

export interface ExecutiveSummary {
  totalPostulantes: number;
  promedioGeneral: number;
  distribucionGenero: { genero: string; cantidad: number; porcentaje: number }[];
  carreraMasDemandada: { carrera: string; postulantes: number } | null;
  provinciaConMasPostulantes: { provincia: string; postulantes: number } | null;
  instituciones: {
    mejorRendimiento: { nombre: string; promedio: number; estudiantes: number } | null;
    menorRendimiento: { nombre: string; promedio: number; estudiantes: number } | null;
  };
}

export interface FilteredData {
  statistics: BIStatistics;
  distribucionGenero: { genero: string; cantidad: number; porcentaje: number }[];
  carrerasPopulares: { carrera: string; postulantes: number }[];
  provincias: { provincia: string; postulantes: number }[];
  tiposInstitucion: { tipo: string; estudiantes: number }[];
}

export type BITrends = BITrend[];

export interface DemographicItem {
  _id: string;
  count: number;
}

export interface BIDemographics {
  gender: DemographicItem[];
  province: DemographicItem[];
  educationalUnit: DemographicItem[];
}

export interface ComponentScore {
  component: string;
  averageScore: number;
  maxScore: string | number;
  minScore: string | number;
  applicantCount: number;
}

export interface BIPerformance {
  componentPerformance: ComponentScore[];
}

export interface DisabilityTypeItem {
  _id: string;
  count: number;
}

export interface BIDisability {
  totalApplicants: number;
  withDisabilityCard: number;
  disabilityPercentage: string;
  disabilityTypes: string[];
  disabilityTypeBreakdown: DisabilityTypeItem[];
}

export interface BIDashboard {
  statistics: BIStatistics;
  trends: BITrend[];
  demographics: BIDemographics;
  componentPerformance: ComponentScore[];
  disabilityStats: BIDisability;
}

export interface PeriodsYears {
  periods: string[];
  years: number[];
}

// Response interfaces
export interface BIResponse<T> {
  success: boolean;
  data: T;
}
