import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, BarChart3, Lightbulb, Send, Loader2, Trash2, Sparkles } from 'lucide-angular';
import { AIAnalysisService } from '../../services/ai-analysis.service';
import { ChartConfig } from '../../models/ai-analysis.models';
import { ToastrService } from 'ngx-toastr';
import { MarkdownPipe } from '../../../../shared/pipes/markdown.pipe';
import { AiLoaderComponent } from '../../../../shared/components/ai-loader/ai-loader.component';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-ai-charts',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, MarkdownPipe, AiLoaderComponent, BaseChartDirective],
  templateUrl: './ai-charts.component.html'
})
export class AiChartsComponent {
  readonly BarChart3 = BarChart3;
  readonly Lightbulb = Lightbulb;
  readonly Send = Send;
  readonly Loader2 = Loader2;
  readonly Trash2 = Trash2;
  readonly Sparkles = Sparkles;

  private aiAnalysisService = inject(AIAnalysisService);
  private toastr = inject(ToastrService);

  prompt = signal<string>('');
  isGenerating = signal<boolean>(false);

  chartConfig = signal<ChartConfig | null>(null);
  chartData = signal<ChartConfiguration['data'] | null>(null);
  chartOptions = signal<ChartConfiguration['options'] | null>(null);
  analysisText = signal<string>('');
  errorMessage = signal<string>('');

  promptSuggestions = [
    '¿Cuántos estudiantes con discapacidad hay y por qué tipo?',
    'Rendimiento promedio: Estudiantes con discapacidad vs General',
    'Distribución de postulantes por tipo de colegio',
    'Top 10 carreras con mayor puntaje promedio',
    'Distribución de estudiantes por tipo de institución',
    'Comparativa de rendimiento por género'
  ];

  selectSuggestion(suggestion: string): void {
    this.prompt.set(suggestion);
  }

  generate(): void {
    const promptText = this.prompt().trim();
    if (!promptText) {
      this.toastr.error('Ingresa una descripción del gráfico que deseas generar', 'Prompt requerido');
      return;
    }

    this.isGenerating.set(true);
    this.chartConfig.set(null);
    this.chartData.set(null);
    this.chartOptions.set(null);
    this.analysisText.set('');
    this.errorMessage.set('');

    this.aiAnalysisService.generateChart({ prompt: promptText }).subscribe({
      next: (response) => {
        this.isGenerating.set(false);

        if (!response.success) {
          this.errorMessage.set(response.error || 'Error desconocido');
          this.toastr.error('Error al generar el gráfico', 'Error');
          return;
        }

        this.analysisText.set(response.data.text || '');

        if (response.data.chart) {
          try {
            this.applyChartConfig(response.data.chart);
            this.toastr.success('Gráfico generado exitosamente', 'Éxito');
          } catch (e: any) {
            console.error('Error applying chart config:', e, 'Raw chart data:', JSON.stringify(response.data.chart));
            this.errorMessage.set('El gráfico no pudo renderizarse correctamente. El análisis textual está disponible.');
            this.toastr.warning('El análisis se generó pero la estructura del gráfico no pudo renderizarse', 'Advertencia');
          }
        } else {
          this.toastr.success('Análisis generado (sin gráfico)', 'Completado');
        }
      },
      error: (error) => {
        console.error('Error generating chart:', error);
        this.isGenerating.set(false);
        this.errorMessage.set('Error al comunicarse con el servicio de IA');
        this.toastr.error('Error al comunicarse con el servicio de IA', 'Error');
      }
    });
  }

  private applyChartConfig(config: ChartConfig): void {
    if (!config || !config.data || !Array.isArray(config.data.labels) || !Array.isArray(config.data.datasets) || config.data.datasets.length === 0) {
      console.warn('Invalid chart config - missing data/labels/datasets:', config);
      throw new Error('Estructura de datos del gráfico inválida');
    }

    const chartType = (config.type || 'bar').toLowerCase();
    const validatedType = ['bar', 'line', 'pie', 'doughnut', 'radar', 'polararea'].includes(chartType) ? chartType : 'bar';
    const isPieOrDoughnut = validatedType === 'pie' || validatedType === 'doughnut';

    this.chartConfig.set({
      ...config,
      type: validatedType as any
    });

    const modernPalette = [
      '#4F46E5', '#0284C7', '#7C3AED', '#EC4899', '#10B981',
      '#F59E0B', '#06B6D4', '#8B5CF6', '#EF4444', '#34D399',
      '#F472B6', '#FB923C', '#22D3EE', '#6366F1', '#A78BFA'
    ];

    const datasets = config.data.datasets.map((ds, idx) => {
      const dataLen = (ds.data || []).length;
      let bgColors: string[] | string;

      if (isPieOrDoughnut || dataLen > 1) {
        if (Array.isArray(ds.backgroundColor) && ds.backgroundColor.length >= dataLen) {
          bgColors = ds.backgroundColor;
        } else {
          bgColors = modernPalette.slice(0, dataLen);
          // Loop colors if length exceeds palette
          while (bgColors.length < dataLen) {
            bgColors.push(modernPalette[bgColors.length % modernPalette.length]);
          }
        }
      } else {
        bgColors = ds.backgroundColor || modernPalette[idx % modernPalette.length];
      }

      return {
        label: ds.label || config.title || 'Estudiantes',
        data: ds.data || [],
        backgroundColor: bgColors,
        borderColor: ds.borderColor || (Array.isArray(bgColors) ? bgColors[0] : bgColors),
        borderWidth: isPieOrDoughnut ? 2 : 1,
        fill: ds.fill ?? (validatedType === 'line' ? false : true)
      };
    });

    this.chartData.set({
      labels: config.data.labels,
      datasets: datasets
    });

    const isNonScalable = isPieOrDoughnut;

    this.chartOptions.set({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom' as const,
          labels: {
            usePointStyle: true,
            boxWidth: 10,
            font: { size: 12, family: 'Inter, system-ui, sans-serif' }
          }
        },
        title: {
          display: !!(config.title || config.data.datasets[0]?.label),
          text: config.title || config.data.datasets[0]?.label || 'Visualización de Datos',
          font: { size: 15, weight: 'bold', family: 'Inter, system-ui, sans-serif' }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: { size: 13, weight: 'bold' },
          bodyFont: { size: 12 },
          padding: 10,
          cornerRadius: 6
        }
      },
      scales: isNonScalable ? undefined : {
        x: {
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(156, 163, 175, 0.15)' }
        }
      }
    });
  }

  getChartTitle(): string {
    return this.chartConfig()?.title || this.chartConfig()?.data?.datasets?.[0]?.label || 'Gráfico generado';
  }

  getChartType(): string {
    return (this.chartConfig()?.type || 'bar').toUpperCase();
  }

  reset(): void {
    this.chartConfig.set(null);
    this.chartData.set(null);
    this.chartOptions.set(null);
    this.analysisText.set('');
    this.errorMessage.set('');
    this.isGenerating.set(false);
  }
}
