import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, AlertTriangle, Sparkles, Loader2, Filter } from 'lucide-angular';
import { AIAnalysisService } from '../../services/ai-analysis.service';
import { BIService } from '../../../dashboard/services/bi.service';
import { StatisticalDistributionService } from '../../../statistical-distribution/services/statistical-distribution.service';
import { OutliersAnalysisData } from '../../models/ai-analysis.models';
import { DistributionAnalysisData } from '../../../statistical-distribution/models/statistical-distribution.model';
import { ToastrService } from 'ngx-toastr';
import { AiLoaderComponent } from '../../../../shared/components/ai-loader/ai-loader.component';
import { MarkdownPipe } from '../../../../shared/pipes/markdown.pipe';

interface OutlierDisplayData {
  studentId: string;
  studentName: string;
  score: number;
  zScore: number;
  deviationFromMean: number;
  percentile?: number;
}

@Component({
  selector: 'app-outliers-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, AiLoaderComponent, MarkdownPipe],
  templateUrl: './outliers-analysis.component.html'
})
export class OutliersAnalysisComponent implements OnInit {
  readonly AlertTriangle = AlertTriangle;
  readonly Sparkles = Sparkles;
  readonly Loader2 = Loader2;
  readonly Filter = Filter;

  private aiAnalysisService = inject(AIAnalysisService);
  private biService = inject(BIService);
  private statisticalService = inject(StatisticalDistributionService);
  private toastr = inject(ToastrService);

  // State
  isLoadingData = signal<boolean>(false);
  isLoadingAI = signal<boolean>(false);
  analysisData = signal<OutliersAnalysisData | null>(null);
  distributionData = signal<DistributionAnalysisData | null>(null);

  // Form - using regular properties for ngModel
  componentValue = '';
  periodValue = '';
  yearValue: number | null = null;

  // Available options from API
  availablePeriods = signal<string[]>([]);
  availableYears = signal<number[]>([]);
  availableComponents = signal<string[]>([]);

  // Outliers data from API
  outliers = signal<OutlierDisplayData[]>([]);
  atypicalScores = signal<OutlierDisplayData[]>([]);
  streamedAnalysis = signal<string>('');

  // Loading messages
  loadingMessages = [
    'Obteniendo distribución estadística...',
    'Calculando puntuaciones Z...',
    'Identificando valores atípicos...',
    'Conectando con el servicio de IA...',
    'Generando interpretación de outliers...',
    'Elaborando recomendaciones pedagógicas...'
  ];

  ngOnInit(): void {
    this.loadPeriodsYears();
  }

