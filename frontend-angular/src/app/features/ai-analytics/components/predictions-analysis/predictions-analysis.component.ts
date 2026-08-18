import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, TrendingUp, Sparkles, Loader2 } from 'lucide-angular';
import { AIAnalysisService } from '../../services/ai-analysis.service';
import { BIService } from '../../../dashboard/services/bi.service';
import { StatisticalDistributionService } from '../../../statistical-distribution/services/statistical-distribution.service';
import { PredictionData, HistoricalDataPoint } from '../../models/ai-analysis.models';
import { BITrend } from '../../../dashboard/models/bi.model';
import { DistributionAnalysisData } from '../../../statistical-distribution/models/statistical-distribution.model';
import { ToastrService } from 'ngx-toastr';
import { AiLoaderComponent } from '../../../../shared/components/ai-loader/ai-loader.component';
import { MarkdownPipe } from '../../../../shared/pipes/markdown.pipe';

@Component({
  selector: 'app-predictions-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, AiLoaderComponent, MarkdownPipe],
  templateUrl: './predictions-analysis.component.html'
})
export class PredictionsAnalysisComponent implements OnInit {
  readonly TrendingUp = TrendingUp;
  readonly Sparkles = Sparkles;
  readonly Loader2 = Loader2;

  private aiAnalysisService = inject(AIAnalysisService);
  private biService = inject(BIService);
  private statisticalService = inject(StatisticalDistributionService);
  private toastr = inject(ToastrService);

  // State
  isLoadingData = signal<boolean>(false);
  isLoadingAI = signal<boolean>(false);
  predictionData = signal<PredictionData | null>(null);

  // Form
  componentValue = '';
  periodsToPredictValue = 3;
  periodValue = '';
  yearValue: number | null = null;

  // Available options from API
  availablePeriods = signal<string[]>([]);
  availableYears = signal<number[]>([]);
  availableComponents = signal<string[]>([]);

  // Historical Data loaded from API
  historicalData = signal<HistoricalDataPoint[]>([]);
  streamedAnalysis = signal<string>('');

