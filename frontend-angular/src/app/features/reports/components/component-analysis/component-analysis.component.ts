import { Component, Input, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertTriangle, ChevronDown, ChevronUp, Info } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { AgCharts } from 'ag-charts-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { ComponentAnalysisData, ComponentAnalysisItem, Recommendation } from '../../models/data-mining.model';
import { ReportsComponent } from '../../reports.component';
import { DarkModeService } from '../../../../services/dark-mode';

@Component({
  selector: 'app-component-analysis',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BaseChartDirective, AgCharts],
  templateUrl: './component-analysis.component.html'
})
export class ComponentAnalysisComponent implements OnInit {
  private parentComponent = inject(ReportsComponent);
  private darkModeService = inject(DarkModeService);

  readonly AlertTriangle = AlertTriangle;
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;
  readonly Info = Info;

  @Input() set data(value: ComponentAnalysisData | null) {
    this.analysisData.set(value);
  }

  analysisData = signal<ComponentAnalysisData | null>(null);
  isDarkMode = toSignal(this.darkModeService.isDarkMode$, { initialValue: false });

  constructor() {
    // Subscribe to parent data changes in constructor (injection context)
    effect(() => {
      const data = this.parentComponent.getComponentData();
      this.analysisData.set(data);
    });
  }

  ngOnInit(): void {
    // OnInit hook if needed for other initialization
  }
  expandedRecommendations = signal<Set<number>>(new Set());

  components = computed(() => this.analysisData()?.components || []);
  summary = computed(() => this.analysisData()?.summary || null);
  overallAverage = computed(() => this.analysisData()?.overallAverage || 0);

  toggleRecommendations(index: number): void {
    const expanded = new Set(this.expandedRecommendations());
    if (expanded.has(index)) {
      expanded.delete(index);
    } else {
      expanded.add(index);
    }
    this.expandedRecommendations.set(expanded);
  }

