import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, GitCompare, Sparkles, Loader2 } from 'lucide-angular';
import { AIAnalysisService } from '../../services/ai-analysis.service';
import { ComparePeriodsData, PeriodData } from '../../models/ai-analysis.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-compare-periods',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './compare-periods.component.html'
})
export class ComparePeriodsComponent implements OnInit {
  readonly GitCompare = GitCompare;
  readonly Sparkles = Sparkles;
  readonly Loader2 = Loader2;

  private aiAnalysisService = inject(AIAnalysisService);
  private toastr = inject(ToastrService);

  isLoading = signal<boolean>(false);
  comparisonData = signal<ComparePeriodsData | null>(null);

  componentValue = 'Razonamiento Abstracto';

  period1Value: PeriodData = {
    period: '2024-2',
    mean: 50.2,
    median: 58,
    standardDeviation: 24.5,
    count: 5400
  };

  period2Value: PeriodData = {
    period: '2025-1',
    mean: 52.55,
    median: 60,
    standardDeviation: 25.07,
    count: 5596
  };

  components = ['Razonamiento Abstracto', 'Razonamiento Verbal', 'Razonamiento Numérico', 'Conocimientos', 'Total'];

  ngOnInit(): void {}

  compare(): void {
    this.isLoading.set(true);

    this.aiAnalysisService.comparePeriods({
      component: this.componentValue,
      period1: this.period1Value,
      period2: this.period2Value
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.comparisonData.set(response.data);
          this.toastr.success('Comparación completada', 'Éxito');
        } else {
          this.toastr.error(response.error || 'Error', 'Error');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastr.error('Error al comunicarse con la IA', 'Error');
        this.isLoading.set(false);
      }
    });
  }

  getPerformanceClass(): string {
    const change = this.comparisonData()?.comparison.performanceChange;
    switch (change) {
      case 'improved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'declined': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'stable': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  getPerformanceIcon(): string {
    const change = this.comparisonData()?.comparison.performanceChange;
    switch (change) {
      case 'improved': return '↑';
      case 'declined': return '↓';
      case 'stable': return '→';
      default: return '?';
    }
  }

  getProviderInfo(): string {
    const metadata = this.comparisonData()?.metadata;
    return metadata ? `${metadata.provider} - ${metadata.model}` : '';
  }
}
