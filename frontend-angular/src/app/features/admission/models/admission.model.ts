export interface AdmissionData {
  _id: string;
  period: string;
  year: number;
  studentId: string;
  studentName: string;
  scores: {
    [key: string]: number;
  };
  totalScore: number;
  status: 'approved' | 'rejected' | 'pending';
  uploadedBy: string;
  createdAt: string;
}

export interface AdmissionStats {
  totalStudents: number;
  averageScore: number;
  maxScore: number;
  minScore: number;
  admitidosCount: number;
  noAdmitidosCount: number;
}

export interface UploadHistoryItem {
  year: number;
  period: string;
  originalFileName: string;
  uploadedAt: string;
  recordCount: number;
}

export interface AdmissionStatsResponse {
  success: boolean;
  data: AdmissionStats;
}

export interface AdmissionListResponse {
  success: boolean;
  data: {
    admissionData: AdmissionData[];
    totalPages: number;
    currentPage: number;
    totalRecords: number;
  };
}

export interface AdmissionUploadResponse {
  success: boolean;
  message: string;
  data?: {
    processedRecords: number;
    errors?: string[];
  };
}

export interface AdmissionFilters {
  period?: string;
  year?: number;
  page?: number;
  limit?: number;
}
