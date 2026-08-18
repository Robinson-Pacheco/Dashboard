import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Upload, Filter, RefreshCw, FileDown } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';
import { AdmissionService } from '../../services/admission.service';
import { AdmissionData, AdmissionFilters } from '../../models/admission.model';

@Component({
  selector: 'app-admission-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterLink],
  templateUrl: './admission-list.component.html'
})
export class AdmissionListComponent implements OnInit {
  readonly Upload = Upload;
  readonly Filter = Filter;
  readonly RefreshCw = RefreshCw;
  readonly FileDown = FileDown;
  readonly Math = Math;

  private admissionService = inject(AdmissionService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  admissionData = signal<AdmissionData[]>([]);
  stats = signal<{
    totalStudents: number;
    averageScore: number;
    maxScore: number;
    minScore: number;
    admitidosCount: number;
    noAdmitidosCount: number;
  } | null>(null);
  isLoading = signal<boolean>(false);
  
  // Filters
  availablePeriods = signal<string[]>([]);
  availableYears = signal<number[]>([]);
  filterPeriod = signal<string>('');
  filterYear = signal<number | undefined>(undefined);
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalRecords = signal<number>(0);
  totalPages = signal<number>(1);

  // Computed
  displayedData = computed(() => this.admissionData());
  hasFilters = computed(() => !!this.filterPeriod() || !!this.filterYear());

  ngOnInit(): void {
    this.loadPeriodsYears();
  }

  loadPeriodsYears(): void {
    this.admissionService.getPeriodsYears().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.availablePeriods.set(response.data.periods || []);
          // Remove duplicate years using Set
          const uniqueYears = [...new Set(response.data.years || [])] as number[];
          this.availableYears.set(uniqueYears);
          
          // Set the most recent period and year as default
          if (response.data.periods.length > 0) {
            const mostRecentPeriod = response.data.periods[response.data.periods.length - 1];
            this.filterPeriod.set(mostRecentPeriod);
          }
          
          if (uniqueYears.length > 0) {
            const mostRecentYear = Math.max(...uniqueYears);
            this.filterYear.set(mostRecentYear);
          }
          
          // Load data after setting defaults
          this.loadAdmissionData();
          this.loadStats();
        }
      },
      error: (error) => {
        console.error('Error loading periods and years:', error);
        this.toastr.error('Error al cargar períodos y años disponibles', 'Error');
        // Still load data with empty filters
        this.loadAdmissionData();
        this.loadStats();
      }
    });
  }

  loadAdmissionData(): void {
    this.isLoading.set(true);
    
    const filters: AdmissionFilters = {
      page: this.currentPage(),
      limit: this.pageSize()
    };

    if (this.filterPeriod()) {
      filters.period = this.filterPeriod();
    }
    if (this.filterYear()) {
      filters.year = this.filterYear();
    }

    this.admissionService.getAdmissionData(filters).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        // Extract data from the nested structure
        const dataArray = Array.isArray(response.data.admissionData) ? response.data.admissionData : [];
        this.admissionData.set(dataArray);
        
        // Update pagination from the new structure
        this.totalRecords.set(response.data.totalRecords || 0);
        this.totalPages.set(response.data.totalPages || 1);
        this.currentPage.set(response.data.currentPage || 1);
        
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('API Error:', error);
        this.toastr.error('Error al cargar datos de admisión', 'Error');
        this.admissionData.set([]);
        this.isLoading.set(false);
      }
    });
  }

  loadStats(): void {
    this.admissionService.getAdmissionStats(
      this.filterPeriod() || undefined,
      this.filterYear()
    ).subscribe({
      next: (response) => {
        console.log('Stats Response:', response);
        // Extract stats from the nested data property
        this.stats.set(response.data);
      },
      error: (error) => {
        console.error('Stats Error:', error);
        this.stats.set(null);
      }
    });
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadAdmissionData();
    this.loadStats();
  }

  clearFilters(): void {
    this.filterPeriod.set('');
    this.filterYear.set(undefined);
    this.currentPage.set(1);
    this.loadAdmissionData();
    this.loadStats();
  }

  refreshData(): void {
    this.loadAdmissionData();
    this.loadStats();
    this.toastr.success('Datos actualizados', 'Éxito');
  }

  goToUpload(): void {
    this.router.navigate(['/admission/upload']);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
      this.loadAdmissionData();
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
      this.loadAdmissionData();
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadAdmissionData();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  }
}
