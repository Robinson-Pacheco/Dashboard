import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule, BarChart3, TrendingUp, Users, Award, Accessibility, Filter, Info,
  Shield, Brain, FileBarChart, Lock, Database, MapPin, GraduationCap, Building2,
  CheckCircle2, XCircle, Target, PieChart, BookOpen, TrendingDown
} from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { toSignal } from '@angular/core/rxjs-interop';
import { BIService } from './services/bi.service';
import { BIDashboard, ExecutiveSummary, FilteredData } from './models/bi.model';
import { StatisticalDistributionService } from '../statistical-distribution/services/statistical-distribution.service';
import { MedianDistributionData } from '../statistical-distribution/models/statistical-distribution.model';
import annotationPlugin from 'chartjs-plugin-annotation';
import { InfoTooltipComponent } from '../../shared/components/info-tooltip/info-tooltip.component';
import { RoleService, UserRole } from '../../core/services/role.service';
import { AuthService } from '../../core/services/auth.service';
import { DarkModeService } from '../../services/dark-mode';

Chart.register(...registerables, annotationPlugin);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, LucideAngularModule, BaseChartDirective, InfoTooltipComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  readonly BarChart3 = BarChart3;
  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
  readonly Users = Users;
  readonly Award = Award;
  readonly Accessibility = Accessibility;
  readonly Filter = Filter;
  readonly Info = Info;
  readonly Shield = Shield;
  readonly Brain = Brain;
  readonly FileBarChart = FileBarChart;
  readonly Lock = Lock;
  readonly Database = Database;
  readonly MapPin = MapPin;
  readonly GraduationCap = GraduationCap;
  readonly Building2 = Building2;
  readonly CheckCircle2 = CheckCircle2;
  readonly XCircle = XCircle;
  readonly Target = Target;
  readonly PieChart = PieChart;
  readonly BookOpen = BookOpen;

  private biService = inject(BIService);
  private statisticalService = inject(StatisticalDistributionService);
  private toastr = inject(ToastrService);
  private roleService = inject(RoleService);
  private authService = inject(AuthService);
  private darkModeService = inject(DarkModeService);

  dashboardData = signal<BIDashboard | null>(null);
  executiveSummary = signal<ExecutiveSummary | null>(null);
  filteredData = signal<FilteredData | null>(null);
  isLoading = signal<boolean>(false);
  activeTab = signal<'resumen' | 'detalle'>('resumen');

  currentUser = computed(() => this.authService.currentUser());
  currentRole = computed(() => this.roleService.currentRole());
  userPermissions = computed(() => this.roleService.permissions());
  isAdmin = computed(() => this.roleService.isAdmin());
  isAnalyst = computed(() => this.roleService.isAnalyst());

  roleDisplayInfo = computed(() => {
    const role = this.currentRole();
    const info: Record<UserRole, { label: string; color: string; icon: any; description: string }> = {
      admin: { label: 'Administrador', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: this.Shield, description: 'Acceso completo al sistema' },
      analyst: { label: 'Analista', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: this.Brain, description: 'Análisis de datos e IA' },
      viewer: { label: 'Visualizador', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: this.FileBarChart, description: 'Reportes y visualización' }
    };
    return role ? info[role] : null;
  });

  availablePeriods = signal<string[]>([]);
  availableYears = signal<number[]>([]);
  selectedPeriod = signal<string>('');
  selectedYear = signal<number | undefined>(undefined);

  // Executive summary computed
  execStats = computed(() => this.executiveSummary());
  demographics = computed(() => this.dashboardData()?.demographics || null);
  performance = computed(() => this.dashboardData()?.componentPerformance || []);
  disability = computed(() => this.dashboardData()?.disabilityStats || null);

  admitidosStats = computed(() => {
    const stats = this.dashboardData()?.statistics;
    const total = this.execStats()?.totalPostulantes || stats?.totalApplications || 0;
    const admitidos = stats?.admitidosCount || 0;
    const noAdmitidos = stats?.noAdmitidosCount || 0;
    const pctAdmitidos = total > 0 ? ((admitidos / total) * 100).toFixed(1) : '0';
    return {
      total,
      admitidos,
      noAdmitidos,
      pctAdmitidos,
      maxScore: stats?.maxScore ? Number(stats.maxScore).toFixed(1) : '0',
      minScore: stats?.minScore ? Number(stats.minScore).toFixed(1) : '0'
    };
  });

  topProvinces = computed(() => {
    const provs = this.demographics()?.province || [];
    const total = this.execStats()?.totalPostulantes || 1;
    return provs.slice(0, 5).map(p => ({
      provincia: p._id || 'Sin especificar',
      cantidad: p.count,
      porcentaje: ((p.count / total) * 100).toFixed(1)
    }));
  });

  topEducationList = computed(() => {
    const ed = this.demographics()?.educationalUnit || [];
    const total = this.execStats()?.totalPostulantes || 1;
    return ed.map(e => ({
      tipo: e._id || 'Sin especificar',
      cantidad: e.count,
      porcentaje: ((e.count / total) * 100).toFixed(1)
    }));
  });

  topCareersList = computed(() => {
    const popular = this.filteredData()?.carrerasPopulares || [];
    if (popular.length > 0) {
      return popular.slice(0, 3);
    }
    const main = this.execStats()?.carreraMasDemandada;
    return main ? [{ carrera: main.carrera, postulantes: main.postulantes }] : [];
  });

  medianaStats = computed(() => {
    const medianData = this.medianDistribution();
    return {
      mediana: medianData?.statistics?.median ? Number(medianData.statistics.median).toFixed(1) : null,
      stdDev: medianData?.statistics?.standardDeviation ? Number(medianData.statistics.standardDeviation).toFixed(1) : null
    };
  });

  medianDistribution = signal<MedianDistributionData | null>(null);
  isLoadingMedian = signal<boolean>(false);
  isDarkMode = toSignal(this.darkModeService.isDarkMode$, { initialValue: false });

  genderChartData = computed<ChartConfiguration['data']>(() => {
    const dist = this.executiveSummary()?.distribucionGenero || [];
    return {
      labels: dist.map(d => d.genero),
      datasets: [{
        data: dist.map(d => d.cantidad),
        backgroundColor: ['#005ca2', '#C2354a'],
        borderColor: ['#004a82', '#9b2b3b'],
        borderWidth: 1
      }]
    };
  });

  educationChartData = computed<ChartConfiguration['data']>(() => {
    const education = this.demographics()?.educationalUnit || [];
    return {
      labels: education.map(e => e._id || 'No especificado'),
      datasets: [{
        data: education.map(e => e.count),
        backgroundColor: ['#10B981', '#005ca2', '#53aae1', '#C2354a', '#004a82'],
        borderWidth: 1
      }]
    };
  });

  disabilityChartData = computed<ChartConfiguration['data']>(() => {
    const disability = this.disability();
    if (!disability) return { labels: [], datasets: [] };
    return {
      labels: disability.disabilityTypeBreakdown.map(d => d._id),
      datasets: [{
        label: 'Cantidad',
        data: disability.disabilityTypeBreakdown.map(d => d.count),
        backgroundColor: '#005ca2',
        borderColor: '#004a82',
        borderWidth: 1
      }]
    };
  });

  performanceChartData = computed<ChartConfiguration['data']>(() => {
    const p = this.performance();
    return {
      labels: p.map(x => x.component),
      datasets: [
        { label: 'Promedio', data: p.map(x => x.averageScore), backgroundColor: 'rgba(0, 92, 162, 0.5)', borderColor: '#005ca2', borderWidth: 2, type: 'bar' as const },
        { label: 'Máximo', data: p.map(x => typeof x.maxScore === 'string' ? parseFloat(x.maxScore) : x.maxScore), borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 2, type: 'line' as const, tension: 0.4 }
      ]
    };
  });

  pieChartOptions = computed<ChartConfiguration['options']>(() => {
    const dark = this.isDarkMode();
    return { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: dark ? '#9CA3AF' : '#4B5563' } } } };
  });

  barChartOptions = computed<ChartConfiguration['options']>(() => {
    const dark = this.isDarkMode();
    return {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'top', labels: { color: dark ? '#9CA3AF' : '#4B5563' } } },
      scales: {
        y: { beginAtZero: true, ticks: { color: dark ? '#9CA3AF' : '#4B5563' }, grid: { color: dark ? 'rgba(156,163,175,0.1)' : 'rgba(156,163,175,0.2)' } },
        x: { ticks: { color: dark ? '#9CA3AF' : '#4B5563' }, grid: { color: dark ? 'rgba(156,163,175,0.1)' : 'rgba(156,163,175,0.2)' } }
      }
    };
  });

  mixedChartOptions = computed<ChartConfiguration['options']>(() => {
    const dark = this.isDarkMode();
    return {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'top', labels: { color: dark ? '#9CA3AF' : '#4B5563' } } },
      scales: {
        y: { beginAtZero: true, ticks: { color: dark ? '#9CA3AF' : '#4B5563' }, grid: { color: dark ? 'rgba(156,163,175,0.1)' : 'rgba(156,163,175,0.2)' } },
        x: { ticks: { color: dark ? '#9CA3AF' : '#4B5563' }, grid: { color: dark ? 'rgba(156,163,175,0.1)' : 'rgba(156,163,175,0.2)' } }
      }
    };
  });

  ngOnInit(): void {
    this.loadPeriodsYears();
    this.loadAll();
  }

  loadPeriodsYears(): void {
    this.biService.getPeriodsYears().subscribe({
      next: (response) => {
        this.availablePeriods.set(response.data.periods || []);
        this.availableYears.set([...new Set(response.data.years || [])]);
      }
    });
  }

  loadAll(): void {
    this.isLoading.set(true);
    const period = this.selectedPeriod() || undefined;
    const year = this.selectedYear();

    Promise.all([
      new Promise<void>(resolve => {
        this.biService.getExecutiveSummary(period, year).subscribe({
          next: r => { this.executiveSummary.set(r.data); resolve(); },
          error: () => { this.executiveSummary.set(null); resolve(); }
        });
      }),
      new Promise<void>(resolve => {
        this.biService.getDashboard(period, year).subscribe({
          next: r => { this.dashboardData.set(r.data); resolve(); },
          error: () => { this.dashboardData.set(null); resolve(); }
        });
      }),
      new Promise<void>(resolve => {
        this.statisticalService.getMedianDistribution(period, year).subscribe({
          next: r => { this.medianDistribution.set(r.data); resolve(); },
          error: () => { this.medianDistribution.set(null); resolve(); }
        });
      }),
      new Promise<void>(resolve => {
        this.biService.getFilteredData({ period, year }).subscribe({
          next: (r: any) => { this.filteredData.set(r.data); resolve(); },
          error: () => { this.filteredData.set(null); resolve(); }
        });
      })
    ]).then(() => this.isLoading.set(false));
  }

  applyFilters(): void { this.loadAll(); }
  clearFilters(): void {
    this.selectedPeriod.set('');
    this.selectedYear.set(undefined);
    this.loadAll();
  }
}
