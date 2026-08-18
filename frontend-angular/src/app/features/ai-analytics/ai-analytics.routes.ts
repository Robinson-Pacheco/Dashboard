import { Routes } from '@angular/router';
import { AIAnalyticsComponent } from './ai-analytics.component';
import { QuartilesAnalysisComponent } from './components/quartiles-analysis/quartiles-analysis.component';
import { PredictionsAnalysisComponent } from './components/predictions-analysis/predictions-analysis.component';
import { OutliersAnalysisComponent } from './components/outliers-analysis/outliers-analysis.component';
import { AiChartsComponent } from './components/ai-charts/ai-charts.component';
// import { ComparePeriodsComponent } from './components/compare-periods/compare-periods.component';
// import { NarrativeReportComponent } from './components/narrative-report/narrative-report.component';

export const AI_ANALYTICS_ROUTES: Routes = [
  {
    path: '',
    component: AIAnalyticsComponent,
    children: [
      {
        path: '',
        redirectTo: 'quartiles',
        pathMatch: 'full'
      },
      {
        path: 'quartiles',
        component: QuartilesAnalysisComponent
      },
      {
        path: 'predictions',
        component: PredictionsAnalysisComponent
      },
      {
        path: 'outliers',
        component: OutliersAnalysisComponent
      },
      {
        path: 'charts',
        component: AiChartsComponent
      }
    ]
  }
];
