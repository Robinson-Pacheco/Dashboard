import { Routes } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { ComponentAnalysisComponent } from './components/component-analysis/component-analysis.component';
import { InstitutionAnalysisComponent } from './components/institution-analysis/institution-analysis.component';
import { GeographicAnalysisComponent } from './components/geographic-analysis/geographic-analysis.component';
import { DifficultyAnalysisComponent } from './components/difficulty-analysis/difficulty-analysis.component';
import { CareerAnalysisComponent } from './components/career-analysis/career-analysis.component';

export const reportsRoutes: Routes = [
  {
    path: '',
    component: ReportsComponent,
    children: [
      {
        path: '',
        redirectTo: 'components',
        pathMatch: 'full'
      },
      {
        path: 'components',
        component: ComponentAnalysisComponent
      },
      {
        path: 'institutions',
        component: InstitutionAnalysisComponent
      },
      {
        path: 'geographic',
        component: GeographicAnalysisComponent
      },
      {
        path: 'difficulty',
        component: DifficultyAnalysisComponent
      },
      {
        path: 'careers',
        component: CareerAnalysisComponent
      }
    ]
  }
];
