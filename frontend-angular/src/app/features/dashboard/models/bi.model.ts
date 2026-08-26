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

export interface CareerGenderCount {
  carrera: string;
  sexo: string;
  rawSexo: string;
  count: number;
  avgScore: number;
  maxScore: number;
  minScore: number;
}

export interface CareerGenderResumen {
  carrera: string;
  masculino: number;
  femenino: number;
  otros: number;
  total: number;
  pctMasculino: string;
  pctFemenino: string;
  dominante: 'MASCULINO' | 'FEMENINO' | 'PARIDAD';
  brecha: number;
  avgMasculino: number;
  avgFemenino: number;
  avgTotal: number;
  maxMasculino: number;
  maxFemenino: number;
  minMasculino: number;
  minFemenino: number;
  diffAvg: number;
}

export interface CareerGenderTop {
  carrera: string;
  count: number;
  pct: string;
  avg: number;
}

export interface CareersByGender {
  byCareerGender: CareerGenderCount[];
  resumen: CareerGenderResumen[];
  topMasculino: CareerGenderTop[];
  topFemenino: CareerGenderTop[];
  mostGendered: CareerGenderResumen[];
}

export interface CareerCupoResumen {
  carrera: string;
  masculino: number;
  femenino: number;
  otros: number;
  total: number;
  pctMasculino: string;
  pctFemenino: string;
  dominante: 'MASCULINO' | 'FEMENINO' | 'PARIDAD';
  brecha: number;
}

export interface CareerCuposByGender {
  byCareerGenderCupos: { carrera: string; sexo: string; rawSexo: string; cupos: number }[];
  resumen: CareerCupoResumen[];
  totales: { masculino: number; femenino: number; total: number; pctMasc: string; pctFem: string };
}

// Response interfaces
export interface BIResponse<T> {
  success: boolean;
  data: T;
}
