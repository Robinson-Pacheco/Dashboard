import { Routes } from '@angular/router';
import { StatisticalDistributionComponent } from './statistical-distribution.component';
import { DistributionViewComponent } from './components/distribution-view/distribution-view.component';
import { ComponentsListViewComponent } from './components/components-list-view/components-list-view.component';
import { ComparativeViewComponent } from './components/comparative-view/comparative-view.component';

export const statisticalDistributionRoutes: Routes = [
  {
    path: '',
    component: StatisticalDistributionComponent,
    children: [
      {
        path: '',
        redirectTo: 'distribution',
        pathMatch: 'full'
      },
      {
        path: 'distribution',
        component: DistributionViewComponent
      },
      {
        path: 'components',
        component: ComponentsListViewComponent
      },
      {
        path: 'comparative',
        component: ComparativeViewComponent
      }
    ]
  }
];
