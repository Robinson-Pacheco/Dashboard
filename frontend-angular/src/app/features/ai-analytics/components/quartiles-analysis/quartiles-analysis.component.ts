import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Box, TrendingUp, AlertTriangle, Sparkles, Loader2 } from 'lucide-angular';
import { AIAnalysisService } from '../../services/ai-analysis.service';
import { StatisticalDistributionService } from '../../../statistical-distribution/services/statistical-distribution.service';
import { QuartilesAnalysisData, QuartilesStatistics } from '../../models/ai-analysis.models';
import { DistributionAnalysisData } from '../../../statistical-distribution/models/statistical-distribution.model';
import { ToastrService } from 'ngx-toastr';
import { AiLoaderComponent } from '../../../../shared/components/ai-loader/ai-loader.component';
import { StreamingService } from '../../../../shared/services/streaming.service';
import { MarkdownPipe } from '../../../../shared/pipes/markdown.pipe';

@Component({
  selector: 'app-quartiles-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, AiLoaderComponent, MarkdownPipe],
  templateUrl: './quartiles-analysis.component.html'
})
export class QuartilesAnalysisComponent implements OnInit {
  readonly Box = Box;
  readonly TrendingUp = TrendingUp;
  readonly AlertTriangle = AlertTriangle;
  readonly Sparkles = Sparkles;
  readonly Loader2 = Loader2;

  private aiAnalysisService = inject(AIAnalysisService);
  private statisticalService = inject(StatisticalDistributionService);
  private toastr = inject(ToastrService);
  private streamingService = inject(StreamingService);

  isLoadingData = signal<boolean>(false);
  isLoadingAI = signal<boolean>(false);
  analysisData = signal<QuartilesAnalysisData | null>(null);
  streamedAnalysis = signal<string>('');
  distributionData = signal<DistributionAnalysisData | null>(null);

  loadingMessages = [
    'Obteniendo datos estadísticos...',
    'Cargando información de cuartiles...',
    'Preparando análisis...',
    'Conectando con el servicio de IA...',
    'Generando interpretación educativa...',
    'Elaborando recomendaciones pedagógicas...'
  ];

  componentValue = '';
  periodValue = '';
  yearValue: number | null = null;

  availablePeriods = signal<string[]>([]);
  availableYears = signal<number[]>([]);
  availableComponents = signal<string[]>([]);

  ngOnInit(): void {
    this.loadPeriodsYears();
  }

  loadPeriodsYears(): void {
    this.isLoadingData.set(true);

    this.statisticalService.getPeriodsYears().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.availablePeriods.set(response.data.periods || []);
          const uniqueYears = [...new Set(response.data.years || [])] as number[];
          this.availableYears.set(uniqueYears);

          if (response.data.periods.length > 0) {
            this.periodValue = response.data.periods[response.data.periods.length - 1];
          }
          if (uniqueYears.length > 0) {
            this.yearValue = Math.max(...uniqueYears);
          }

          this.loadAvailableComponents();
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
    if (!this.periodValue || !this.yearValue) return;

    this.statisticalService.getAvailableComponents(this.periodValue, this.yearValue).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const components = response.data.map(c => c.componente);
          this.availableComponents.set(components);

          if (components.length > 0) {
            this.componentValue = components[0];
          }

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

    this.statisticalService.getDistributionAnalysis(this.periodValue, this.yearValue, this.componentValue).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.length > 0) {
          const data = response.data[0];
          this.distributionData.set(data);

          const statistics: QuartilesStatistics = {
            q1: data.statistics.q1,
            median: data.statistics.median,
            q3: data.statistics.q3,
            iqr: data.statistics.iqr,
            min: data.statistics.min,
            max: data.statistics.max
          };

          this.analyzeWithAI(statistics);
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

  analyzeWithAI(statistics: QuartilesStatistics): void {
    this.aiAnalysisService.analyzeQuartiles({
      component: this.componentValue,
      period: this.periodValue,
      year: this.yearValue!,
      statistics
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.analysisData.set(response.data);

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
        console.error('Error analyzing quartiles with AI:', error);
        this.toastr.error('Error al comunicarse con el servicio de IA', 'Error');
        this.isLoadingAI.set(false);
      }
    });
  }

  startStreaming(text: string): void {
    this.streamingService.streamTextByWord(
      text,
      (streamedText) => {
        this.streamedAnalysis.set(streamedText);
      },
      {
        delayMs: 30,
        onComplete: () => {
          this.isLoadingAI.set(false);
        }
      }
    );
  }

  reset(): void {
    this.analysisData.set(null);
    this.streamedAnalysis.set('');
    this.distributionData.set(null);
  }

  onFiltersChange(): void {
    this.loadAvailableComponents();
  }

  isLoading(): boolean {
    return this.isLoadingData() || this.isLoadingAI();
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
