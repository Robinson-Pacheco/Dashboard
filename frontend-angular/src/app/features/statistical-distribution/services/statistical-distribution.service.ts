import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  StatisticalDistributionResponse,
  DistributionAnalysisData,
  DistributionAnalysisResponse,
  ComponentsListData,
  ComparativeAnalysisData,
  MedianDistributionData
} from '../models/statistical-distribution.model';

@Injectable({
  providedIn: 'root'
})
export class StatisticalDistributionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/statistical`;

  /**
   * Get distribution analysis for a specific component/dimension
   * GET /api/statistical/distribution?period=2025-2&year=2025&componente=Razonamiento Abstracto
   */
  getDistributionAnalysis(
    period?: string,
    year?: number,
    component?: string
  ): Observable<StatisticalDistributionResponse<DistributionAnalysisResponse>> {
    let params = new HttpParams();
    if (period) params = params.set('period', period);
    if (year) params = params.set('year', year.toString());
    if (component) params = params.set('componente', component);

    return this.http.get<StatisticalDistributionResponse<DistributionAnalysisResponse>>(
      `${this.apiUrl}/distribution`,
      { params }
    );
  }

  /**
   * Get list of available components/dimensions
   * GET /api/statistical/components?period=2025-2&year=2025
   */
  getAvailableComponents(
    period?: string,
    year?: number
  ): Observable<StatisticalDistributionResponse<ComponentsListData>> {
    let params = new HttpParams();
    if (period) params = params.set('period', period);
    if (year) params = params.set('year', year.toString());

    return this.http.get<StatisticalDistributionResponse<ComponentsListData>>(
      `${this.apiUrl}/components`,
      { params }
    );
  }

  /**
   * Get comparative analysis between two periods
   * GET /api/statistical/comparative?componente=Razonamiento Abstracto&period1=2025-1&period2=2025-2&year=2025
   */
  getComparativeAnalysis(
    component?: string,
    period1?: string,
    period2?: string,
    year?: number
  ): Observable<StatisticalDistributionResponse<ComparativeAnalysisData>> {
    let params = new HttpParams();
    if (component) params = params.set('componente', component);
    if (period1) params = params.set('period1', period1);
    if (period2) params = params.set('period2', period2);
    if (year) params = params.set('year', year.toString());

    return this.http.get<StatisticalDistributionResponse<ComparativeAnalysisData>>(
      `${this.apiUrl}/comparative`,
      { params }
    );
  }

  /**
   * Get periods and years available (reusing existing endpoint)
   * GET /api/bi/periods-years
   */
  getPeriodsYears(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/bi/periods-years`);
  }

  /**
   * Get median distribution analysis for dashboard
   * GET /api/statistical/median-distribution?period=2025-2&year=2025
   */
  getMedianDistribution(
    period?: string,
    year?: number
  ): Observable<StatisticalDistributionResponse<MedianDistributionData>> {
    let params = new HttpParams();
    if (period) params = params.set('period', period);
    if (year) params = params.set('year', year.toString());

    return this.http.get<StatisticalDistributionResponse<MedianDistributionData>>(
      `${this.apiUrl}/median-distribution`,
      { params }
    );
  }
}
