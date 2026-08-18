import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AdmissionData,
  AdmissionStatsResponse,
  AdmissionListResponse,
  AdmissionUploadResponse,
  AdmissionFilters,
  UploadHistoryItem
} from '../models/admission.model';

@Injectable({
  providedIn: 'root'
})
export class AdmissionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admission`;
  private biApiUrl = `${environment.apiUrl}/bi`;

  getPeriodsYears(): Observable<any> {
    return this.http.get<any>(`${this.biApiUrl}/periods-years`);
  }

  getAdmissionData(filters?: AdmissionFilters): Observable<AdmissionListResponse> {
    let params = new HttpParams();
    
    if (filters?.period) {
      params = params.set('period', filters.period);
    }
    if (filters?.year) {
      params = params.set('year', filters.year.toString());
    }
    if (filters?.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters?.limit) {
      params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<AdmissionListResponse>(this.apiUrl, { params });
  }

  getAdmissionStats(period?: string, year?: number): Observable<AdmissionStatsResponse> {
    let params = new HttpParams();
    
    if (period) {
      params = params.set('period', period);
    }
    if (year) {
      params = params.set('year', year.toString());
    }

    return this.http.get<AdmissionStatsResponse>(`${this.apiUrl}/stats`, { params });
  }

  uploadAdmissionFile(file: File, period: string, year: number): Observable<AdmissionUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('period', period);
    formData.append('year', year.toString());

    return this.http.post<AdmissionUploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  getUploadHistory(): Observable<{ success: boolean; data: UploadHistoryItem[] }> {
    return this.http.get<{ success: boolean; data: UploadHistoryItem[] }>(`${this.apiUrl}/history`);
  }
}
