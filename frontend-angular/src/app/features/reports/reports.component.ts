import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { LucideAngularModule, Filter } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';
import { DataMiningService } from './services/data-mining.service';
import {
  ComponentAnalysisData,
  InstitutionAnalysisData,
  GeographicAnalysisData,
  DifficultyAnalysisData,
  CareerAnalysisData
} from './models/data-mining.model';

@Component({
  selector: 'app-reports',
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterOutlet],
  templateUrl: './reports.component.html'
})
export class ReportsComponent implements OnInit {
  readonly Filter = Filter;

  private dataMiningService = inject(DataMiningService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  // State
  currentRoute = signal<string>('components');
  isLoading = signal<boolean>(false);

  // Data - expose as observables for child components
  componentData = signal<ComponentAnalysisData | null>(null);
  institutionData = signal<InstitutionAnalysisData | null>(null);
  geographicData = signal<GeographicAnalysisData | null>(null);
  difficultyData = signal<DifficultyAnalysisData | null>(null);
  careerData = signal<CareerAnalysisData | null>(null);

  // Public getters for child components
  getComponentData = () => this.componentData();
  getInstitutionData = () => this.institutionData();
  getGeographicData = () => this.geographicData();
  getDifficultyData = () => this.difficultyData();
  getCareerData = () => this.careerData();
  getIsLoading = () => this.isLoading();

  // Filters
  availablePeriods = signal<string[]>([]);
  availableYears = signal<number[]>([]);
  selectedPeriod = signal<string>('');
  selectedYear = signal<number>(0);

  ngOnInit(): void {
    // Load periods and years first
    this.loadPeriodsYears();
    
    // Set initial route
    const currentUrl = this.router.url;
    const route = currentUrl.split('/').pop() || 'components';
    this.currentRoute.set(route);
    
    // Listen to route changes to determine which data to load
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const route = event.url.split('/').pop() || 'components';
        this.currentRoute.set(route);
        if (this.selectedPeriod() && this.selectedYear()) {
          this.loadCurrentData();
        }
      }
    });
  }

  loadPeriodsYears(): void {
    this.dataMiningService.getPeriodsYears().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.availablePeriods.set(response.data.periods || []);
          // Remove duplicate years using Set
          const uniqueYears = [...new Set(response.data.years || [])] as number[];
          this.availableYears.set(uniqueYears);
          
          // Set the most recent period and year as default
          if (response.data.periods.length > 0) {
            const mostRecentPeriod = response.data.periods[response.data.periods.length - 1];
            this.selectedPeriod.set(mostRecentPeriod);
          }
          
          if (uniqueYears.length > 0) {
            const mostRecentYear = Math.max(...uniqueYears);
            this.selectedYear.set(mostRecentYear);
          }
          
          // Load data after setting defaults
          this.loadCurrentData();
        }
      },
      error: (error) => {
        console.error('Error loading periods and years:', error);
        this.toastr.error('Error al cargar períodos y años disponibles', 'Error');
      }
    });
  }

  loadCurrentData(): void {
    this.isLoading.set(true);
    const period = this.selectedPeriod();
    const year = this.selectedYear();

    const currentTab = this.currentRoute();

    if (currentTab === 'components') {
      this.dataMiningService.getComponentAnalysis(period, year).subscribe({
        next: (response) => {
          this.componentData.set(response.data || null);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading component analysis:', error);
          this.toastr.error('Error al cargar el análisis de componentes', 'Error');
          this.componentData.set(null);
          this.isLoading.set(false);
        }
      });
    } else if (currentTab === 'institutions') {
      this.dataMiningService.getInstitutionAnalysis(period, year).subscribe({
        next: (response) => {
          this.institutionData.set(response.data || null);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading institution analysis:', error);
          this.toastr.error('Error al cargar el análisis de instituciones', 'Error');
          this.institutionData.set(null);
          this.isLoading.set(false);
        }
      });
    } else if (currentTab === 'geographic') {
      this.dataMiningService.getGeographicAnalysis(period, year).subscribe({
        next: (response) => {
          this.geographicData.set(response.data || null);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading geographic analysis:', error);
          this.toastr.error('Error al cargar el análisis geográfico', 'Error');
          this.geographicData.set(null);
          this.isLoading.set(false);
        }
      });
    } else if (currentTab === 'difficulty') {
      this.dataMiningService.getDifficultyAnalysis(period, year).subscribe({
        next: (response) => {
          this.difficultyData.set(response.data || null);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading difficulty analysis:', error);
          this.toastr.error('Error al cargar el análisis de dificultad', 'Error');
          this.difficultyData.set(null);
          this.isLoading.set(false);
        }
      });
    } else if (currentTab === 'careers') {
      this.dataMiningService.getCareerAnalysis(period, year).subscribe({
        next: (response) => {
          this.careerData.set(response.data || null);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading career analysis:', error);
          this.toastr.error('Error al cargar el análisis de carreras', 'Error');
          this.careerData.set(null);
          this.isLoading.set(false);
        }
      });
    }
  }

  applyFilters(): void {
    this.loadCurrentData();
  }

  // Method to reload institution analysis with sample size filter
  reloadInstitutions(sampleSize?: string): void {
    this.isLoading.set(true);
    const period = this.selectedPeriod();
    const year = this.selectedYear();

    this.dataMiningService.getInstitutionAnalysis(period, year, sampleSize).subscribe({
      next: (response) => {
        this.institutionData.set(response.data || null);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading institution analysis:', error);
        this.toastr.error('Error al cargar el análisis de instituciones', 'Error');
        this.institutionData.set(null);
        this.isLoading.set(false);
      }
    });
  }

  // Method to reload geographic analysis with sample size filter
  reloadGeographic(sampleSize?: string): void {
    this.isLoading.set(true);
    const period = this.selectedPeriod();
    const year = this.selectedYear();

    this.dataMiningService.getGeographicAnalysis(period, year, sampleSize).subscribe({
      next: (response) => {
        this.geographicData.set(response.data || null);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading geographic analysis:', error);
        this.toastr.error('Error al cargar el análisis geográfico', 'Error');
        this.geographicData.set(null);
        this.isLoading.set(false);
      }
    });
  }

}