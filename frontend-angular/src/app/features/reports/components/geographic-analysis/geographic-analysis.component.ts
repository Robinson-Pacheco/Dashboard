import { Component, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MapPin, AlertTriangle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search, X, Filter, Info, AlertCircle } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { toSignal } from '@angular/core/rxjs-interop';
import { DarkModeService } from '../../../../services/dark-mode';
import { GeographicAnalysisData, GeographicAnalysisItem } from '../../models/data-mining.model';
import { BaselineComparisonBarComponent } from '../../../../shared/components/baseline-comparison-bar/baseline-comparison-bar.component';
import { ReportsComponent } from '../../reports.component';

@Component({
  selector: 'app-geographic-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, BaseChartDirective, BaselineComparisonBarComponent],
  templateUrl: './geographic-analysis.component.html'
})
export class GeographicAnalysisComponent implements OnInit {
  private parentComponent = inject(ReportsComponent);
  private darkModeService = inject(DarkModeService);
  isDarkMode = toSignal(this.darkModeService.isDarkMode$, { initialValue: false });

  readonly MapPin = MapPin;
  readonly AlertTriangle = AlertTriangle;
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Search = Search;
  readonly X = X;
  readonly Filter = Filter;
  readonly Info = Info;
  readonly AlertCircle = AlertCircle;

  // Use only the effect for data, remove the @Input to avoid conflicts
  analysisData = signal<GeographicAnalysisData | null>(null);

  constructor() {
    // Subscribe to parent data changes in constructor (injection context)
    effect(() => {
      const data = this.parentComponent.getGeographicData();
      this.analysisData.set(data);
    });
  }

  readonly STORAGE_KEY = 'geographic_sampleSizeFilter';

  ngOnInit(): void {
    // Restore filter from localStorage and fetch filtered data if present
    const savedFilter = localStorage.getItem(this.STORAGE_KEY);
    if (savedFilter !== null && savedFilter !== '') {
      this.sampleSizeFilter.set(savedFilter);
      this.parentComponent.reloadGeographic(savedFilter);
    }
  }
  expandedRecommendations = signal<Set<number>>(new Set());

  // Search/Filter
  searchTerm = signal<string>('');
  showDropdown = signal<boolean>(false);

  // Sample size filter
  sampleSizeFilter = signal<string>('');
  sampleSizeOptions = [
    { value: '', label: 'Todos los tamaños' },
    { value: '1-10', label: '1-10 estudiantes' },
    { value: '11-20', label: '11-20 estudiantes' },
    { value: '21-50', label: '21-50 estudiantes' },
    { value: '50+', label: 'Más de 50 estudiantes' }
  ];

  // Pagination
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);

  locations = computed(() => this.analysisData()?.locations || []);
  summary = computed(() => this.analysisData()?.summary || null);
  overallAverage = computed(() => this.analysisData()?.overallAverage || 0);

  // Check if we have data after filtering
  hasDataAfterFilter = computed(() => this.locations().length > 0);
  hasFilterApplied = computed(() => this.sampleSizeFilter() !== '');

  // Filtered locations based on search
  filteredLocations = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) {
      return this.locations();
    }
    return this.locations().filter(loc =>
      loc.province.toLowerCase().includes(term) ||
      loc.canton.toLowerCase().includes(term) ||
      `${loc.province} - ${loc.canton}`.toLowerCase().includes(term)
    );
  });

  // Autocomplete suggestions
  autocompleteSuggestions = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term || term.length < 2) {
      return [];
    }
    return this.locations()
      .filter(loc =>
        loc.province.toLowerCase().includes(term) ||
        loc.canton.toLowerCase().includes(term) ||
        `${loc.province} - ${loc.canton}`.toLowerCase().includes(term)
      )
      .slice(0, 10); // Limit to 10 suggestions
  });

  // Paginated locations
  totalPages = computed(() => Math.ceil(this.filteredLocations().length / this.itemsPerPage()));
  paginatedLocations = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredLocations().slice(start, end);
  });

  // Pagination helpers
  hasPreviousPage = computed(() => this.currentPage() > 1);
  hasNextPage = computed(() => this.currentPage() < this.totalPages());
  startIndex = computed(() => (this.currentPage() - 1) * this.itemsPerPage() + 1);
  endIndex = computed(() => Math.min(this.currentPage() * this.itemsPerPage(), this.filteredLocations().length));

  // Page numbers for display
  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      // Show all pages if 7 or less
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current > 3) {
        pages.push(-1); // Ellipsis
      }

      // Show pages around current
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push(-1); // Ellipsis
      }

      // Always show last page
      pages.push(total);
    }

    return pages;
  });

  // Top 15 highest risk zones (by absolute risk index deviation)
  highRiskZones = computed(() =>
    this.locations()
      .filter(l => l.riskIndex > 0)
      .sort((a, b) => b.riskIndex - a.riskIndex)
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
    this.currentPage.set(1); // Reset to first page
  }

  // Search methods
  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1); // Reset to first page when searching
    this.showDropdown.set(term.length >= 2);
  }

  selectLocation(location: GeographicAnalysisItem): void {
    this.searchTerm.set(`${location.province} - ${location.canton}`);
    this.showDropdown.set(false);
    this.currentPage.set(1);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.showDropdown.set(false);
    this.currentPage.set(1);
  }

  hideDropdown(): void {
    // Delay to allow click on suggestion
    setTimeout(() => this.showDropdown.set(false), 200);
  }

  // Sample size filter methods
  applySampleSizeFilter(sampleSize: string): void {
    this.sampleSizeFilter.set(sampleSize);
    localStorage.setItem(this.STORAGE_KEY, sampleSize);
    this.parentComponent.reloadGeographic(sampleSize || undefined);
    this.currentPage.set(1);
  }

  clearSampleSizeFilter(): void {
    this.sampleSizeFilter.set('');
    localStorage.setItem(this.STORAGE_KEY, '');
    this.parentComponent.reloadGeographic(undefined);
    this.currentPage.set(1);
  }

  getSampleSizeLabel(): string {
    const current = this.sampleSizeFilter();
    if (!current) return '';
    const option = this.sampleSizeOptions.find(o => o.value === current);
    return option ? option.label : '';
  }

  toggleRecommendations(index: number): void {
    const expanded = new Set(this.expandedRecommendations());
    // Calculate global index based on pagination
    const globalIndex = (this.currentPage() - 1) * this.itemsPerPage() + index;
    if (expanded.has(globalIndex)) {
      expanded.delete(globalIndex);
    } else {
      expanded.add(globalIndex);
    }
    this.expandedRecommendations.set(expanded);
  }

  isRecommendationExpanded(index: number): boolean {
    // Calculate global index based on pagination
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

  getRiskLevelClass(level: string): string {
    switch (level) {
      case 'Riesgo Alto': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Riesgo Medio': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Riesgo Bajo': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
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

  // Chart for Risk Index
  riskChartData = computed<ChartConfiguration['data']>(() => {
    const data = this.highRiskZones();
    return {
      labels: data.map(l => `${l.province} - ${l.canton}`.length > 35
        ? `${l.province} - ${l.canton}`.substring(0, 35) + '...'
        : `${l.province} - ${l.canton}`),
      datasets: [{
        label: 'Índice de Riesgo (%)',
        data: data.map(l => l.riskIndex),
        backgroundColor: 'rgba(194, 53, 74, 0.5)',
        borderColor: '#C2354a',
        borderWidth: 2
      }]
    };
  });

  riskChartOptions = computed<ChartConfiguration['options']>(() => {
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
          max: 100,
          ticks: {
            color: textColor,
            callback: (value: string | number) => value + '%'
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
}