  isRecommendationExpanded(index: number): boolean {
    return this.expandedRecommendations().has(index);
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Crítica': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Alta': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Media': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Baja': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  getPerformanceLevelClass(level: string): string {
    switch (level) {
      case 'Excelente': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Bueno': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Regular': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Bajo': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  getVariabilityClass(variability: string): string {
    switch (variability) {
      case 'Baja': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Media': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Alta': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  chartData = computed<ChartConfiguration['data']>(() => {
    const data = this.components();
    return {
      labels: data.map(c => c.component),
      datasets: [{
        label: 'Rendimiento Promedio (%)',
        data: data.map(c => c.avgPerformance),
        backgroundColor: 'rgba(0, 92, 162, 0.5)',
        borderColor: '#005ca2',
        borderWidth: 2
      }]
    };
  });

  chartOptions = computed<ChartConfiguration['options']>(() => {
    const isDark = this.isDarkMode();
    const textColor = isDark ? '#F3F4F6' : '#374151';
    const gridColor = isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)';
    
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            color: textColor
          },
          grid: {
            color: gridColor
          }
        },
        x: {
          ticks: {
            color: textColor
          },
          grid: {
            color: gridColor
          }
        }
      }
    };
  });

  // Performance Distribution Chart
  performanceDistributionChartData = computed<ChartConfiguration['data']>(() => {
    const data = this.components();
    const levels = ['Excelente', 'Bueno', 'Regular', 'Bajo'];
    const counts = levels.map(level => 
      data.filter(c => c.performanceLevel === level).length
    );
    
    return {
      labels: levels,
      datasets: [{
        data: counts,
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',
          'rgba(0, 92, 162, 0.7)',
          'rgba(83, 170, 225, 0.7)',
          'rgba(194, 53, 74, 0.7)'
        ],
        borderColor: ['#10B981', '#005ca2', '#53aae1', '#C2354a'],
        borderWidth: 2
      }]
    };
  });

  performanceDistributionChartOptions = computed<ChartConfiguration['options']>(() => {
    const isDark = this.isDarkMode();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: isDark ? '#F3F4F6' : '#374151',
            padding: 15
          }
        }
      }
    };
  });

  // Variability Comparison Chart
  variabilityChartData = computed<ChartConfiguration['data']>(() => {
    const data = this.components();
    
    return {
      labels: data.map(c => c.component),
      datasets: [{
        label: 'Desviación Estándar',
        data: data.map(c => c.stdDev),
        backgroundColor: data.map(c => {
          if (c.variability === 'Alta') return 'rgba(194, 53, 74, 0.5)';
          if (c.variability === 'Media') return 'rgba(83, 170, 225, 0.5)';
          return 'rgba(16, 185, 129, 0.5)';
        }),
        borderColor: data.map(c => {
          if (c.variability === 'Alta') return '#C2354a';
          if (c.variability === 'Media') return '#53aae1';
          return '#10B981';
        }),
        borderWidth: 2
      }]
    };
  });

  variabilityChartOptions = computed<ChartConfiguration['options']>(() => {
    const isDark = this.isDarkMode();
    const textColor = isDark ? '#F3F4F6' : '#374151';
    const gridColor = isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)';

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColor
          },
          grid: {
            color: gridColor
          }
        },
        x: {
          ticks: {
            color: textColor
          },
          grid: {
            color: gridColor
          }
        }
      }
    };
  });

  // Box Plot Chart - Using AG Charts for native box plot support
  boxPlotOptions = computed<any>(() => {
    const data = this.components();
    const isDark = this.isDarkMode();

    return {
      autoSize: true,
      title: {
        text: 'Box Plot - Distribución Estadística por Componente',
        fontSize: 18,
        color: isDark ? '#E5E7EB' : '#111827'
      },
      subtitle: {
        text: 'Análisis de cuartiles y outliers del rendimiento',
        fontSize: 14,
        color: isDark ? '#9CA3AF' : '#6B7280'
      },
      data: data.map(c => ({
        component: c.component,
        min: c.minPerformance,
        q1: c.q1,
        median: c.median,
        q3: c.q3,
        max: c.maxPerformance
      })),
      series: [
        {
          type: 'box-plot',
          yName: 'Rendimiento (%)',
          xKey: 'component',
          minKey: 'min',
          q1Key: 'q1',
          medianKey: 'median',
          q3Key: 'q3',
          maxKey: 'max',
          fill: '#005ca2',
          stroke: '#004a82',
          whisker: {
            stroke: isDark ? '#9CA3AF' : '#6B7280',
            strokeWidth: 2
          },
          tooltip: {
            renderer: (params: any) => {
              const item = this.components()[params.datumIndex];
              return {
                title: params.datum[params.xKey],
                content: [
                  `Mínimo: ${item.minPerformance}%`,
                  `Q1 (25%): ${item.q1}%`,
                  `Mediana (50%): ${item.median}%`,
                  `Q3 (75%): ${item.q3}%`,
                  `Máximo: ${item.maxPerformance}%`
                ].join('\n')
              };
            }
          }
        }
      ],
      axes: [
        {
          type: 'category',
          position: 'bottom',
          title: {
            text: 'Componente',
            fontSize: 14,
            color: isDark ? '#E5E7EB' : '#374151'
          },
          label: {
            color: isDark ? '#FFFFFF' : '#111827',
            fontSize: 12,
            fontWeight: 'bold',
            rotation: 0
          }
        },
        {
          type: 'number',
          position: 'left',
          title: {
            text: 'Rendimiento (%)',
            fontSize: 14,
            color: isDark ? '#E5E7EB' : '#374151'
          },
          label: {
            color: isDark ? '#FFFFFF' : '#111827',
            fontSize: 12
          },
          min: 0,
          max: 100
        }
      ],
      legend: {
        enabled: false
      },
      background: {
        visible: false
      },
      theme: isDark ? 'ag-default-dark' : 'ag-default'
    };
  });

  // Get quartile statistics for display in cards
  getQuartileDisplay(item: ComponentAnalysisItem): { min: number; q1: number; median: number; q3: number; max: number } {
    return {
      min: item.minPerformance,
      q1: item.q1,
      median: item.median,
      q3: item.q3,
      max: item.maxPerformance
    };
  }

  // Get count of outliers
  getOutlierCount(item: ComponentAnalysisItem): number {
    return item.outliers?.length || 0;
  }

  // Check if has outliers
  hasOutliers(item: ComponentAnalysisItem): boolean {
    return item.outliers && item.outliers.length > 0;
  }

  // Get outliers display text
  getOutliersDisplay(item: ComponentAnalysisItem): string {
    if (!this.hasOutliers(item)) return 'Ninguno';
    return item.outliers.map(o => o + '%').join(', ');
  }

  // Mini Box Plot Visual Helpers
  getBoxPlotStyle(item: ComponentAnalysisItem): string {
    return 'width: 40px; height: 100%; position: relative;';
  }

  getWhiskerTopPercent(item: ComponentAnalysisItem): number {
    return 100 - item.maxPerformance;
  }

  getWhiskerBottomPercent(item: ComponentAnalysisItem): number {
    return item.minPerformance;
  }

  getBoxTopPercent(item: ComponentAnalysisItem): number {
    return 100 - item.q3;
  }

  getBoxHeightPercent(item: ComponentAnalysisItem): number {
    return item.q3 - item.q1;
  }

  getMedianTopPercent(item: ComponentAnalysisItem): number {
    return 100 - item.median;
  }
}
