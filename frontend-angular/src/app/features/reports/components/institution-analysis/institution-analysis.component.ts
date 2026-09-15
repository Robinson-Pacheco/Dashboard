import { Component, Input, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, AlertTriangle, ChevronDown, ChevronUp, Building, Search, X, ChevronLeft, ChevronRight, Users, TrendingDown, BarChart2, Eye, Info, Filter } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { AgCharts } from 'ag-charts-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { DarkModeService } from '../../../../services/dark-mode';
import { InstitutionAnalysisData, InstitutionAnalysisItem, InstitutionTypeGroup, SectorRiskAnalysis } from '../../models/data-mining.model';
import { BaselineComparisonBarComponent } from '../../../../shared/components/baseline-comparison-bar/baseline-comparison-bar.component';
import { InstitutionsDetailModalComponent } from '../../../../shared/components/institutions-detail-modal/institutions-detail-modal.component';
import { ReportsComponent } from '../../reports.component';

@Component({
  selector: 'app-institution-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, BaseChartDirective, AgCharts, BaselineComparisonBarComponent, InstitutionsDetailModalComponent],
  templateUrl: './institution-analysis.component.html'
})
export class InstitutionAnalysisComponent implements OnInit {
  private parentComponent = inject(ReportsComponent);
  private darkModeService = inject(DarkModeService);
  isDarkMode = toSignal(this.darkModeService.isDarkMode$, { initialValue: false });

  readonly AlertTriangle = AlertTriangle;
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;
  readonly Building = Building;
  readonly Search = Search;
  readonly X = X;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Users = Users;
  readonly TrendingDown = TrendingDown;
  readonly BarChart2 = BarChart2;
  readonly Eye = Eye;
  readonly Info = Info;
  readonly Filter = Filter;
  readonly Math = Math;

  @Input() set data(value: InstitutionAnalysisData | null) {
    this.analysisData.set(value);
  }

  analysisData = signal<InstitutionAnalysisData | null>(null);

  // Modal state
  isWorstModalOpen = signal<boolean>(false);
  isBestModalOpen = signal<boolean>(false);

  constructor() {
    // Subscribe to parent data changes in constructor (injection context)
    effect(() => {
      const data = this.parentComponent.getInstitutionData();
      this.analysisData.set(data);
    });
  }

  readonly STORAGE_KEY = 'institution_sampleSizeFilter';

