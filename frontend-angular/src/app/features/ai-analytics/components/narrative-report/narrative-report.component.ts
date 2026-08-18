import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, FileText, Sparkles, Loader2 } from 'lucide-angular';
import { AIAnalysisService } from '../../services/ai-analysis.service';
import { NarrativeReportData, QuartilesStatistics, NormalDistributionData } from '../../models/ai-analysis.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-narrative-report',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './narrative-report.component.html'
})
export class NarrativeReportComponent implements OnInit {
  readonly FileText = FileText;
  readonly Sparkles = Sparkles;
  readonly Loader2 = Loader2;

  private aiAnalysisService = inject(AIAnalysisService);
  private toastr = inject(ToastrService);

  isLoading = signal<boolean>(false);
  reportData = signal<NarrativeReportData | null>(null);

  componentValue = 'Razonamiento Abstracto';
  totalStudentsValue = 5596;

  q1Value = 40;
  medianValue = 60;
  q3Value = 80;
  iqrValue = 40;
  minValue = 0;
  maxValue = 100;

  meanValue = 52.55;
  standardDeviationValue = 25.07;

  components = ['Razonamiento Abstracto', 'Razonamiento Verbal', 'Razonamiento Numérico', 'Conocimientos', 'Total'];

  ngOnInit(): void {}

  generateReport(): void {
    this.isLoading.set(true);

    const statistics: QuartilesStatistics = {
      q1: this.q1Value,
      median: this.medianValue,
      q3: this.q3Value,
      iqr: this.iqrValue,
      min: this.minValue,
      max: this.maxValue
    };

    const normalDistribution: NormalDistributionData = {
      mean: this.meanValue,
      standardDeviation: this.standardDeviationValue
    };

    this.aiAnalysisService.generateNarrativeReport({
      data: {
        component: this.componentValue,
        totalStudents: this.totalStudentsValue,
        statistics,
        normalDistribution
      }
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.reportData.set(response.data);
          this.toastr.success('Reporte generado exitosamente', 'Éxito');
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

  getProviderInfo(): string {
    const metadata = this.reportData()?.metadata;
    return metadata ? `${metadata.provider} - ${metadata.model}` : '';
  }

  formatText(text: string): string {
    return text.replace(/\n/g, '<br>');
  }
}
