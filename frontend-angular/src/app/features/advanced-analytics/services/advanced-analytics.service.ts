import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GenderCareerResponse, DisabilityImpactResponse, ResponseStrategyResponse } from '../models/advanced-analytics.model';

@Injectable({
  providedIn: 'root'
})
export class AdvancedAnalyticsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/advanced-analytics`;
  private biApiUrl = `${environment.apiUrl}/bi`;

  getPeriodsYears(): Observable<any> {
    return this.http.get<any>(`${this.biApiUrl}/periods-years`);
  }

  getGenderCareerAnalysis(period?: string, year?: number): Observable<GenderCareerResponse> {
    let params = new HttpParams();
    if (period) params = params.set('period', period);
    if (year) params = params.set('year', year.toString());
    return this.http.get<GenderCareerResponse>(`${this.apiUrl}/gender-career`, { params });
  }

  getDisabilityImpactAnalysis(period?: string, year?: number): Observable<DisabilityImpactResponse> {
    let params = new HttpParams();
    if (period) params = params.set('period', period);
    if (year) params = params.set('year', year.toString());
    return this.http.get<DisabilityImpactResponse>(`${this.apiUrl}/disability-impact`, { params });
  }

  getResponseStrategyAnalysis(period?: string, year?: number): Observable<ResponseStrategyResponse> {
    let params = new HttpParams();
    if (period) params = params.set('period', period);
    if (year) params = params.set('year', year.toString());
    return this.http.get<ResponseStrategyResponse>(`${this.apiUrl}/response-strategy`, { params });
  }
}
