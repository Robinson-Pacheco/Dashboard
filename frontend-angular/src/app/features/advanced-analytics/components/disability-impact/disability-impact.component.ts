import { Component, Input, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, HeartHandshake, AlertTriangle, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Users, Award, Info } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { toSignal } from '@angular/core/rxjs-interop';
import { DarkModeService } from '../../../../services/dark-mode';
import { DisabilityImpactData, DisabilityTypeItem } from '../../models/advanced-analytics.model';
import { BaselineComparisonBarComponent } from '../../../../shared/components/baseline-comparison-bar/baseline-comparison-bar.component';
import { AdvancedAnalyticsComponent } from '../../advanced-analytics.component';

@Component({
  selector: 'app-disability-impact',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, BaseChartDirective, BaselineComparisonBarComponent],
  templateUrl: './disability-impact.component.html'
})
export class DisabilityImpactComponent implements OnInit {
  private parentComponent = inject(AdvancedAnalyticsComponent);
  private darkModeService = inject(DarkModeService);
  isDarkMode = toSignal(this.darkModeService.isDarkMode$, { initialValue: false });

  readonly HeartHandshake = HeartHandshake;
  readonly AlertTriangle = AlertTriangle;
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;
  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
  readonly Users = Users;
  readonly Award = Award;
  readonly Info = Info;
  readonly Math = Math;

  @Input() set data(value: DisabilityImpactData | null) {
    this.analysisData.set(value);
  }

  analysisData = signal<DisabilityImpactData | null>(null);

  constructor() {
    // Subscribe to parent data changes in constructor (injection context)
    effect(() => {
      const data = this.parentComponent.getDisabilityImpactData();
      this.analysisData.set(data);
    });
  }

  ngOnInit(): void {
    // OnInit hook if needed for other initialization
  }
  expandedRecommendations = signal<Set<number>>(new Set());

  withoutDisability = computed(() => this.analysisData()?.withoutDisability || null);
  disabilityTypes = computed(() => this.analysisData()?.byDisabilityType || []);
  summary = computed(() => this.analysisData()?.summary || null);

  // Sorted disability types by gap (descending)
  sortedDisabilityTypes = computed(() => 
    [...this.disabilityTypes()].sort((a, b) => Math.abs(b.gapVsNoDisability) - Math.abs(a.gapVsNoDisability))
  );

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

  getGapSeverityClass(percentGap: number): string {
    const absGap = Math.abs(percentGap);
    if (absGap >= 25) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (absGap >= 15) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    if (absGap >= 5) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  }

  getGapSeverityText(percentGap: number): string {
    const absGap = Math.abs(percentGap);
    if (absGap >= 25) return 'Crítica';
    if (absGap >= 15) return 'Alta';
    if (absGap >= 5) return 'Moderada';
    return 'Baja';
  }

  // Performance classification methods
  getPerformanceClass(classification: string): string {
    switch (classification) {
      case 'Mejor desempeño':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-500';
      case 'Peor desempeño':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-500';
      case 'Similar':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-500';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-500';
    }
  }

  getPerformanceIconClass(classification: string): string {
    switch (classification) {
      case 'Mejor desempeño':
        return 'text-green-600 dark:text-green-400';
      case 'Peor desempeño':
        return 'text-red-600 dark:text-red-400';
      case 'Similar':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  }

  // Chart for Gap Comparison
  gapComparisonChartData = computed<ChartConfiguration['data']>(() => {
    const data = this.sortedDisabilityTypes();
    return {
      labels: data.map(d => d.disabilityType),
      datasets: [{
        label: 'Brecha vs Sin Discapacidad (puntos)',
        data: data.map(d => Math.abs(d.gapVsNoDisability)),
        backgroundColor: data.map(d => {
          const absGap = Math.abs(d.percentGap);
          if (absGap >= 25) return 'rgba(194, 53, 74, 0.5)';
          if (absGap >= 15) return 'rgba(194, 53, 74, 0.3)';
          if (absGap >= 5) return 'rgba(83, 170, 225, 0.5)';
          return 'rgba(16, 185, 129, 0.5)';
        }),
        borderColor: data.map(d => {
          const absGap = Math.abs(d.percentGap);
          if (absGap >= 25) return '#C2354a';
          if (absGap >= 15) return '#9b2b3b';
          if (absGap >= 5) return '#53aae1';
          return '#10B981';
        }),
        borderWidth: 2
      }]
    };
  });

  gapComparisonChartOptions = computed<ChartConfiguration['options']>(() => {
    const isDark = this.isDarkMode();
    const textColor = isDark ? '#F3F4F6' : '#374151';
    const gridColor = isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)';

    return {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: textColor
          },
          grid: {
            color: gridColor
          }
        },
        y: {
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

  // Chart for Performance Comparison
  performanceChartData = computed<ChartConfiguration['data']>(() => {
    const data = this.sortedDisabilityTypes();
    const withoutDisability = this.withoutDisability();
    
    return {
      labels: ['Sin Discapacidad', ...data.map(d => d.disabilityType)],
      datasets: [{
        label: 'Puntaje Promedio',
        data: [withoutDisability?.avgScore || 0, ...data.map(d => d.avgScore)],
        backgroundColor: [
          'rgba(0, 92, 162, 0.5)',
          ...data.map(() => 'rgba(83, 170, 225, 0.5)')
        ],
        borderColor: [
          '#005ca2',
          ...data.map(() => '#53aae1')
        ],
        borderWidth: 2
      }]
    };
  });

  performanceChartOptions = computed<ChartConfiguration['options']>(() => {
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

  // Student Distribution Chart
  studentDistributionChartData = computed<ChartConfiguration['data']>(() => {
    const data = this.sortedDisabilityTypes();
    
    return {
      labels: data.map(d => d.disabilityType),
      datasets: [{
        label: 'Número de Estudiantes',
        data: data.map(d => d.studentCount),
        backgroundColor: 'rgba(83, 170, 225, 0.6)',
        borderColor: '#53aae1',
        borderWidth: 2
      }]
    };
  });

  studentDistributionChartOptions = computed<ChartConfiguration['options']>(() => {
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
}
