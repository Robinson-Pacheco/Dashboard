import { Component, inject, OnInit, effect, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { toSignal } from '@angular/core/rxjs-interop';
import { ComparativeAnalysisData } from '../../models/statistical-distribution.model';
import { StatisticalDistributionComponent } from '../../statistical-distribution.component';
import { DarkModeService } from '../../../../services/dark-mode';

@Component({
  selector: 'app-comparative-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BaseChartDirective],
  templateUrl: './comparative-view.component.html'
})
export class ComparativeViewComponent implements OnInit {
  private parentComponent = inject(StatisticalDistributionComponent);
  private darkModeService = inject(DarkModeService);

  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
  readonly Minus = Minus;
  readonly BarChart3 = BarChart3;

  comparativeData = signal<ComparativeAnalysisData | null>(null);
  isDarkMode = toSignal(this.darkModeService.isDarkMode$, { initialValue: false });

  constructor() {
    effect(() => {
      const data = this.parentComponent.getComparativeData();
      this.comparativeData.set(data);
    });
  }

  ngOnInit(): void {}

  // Computed properties
  componente = computed(() => this.comparativeData()?.componente || '');
  period1 = computed(() => this.comparativeData()?.comparison?.period1);
  period2 = computed(() => this.comparativeData()?.comparison?.period2);
  differences = computed(() => this.comparativeData()?.comparison?.differences);

  // Statistics Comparison Chart
  comparisonChartData = computed<ChartConfiguration['data']>(() => {
    const p1 = this.period1();
    const p2 = this.period2();
    if (!p1 || !p2) return { labels: [], datasets: [] };

    return {
      labels: ['Media', 'Mediana', 'Desv. Estándar'],
      datasets: [
        {
          label: p1.period,
          data: [p1.mean, p1.median, p1.standardDeviation],
          backgroundColor: 'rgba(0, 92, 162, 0.6)',
          borderColor: '#005ca2',
          borderWidth: 2
        },
        {
          label: p2.period,
          data: [p2.mean, p2.median, p2.standardDeviation],
          backgroundColor: 'rgba(83, 170, 225, 0.6)',
          borderColor: '#53aae1',
          borderWidth: 2
        }
      ]
    };
  });

  comparisonChartOptions = computed<ChartConfiguration['options']>(() => {
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

  // Helper methods
  getMeanChangeIcon(): any {
    const diff = this.differences()?.meanDifference || 0;
    if (diff > 0) return TrendingUp;
    if (diff < 0) return TrendingDown;
    return Minus;
  }

  getMeanChangeClass(): string {
    const diff = this.differences()?.meanDifference || 0;
    if (diff > 0) return 'text-green-600 dark:text-green-400';
    if (diff < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  }

  getStdDevChangeClass(): string {
    const diff = this.differences()?.stdDevDifference || 0;
    if (diff > 0) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (diff < 0) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }

  getStdDevChangeLabel(): string {
    const diff = this.differences()?.stdDevDifference || 0;
    if (diff > 0) return 'Aumentó';
    if (diff < 0) return 'Disminuyó';
    return 'Sin Cambio';
  }
}
