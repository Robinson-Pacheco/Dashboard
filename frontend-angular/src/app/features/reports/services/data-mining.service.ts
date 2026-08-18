import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ComponentAnalysisResponse,
  InstitutionAnalysisResponse,
  GeographicAnalysisResponse,
  DifficultyAnalysisResponse,
  CareerAnalysisResponse
} from '../models/data-mining.model';

@Injectable({
  providedIn: 'root'
})
export class DataMiningService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/data-mining`;
  private biApiUrl = `${environment.apiUrl}/bi`;

  getPeriodsYears(): Observable<any> {
    return this.http.get<any>(`${this.biApiUrl}/periods-years`);
  }

  getComponentAnalysis(period?: string, year?: number): Observable<ComponentAnalysisResponse> {
    let params = new HttpParams();
    if (period) params = params.set('period', period);
    if (year) params = params.set('year', year.toString());
    return this.http.get<ComponentAnalysisResponse>(`${this.apiUrl}/component-analysis`, { params });
  }

  getInstitutionAnalysis(period?: string, year?: number, sampleSize?: string): Observable<InstitutionAnalysisResponse> {
    let params = new HttpParams();
    if (period) params = params.set('period', period);
    if (year) params = params.set('year', year.toString());
    if (sampleSize) params = params.set('sampleSize', sampleSize);
    return this.http.get<InstitutionAnalysisResponse>(`${this.apiUrl}/institution-analysis`, { params });
  }

  getGeographicAnalysis(period?: string, year?: number, sampleSize?: string): Observable<GeographicAnalysisResponse> {
    let params = new HttpParams();
    if (period) params = params.set('period', period);
    if (year) params = params.set('year', year.toString());
    if (sampleSize) params = params.set('sampleSize', sampleSize);
    return this.http.get<GeographicAnalysisResponse>(`${this.apiUrl}/geographic-analysis`, { params });
  }

  getDifficultyAnalysis(period?: string, year?: number): Observable<DifficultyAnalysisResponse> {
    let params = new HttpParams();
    if (period) params = params.set('period', period);
    if (year) params = params.set('year', year.toString());
    return this.http.get<DifficultyAnalysisResponse>(`${this.apiUrl}/difficulty-analysis`, { params });
  }

  getCareerAnalysis(period?: string, year?: number): Observable<CareerAnalysisResponse> {
    let params = new HttpParams();
    if (period) params = params.set('period', period);
    if (year) params = params.set('year', year.toString());
    return this.http.get<CareerAnalysisResponse>(`${this.apiUrl}/career-analysis`, { params });
  }
}
