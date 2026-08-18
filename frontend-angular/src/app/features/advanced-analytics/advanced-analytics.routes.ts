import { Routes } from '@angular/router';
import { AdvancedAnalyticsComponent } from './advanced-analytics.component';
import { GenderCareerComponent } from './components/gender-career/gender-career.component';
import { DisabilityImpactComponent } from './components/disability-impact/disability-impact.component';
import { ResponseStrategyComponent } from './components/response-strategy/response-strategy.component';

export const advancedAnalyticsRoutes: Routes = [
  {
    path: '',
    component: AdvancedAnalyticsComponent,
    children: [
      {
        path: '',
        redirectTo: 'gender-career',
        pathMatch: 'full'
      },
      {
        path: 'gender-career',
        component: GenderCareerComponent
      },
      {
        path: 'disability-impact',
        component: DisabilityImpactComponent
      },
      {
        path: 'response-strategy',
        component: ResponseStrategyComponent
      }
    ]
  }
];
