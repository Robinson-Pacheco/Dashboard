import { Component, Input, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Users, AlertTriangle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search, X, TrendingUp, TrendingDown, Info, List } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { toSignal } from '@angular/core/rxjs-interop';
import { GenderCareerData, GenderCareerItem } from '../../models/advanced-analytics.model';
import { AdvancedAnalyticsComponent } from '../../advanced-analytics.component';
import { DarkModeService } from '../../../../services/dark-mode';

@Component({
  selector: 'app-gender-career',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, BaseChartDirective],
  templateUrl: './gender-career.component.html'
})
export class GenderCareerComponent implements OnInit {
  private parentComponent = inject(AdvancedAnalyticsComponent);
  private darkModeService = inject(DarkModeService);

  readonly Users = Users;
  readonly AlertTriangle = AlertTriangle;
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Search = Search;
  readonly X = X;
  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
  readonly Info = Info;
  readonly List = List;

  // Modals for viewing full career names
  showSignificantGapModal = signal<boolean>(false);
  showScoreComparisonModal = signal<boolean>(false);
  showQuotaComparisonModal = signal<boolean>(false);

  @Input() set data(value: GenderCareerData | null) {
    this.analysisData.set(value);
  }

  analysisData = signal<GenderCareerData | null>(null);
  isDarkMode = toSignal(this.darkModeService.isDarkMode$, { initialValue: false });

  constructor() {
    // Subscribe to parent data changes in constructor (injection context)
    effect(() => {
      const data = this.parentComponent.getGenderCareerData();
      this.analysisData.set(data);
    });
  }

  ngOnInit(): void {
    // OnInit hook if needed for other initialization
  }
  expandedRecommendations = signal<Set<number>>(new Set());

  // Search/Filter
  searchTerm = signal<string>('');
  showDropdown = signal<boolean>(false);

