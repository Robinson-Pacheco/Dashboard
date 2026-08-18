import { Component, inject, OnInit, effect, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, List, Layers, TrendingUp, TrendingDown, Minus } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { toSignal } from '@angular/core/rxjs-interop';
import { ComponentsListData, ComponentItem } from '../../models/statistical-distribution.model';
import { StatisticalDistributionComponent } from '../../statistical-distribution.component';
import { DarkModeService } from '../../../../services/dark-mode';

@Component({
  selector: 'app-components-list-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BaseChartDirective],
  templateUrl: './components-list-view.component.html'
})
export class ComponentsListViewComponent implements OnInit {
  private parentComponent = inject(StatisticalDistributionComponent);
  private darkModeService = inject(DarkModeService);

  readonly List = List;
  readonly Layers = Layers;
  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
  readonly Minus = Minus;

  componentsListData = signal<ComponentsListData | null>(null);
  isDarkMode = toSignal(this.darkModeService.isDarkMode$, { initialValue: false });

  constructor() {
    effect(() => {
      const data = this.parentComponent.getComponentsListData();
      this.componentsListData.set(data);
    });
  }

  ngOnInit(): void {}

  // ComponentsListData is now ComponentItem[]
  components = computed(() => this.componentsListData() || []);
  period = computed(() => {
    const data = this.componentsListData();
    return data && data.length > 0 ? data[0].period : '';
  });
  year = computed(() => {
    const data = this.componentsListData();
    return data && data.length > 0 ? data[0].year : 0;
  });

  // Computed statistics
  totalComponents = computed(() => this.components().length);
  totalStudents = computed(() => {
    const comps = this.components();
    return comps.length > 0 ? comps[0].count : 0;
  });
  overallAverage = computed(() => {
    const comps = this.components();
    if (comps.length === 0) return 0;
    const sum = comps.reduce((acc, c) => acc + c.averageScore, 0);
    return sum / comps.length;
  });

  // Score range chart data
  scoreRangeChartData = computed<ChartConfiguration['data']>(() => {
    const comps = this.components();
    if (comps.length === 0) return { labels: [], datasets: [] };

    return {
      labels: comps.map(c => c.componente),
      datasets: [
        {
          label: 'Puntaje Mínimo',
          data: comps.map(c => c.minScore),
          backgroundColor: 'rgba(194, 53, 74, 0.6)',
          borderColor: '#C2354a',
          borderWidth: 2
        },
        {
          label: 'Promedio',
          data: comps.map(c => c.averageScore),
          backgroundColor: 'rgba(0, 92, 162, 0.6)',
          borderColor: '#005ca2',
          borderWidth: 2
        },
        {
          label: 'Puntaje Máximo',
          data: comps.map(c => c.maxScore),
          backgroundColor: 'rgba(16, 185, 129, 0.6)',
          borderColor: '#10B981',
          borderWidth: 2
        }
      ]
    };
  });

  scoreRangeChartOptions = computed<ChartConfiguration['options']>(() => {
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
  getPerformanceLevel(avgScore: number, maxScore: number): string {
    const percentage = (avgScore / maxScore) * 100;
    if (percentage >= 80) return 'Excelente';
    if (percentage >= 60) return 'Bueno';
    if (percentage >= 40) return 'Regular';
    return 'Bajo';
  }

  getPerformanceLevelClass(level: string): string {
    switch (level) {
      case 'Excelente': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Bueno': return 'bg-utmach-blue-50 text-utmach-blue-700 dark:bg-utmach-blue-900 dark:text-utmach-blue-200';
      case 'Regular': return 'bg-utmach-sky-50 text-utmach-sky-700 dark:bg-utmach-sky-900 dark:text-utmach-sky-200';
      case 'Bajo': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  getScorePercentage(avgScore: number, maxScore: number): number {
    return (avgScore / maxScore) * 100;
  }

  getScoreBarColor(percentage: number): string {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-utmach-blue';
    if (percentage >= 40) return 'bg-utmach-sky';
    return 'bg-red-500';
  }
}
