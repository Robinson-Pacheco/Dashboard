import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  QuartilesAnalysisRequest,
  QuartilesAnalysisResponse,
  PredictionRequest,
  PredictionResponse,
  OutliersAnalysisRequest,
  OutliersAnalysisResponse,
  ComparePeriodsRequest,
  ComparePeriodsResponse,
  NarrativeReportRequest,
  NarrativeReportResponse,
  AnomaliesDetectionRequest,
  AnomaliesDetectionResponse,
  ProviderStatusResponse,
  GenerateChartResponse,
  ChartGenerationRequest
} from '../models/ai-analysis.models';

/**
 * Service for AI-powered analysis
 * Communicates with the backend AI analysis endpoints
 */
@Injectable({
  providedIn: 'root'
})
export class AIAnalysisService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ai`;

  /**
   * Analyze quartiles with AI insights
   * Provides educational interpretation of Q1, Q2, Q3 values
   */
  analyzeQuartiles(request: QuartilesAnalysisRequest): Observable<QuartilesAnalysisResponse> {
    return this.http.post<QuartilesAnalysisResponse>(`${this.apiUrl}/quartiles`, request);
  }

  /**
   * Generate predictions for future admission periods
   * Uses historical data to predict trends
   */
  predictAdmissions(request: PredictionRequest): Observable<PredictionResponse> {
    return this.http.post<PredictionResponse>(`${this.apiUrl}/predictions`, request);
  }

  /**
   * Analyze outliers with educational recommendations
   * Provides insights for students with atypical scores
   */
  analyzeOutliers(request: OutliersAnalysisRequest): Observable<OutliersAnalysisResponse> {
    return this.http.post<OutliersAnalysisResponse>(`${this.apiUrl}/outliers`, request);
  }

  /**
   * Compare performance between different periods
   * Provides comparative analysis with statistical significance
   */
  comparePeriods(request: ComparePeriodsRequest): Observable<ComparePeriodsResponse> {
    return this.http.post<ComparePeriodsResponse>(`${this.apiUrl}/compare-periods`, request);
  }

  /**
   * Generate comprehensive narrative report
   * Creates a detailed report in natural language
   */
  generateNarrativeReport(request: NarrativeReportRequest): Observable<NarrativeReportResponse> {
    return this.http.post<NarrativeReportResponse>(`${this.apiUrl}/narrative-report`, request);
  }

  /**
   * Detect anomalies in admission data
   * Identifies unusual patterns in the data
   */
  detectAnomalies(request: AnomaliesDetectionRequest): Observable<AnomaliesDetectionResponse> {
    return this.http.post<AnomaliesDetectionResponse>(`${this.apiUrl}/anomalies`, request);
  }

  /**
   * Get AI provider connection status
   * Checks if the AI service is properly configured and accessible
   */
  getProviderStatus(): Observable<ProviderStatusResponse> {
    return this.http.get<ProviderStatusResponse>(`${this.apiUrl}/status`);
  }

  /**
   * Stream quartiles analysis via SSE using fetch
   * Calls onChunk callback for each data event
   */
  streamQuartiles(
    request: QuartilesAnalysisRequest,
    onChunk: (data: { content?: string; done?: boolean; error?: string }) => void
  ): AbortController {
    const controller = new AbortController();
    const token = localStorage.getItem(environment.jwtTokenKey);

    fetch(`${this.apiUrl}/quartiles/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(request),
      signal: controller.signal
    }).then(async (response) => {
      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              onChunk(data);
              if (data.done) return;
            } catch { }
          }
        }
      }
    }).catch((err) => {
      if (err.name !== 'AbortError') {
        onChunk({ error: err.message });
      }
    });

    return controller;
  }

  /**
   * Generate chart from natural language prompt
   */
  generateChart(request: ChartGenerationRequest): Observable<GenerateChartResponse> {
    return this.http.post<GenerateChartResponse>(`${this.apiUrl}/generate-chart`, request);
  }

  /**
   * Stream chart generation via SSE using fetch
   */
  streamChartGeneration(
    request: ChartGenerationRequest,
    onChunk: (data: { content?: string; chart?: any; analysis?: string; done?: boolean; error?: string }) => void
  ): AbortController {
    const controller = new AbortController();
    const token = localStorage.getItem(environment.jwtTokenKey);

    fetch(`${this.apiUrl}/generate-chart/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(request),
      signal: controller.signal
    }).then(async (response) => {
      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              onChunk(data);
              if (data.done) return;
            } catch { }
          }
        }
      }
    }).catch((err) => {
      if (err.name !== 'AbortError') {
        onChunk({ error: err.message });
      }
    });

    return controller;
  }
}
