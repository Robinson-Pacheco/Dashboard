import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const admissionRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/admission-list/admission-list.component').then(m => m.AdmissionListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'upload',
    loadComponent: () => import('./components/admission-upload/admission-upload.component').then(m => m.AdmissionUploadComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'analyst'] }
  },
  {
    path: 'history',
    loadComponent: () => import('./components/upload-history/upload-history.component').then(m => m.UploadHistoryComponent),
    canActivate: [authGuard]
  }
];
