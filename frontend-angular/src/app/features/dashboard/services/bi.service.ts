import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  BIStatistics,
  BITrends,
  BIDemographics,
  BIPerformance,
  BIDisability,
  BIDashboard,
  ExecutiveSummary,
  FilteredData,
  PeriodsYears,
  BIResponse
} from '../models/bi.model';

@Injectable({
  providedIn: 'root'
})
export class BIService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/bi`;

  getStatistics(period?: string, year?: number): Observable<BIResponse<BIStatistics>> {
    let params = new HttpParams();
    if (period) params = params.set('period', period);
    if (year) params = params.set('year', year.toString());
    return this.http.get<BIResponse<BIStatistics>>(`${this.apiUrl}/statistics`, { params });
  }

  getTrends(): Observable<BIResponse<BITrends>> {
    return this.http.get<BIResponse<BITrends>>(`${this.apiUrl}/trends`);
  }

  getDemographics(): Observable<BIResponse<BIDemographics>> {
    return this.http.get<BIResponse<BIDemographics>>(`${this.apiUrl}/demographics`);
  }

  getPerformance(): Observable<BIResponse<BIPerformance>> {
    return this.http.get<BIResponse<BIPerformance>>(`${this.apiUrl}/performance`);
  }

  getDisability(): Observable<BIResponse<BIDisability>> {
    return this.http.get<BIResponse<BIDisability>>(`${this.apiUrl}/disability`);
  }

  getPeriodsYears(): Observable<BIResponse<PeriodsYears>> {
    return this.http.get<BIResponse<PeriodsYears>>(`${this.apiUrl}/periods-years`);
  }

  getDashboard(period?: string, year?: number): Observable<BIResponse<BIDashboard>> {
    let params = new HttpParams();
    if (period) params = params.set('period', period);
    if (year) params = params.set('year', year.toString());
    return this.http.get<BIResponse<BIDashboard>>(`${this.apiUrl}/dashboard`, { params });
  }

  getExecutiveSummary(period?: string, year?: number): Observable<BIResponse<ExecutiveSummary>> {
    let params = new HttpParams();
    if (period) params = params.set('period', period);
    if (year) params = params.set('year', year.toString());
    return this.http.get<BIResponse<ExecutiveSummary>>(`${this.apiUrl}/executive-summary`, { params });
  }

  getFilteredData(filters: { period?: string; year?: number; provincia?: string; canton?: string; sexo?: string; tipoInstitucion?: string; carrera?: string } = {}): Observable<BIResponse<FilteredData>> {
    let params = new HttpParams();
    if (filters.period) params = params.set('period', filters.period);
    if (filters.year) params = params.set('year', filters.year.toString());
    if (filters.provincia) params = params.set('provincia', filters.provincia);
    if (filters.canton) params = params.set('canton', filters.canton);
    if (filters.sexo) params = params.set('sexo', filters.sexo);
    if (filters.tipoInstitucion) params = params.set('tipoInstitucion', filters.tipoInstitucion);
    if (filters.carrera) params = params.set('carrera', filters.carrera);
    return this.http.get<BIResponse<FilteredData>>(`${this.apiUrl}/filtered`, { params });
  }
}
