import { Component, Input, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Target, CheckCircle2, XCircle, MinusCircle, Award, Users, AlertTriangle, TrendingUp } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { toSignal } from '@angular/core/rxjs-interop';
import { ResponseStrategyData, ResponseStrategyByComponent, ResponseStrategyByStrategy } from '../../models/advanced-analytics.model';
import { AdvancedAnalyticsComponent } from '../../advanced-analytics.component';
import { DarkModeService } from '../../../../services/dark-mode';

@Component({
  selector: 'app-response-strategy',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, BaseChartDirective],
  templateUrl: './response-strategy.component.html'
})
export class ResponseStrategyComponent implements OnInit {
  private parentComponent = inject(AdvancedAnalyticsComponent);
  private darkModeService = inject(DarkModeService);

  readonly Target = Target;
  readonly CheckCircle2 = CheckCircle2;
  readonly XCircle = XCircle;
  readonly MinusCircle = MinusCircle;
  readonly Award = Award;
  readonly Users = Users;
  readonly AlertTriangle = AlertTriangle;
  readonly TrendingUp = TrendingUp;

  @Input() set data(value: ResponseStrategyData | null) {
    this.analysisData.set(value);
  }

  analysisData = signal<ResponseStrategyData | null>(null);
  isDarkMode = toSignal(this.darkModeService.isDarkMode$, { initialValue: false });

  constructor() {
    // Subscribe to parent data changes in constructor (injection context)
    effect(() => {
      const data = this.parentComponent.getResponseStrategyData();
      this.analysisData.set(data);
    });
  }

  ngOnInit(): void {
    // OnInit hook if needed for other initialization
  }

  byComponent = computed(() => this.analysisData()?.byComponent || []);
  byStrategy = computed(() => this.analysisData()?.byStrategy || []);
  summary = computed(() => this.analysisData()?.summary || null);

  // Sorted strategies by score
  sortedStrategies = computed(() => 
    [...this.byStrategy()].sort((a, b) => b.avgScore - a.avgScore)
  );

  // Heatmap data: matriz de componentes x estrategias
  heatmapData = computed(() => {
    const components = this.byComponent();
    const strategies = this.byStrategy();
    
    if (components.length === 0 || strategies.length === 0) return null;

    // Crear matriz con todos los componentes y estrategias
    const matrix = components.map(component => ({
      component: component.component,
      strategies: strategies.map(strategy => ({
        strategyType: strategy.strategyType,
        // Calcular un score de efectividad basado en correctas/total
        effectiveness: this.calculateEffectiveness(component, strategy),
        avgScore: strategy.avgScore
      }))
    }));

    return matrix;
  });

  // Calcular efectividad (simulada - en realidad necesitarías datos cruzados del backend)
  private calculateEffectiveness(component: ResponseStrategyByComponent, strategy: ResponseStrategyByStrategy): number {
    // Simulación: usar el promedio de correctas del componente ponderado por la estrategia
    const componentEfficiency = component.avgCorrect / (component.avgCorrect + component.avgIncorrect + component.avgUnanswered);
    const strategyEfficiency = strategy.avgCorrect / (strategy.avgCorrect + strategy.avgIncorrect + strategy.avgUnanswered);
    return (componentEfficiency + strategyEfficiency) / 2 * 100;
  }

  // Obtener color del heatmap basado en efectividad
  getHeatmapColor(effectiveness: number): string {
    if (effectiveness >= 75) return 'bg-green-600 dark:bg-green-500';
    if (effectiveness >= 60) return 'bg-green-400 dark:bg-green-600';
    if (effectiveness >= 45) return 'bg-yellow-400 dark:bg-yellow-500';
    if (effectiveness >= 30) return 'bg-orange-400 dark:bg-orange-500';
    return 'bg-red-500 dark:bg-red-600';
  }

  // Obtener intensidad de opacidad
  getHeatmapOpacity(effectiveness: number): string {
    const opacity = Math.min(Math.max(effectiveness / 100, 0.3), 1);
    return opacity.toFixed(2);
  }