  // Pagination
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);

  careers = computed(() => this.analysisData()?.careers || []);
  summary = computed(() => this.analysisData()?.summary || null);

  totalMen = computed(() =>
    this.careers().reduce((sum, c) =>
      sum + (c.genderData['M']?.applicantCount || c.genderData['HOMBRE']?.applicantCount || 0), 0)
  );
  totalWomen = computed(() =>
    this.careers().reduce((sum, c) =>
      sum + (c.genderData['F']?.applicantCount || c.genderData['MUJER']?.applicantCount || 0), 0)
  );
  totalApplicantsGender = computed(() => this.totalMen() + this.totalWomen());
  genderPercentGap = computed(() => {
    const total = this.totalApplicantsGender();
    if (total === 0) return 0;
    return parseFloat((Math.abs(this.totalMen() - this.totalWomen()) / total * 100).toFixed(2));
  });

  // Filtered careers based on search
  filteredCareers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) {
      return this.careers();
    }
    return this.careers().filter(career => 
      career.career.toLowerCase().includes(term)
    );
  });

  // Autocomplete suggestions
  autocompleteSuggestions = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term || term.length < 2) {
      return [];
    }
    return this.careers()
      .filter(career => 
        career.career.toLowerCase().includes(term)
      )
      .slice(0, 10);
  });

  // Paginated careers
  totalPages = computed(() => Math.ceil(this.filteredCareers().length / this.itemsPerPage()));
  paginatedCareers = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredCareers().slice(start, end);
  });

  // Pagination helpers
  hasPreviousPage = computed(() => this.currentPage() > 1);
  hasNextPage = computed(() => this.currentPage() < this.totalPages());
  startIndex = computed(() => (this.currentPage() - 1) * this.itemsPerPage() + 1);
  endIndex = computed(() => Math.min(this.currentPage() * this.itemsPerPage(), this.filteredCareers().length));

  // Page numbers for display
  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (current > 3) {
        pages.push(-1);
      }

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push(-1);
      }

      pages.push(total);
    }

    return pages;
  });

  // Careers with top gender gap (Top 15 sorted by largest gap)
  significantGapCareers = computed(() => 
    this.careers()
      .filter(c => c.genderGap && c.genderGap.gap !== undefined)
      .sort((a, b) => (b.genderGap?.percentGap || 0) - (a.genderGap?.percentGap || 0))
      .slice(0, 15)
  );

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  changeItemsPerPage(items: number): void {
    this.itemsPerPage.set(items);
    this.currentPage.set(1);
  }

  // Search methods
  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
    this.showDropdown.set(term.length >= 2);
  }

  selectCareer(career: GenderCareerItem): void {
    this.searchTerm.set(career.career);
    this.showDropdown.set(false);
    this.currentPage.set(1);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.showDropdown.set(false);
    this.currentPage.set(1);
  }

  hideDropdown(): void {
    setTimeout(() => this.showDropdown.set(false), 200);
  }

  toggleRecommendations(index: number): void {
    const expanded = new Set(this.expandedRecommendations());
    const globalIndex = (this.currentPage() - 1) * this.itemsPerPage() + index;
    if (expanded.has(globalIndex)) {
      expanded.delete(globalIndex);
    } else {
      expanded.add(globalIndex);
    }
    this.expandedRecommendations.set(expanded);
  }

  isRecommendationExpanded(index: number): boolean {
    const globalIndex = (this.currentPage() - 1) * this.itemsPerPage() + index;
    return this.expandedRecommendations().has(globalIndex);
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

  getGapTypeClass(gapType: string): string {
    switch (gapType) {
      case 'Brecha Significativa': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Brecha Moderada': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Equitativo': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  // Chart for Gender Gap
  genderGapChartData = computed<ChartConfiguration['data']>(() => {
    const data = this.significantGapCareers();
    return {
      labels: data.map(c => c.career.length > 40 
        ? c.career.substring(0, 40) + '...' 
        : c.career),
      datasets: [{
        label: 'Diferencia de Puntaje (%)',
        data: data.map(c => c.genderGap.percentGap),
        backgroundColor: data.map(c => 
          c.gapType === 'Brecha Significativa' ? 'rgba(194, 53, 74, 0.7)' :
          c.gapType === 'Brecha Moderada' ? 'rgba(234, 179, 8, 0.7)' :
          'rgba(16, 185, 129, 0.7)'
        ),
        borderColor: data.map(c => 
          c.gapType === 'Brecha Significativa' ? '#C2354a' :
          c.gapType === 'Brecha Moderada' ? '#EAB308' :
          '#10B981'
        ),
        borderWidth: 2
      }]
    };
  });

  genderGapChartOptions = computed<ChartConfiguration['options']>(() => {
    const isDark = this.isDarkMode();
    return {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: isDark ? '#9CA3AF' : '#4B5563'
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: isDark ? '#9CA3AF' : '#4B5563'
          },
          grid: {
            color: isDark ? 'rgba(156, 163, 175, 0.1)' : 'rgba(156, 163, 175, 0.2)'
          }
        },
        y: {
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

  // Gap Distribution Pie Chart
  gapDistributionChartData = computed<ChartConfiguration['data']>(() => {
    const summary = this.summary();
    if (!summary) return { labels: [], datasets: [] };
    
    return {
      labels: ['Brecha Significativa', 'Brecha Moderada', 'Equitativo'],
      datasets: [{
        data: [
          summary.careersWithSignificantGap,
          summary.careersWithModerateGap,
          summary.equitableCareers
        ],
        backgroundColor: [
          'rgba(194, 53, 74, 0.7)',
          'rgba(83, 170, 225, 0.7)',
          'rgba(16, 185, 129, 0.7)'
        ],
        borderColor: ['#C2354a', '#53aae1', '#10B981'],
        borderWidth: 2
      }]
    };
  });

  gapDistributionChartOptions = computed<ChartConfiguration['options']>(() => {
    const isDark = this.isDarkMode();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: isDark ? '#9CA3AF' : '#4B5563',
            padding: 15
          }
        }
      }
    };
  });

  // Gender Comparison Chart - Top 10 Careers
  genderComparisonChartData = computed<ChartConfiguration['data']>(() => {
    const top10 = this.careers().slice(0, 10);
    
    return {
      labels: top10.map(c => c.career.length > 30 ? c.career.substring(0, 30) + '...' : c.career),
      datasets: [
        {
          label: 'Hombre - Puntaje Promedio',
          data: top10.map(c => c.genderData['HOMBRE']?.avgScore || 0),
          backgroundColor: 'rgba(0, 92, 162, 0.5)',
          borderColor: '#005ca2',
          borderWidth: 2
        },
        {
          label: 'Mujer - Puntaje Promedio',
          data: top10.map(c => c.genderData['MUJER']?.avgScore || 0),
          backgroundColor: 'rgba(194, 53, 74, 0.5)',
          borderColor: '#C2354a',
          borderWidth: 2
        }
      ]
    };
  });

  genderComparisonChartOptions = computed<ChartConfiguration['options']>(() => {
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

  // Quota Share / Distribution Comparison Chart
  quotaRateChartData = computed<ChartConfiguration['data']>(() => {
    const top10 = this.careers().slice(0, 10);
    
    return {
      labels: top10.map(c => c.career.length > 30 ? c.career.substring(0, 30) + '...' : c.career),
      datasets: [
        {
          label: 'Hombre - % de Cupos Asignados',
          data: top10.map(c => this.getQuotaShare(c, 'HOMBRE')),
          backgroundColor: 'rgba(0, 92, 162, 0.5)',
          borderColor: '#005ca2',
          borderWidth: 2
        },
        {
          label: 'Mujer - % de Cupos Asignados',
          data: top10.map(c => this.getQuotaShare(c, 'MUJER')),
          backgroundColor: 'rgba(194, 53, 74, 0.5)',
          borderColor: '#C2354a',
          borderWidth: 2
        }
      ]
    };
  });

  quotaRateChartOptions = computed<ChartConfiguration['options']>(() => {
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

  // Helper to get gender data keys
  getGenderKeys(genderData: any): string[] {
    return Object.keys(genderData || {});
  }

  // Helper to get gender quota share percentage
  getQuotaShare(item: GenderCareerItem, gender: string): number {
    const data = item.genderData[gender];
    if (data?.quotaShare !== undefined) return data.quotaShare;
    
    const total = Object.values(item.genderData).reduce((sum, g) => sum + (g?.withQuota || 0), 0);
    return total > 0 ? parseFloat((((data?.withQuota || 0) / total) * 100).toFixed(2)) : 0;
  }

  // Helper to get gender icon color
  getGenderColor(gender: string): string {
    if (gender === 'HOMBRE') return 'text-utmach-blue dark:text-utmach-sky';
    if (gender === 'MUJER') return 'text-utmach-red dark:text-utmach-red-300';
    return 'text-gray-600 dark:text-gray-400';
  }

  // Helper to get gender background color
  getGenderBgColor(gender: string): string {
    if (gender === 'HOMBRE') return 'bg-utmach-blue-50 dark:bg-utmach-blue-900';
    if (gender === 'MUJER') return 'bg-utmach-red-50 dark:bg-utmach-red-900';
    return 'bg-gray-100 dark:bg-gray-900';
  }

  // Helper to calculate absolute value
  abs(value: number): number {
    return Math.abs(value);
  }

  // Modal methods
  openSignificantGapModal(): void {
    this.showSignificantGapModal.set(true);
  }

  closeSignificantGapModal(): void {
    this.showSignificantGapModal.set(false);
  }

  openScoreComparisonModal(): void {
    this.showScoreComparisonModal.set(true);
  }

  closeScoreComparisonModal(): void {
    this.showScoreComparisonModal.set(false);
  }

  openQuotaComparisonModal(): void {
    this.showQuotaComparisonModal.set(true);
  }

  closeQuotaComparisonModal(): void {
    this.showQuotaComparisonModal.set(false);
  }
}
