import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { LucideAngularModule, BarChart3 } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';
import { StatisticalDistributionService } from './services/statistical-distribution.service';
import {
  DistributionAnalysisData,
  ComponentsListData,
  ComparativeAnalysisData
} from './models/statistical-distribution.model';

@Component({
  selector: 'app-statistical-distribution',
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterOutlet],
  templateUrl: './statistical-distribution.component.html'
})
export class StatisticalDistributionComponent implements OnInit {
  readonly BarChart3 = BarChart3;

  private statisticalService = inject(StatisticalDistributionService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  // State
  currentRoute = signal<string>('distribution');
  isLoading = signal<boolean>(false);

  // Data - expose as signals for child components
  distributionData = signal<DistributionAnalysisData | null>(null);
  componentsListData = signal<ComponentsListData | null>(null);
  comparativeData = signal<ComparativeAnalysisData | null>(null);

  // Public getters for child components
  getDistributionData = () => this.distributionData();
  getComponentsListData = () => this.componentsListData();
  getComparativeData = () => this.comparativeData();
  getIsLoading = () => this.isLoading();

  // Filters
  availablePeriods = signal<string[]>([]);
  availableYears = signal<number[]>([]);
  availableComponents = signal<string[]>([]);
  selectedPeriod = signal<string>('');
  selectedYear = signal<number>(0);
  selectedComponent = signal<string>('');

  ngOnInit(): void {
    // Load periods and years first
    this.loadPeriodsYears();

    // Set initial route
    const currentUrl = this.router.url;
    const route = currentUrl.split('/').pop() || 'distribution';
    this.currentRoute.set(route);

    // Listen to route changes to determine which data to load
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const route = event.url.split('/').pop() || 'distribution';
        this.currentRoute.set(route);
        if (this.selectedPeriod() && this.selectedYear()) {
          this.loadCurrentData();
        }
      }
    });
  }

  loadPeriodsYears(): void {
    this.statisticalService.getPeriodsYears().subscribe({
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

          // Load available components after setting defaults
          this.loadAvailableComponents();
        }
      },
      error: (error) => {
        console.error('Error loading periods and years:', error);
        this.toastr.error('Error al cargar períodos y años disponibles', 'Error');
      }
    });
  }

  loadAvailableComponents(): void {
    const period = this.selectedPeriod();
    const year = this.selectedYear();

    this.statisticalService.getAvailableComponents(period, year).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // response.data is now an array of ComponentItem
          const components = response.data.map(c => c.componente);
          this.availableComponents.set(components);

          // Store the full component data for the components list view
          this.componentsListData.set(response.data);

          // Set first component as default
          if (components.length > 0) {
            this.selectedComponent.set(components[0]);
          }

          // Load data after setting defaults
          this.loadCurrentData();
        }
      },
      error: (error) => {
        console.error('Error loading components:', error);
        this.toastr.error('Error al cargar componentes disponibles', 'Error');
      }
    });
  }

  loadCurrentData(): void {
    this.isLoading.set(true);
    const period = this.selectedPeriod();
    const year = this.selectedYear();
    const component = this.selectedComponent();

    const currentTab = this.currentRoute();

    if (currentTab === 'distribution') {
      this.statisticalService.getDistributionAnalysis(period, year, component).subscribe({
        next: (response) => {
          console.log('StatisticalDistributionComponent - Response:', response);
          console.log('StatisticalDistributionComponent - Response.data:', response.data);
          // Backend returns an array, extract the first element
          const data = response.data && response.data.length > 0 ? response.data[0] : null;
          this.distributionData.set(data);
          console.log('StatisticalDistributionComponent - distributionData after set:', this.distributionData());
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading distribution analysis:', error);
          this.toastr.error('Error al cargar el análisis de distribución', 'Error');
          this.distributionData.set(null);
          this.isLoading.set(false);
        }
      });
    } else if (currentTab === 'components') {
      // Components list data already loaded in loadAvailableComponents
      // No need to reload, just set loading to false
      this.isLoading.set(false);
    } else if (currentTab === 'comparative') {
      // For comparative, we need two periods - using current and previous
      const periodIndex = this.availablePeriods().indexOf(period);
      const period1 = periodIndex > 0 ? this.availablePeriods()[periodIndex - 1] : period;

      this.statisticalService.getComparativeAnalysis(component, period1, period, year).subscribe({
        next: (response) => {
          this.comparativeData.set(response.data || null);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading comparative analysis:', error);
          this.toastr.error('Error al cargar el análisis comparativo', 'Error');
          this.comparativeData.set(null);
          this.isLoading.set(false);
        }
      });
    }
  }

  applyFilters(): void {
    // Only reload components data when period or year changes
    // Don't reset the selected component
    const period = this.selectedPeriod();
    const year = this.selectedYear();

    this.statisticalService.getAvailableComponents(period, year).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const components = response.data.map(c => c.componente);
          this.availableComponents.set(components);

          // Store the full component data for the components list view
          this.componentsListData.set(response.data);

          // Keep the currently selected component if it's still in the list
          const currentComponent = this.selectedComponent();
          if (components.includes(currentComponent)) {
            // Current component is still valid, just reload data
            this.loadCurrentData();
          } else if (components.length > 0) {
            // Current component not in list, select first one
            this.selectedComponent.set(components[0]);
            this.loadCurrentData();
          }
        }
      },
      error: (error) => {
        console.error('Error loading components:', error);
        this.toastr.error('Error al cargar componentes disponibles', 'Error');
      }
    });
  }

  onComponentChange(component: string): void {
    this.selectedComponent.set(component);
    this.loadCurrentData();
  }
}