  getStrategyClass(strategyType: string): string {
    switch (strategyType) {
      case 'Balanced': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Aggressive': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Conservative': return 'bg-utmach-blue-50 text-utmach-blue-700 dark:bg-utmach-blue-900 dark:text-utmach-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  getStrategyBorderClass(strategyType: string): string {
    switch (strategyType) {
      case 'Balanced': return 'border-green-500';
      case 'Aggressive': return 'border-orange-500';
      case 'Conservative': return 'border-utmach-blue';
      default: return 'border-gray-500';
    }
  }

  getStrategyBgClass(strategyType: string): string {
    switch (strategyType) {
      case 'Balanced': return 'bg-green-100 dark:bg-green-900';
      case 'Aggressive': return 'bg-orange-100 dark:bg-orange-900';
      case 'Conservative': return 'bg-utmach-blue-50 dark:bg-utmach-blue-900';
      default: return 'bg-gray-100 dark:bg-gray-900';
    }
  }

  getStrategyIconColor(strategyType: string): string {
    switch (strategyType) {
      case 'Balanced': return 'text-green-600 dark:text-green-300';
      case 'Aggressive': return 'text-orange-600 dark:text-orange-300';
      case 'Conservative': return 'text-utmach-blue dark:text-utmach-sky';
      default: return 'text-gray-600 dark:text-gray-300';
    }
  }

  // Component Performance Chart
  componentPerformanceChartData = computed<ChartConfiguration['data']>(() => {
    const data = this.byComponent();
    return {
      labels: data.map(c => c.component),
      datasets: [
        {
          label: 'Correctas',
          data: data.map(c => c.avgCorrect),
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
          borderColor: '#22C55E',
          borderWidth: 2
        },
        {
          label: 'Incorrectas',
          data: data.map(c => c.avgIncorrect),
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
          borderColor: '#EF4444',
          borderWidth: 2
        },
        {
          label: 'Sin Responder',
          data: data.map(c => c.avgUnanswered),
          backgroundColor: 'rgba(156, 163, 175, 0.5)',
          borderColor: '#9CA3AF',
          borderWidth: 2
        }
      ]
    };
  });

  componentPerformanceChartOptions = computed<ChartConfiguration['options']>(() => {
    const isDark = this.isDarkMode();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: isDark ? '#9CA3AF' : '#4B5563'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: isDark ? '#9CA3AF' : '#4B5563'
          },
          grid: {
            color: isDark ? 'rgba(156, 163, 175, 0.1)' : 'rgba(156, 163, 175, 0.2)'
          }
        },
        x: {
          ticks: {
            color: isDark ? '#9CA3AF' : '#4B5563'
          },
          grid: {
            color: isDark ? 'rgba(156, 163, 175, 0.1)' : 'rgba(156, 163, 175, 0.2)'
          }
        }
      }
    };
  });

  // Strategy Comparison Chart
  strategyComparisonChartData = computed<ChartConfiguration['data']>(() => {
    const data = this.sortedStrategies();
    return {
      labels: data.map(s => s.strategyType),
      datasets: [{
        label: 'Puntaje Promedio',
        data: data.map(s => s.avgScore),
        backgroundColor: data.map(s => {
          if (s.strategyType === 'Balanced') return 'rgba(16, 185, 129, 0.5)';
          if (s.strategyType === 'Aggressive') return 'rgba(194, 53, 74, 0.5)';
          return 'rgba(0, 92, 162, 0.5)';
        }),
        borderColor: data.map(s => {
          if (s.strategyType === 'Balanced') return '#10B981';
          if (s.strategyType === 'Aggressive') return '#C2354a';
          return '#005ca2';
        }),
        borderWidth: 2
      }]
    };
  });

  strategyComparisonChartOptions = computed<ChartConfiguration['options']>(() => {
    const isDark = this.isDarkMode();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: isDark ? '#9CA3AF' : '#4B5563'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: isDark ? '#9CA3AF' : '#4B5563'
          },
          grid: {
            color: isDark ? 'rgba(156, 163, 175, 0.1)' : 'rgba(156, 163, 175, 0.2)'
          }
        },
        x: {
          ticks: {
            color: isDark ? '#9CA3AF' : '#4B5563'
          },
          grid: {
            color: isDark ? 'rgba(156, 163, 175, 0.1)' : 'rgba(156, 163, 175, 0.2)'
          }
        }
      }
    };
  });
}
