import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleService } from '../services/role.service';

export interface RoleData {
  roles?: string[];
  requireAll?: boolean;
}

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree => {
  const authService = inject(AuthService);
  const roleService = inject(RoleService);
  const router = inject(Router);

  // Primero verificar autenticación
  const isAuthenticated = authService.checkAuthStatus();
  if (!isAuthenticated) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  // Obtener roles requeridos de los datos de la ruta
  const requiredRoles = route.data?.['roles'] as string[] | undefined;

  // Si no hay roles requeridos, permitir acceso
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Verificar si el usuario tiene alguno de los roles requeridos
  const hasRequiredRole = requiredRoles.some(role => roleService.hasRole(role));

  if (hasRequiredRole) {
    return true;
  }

  // Usuario autenticado pero sin permisos suficientes
  console.warn(`RoleGuard: User does not have required roles [${requiredRoles.join(', ')}] for route:`, state.url);

  // Redirigir al dashboard con mensaje de acceso denegado
  return router.createUrlTree(['/dashboard'], {
    queryParams: { accessDenied: true }
  });
};