  loadPeriodsYears(): void {
    this.isLoadingData.set(true);

    this.biService.getPeriodsYears().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.availablePeriods.set(response.data.periods || []);
          const uniqueYears = [...new Set(response.data.years || [])] as number[];
          this.availableYears.set(uniqueYears);

          // Set most recent as defaults
          if (response.data.periods.length > 0) {
            this.periodValue = response.data.periods[response.data.periods.length - 1];
          }
          if (uniqueYears.length > 0) {
            this.yearValue = Math.max(...uniqueYears);
          }

          // Load available components
          this.loadAvailableComponents();
        } else {
          this.isLoadingData.set(false);
        }
      },
      error: (error) => {
        console.error('Error loading periods and years:', error);
        this.toastr.error('Error al cargar períodos y años disponibles', 'Error');
        this.isLoadingData.set(false);
      }
    });
  }

  loadAvailableComponents(): void {
    if (!this.periodValue || !this.yearValue) {
      this.isLoadingData.set(false);
      return;
    }

    this.statisticalService.getAvailableComponents(this.periodValue, this.yearValue).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const components = response.data.map(c => c.componente);
          this.availableComponents.set(components);

          if (components.length > 0) {
            this.componentValue = components[0];
          }

          this.isLoadingData.set(false);
        } else {
          this.isLoadingData.set(false);
        }
      },
      error: (error) => {
        console.error('Error loading components:', error);
        this.toastr.error('Error al cargar componentes disponibles', 'Error');
        this.isLoadingData.set(false);
      }
    });
  }

  analyze(): void {
    if (!this.componentValue || !this.periodValue || !this.yearValue) {
      this.toastr.error('Por favor selecciona periodo, año y componente', 'Datos incompletos');
      return;
    }

    this.isLoadingAI.set(true);
    this.streamedAnalysis.set('');

    // First get the distribution data from API
    this.statisticalService.getDistributionAnalysis(this.periodValue, this.yearValue, this.componentValue).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.length > 0) {
          const data = response.data[0];
          this.distributionData.set(data);

          // Extract outliers from distribution data
          const outliersData: OutlierDisplayData[] = (data.outliers?.details || []).map(outlier => ({
            studentId: outlier.studentId,
            studentName: outlier.studentName,
            score: outlier.score,
            zScore: outlier.zScore,
            deviationFromMean: outlier.deviationFromMean
          }));

          const atypicalData: OutlierDisplayData[] = (data.atypicalScores?.details || []).map(atypical => ({
            studentId: atypical.studentId,
            studentName: atypical.studentName,
            score: atypical.score,
            zScore: atypical.zScore,
            deviationFromMean: atypical.deviationFromMean,
            percentile: atypical.percentile
          }));

          this.outliers.set(outliersData);
          this.atypicalScores.set(atypicalData);

          // Now call AI analysis with real data
          this.analyzeWithAI(data);
        } else {
          this.toastr.error('No se encontraron datos para los filtros seleccionados', 'Sin datos');
          this.isLoadingAI.set(false);
        }
      },
      error: (error) => {
        console.error('Error loading distribution data:', error);
        this.toastr.error('Error al cargar datos estadísticos', 'Error');
        this.isLoadingAI.set(false);
      }
    });
  }

  analyzeWithAI(distributionData: DistributionAnalysisData): void {
    // Combine outliers and atypical scores for AI analysis
    const allOutliers = [
      ...this.outliers(),
      ...this.atypicalScores()
    ];

    this.aiAnalysisService.analyzeOutliers({
      component: this.componentValue,
      outliers: allOutliers.map(o => ({
        studentName: o.studentName,
        score: o.score,
        zScore: o.zScore
      })),
      statistics: {
        mean: distributionData.statistics.mean,
        standardDeviation: distributionData.statistics.standardDeviation
      }
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.analysisData.set(response.data);

          // Start streaming effect after a brief delay
          setTimeout(() => {
            this.startStreaming(response.data.analysis);
          }, 500);

          this.toastr.success('Análisis completado exitosamente', 'Éxito');
        } else {
          this.toastr.error(response.error || 'Error al generar el análisis', 'Error');
          this.isLoadingAI.set(false);
        }
      },
      error: (error) => {
        console.error('Error analyzing outliers with AI:', error);
        this.toastr.error('Error al comunicarse con el servicio de IA', 'Error');
        this.isLoadingAI.set(false);
      }
    });
  }

  startStreaming(text: string): void {
    let index = 0;
    const chunkSize = 3;
    const interval = setInterval(() => {
      if (index >= text.length) {
        clearInterval(interval);
        this.isLoadingAI.set(false);
        return;
      }

      const nextIndex = Math.min(index + chunkSize, text.length);
      this.streamedAnalysis.set(text.substring(0, nextIndex));
      index = nextIndex;
    }, 30);
  }

  reset(): void {
    this.analysisData.set(null);
    this.streamedAnalysis.set('');
    this.distributionData.set(null);
    this.outliers.set([]);
    this.atypicalScores.set([]);
  }

  isLoading(): boolean {
    return this.isLoadingData() || this.isLoadingAI();
  }

  getZScoreClass(zScore: number): string {
    const abs = Math.abs(zScore);
    if (abs >= 3) return 'text-red-600 dark:text-red-400 font-bold';
    if (abs >= 2) return 'text-orange-600 dark:text-orange-400 font-semibold';
    if (abs >= 1.5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  }

  getZScoreBackground(zScore: number): string {
    const abs = Math.abs(zScore);
    if (abs >= 3) return 'bg-red-50 dark:bg-red-900/20';
    if (abs >= 2) return 'bg-orange-50 dark:bg-orange-900/20';
    if (abs >= 1.5) return 'bg-yellow-50 dark:bg-yellow-900/20';
    return 'bg-gray-50 dark:bg-gray-900/20';
  }

  getOutlierType(): string {
    const outliersCount = this.outliers().length;
    const atypicalCount = this.atypicalScores().length;

    if (outliersCount > 0) return 'Método IQR';
    if (atypicalCount > 0) return 'Desviación Estándar';
    return 'No detectados';
  }

  getTotalOutliers(): number {
    return this.outliers().length + this.atypicalScores().length;
  }

  getMean(): number {
    return this.distributionData()?.statistics.mean || 0;
  }

  getStandardDeviation(): number {
    return this.distributionData()?.statistics.standardDeviation || 0;
  }

  getProviderInfo(): string {
    const metadata = this.analysisData()?.metadata;
    if (!metadata) return '';
    return `Generado por ${metadata.provider} usando ${metadata.model}`;
  }

  getTokenUsage(): string {
    const metadata = this.analysisData()?.metadata;
    if (!metadata?.usage) return '';
    return `${metadata.usage.totalTokens} tokens utilizados`;
  }

  isStreamingComplete(): boolean {
    return !this.isLoading() && this.streamedAnalysis().length > 0;
  }

  hasFormData(): boolean {
    return !this.isLoadingData() &&
      this.availablePeriods().length > 0 &&
      this.availableComponents().length > 0 &&
      !!this.periodValue &&
      !!this.yearValue &&
      !!this.componentValue;
  }
}