  ngOnInit(): void {
    // Restore filter from localStorage and fetch filtered data if present
    const savedFilter = localStorage.getItem(this.STORAGE_KEY);
    if (savedFilter !== null && savedFilter !== '') {
      this.sampleSizeFilter.set(savedFilter);
      this.parentComponent.reloadInstitutions(savedFilter);
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

  institutions = computed(() => this.analysisData()?.institutions || []);
  overallAverage = computed(() => this.analysisData()?.overallAverage || 0);
  groupByType = computed(() => this.analysisData()?.groupByType || []);
  riskConcentration = computed(() => this.analysisData()?.riskConcentration || null);

  // Filtered institutions based on search
  filteredInstitutions = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) {
      return this.institutions();
    }
    return this.institutions().filter(inst => 
      inst.institution.toLowerCase().includes(term) || 
      inst.type.toLowerCase().includes(term)
    );
  });

  // Autocomplete suggestions
  autocompleteSuggestions = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term || term.length < 2) {
      return [];
    }
    return this.institutions()
      .filter(inst => 
        inst.institution.toLowerCase().includes(term) || 
        inst.type.toLowerCase().includes(term)
      )
      .slice(0, 10);
  });

  // Paginated institutions
  totalPages = computed(() => Math.ceil(this.filteredInstitutions().length / this.itemsPerPage()));
  paginatedInstitutions = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredInstitutions().slice(start, end);
  });

  // Pagination helpers
  hasPreviousPage = computed(() => this.currentPage() > 1);
  hasNextPage = computed(() => this.currentPage() < this.totalPages());
  startIndex = computed(() => (this.currentPage() - 1) * this.itemsPerPage() + 1);
  endIndex = computed(() => Math.min(this.currentPage() * this.itemsPerPage(), this.filteredInstitutions().length));

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

  // Top 10 institutions with lowest performance for main chart
  topInstitutions = computed(() => this.institutions().slice(0, 10));

  // Top 10 institutions with best performance
  bestInstitutions = computed(() => {
    const sorted = [...this.institutions()].sort((a, b) => b.avgScore - a.avgScore);
    return sorted.slice(0, 10);
  });

  // Box Plot Mode (worst = menor rendimiento, best = mejor rendimiento)
  boxPlotMode = signal<'worst' | 'best'>('worst');

  setBoxPlotMode(mode: 'worst' | 'best'): void {
    this.boxPlotMode.set(mode);
  }

  boxPlotData = computed(() => {
    return this.boxPlotMode() === 'worst' ? this.topInstitutions() : this.bestInstitutions();
  });

  formatInstitutionLabel(name: string, index: number): string {
    if (!name) return `${index + 1}. Sin Información`;
    let clean = name
      .replace(/UNIDAD EDUCATIVA FISCOMISIONAL/gi, 'U.E. Fiscomisional')
      .replace(/UNIDAD EDUCATIVA PARTICULAR/gi, 'U.E. Particular')
      .replace(/UNIDAD EDUCATIVA MUNICIPAL/gi, 'U.E. Municipal')
      .replace(/UNIDAD EDUCATIVA FISCAL/gi, 'U.E. Fiscal')
      .replace(/COLEGIO DE BACHILLERATO/gi, 'C.B.')
      .replace(/UNIDAD EDUCATIVA/gi, 'U.E.');

    if (clean.length > 28) {
      clean = clean.substring(0, 28) + '...';
    }
    return `${index + 1}. ${clean}`;
  }

  // Box Plot Chart Options using AG Charts Enterprise
  boxPlotOptions = computed<any>(() => {
    const data = this.boxPlotData();
    const isDark = this.isDarkMode();
    const isWorst = this.boxPlotMode() === 'worst';
    const mainColor = isWorst ? '#C2354a' : '#005ca2';
    const strokeColor = isWorst ? '#991B1B' : '#004a82';

    // Calculate dynamic Y-axis bounds based on actual data min and max
    const allMins = data.map(inst => inst.minScore).filter(v => v !== undefined && !isNaN(v));
    const allMaxs = data.map(inst => inst.maxScore).filter(v => v !== undefined && !isNaN(v));

    const globalMin = allMins.length > 0 ? Math.min(...allMins) : 0;
    const globalMax = allMaxs.length > 0 ? Math.max(...allMaxs) : 1000;

    // Add padding to score axis range
    const yMin = Math.max(0, Math.floor((globalMin - 40) / 50) * 50);
    const yMax = Math.min(1000, Math.ceil((globalMax + 40) / 50) * 50);

    return {
      autoSize: true,
      padding: {
        top: 10,
        right: 20,
        bottom: 10,
        left: 10
      },
      data: data.map((inst, idx) => {
        const min = inst.minScore;
        const max = inst.maxScore;
        const avg = inst.avgScore;
        const q1 = inst.q1 ?? Math.round(min + (avg - min) * 0.5);
        const median = inst.median ?? Math.round(avg);
        const q3 = inst.q3 ?? Math.round(avg + (max - avg) * 0.5);
        const uniqueKey = this.formatInstitutionLabel(inst.institution, idx);

        return {
          institution: uniqueKey,
          fullTitle: inst.institution,
          type: inst.type,
          min,
          q1,
          median,
          q3,
          max,
          avg,
          studentCount: inst.studentCount
        };
      }),
      series: [
        {
          type: 'box-plot',
          direction: 'horizontal',
          xKey: 'institution',
          minKey: 'min',
          q1Key: 'q1',
          medianKey: 'median',
          q3Key: 'q3',
          maxKey: 'max',
          fill: mainColor,
          fillOpacity: 0.85,
          stroke: strokeColor,
          strokeWidth: 2,
          whisker: {
            stroke: isDark ? '#E2E8F0' : '#1E293B',
            strokeWidth: 2.5
          },
          tooltip: {
            renderer: (params: any) => {
              const item = params.datum;
              return {
                title: item.fullTitle || item[params.xKey],
                content: [
                  `Tipo: ${item.type || 'N/A'}`,
                  `Mínimo: ${item.min} pts`,
                  `Q1 (25%): ${item.q1} pts`,
                  `Mediana (50%): ${item.median} pts`,
                  `Promedio: ${item.avg} pts`,
                  `Q3 (75%): ${item.q3} pts`,
                  `Máximo: ${item.max} pts`,
                  `Estudiantes: ${item.studentCount}`
                ].join('\n')
              };
            }
          }
        }
      ],
      axes: [
        {
          type: 'category',
          position: 'left',
          paddingInner: 0.35,
          paddingOuter: 0.15,
          title: {
            text: 'Institución Educativa (Top 10)',
            fontSize: 13,
            fontWeight: 'bold',
            color: isDark ? '#E5E7EB' : '#374151'
          },
          label: {
            color: isDark ? '#F9FAFB' : '#111827',
            fontSize: 12,
            fontWeight: 'bold',
            rotation: 0
          }
        },
        {
          type: 'number',
          position: 'bottom',
          title: {
            text: 'Puntaje Obtenido (pts)',
            fontSize: 13,
            fontWeight: 'bold',
            color: isDark ? '#E5E7EB' : '#374151'
          },
          label: {
            color: isDark ? '#F9FAFB' : '#111827',
            fontSize: 12
          },
          min: yMin,
          max: yMax
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

  // Navigation methods
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

  selectInstitution(institution: InstitutionAnalysisItem): void {
    this.searchTerm.set(institution.institution);
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

  getPerformanceLevelClass(level: string): string {
    switch (level) {
      case 'Excelente': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Bueno': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Regular': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Bajo': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'FISCAL': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PARTICULAR': return 'bg-utmach-sky-50 text-utmach-sky-700 dark:bg-utmach-sky-900 dark:text-utmach-sky-200';
      case 'FISCOMISIONAL': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'MUNICIPAL': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  chartData = computed<ChartConfiguration['data']>(() => {
    const data = this.topInstitutions();
    return {
      labels: data.map(i => i.institution.length > 30 ? i.institution.substring(0, 30) + '...' : i.institution),
      datasets: [{
        label: 'Puntaje Promedio',
        data: data.map(i => i.avgScore),
        backgroundColor: 'rgba(194, 53, 74, 0.5)',
        borderColor: '#C2354a',
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

  // Best Institutions Chart Data - Using institutional colors
  bestInstitutionsChartData = computed<ChartConfiguration['data']>(() => {
    const data = this.bestInstitutions();
    // Institutional colors: #005ca2 (Azul), #53aae1 (Azul celeste), #C2354a (Rojo)
    const colors = data.map((_, index) => {
      if (index < 3) return 'rgba(0, 92, 162, 0.7)'; // Top 3: Azul (autoridad, éxito)
      if (index < 7) return 'rgba(83, 170, 225, 0.7)'; // 4-7: Azul celeste (serenidad)
      return 'rgba(194, 53, 74, 0.7)'; // 8-10: Rojo (lucha y esfuerzo)
    });
    
    const borderColors = data.map((_, index) => {
      if (index < 3) return '#005ca2';
      if (index < 7) return '#53aae1';
      return '#C2354a';
    });

    return {
      labels: data.map(i => i.institution.length > 30 ? i.institution.substring(0, 30) + '...' : i.institution),
      datasets: [{
        label: 'Puntaje Promedio',
        data: data.map(i => i.avgScore),
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 2
      }]
    };
  });

  bestInstitutionsChartOptions = computed<ChartConfiguration['options']>(() => {
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
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const index = context.dataIndex;
              let category = '';
              if (index < 3) category = ' (Excelencia - Top 3)';
              else if (index < 7) category = ' (Alto Rendimiento)';
              else category = ' (Buen Desempeño)';
              return context.dataset.label + ': ' + context.parsed.x + category;
            }
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

  // Type Group Chart Data - Group by institution type
  typeGroupChartData = computed<ChartConfiguration['data']>(() => {
    const data = this.groupByType();
    return {
      labels: data.map(g => g.type || 'No especificado'),
      datasets: [{
        label: 'Puntaje Promedio',
        data: data.map(g => g.avgScoreFormatted),
        backgroundColor: data.map(g => this.getTypeColor(g.type) + '99'),
        borderColor: data.map(g => this.getTypeColor(g.type)),
        borderWidth: 2
      }]
    };
  });

  typeGroupChartOptions = computed<ChartConfiguration['options']>(() => {
    const isDark = this.isDarkMode();
    const textColor = isDark ? '#F3F4F6' : '#374151';
    const gridColor = isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)';
    
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            afterLabel: (context: any) => {
              const data = this.groupByType();
              const index = context.dataIndex;
              if (data[index]) {
                return `Instituciones: ${data[index].institutions.length} | Estudiantes: ${data[index].totalStudents}`;
              }
              return '';
            }
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

  // Modal methods
  openWorstModal(): void {
    this.isWorstModalOpen.set(true);
  }

  closeWorstModal(): void {
    this.isWorstModalOpen.set(false);
  }

  openBestModal(): void {
    this.isBestModalOpen.set(true);
  }

  closeBestModal(): void {
    this.isBestModalOpen.set(false);
  }

  // Sample size filter method
  applySampleSizeFilter(sampleSize: string): void {
    this.sampleSizeFilter.set(sampleSize);
    localStorage.setItem(this.STORAGE_KEY, sampleSize);
    this.parentComponent.reloadInstitutions(sampleSize || undefined);
    this.currentPage.set(1); // Reset to first page when filter changes
  }

  getSampleSizeLabel(): string {
    const current = this.sampleSizeFilter();
    if (!current) return '';
    const option = this.sampleSizeOptions.find(o => o.value === current);
    return option ? option.label : '';
  }

  getRiskLevelClass(riskLevel: string): string {
    if (riskLevel === 'Rendimiento Superior') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (riskLevel === 'Riesgo Alto') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (riskLevel === 'Riesgo Medio') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (riskLevel === 'Riesgo Bajo') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }

  // Get institution type color for charts
  getTypeColor(type: string): string {
    const typeUpper = type.toUpperCase();
    switch (typeUpper) {
      case 'FISCAL': return '#005ca2'; // Azul institucional
      case 'PARTICULAR': return '#53aae1'; // Azul celeste institucional
      case 'FISCOMISIONAL': return '#10B981'; // Verde (semafórico: positivo)
      case 'MUNICIPAL': return '#C2354a'; // Rojo institucional
      default: return '#6B7280'; // Gray
    }
  }
}
