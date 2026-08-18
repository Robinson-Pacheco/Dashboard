import { Component, inject, OnInit, effect, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType, ChartData } from 'chart.js';
import { toSignal } from '@angular/core/rxjs-interop';
import { DistributionAnalysisData, AtypicalScoreDetail } from '../../models/statistical-distribution.model';
import { StatisticalDistributionComponent } from '../../statistical-distribution.component';
import { DarkModeService } from '../../../../services/dark-mode';

@Component({
  selector: 'app-distribution-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BaseChartDirective],
  templateUrl: './distribution-view.component.html'
})
export class DistributionViewComponent implements OnInit {
  private parentComponent = inject(StatisticalDistributionComponent);
  private darkModeService = inject(DarkModeService);

  readonly AlertTriangle = AlertTriangle;
  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
  readonly Minus = Minus;

  analysisData = signal<DistributionAnalysisData | null>(null);
  componentsData = signal<any[]>([]);
  isDarkMode = toSignal(this.darkModeService.isDarkMode$, { initialValue: false });

  constructor() {
    effect(() => {
      const data = this.parentComponent.getDistributionData();
      console.log('DistributionViewComponent - Data received:', data);
      this.analysisData.set(data);
    });
  }

  ngOnInit(): void {}

  // Computed properties
  statistics = computed(() => this.analysisData()?.statistics);
  normalDistribution = computed(() => this.analysisData()?.normalDistribution);
  outliers = computed(() => this.analysisData()?.outliers);
  atypicalScores = computed(() => this.analysisData()?.atypicalScores);
  componentName = computed(() => this.analysisData()?.componente || '');
  quizName = computed(() => this.analysisData()?.quiz || '');
  totalStudents = computed(() => this.analysisData()?.totalStudents || 0);

  // Normal Distribution Chart Data
  normalDistChartData = computed<ChartConfiguration['data']>(() => {
    const dist = this.normalDistribution();
    if (!dist) return { labels: [], datasets: [] };

    return {
      labels: ['1σ (68%)', '2σ (95%)', '3σ (99.7%)'],
      datasets: [{
        label: 'Distribución Normal',
        data: [
          dist.withinOneStdDev.percentage,
          dist.withinTwoStdDev.percentage,
          dist.withinThreeStdDev.percentage
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.6)',
          'rgba(0, 92, 162, 0.6)',
          'rgba(83, 170, 225, 0.6)'
        ],
        borderColor: ['#10B981', '#005ca2', '#53aae1'],
        borderWidth: 2
      }]
    };
  });

  normalDistChartOptions = computed<ChartConfiguration['options']>(() => {
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

  // Statistics Chart Data (Polar Area Chart)
  statisticsChartData = computed<ChartData>(() => {
    const stats = this.statistics();
    if (!stats) return { labels: [], datasets: [] };

    // Normalized values for polar area chart (0-100 scale)
    const maxScore = stats.max || 100;
    const normalizeValue = (value: number) => ((value - stats.min) / (maxScore - stats.min)) * 100;

    return {
      labels: ['Media', 'Mediana', 'Moda', 'Q1', 'Q3', 'Rango'],
      datasets: [{
        label: 'Estadísticas',
        data: [
          normalizeValue(stats.mean),
          normalizeValue(stats.median),
          normalizeValue(stats.mode),
          normalizeValue(stats.q1),
          normalizeValue(stats.q3),
          normalizeValue(stats.range)
        ],
        backgroundColor: [
          'rgba(0, 92, 162, 0.6)',    // Azul institucional
          'rgba(16, 185, 129, 0.6)',  // Verde (éxito)
          'rgba(83, 170, 225, 0.6)',  // Azul celeste institucional
          'rgba(194, 53, 74, 0.6)',   // Rojo institucional
          'rgba(0, 74, 130, 0.6)',    // Azul oscuro institucional
          'rgba(45, 154, 217, 0.6)'   // Azul celeste oscuro
        ],
        borderColor: [
          '#005ca2',
          '#10B981',
          '#53aae1',
          '#C2354a',
          '#004a82',
          '#2d9ad9'
        ],
        borderWidth: 2
      }]
    };
  });

  statisticsChartOptions = computed<ChartConfiguration['options']>(() => {
    const isDark = this.isDarkMode();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: {
            color: isDark ? '#9CA3AF' : '#4B5563',
            font: {
              size: 12
            }
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            color: isDark ? '#9CA3AF' : '#4B5563',
            backdropColor: 'transparent'
          },
          grid: {
            color: isDark ? 'rgba(156, 163, 175, 0.2)' : 'rgba(156, 163, 175, 0.3)'
          },
          pointLabels: {
            color: isDark ? '#9CA3AF' : '#4B5563',
            font: {
              size: 11
            }
          }
        }
      }
    };
  });

  // Helper methods
  getZScoreClass(zScore: number): string {
    const absZScore = Math.abs(zScore);
    if (absZScore > 3) return 'text-red-600 dark:text-red-400';
    if (absZScore > 2) return 'text-orange-600 dark:text-orange-400';
    if (absZScore > 1) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  }

  getPercentileClass(percentile: number): string {
    if (percentile >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (percentile >= 75) return 'bg-utmach-blue-50 text-utmach-blue-700 dark:bg-utmach-blue-900 dark:text-utmach-blue-200';
    if (percentile >= 50) return 'bg-utmach-sky-50 text-utmach-sky-700 dark:bg-utmach-sky-900 dark:text-utmach-sky-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }

  getDeviationClass(deviation: number): string {
    if (deviation > 0) return 'text-green-600 dark:text-green-400';
    if (deviation < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  }
}