  // Loading messages
  loadingMessages = [
    'Obteniendo datos históricos...',
    'Analizando tendencias pasadas...',
    'Identificando patrones estacionales...',
    'Conectando con el servicio de IA...',
    'Generando predicciones...',
    'Calculando intervalos de confianza...'
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

          // Load components and historical data after setting defaults
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

          // Load historical trends
          this.loadHistoricalTrends();
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

  loadHistoricalTrends(): void {
    this.biService.getTrends().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const trendsArray = Array.isArray(response.data) ? response.data : [];

          if (trendsArray && trendsArray.length > 0) {
            // Convert BITrend to HistoricalDataPoint
            const historicalPoints: HistoricalDataPoint[] = trendsArray.map(trend => ({
              period: trend.period,
              mean: parseFloat(trend.averageScore) || 0,
              count: trend.totalApplications || 0
            }));

            this.historicalData.set(historicalPoints);
            this.isLoadingData.set(false);
          } else {
            this.historicalData.set([]);
            this.isLoadingData.set(false);
          }
        } else {
          this.isLoadingData.set(false);
        }
      },
      error: (error) => {
        console.error('Error loading historical trends:', error);
        this.toastr.error('Error al cargar datos históricos', 'Error');
        this.isLoadingData.set(false);
      }
    });
  }

  generatePredictions(): void {
    if (!this.componentValue) {
      this.toastr.error('Por favor selecciona un componente', 'Dato requerido');
      return;
    }

    if (this.historicalData().length < 2) {
      this.toastr.error('Se necesitan al menos 2 periodos históricos para generar predicciones', 'Datos insuficientes');
      return;
    }

    this.isLoadingAI.set(true);
    this.streamedAnalysis.set('');

    this.aiAnalysisService.predictAdmissions({
      component: this.componentValue,
      periodsToPredict: this.periodsToPredictValue,
      historicalData: this.historicalData()
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.predictionData.set(response.data);
          this.startStreaming(JSON.stringify(response.data, null, 2));
          this.toastr.success('Predicciones generadas exitosamente', 'Éxito');
        } else {
          this.toastr.error(response.error || 'Error al generar predicciones', 'Error');
          this.isLoadingAI.set(false);
        }
      },
      error: (error) => {
        console.error('Error generating predictions:', error);
        this.toastr.error('Error al comunicarse con el servicio de IA', 'Error');
        this.isLoadingAI.set(false);
      }
    });
  }

  startStreaming(text: string): void {
    // Stream predictions formatted as markdown
    const formattedText = this.formatPredictionsAsMarkdown(text);

    let index = 0;
    const chunkSize = 3;
    const interval = setInterval(() => {
      if (index >= formattedText.length) {
        clearInterval(interval);
        this.isLoadingAI.set(false);
        return;
      }

      const nextIndex = Math.min(index + chunkSize, formattedText.length);
      this.streamedAnalysis.set(formattedText.substring(0, nextIndex));
      index = nextIndex;
    }, 15);
  }

  formatPredictionsAsMarkdown(data: string): string {
    const predData = JSON.parse(data) as PredictionData;
    let markdown = `# Predicciones de Admisiones\n\n`;
    markdown += `**Componente:** ${predData.component}\n\n`;

    markdown += `## 📊 Tendencia Detectada\n\n`;
    const trendIcon = predData.trend === 'increasing' ? '↗️' : predData.trend === 'decreasing' ? '↘️' : '→';
    const trendText = predData.trend === 'increasing' ? 'Ascendente' : predData.trend === 'decreasing' ? 'Descendente' : 'Estable';
    markdown += `**Tendencia:** ${trendIcon} ${trendText}\n\n`;

    markdown += `## 🔮 Predicciones\n\n`;
    predData.predictions.forEach(pred => {
      const confidenceLevel = pred.confidence >= 80 ? '🟢 Alta' : pred.confidence >= 60 ? '🟡 Media' : '🔴 Baja';
      markdown += `### ${pred.period}\n`;
      markdown += `- **Promedio estimado:** ${pred.predictedMean.toFixed(2)}\n`;
      markdown += `- **Cantidad estimada:** ${pred.predictedCount} estudiantes\n`;
      markdown += `- **Confianza:** ${confidenceLevel} (${pred.confidence.toFixed(1)}%)\n\n`;
    });

    if (predData.recommendations.length > 0) {
      markdown += `## 💡 Recomendaciones\n\n`;
      predData.recommendations.forEach(rec => {
        markdown += `- ${rec}\n`;
      });
      markdown += `\n`;
    }

    return markdown;
  }

  reset(): void {
    this.predictionData.set(null);
    this.streamedAnalysis.set('');
    this.periodsToPredictValue = 3;
    this.loadHistoricalTrends();
  }

  isLoading(): boolean {
    return this.isLoadingData() || this.isLoadingAI();
  }

  getTrendClass(): string {
    const trend = this.predictionData()?.trend;
    switch (trend) {
      case 'increasing':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'decreasing':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      case 'stable':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900';
    }
  }

  getTrendIcon(): string {
    const trend = this.predictionData()?.trend;
    switch (trend) {
      case 'increasing':
        return '↗';
      case 'decreasing':
        return '↘';
      case 'stable':
        return '→';
      default:
        return '?';
    }
  }

  getTrendText(): string {
    const trend = this.predictionData()?.trend;
    switch (trend) {
      case 'increasing':
        return 'Tendencia Ascendente';
      case 'decreasing':
        return 'Tendencia Descendente';
      case 'stable':
        return 'Tendencia Estable';
      default:
        return 'Desconocido';
    }
  }

  getProviderInfo(): string {
    const metadata = this.predictionData()?.metadata;
    if (!metadata) return '';
    return `Generado por ${metadata.provider} usando ${metadata.model}`;
  }

  hasFormData(): boolean {
    return !this.isLoadingData() &&
      this.availablePeriods().length > 0 &&
      this.availableComponents().length > 0 &&
      this.historicalData().length >= 2;
  }

  isStreamingComplete(): boolean {
    return !this.isLoading() && this.streamedAnalysis().length > 0;
  }
}
