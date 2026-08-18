import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { LucideAngularModule, Filter } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';
import { AdvancedAnalyticsService } from './services/advanced-analytics.service';
import { GenderCareerData, DisabilityImpactData, ResponseStrategyData } from './models/advanced-analytics.model';

@Component({
  selector: 'app-advanced-analytics',
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterOutlet],
  templateUrl: './advanced-analytics.component.html'
})
export class AdvancedAnalyticsComponent implements OnInit {
  readonly Filter = Filter;

  private advancedAnalyticsService = inject(AdvancedAnalyticsService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  // State
  currentRoute = signal<string>('gender-career');
  isLoading = signal<boolean>(false);

  // Data - expose as observables for child components
  genderCareerData = signal<GenderCareerData | null>(null);
  disabilityImpactData = signal<DisabilityImpactData | null>(null);
  responseStrategyData = signal<ResponseStrategyData | null>(null);

  // Public getters for child components
  getGenderCareerData = () => this.genderCareerData();
  getDisabilityImpactData = () => this.disabilityImpactData();
  getResponseStrategyData = () => this.responseStrategyData();
  getIsLoading = () => this.isLoading();

  // Filters
  availablePeriods = signal<string[]>([]);
  availableYears = signal<number[]>([]);
  selectedPeriod = signal<string>('');
  selectedYear = signal<number>(0);

  ngOnInit(): void {
    this.loadPeriodsYears();
    
    // Set initial route
    const currentUrl = this.router.url;
    const route = currentUrl.split('/').pop() || 'gender-career';
    this.currentRoute.set(route);
    
    // Listen to route changes to determine which data to load
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const route = event.url.split('/').pop() || 'gender-career';
        this.currentRoute.set(route);
        if (this.selectedPeriod() && this.selectedYear()) {
          this.loadCurrentData();
        }
      }
    });
  }

  loadPeriodsYears(): void {
    this.advancedAnalyticsService.getPeriodsYears().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.availablePeriods.set(response.data.periods || []);
          const uniqueYears = [...new Set(response.data.years || [])] as number[];
          this.availableYears.set(uniqueYears);
          
          if (response.data.periods.length > 0) {
            const mostRecentPeriod = response.data.periods[response.data.periods.length - 1];
            this.selectedPeriod.set(mostRecentPeriod);
          }
          
          if (uniqueYears.length > 0) {
            const mostRecentYear = Math.max(...uniqueYears);
            this.selectedYear.set(mostRecentYear);
          }
          
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

    if (currentTab === 'gender-career') {
      this.advancedAnalyticsService.getGenderCareerAnalysis(period, year).subscribe({
        next: (response) => {
          this.genderCareerData.set(response.data || null);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading gender career analysis:', error);
          this.toastr.error('Error al cargar el análisis de género por carrera', 'Error');
          this.genderCareerData.set(null);
          this.isLoading.set(false);
        }
      });
    } else if (currentTab === 'disability-impact') {
      this.advancedAnalyticsService.getDisabilityImpactAnalysis(period, year).subscribe({
        next: (response) => {
          this.disabilityImpactData.set(response.data || null);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading disability impact analysis:', error);
          this.toastr.error('Error al cargar el análisis de impacto por discapacidad', 'Error');
          this.disabilityImpactData.set(null);
          this.isLoading.set(false);
        }
      });
    } else if (currentTab === 'response-strategy') {
      this.advancedAnalyticsService.getResponseStrategyAnalysis(period, year).subscribe({
        next: (response) => {
          this.responseStrategyData.set(response.data || null);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading response strategy analysis:', error);
          this.toastr.error('Error al cargar el análisis de estrategia de respuesta', 'Error');
          this.responseStrategyData.set(null);
          this.isLoading.set(false);
        }
      });
    }
  }

  applyFilters(): void {
    this.loadCurrentData();
  }

}
