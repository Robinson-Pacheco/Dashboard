import { Component, Input, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { toSignal } from '@angular/core/rxjs-interop';
import { DifficultyAnalysisData } from '../../models/data-mining.model';
import { ReportsComponent } from '../../reports.component';
import { DarkModeService } from '../../../../services/dark-mode';

@Component({
  selector: 'app-difficulty-analysis',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BaseChartDirective],
  templateUrl: './difficulty-analysis.component.html'
})
export class DifficultyAnalysisComponent implements OnInit {
  private parentComponent = inject(ReportsComponent);
  private darkModeService = inject(DarkModeService);

  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
  readonly Minus = Minus;
  readonly BarChart3 = BarChart3;

  @Input() set data(value: DifficultyAnalysisData | null) {
    this.analysisData.set(value);
  }

  analysisData = signal<DifficultyAnalysisData | null>(null);
  isDarkMode = toSignal(this.darkModeService.isDarkMode$, { initialValue: false });

  constructor() {
    // Subscribe to parent data changes in constructor (injection context)
    effect(() => {
      const data = this.parentComponent.getDifficultyData();
      this.analysisData.set(data);
    });
  }

  ngOnInit(): void {
    // OnInit hook if needed for other initialization
  }

  components = computed(() => this.analysisData()?.components || []);
  summary = computed(() => this.analysisData()?.summary || null);

  getDifficultyLevelClass(level: string): string {
    switch (level) {
      case 'Muy Difícil': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Difícil': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Moderado': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Fácil': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  getDifficultyIcon(level: string) {
    switch (level) {
      case 'Muy Difícil':
      case 'Difícil':
        return TrendingUp;
      case 'Moderado':
        return Minus;
      case 'Fácil':
        return TrendingDown;
      default:
        return Minus;
    }
  }

  getDifficultyColor(level: string): string {
    switch (level) {
      case 'Muy Difícil': return '#DC2626';
      case 'Difícil': return '#F97316';
      case 'Moderado': return '#FACC15';
      case 'Fácil': return '#10B981';
      default: return '#9CA3AF';
    }
  }

  // Success Rate Chart (Doughnut)
  successRateChartData = computed<ChartConfiguration['data']>(() => {
    const data = this.components();
    return {
      labels: data.map(c => c.component),
      datasets: [{
        label: 'Tasa de Éxito (%)',
        data: data.map(c => c.avgSuccessRate),
        backgroundColor: [
          'rgba(0, 92, 162, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(83, 170, 225, 0.7)',
          'rgba(194, 53, 74, 0.7)'
        ],
        borderColor: [
          '#005ca2',
          '#10B981',
          '#53aae1',
          '#C2354a'
        ],
        borderWidth: 2
      }]
    };
  });

  successRateChartOptions = computed<ChartConfiguration['options']>(() => {
    const isDark = this.isDarkMode();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: isDark ? '#9CA3AF' : '#4B5563',
            padding: 15,
            font: {
              size: 12
            }
          }
        }
      }
    };
  });

  // Difficulty Index Chart (Bar)
  difficultyIndexChartData = computed<ChartConfiguration['data']>(() => {
    const data = this.components();
    return {
      labels: data.map(c => c.component),
      datasets: [{
        label: 'Índice de Dificultad (%)',
        data: data.map(c => c.difficultyIndex),
        backgroundColor: data.map(c => {
          const color = this.getDifficultyColor(c.difficultyLevel);
          return color + '80'; // Add opacity
        }),
        borderColor: data.map(c => this.getDifficultyColor(c.difficultyLevel)),
        borderWidth: 2
      }]
    };
  });

  difficultyIndexChartOptions = computed<ChartConfiguration['options']>(() => {
    const isDark = this.isDarkMode();
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
          max: 100,
          ticks: {
            color: isDark ? '#9CA3AF' : '#4B5563',
            callback: (value: string | number) => value + '%'
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

  // Comparative Chart (Success vs Difficulty)
  comparativeChartData = computed<ChartConfiguration['data']>(() => {
    const data = this.components();
    return {
      labels: data.map(c => c.component),
      datasets: [
        {
          label: 'Tasa de Éxito (%)',
          data: data.map(c => c.avgSuccessRate),
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: '#10B981',
          borderWidth: 2
        },
        {
          label: 'Índice de Dificultad (%)',
          data: data.map(c => c.difficultyIndex),
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
          borderColor: '#EF4444',
          borderWidth: 2
        }
      ]
    };
  });

  comparativeChartOptions = computed<ChartConfiguration['options']>(() => {
    const isDark = this.isDarkMode();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: isDark ? '#9CA3AF' : '#4B5563',
            padding: 15
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            color: isDark ? '#9CA3AF' : '#4B5563',
            callback: (value: string | number) => value + '%'
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
