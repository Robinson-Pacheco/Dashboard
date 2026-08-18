import { Component, Input, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Briefcase, AlertTriangle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search, X, TrendingUp, Users, Info, Award, TrendingDown, List, ExternalLink } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { toSignal } from '@angular/core/rxjs-interop';
import { CareerAnalysisData, CareerAnalysisItem } from '../../models/data-mining.model';
import { BaselineComparisonBarComponent } from '../../../../shared/components/baseline-comparison-bar/baseline-comparison-bar.component';
import { ReportsComponent } from '../../reports.component';
import { DarkModeService } from '../../../../services/dark-mode';

@Component({
  selector: 'app-career-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, BaseChartDirective, BaselineComparisonBarComponent],
  templateUrl: './career-analysis.component.html'
})
export class CareerAnalysisComponent implements OnInit {
  private parentComponent = inject(ReportsComponent);
  private darkModeService = inject(DarkModeService);

  readonly Briefcase = Briefcase;
  readonly AlertTriangle = AlertTriangle;
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Search = Search;
  readonly X = X;
  readonly TrendingUp = TrendingUp;
  readonly Users = Users;
  readonly Info = Info;
  readonly Award = Award;
  readonly TrendingDown = TrendingDown;
  readonly List = List;
  readonly ExternalLink = ExternalLink;

  // Modal for competitive careers list
  showModal = signal<boolean>(false);

  @Input() set data(value: CareerAnalysisData | null) {
    this.analysisData.set(value);
  }

  analysisData = signal<CareerAnalysisData | null>(null);
  isDarkMode = toSignal(this.darkModeService.isDarkMode$, { initialValue: false });

  constructor() {
    // Subscribe to parent data changes in constructor (injection context)
    effect(() => {
      const data = this.parentComponent.getCareerData();
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
  overallAverage = computed(() => this.analysisData()?.overallAverage || 0);
  noQuotaSegment = computed(() => this.analysisData()?.noQuotaSegment || null);
  hasNoQuotaData = computed(() => {
    const segment = this.noQuotaSegment();
    return segment && (
      (segment.bestPerforming && segment.bestPerforming.length > 0) ||
      (segment.lowestPerforming && segment.lowestPerforming.length > 0)
    );
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

  // Top 15 most competitive careers
  mostCompetitiveCareers = computed(() => 
    this.careers()
      .filter(c => c.competitiveness === 'Muy Alta' || c.competitiveness === 'Alta')
      .sort((a, b) => b.applicantCount - a.applicantCount)
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

  selectCareer(career: CareerAnalysisItem): void {
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

  getCompetitivenessClass(level: string): string {
    switch (level) {
      case 'Muy Alta': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
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

  // Chart for Most Competitive Careers
  competitivenessChartData = computed<ChartConfiguration['data']>(() => {
    const data = this.mostCompetitiveCareers();
    return {
      labels: data.map(c => c.career.length > 40 
        ? c.career.substring(0, 40) + '...' 
        : c.career),
      datasets: [{
        label: 'Número de Postulantes',
        data: data.map(c => c.applicantCount),
        backgroundColor: 'rgba(194, 53, 74, 0.5)',
        borderColor: '#C2354a',
        borderWidth: 2
      }]
    };
  });

  competitivenessChartOptions = computed<ChartConfiguration['options']>(() => {
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

  // Modal methods
  openModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }
}
