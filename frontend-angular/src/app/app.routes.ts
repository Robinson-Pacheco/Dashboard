import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { SessionExpiredComponent } from './features/auth/session-expired/session-expired.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { SubLayoutComponent } from './layout/sub-layout/sub-layout.component';
import { USER_ROUTES } from './features/users/user.routes';
import { admissionRoutes } from './features/admission/admission.routes';
import { advancedAnalyticsRoutes } from './features/advanced-analytics/advanced-analytics.routes';
import { reportsRoutes } from './features/reports/reports.routes';
import { statisticalDistributionRoutes } from './features/statistical-distribution/statistical-distribution.routes';
import { AI_ANALYTICS_ROUTES } from './features/ai-analytics/ai-analytics.routes';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'session-expired', component: SessionExpiredComponent },
  {
    path: '',
    component: SubLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'reports', children: reportsRoutes },
      {
        path: 'advanced-analytics',
        canActivateChild: [roleGuard],
        data: { roles: ['admin', 'analyst'] },
        children: advancedAnalyticsRoutes
      },
      {
        path: 'statistical-distribution',
        canActivateChild: [roleGuard],
        data: { roles: ['admin', 'analyst'] },
        children: statisticalDistributionRoutes
      },
      {
        path: 'ai-analytics',
        canActivateChild: [roleGuard],
        data: { roles: ['admin', 'analyst'] },
        children: AI_ANALYTICS_ROUTES
      },
      {
        path: 'users',
        canActivateChild: [roleGuard],
        data: { roles: ['admin'] },
        children: USER_ROUTES
      },
      { path: 'admission', children: admissionRoutes },
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      { path: '**', redirectTo: '/dashboard' }
    ]
  }
];
