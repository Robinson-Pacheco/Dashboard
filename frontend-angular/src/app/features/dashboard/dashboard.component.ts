import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule, BarChart3, TrendingUp, Users, Award, Accessibility, Filter, Info,
  Shield, Brain, FileBarChart, Lock, Database, MapPin, GraduationCap, Building2,
  CheckCircle2, XCircle, Target, PieChart, BookOpen, TrendingDown,
  Sparkles, Lightbulb, Zap, Activity, Crown, Trophy, Rocket, Eye, Flame, Gauge,
  HeartHandshake, Layers, ArrowUpRight, Star, Clock, Calendar, Wand2, AlertTriangle,
  Mars, Venus, Scale, X
} from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { toSignal } from '@angular/core/rxjs-interop';
import { BIService } from './services/bi.service';
import { BIDashboard, ExecutiveSummary, FilteredData, CareerCuposByGender } from './models/bi.model';
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
  readonly Sparkles = Sparkles;
  readonly Lightbulb = Lightbulb;
  readonly Zap = Zap;
  readonly Activity = Activity;
  readonly Crown = Crown;
  readonly Trophy = Trophy;
  readonly Rocket = Rocket;
  readonly Eye = Eye;
  readonly Flame = Flame;
  readonly Gauge = Gauge;
  readonly HeartHandshake = HeartHandshake;
  readonly Layers = Layers;
  readonly ArrowUpRight = ArrowUpRight;
  readonly Star = Star;
  readonly Clock = Clock;
  readonly Calendar = Calendar;
  readonly Wand2 = Wand2;
  readonly AlertTriangle = AlertTriangle;
  readonly Mars = Mars;
  readonly Venus = Venus;
  readonly Scale = Scale;
  readonly X = X;

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
    const pctNumber = total > 0 ? (admitidos / total) * 100 : 0;
    let level: 'high' | 'medium' | 'low' = 'medium';
    if (pctNumber >= 60) level = 'high';
    else if (pctNumber < 35) level = 'low';
    return {
      total,
      admitidos,
      noAdmitidos,
      pctAdmitidos,
      pctNumber,
      level,
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
      porcentaje: ((p.count / total) * 100).toFixed(1),
      porcentajeNum: (p.count / total) * 100
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

  // Ranking completo carreras demandadas (flotante)
  showDemandDetails = signal<boolean>(false);
  demandSortDir = signal<'desc' | 'asc'>('desc');
  allCareersDemand = computed(() => this.filteredData()?.carrerasPopulares || []);
  sortedDemandList = computed(() => {
    const list = [...this.allCareersDemand()];
    const dir = this.demandSortDir();
    list.sort((a, b) => dir === 'desc' ? b.postulantes - a.postulantes : a.postulantes - b.postulantes);
    return list;
  });

  medianaStats = computed(() => {
    const medianData = this.medianDistribution();
    return {
      mediana: medianData?.statistics?.median ? Number(medianData.statistics.median).toFixed(1) : null,
      stdDev: medianData?.statistics?.standardDeviation ? Number(medianData.statistics.standardDeviation).toFixed(1) : null,
      mean: medianData?.statistics?.mean ? Number(medianData.statistics.mean).toFixed(1) : null,
      totalStudents: medianData?.totalStudents || null
    };
  });

  medianDistribution = signal<MedianDistributionData | null>(null);
  isLoadingMedian = signal<boolean>(false);
  careerCupos = signal<CareerCuposByGender | null>(null);
  isLoadingCupos = signal<boolean>(false);
  isDarkMode = toSignal(this.darkModeService.isDarkMode$, { initialValue: false });

  // ===== NUEVO: Insights inteligentes =====
  heroInsight = computed(() => {
    const total = this.execStats()?.totalPostulantes || 0;
    const avg = this.execStats()?.promedioGeneral || 0;
    const carrera = this.execStats()?.carreraMasDemandada?.carrera;
    const provincia = this.execStats()?.provinciaConMasPostulantes?.provincia || this.topProvinces()[0]?.provincia;
    const admitidos = this.admitidosStats();
    const periodLabel = this.selectedPeriod() ? `período ${this.selectedPeriod()}` : 'todos los períodos';
    const yearLabel = this.selectedYear() ? ` ${this.selectedYear()}` : '';
    if (!total) return {
      title: 'Explora los resultados de admisión',
      subtitle: 'Selecciona filtros para descubrir insights inteligentes al instante',
      highlight: 'Sin datos aún',
      detail: 'Carga datos o ajusta los filtros para ver el análisis'
    };
    const carreraShort = carrera ? (carrera.length > 28 ? carrera.slice(0, 28) + '…' : carrera) : '—';
    const tasa = admitidos.pctAdmitidos;
    let mood: 'excelente' | 'bueno' | 'atencion' = 'bueno';
    if (Number(tasa) >= 55) mood = 'excelente';
    else if (Number(tasa) < 35) mood = 'atencion';
    return {
      title: total > 1000 ? `${total.toLocaleString('es-EC')} jóvenes soñando en grande` : `${total.toLocaleString('es-EC')} postulantes evaluados`,
      subtitle: `Promedio general ${Number(avg).toFixed(1)} pts · ${periodLabel}${yearLabel}`,
      highlight: carrera ? `Top: ${carreraShort}` : `Origen líder: ${provincia || '—'}`,
      detail: mood === 'excelente'
        ? `¡Gran tasa de asignación del ${tasa}%! El sistema está asignando cupos eficientemente.`
        : mood === 'atencion'
          ? `Tasa de asignación del ${tasa}% sugiere alta competitividad — revisa el detalle por componentes.`
          : `${tasa}% con cupo asignado · Observa el desglose por provincia y componente abajo.`,
      mood
    };
  });

  smartInsights = computed(() => {
    const insights: { icon: any; color: string; bg: string; title: string; desc: string; badge?: string }[] = [];
    const total = this.execStats()?.totalPostulantes || 0;
    if (!total) return insights;

    // 1. Provincia dominante
    const topProv = this.topProvinces()[0];
    if (topProv) {
      const pct = parseFloat(topProv.porcentaje);
      insights.push({
        icon: this.MapPin,
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50',
        title: `${topProv.provincia} lidera`,
        desc: `Concentra ${topProv.porcentaje}% (${topProv.cantidad.toLocaleString('es-EC')}) del total. ${pct > 50 ? 'Alta concentración geográfica.' : pct > 30 ? 'Origen predominante.' : 'Distribución relativamente equilibrada.'}`,
        badge: `#1 Origen`
      });
    }

    // 2. Brecha de género
    const genero = this.execStats()?.distribucionGenero || [];
    if (genero.length >= 2) {
      const sorted = [...genero].sort((a, b) => b.cantidad - a.cantidad);
      const gap = Math.abs(sorted[0].porcentaje - sorted[1].porcentaje);
      insights.push({
        icon: this.Users,
        color: 'text-sky-600 dark:text-sky-400',
        bg: 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/50',
        title: gap < 5 ? 'Paridad de género' : `${sorted[0].genero} predomina`,
        desc: gap < 5
          ? `Equilibrio notable: ${sorted[0].porcentaje}% vs ${sorted[1].porcentaje}%. Población muy paritaria.`
          : `Diferencia de ${gap.toFixed(1)} pts entre ${sorted[0].genero} (${sorted[0].porcentaje}%) y ${sorted[1].genero} (${sorted[1].porcentaje}%).`,
        badge: gap < 5 ? 'Equilibrado' : 'Brecha'
      });
    } else if (genero.length === 1) {
      insights.push({
        icon: this.Users,
        color: 'text-sky-600 dark:text-sky-400',
        bg: 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/50',
        title: `${genero[0].genero} único`,
        desc: `El ${genero[0].porcentaje}% de postulantes es ${genero[0].genero}. Población homogénea en este filtro.`,
        badge: 'Dato'
      });
    }

    // 3. Componente crítico / estrella
    const perf = this.performance();
    if (perf.length) {
      const sortedByAvg = [...perf].sort((a, b) => a.averageScore - b.averageScore);
      const weakest = sortedByAvg[0];
      const strongest = sortedByAvg[sortedByAvg.length - 1];
      const diff = strongest.averageScore - weakest.averageScore;
      insights.push({
        icon: this.Flame,
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50',
        title: `Reto: ${weakest.component}`,
        desc: `Promedio más bajo (${weakest.averageScore.toFixed(1)} pts). ${diff > 150 ? 'Brecha amplia vs. el mejor componente.' : 'Requiere refuerzo académico.'} El más fuerte: ${strongest.component} (${strongest.averageScore.toFixed(1)}).`,
        badge: 'Atención'
      });
    }

    // 4. Asignación / inclusión
    const adm = this.admitidosStats();
    const dis = this.disability();
    if (dis && Number(dis.disabilityPercentage) > 0) {
      insights.push({
        icon: this.HeartHandshake,
        color: 'text-violet-600 dark:text-violet-400',
        bg: 'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/50',
        title: `Inclusión: ${dis.withDisabilityCard} con carnet`,
        desc: `${dis.disabilityPercentage}% del total. ${Number(dis.disabilityPercentage) > 3 ? 'Presencia inclusiva destacada.' : 'Seguimiento de política inclusiva activo.'}`,
        badge: 'Inclusivo'
      });
    } else if (adm.total > 0) {
      insights.push({
        icon: this.Trophy,
        color: adm.level === 'high' ? 'text-emerald-600 dark:text-emerald-400' : adm.level === 'low' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300',
        bg: adm.level === 'high' ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50' : adm.level === 'low' ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
        title: adm.level === 'high' ? 'Alta asignación' : adm.level === 'low' ? 'Alta selectividad' : 'Asignación equilibrada',
        desc: `${adm.pctAdmitidos}% con cupo (${adm.admitidos.toLocaleString('es-EC')}). ${adm.level === 'high' ? 'Muchos aspirantes lograron cupo.' : adm.level === 'low' ? 'Competencia intensa por cupos.' : 'Tasa intermedia, revisa distribución por carrera.'}`,
        badge: `${adm.pctAdmitidos}%`
      });
    }

    return insights.slice(0, 4);
  });

  activeFilterChips = computed(() => {
    const chips: string[] = [];
    if (this.selectedPeriod()) chips.push(`Período: ${this.selectedPeriod()}`);
    if (this.selectedYear()) chips.push(`Año: ${this.selectedYear()}`);
    if (chips.length === 0) chips.push('Todos los datos');
    return chips;
  });

  hasActiveFilters = computed(() => !!(this.selectedPeriod() || this.selectedYear()));

  scoreRange = computed(() => {
    const stats = this.dashboardData()?.statistics;
    if (!stats) return null;
    const max = Number(stats.maxScore) || 1000;
    const min = Number(stats.minScore) || 0;
    const range = max - min;
    return { max: max.toFixed(1), min: min.toFixed(1), range: range.toFixed(1) };
  });

  // ===== Cupos por carrera y género =====
  cuposResumen = computed(() => this.careerCupos()?.resumen || []);
  cuposTotales = computed(() => this.careerCupos()?.totales || null);
  hasCuposData = computed(() => (this.careerCupos()?.resumen?.length || 0) > 0);
  showCuposDetails = signal<boolean>(false);
  cuposSortBy = signal<'total' | 'masculino' | 'femenino'>('total');
  cuposSortDir = signal<'desc' | 'asc'>('desc');

  sortedCuposResumen = computed(() => {
    const list = [...this.cuposResumen()];
    const sortBy = this.cuposSortBy();
    const dir = this.cuposSortDir();
    list.sort((a, b) => {
      let va: number, vb: number;
      if (sortBy === 'masculino') { va = a.masculino; vb = b.masculino; }
      else if (sortBy === 'femenino') { va = a.femenino; vb = b.femenino; }
      else { va = a.total; vb = b.total; }
      return dir === 'desc' ? vb - va : va - vb;
    });
    return list;
  });

  toggleCuposSort(field: 'total' | 'masculino' | 'femenino'): void {
    if (this.cuposSortBy() === field) {
      this.cuposSortDir.update(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      this.cuposSortBy.set(field);
      this.cuposSortDir.set('desc');
    }
  }

  cuposChartData = computed<ChartConfiguration['data']>(() => {
    const resumen = this.cuposResumen().slice(0, 6);
    if (!resumen.length) return { labels: [], datasets: [] };
    return {
      labels: resumen.map(r => {
        const name = r.carrera.split('-')[1] || r.carrera;
        return name.length > 20 ? name.slice(0, 20) + '…' : name;
      }),
      datasets: [
        {
          label: '♂ Hombres',
          data: resumen.map(r => r.masculino),
          backgroundColor: '#005ca2',
          hoverBackgroundColor: '#004a82',
          borderWidth: 0,
          borderRadius: 8 as any,
          borderSkipped: false as any,
          barPercentage: 0.7,
          categoryPercentage: 0.75
        },
        {
          label: '♀ Mujeres',
          data: resumen.map(r => r.femenino),
          backgroundColor: '#C2354a',
          hoverBackgroundColor: '#9b2b3b',
          borderWidth: 0,
          borderRadius: 8 as any,
          borderSkipped: false as any,
          barPercentage: 0.7,
          categoryPercentage: 0.75
        }
      ]
    };
  });

  cuposChartOptions = computed<ChartConfiguration['options']>(() => {
    const dark = this.isDarkMode();
    return {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y' as const,
      interaction: { intersect: false, mode: 'index' as const },
      layout: { padding: { left: 4, right: 12, top: 4, bottom: 4 } },
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            color: dark ? '#CBD5E1' : '#475569',
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 16,
            font: { size: 11, weight: 'bold' } as any,
            boxWidth: 8
          }
        },
        tooltip: {
          backgroundColor: dark ? '#0f172a' : '#ffffff',
          titleColor: dark ? '#f8fafc' : '#0f172a',
          bodyColor: dark ? '#e2e8f0' : '#334155',
          borderColor: dark ? '#334155' : '#e2e8f0',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 12,
          displayColors: true,
          boxPadding: 4,
          titleFont: { size: 13, weight: 'bold' } as any,
          bodyFont: { size: 12 } as any,
          callbacks: {
            title: (items: any) => {
              const idx = items[0]?.dataIndex;
              const r = this.cuposResumen()[idx];
              return r ? r.carrera : items[0]?.label || '';
            },
            footer: (items: any) => {
              const idx = items[0]?.dataIndex;
              const r = this.cuposResumen()[idx];
              if (!r) return '';
              return `Total: ${r.total} cupos · H ${r.pctMasculino}% · M ${r.pctFemenino}%`;
            }
          } as any
        }
      },
      scales: {
        x: {
          stacked: false,
          beginAtZero: true,
          border: { display: false },
          ticks: { color: dark ? '#64748B' : '#94A3B8', precision: 0, font: { size: 11 } as any, padding: 8 },
          grid: { color: dark ? 'rgba(148,163,184,0.08)' : 'rgba(241,245,249,1)', drawTicks: false }
        },
        y: {
          stacked: false,
          border: { display: false },
          ticks: { color: dark ? '#E2E8F0' : '#1e293b', font: { size: 11, weight: 600 } as any, padding: 8 },
          grid: { display: false }
        }
      }
    };
  });

  provinceChartData = computed<ChartConfiguration['data']>(() => {
    const provs = this.topProvinces();
    return {
      labels: provs.map(p => p.provincia),
      datasets: [{
        label: 'Postulantes',
        data: provs.map(p => p.cantidad),
        backgroundColor: ['#005ca2', '#0d6ab3', '#1a78c4', '#3388cc', '#53aae1'],
        borderRadius: 8 as any,
        borderSkipped: false as any,
        barThickness: 14
      }]
    };
  });

  genderChartData = computed<ChartConfiguration['data']>(() => {
    const dist = this.executiveSummary()?.distribucionGenero || [];
    return {
      labels: dist.map(d => d.genero),
      datasets: [{
        data: dist.map(d => d.cantidad),
        backgroundColor: ['#005ca2', '#C2354a', '#53aae1', '#10B981', '#f59e0b'],
        borderColor: ['#004a82', '#9b2b3b', '#2d9ad9', '#059669', '#d97706'],
        borderWidth: 2,
        hoverOffset: 8
      }]
    };
  });

  educationChartData = computed<ChartConfiguration['data']>(() => {
    const education = this.demographics()?.educationalUnit || [];
    return {
      labels: education.map(e => e._id || 'No especificado'),
      datasets: [{
        data: education.map(e => e.count),
        backgroundColor: ['#005ca2', '#10B981', '#53aae1', '#C2354a', '#f59e0b', '#8b5cf6'],
        borderWidth: 2,
        hoverOffset: 6
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
        borderWidth: 1,
        borderRadius: 6 as any
      }]
    };
  });

  performanceChartData = computed<ChartConfiguration['data']>(() => {
    const p = this.performance();
    return {
      labels: p.map(x => x.component),
      datasets: [
        { label: 'Promedio', data: p.map(x => x.averageScore), backgroundColor: 'rgba(0, 92, 162, 0.7)', borderColor: '#005ca2', borderWidth: 2, type: 'bar' as const, borderRadius: 8 as any },
        { label: 'Máximo', data: p.map(x => typeof x.maxScore === 'string' ? parseFloat(x.maxScore) : x.maxScore), borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 2.5, type: 'line' as const, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#10B981' }
      ]
    };
  });

  admissionDoughnutData = computed<ChartConfiguration['data']>(() => {
    const adm = this.admitidosStats();
    return {
      labels: ['Con cupo', 'Sin cupo'],
      datasets: [{
        data: [adm.admitidos, adm.noAdmitidos],
        backgroundColor: ['#10b981', '#e2e8f0'],
        borderColor: ['#059669', '#cbd5e1'],
        borderWidth: 2,
        hoverOffset: 6
      }]
    };
  });

  admissionDoughnutOptions = computed<ChartConfiguration['options']>(() => {
    const dark = this.isDarkMode();
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: dark ? '#1e293b' : '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#e2e8f0',
          borderColor: dark ? '#334155' : '#1e293b',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 10
        }
      }
    };
  });

  pieChartOptions = computed<ChartConfiguration['options']>(() => {
    const dark = this.isDarkMode();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' as const, labels: { color: dark ? '#CBD5E1' : '#475569', padding: 14, usePointStyle: true, pointStyle: 'circle', font: { size: 11, weight: 500 } as any } },
        tooltip: {
          backgroundColor: dark ? '#1e293b' : '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#e2e8f0',
          borderColor: dark ? '#334155' : '#1e293b',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 10
        }
      }
    };
  });

  doughnutCenterOptions = computed<ChartConfiguration['options']>(() => {
    const dark = this.isDarkMode();
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { position: 'bottom' as const, labels: { color: dark ? '#CBD5E1' : '#475569', padding: 16, usePointStyle: true, pointStyle: 'circle' } },
        tooltip: {
          backgroundColor: dark ? '#1e293b' : '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#e2e8f0',
          padding: 10,
          cornerRadius: 10
        }
      }
    };
  });

  barChartOptions = computed<ChartConfiguration['options']>(() => {
    const dark = this.isDarkMode();
    return {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' as const, labels: { color: dark ? '#CBD5E1' : '#475569', usePointStyle: true, pointStyle: 'circle', font: { size: 11 } as any } },
        tooltip: {
          backgroundColor: dark ? '#1e293b' : '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#e2e8f0',
          borderColor: dark ? '#334155' : '#1e293b',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 10
        }
      },
      scales: {
        y: { beginAtZero: true, ticks: { color: dark ? '#94A3B8' : '#64748B', font: { size: 11 } as any }, grid: { color: dark ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.18)' } },
        x: { ticks: { color: dark ? '#94A3B8' : '#64748B', font: { size: 11 } as any, maxRotation: 0 }, grid: { display: false } }
      }
    };
  });

  hBarChartOptions = computed<ChartConfiguration['options']>(() => {
    const dark = this.isDarkMode();
    return {
      indexAxis: 'y' as const,
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: dark ? '#1e293b' : '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#e2e8f0',
          padding: 10,
          cornerRadius: 10
        }
      },
      scales: {
        x: { beginAtZero: true, ticks: { color: dark ? '#94A3B8' : '#64748B', precision: 0 }, grid: { color: dark ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.18)' } },
        y: { ticks: { color: dark ? '#E2E8F0' : '#334155', font: { size: 11, weight: 600 } as any }, grid: { display: false } }
      }
    };
  });

  mixedChartOptions = computed<ChartConfiguration['options']>(() => {
    const dark = this.isDarkMode();
    return {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' as const, labels: { color: dark ? '#CBD5E1' : '#475569', usePointStyle: true } },
        tooltip: {
          backgroundColor: dark ? '#1e293b' : '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#e2e8f0',
          padding: 10,
          cornerRadius: 10
        }
      },
      scales: {
        y: { beginAtZero: true, ticks: { color: dark ? '#94A3B8' : '#64748B' }, grid: { color: dark ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.18)' } },
        x: { ticks: { color: dark ? '#94A3B8' : '#64748B' }, grid: { display: false } }
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
    this.isLoadingCupos.set(true);
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
      }),
      new Promise<void>(resolve => {
        this.biService.getCareerCuposByGender(period, year).subscribe({
          next: r => { this.careerCupos.set(r.data); this.isLoadingCupos.set(false); resolve(); },
          error: () => { this.careerCupos.set(null); this.isLoadingCupos.set(false); resolve(); }
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

  getPerformanceLevel(score: number): { label: string; color: string; bg: string; width: number } {
    const pct = (score / 1000) * 100;
    if (score >= 750) return { label: 'Excelente', color: 'text-emerald-600 dark:text-emerald-400', bg: 'from-emerald-500 to-teal-500', width: pct };
    if (score >= 600) return { label: 'Bueno', color: 'text-sky-600 dark:text-sky-400', bg: 'from-sky-500 to-utmach-blue', width: pct };
    if (score >= 400) return { label: 'Medio', color: 'text-amber-600 dark:text-amber-400', bg: 'from-amber-500 to-orange-500', width: pct };
    return { label: 'Atención', color: 'text-rose-600 dark:text-rose-400', bg: 'from-rose-500 to-red-600', width: pct };
  }
}
