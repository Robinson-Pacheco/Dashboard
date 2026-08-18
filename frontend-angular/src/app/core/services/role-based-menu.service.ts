import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { RoleService, UserRole } from './role.service';
import { AuthService } from './auth.service';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  badge?: string;
  badgeClass?: string;
  children?: MenuItem[];
  isActive?: boolean;
  isExpanded?: boolean;
  allowedRoles?: UserRole[];
  requiredPermission?: keyof import('./role.service').RolePermissions;
  hideWhenNoAccess?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RoleBasedMenuService {
  private router = inject(Router);
  private roleService = inject(RoleService);
  private authService = inject(AuthService);

  // Definición estructurada del menú con jerarquía analítica recomendada
  private fullMenuItems = signal<MenuItem[]>([
    {
      id: 'dashboard',
      label: 'Dashboard Analytics',
      icon: 'layout-dashboard',
      route: '/dashboard',
      isActive: true,
      allowedRoles: ['admin', 'analyst', 'viewer'],
      requiredPermission: 'canViewDashboard'
    },
    {
      id: 'admission',
      label: 'Datos de Admisión',
      icon: 'database',
      route: '/admission',
      isActive: false,
      isExpanded: false,
      allowedRoles: ['admin', 'analyst', 'viewer'],
      requiredPermission: 'canViewAdmission',
      children: [
        {
          id: 'admission-list',
          label: 'Ver Registros',
          icon: 'list',
          route: '/admission',
          isActive: false,
          allowedRoles: ['admin', 'analyst', 'viewer']
        },
        {
          id: 'admission-upload',
          label: 'Subir Excel',
          icon: 'trending-up',
          route: '/admission/upload',
          isActive: false,
          allowedRoles: ['admin', 'analyst'],
          requiredPermission: 'canUploadData',
          hideWhenNoAccess: true
        }
      ]
    },
    {
      id: 'statistical-distribution',
      label: 'Distribución Estadística',
      icon: 'bar-chart-3',
      route: '/statistical-distribution',
      isActive: false,
      isExpanded: false,
      allowedRoles: ['admin', 'analyst'],
      requiredPermission: 'canViewStatisticalDistribution',
      children: [
        {
          id: 'distribution-analysis',
          label: 'Distribución Normal & Mediana',
          icon: 'target',
          route: '/statistical-distribution/distribution',
          isActive: false,
          allowedRoles: ['admin', 'analyst']
        },
        {
          id: 'components-list',
          label: 'Rendimiento x Componente',
          icon: 'box',
          route: '/statistical-distribution/components',
          isActive: false,
          allowedRoles: ['admin', 'analyst']
        },
        {
          id: 'comparative-analysis',
          label: 'Análisis Comparativo',
          icon: 'trending-up',
          route: '/statistical-distribution/comparative',
          isActive: false,
          allowedRoles: ['admin', 'analyst']
        }
      ]
    },
    {
      id: 'advanced-analytics',
      label: 'Análisis Avanzado',
      icon: 'bar-chart-3',
      route: '/advanced-analytics',
      isActive: false,
      isExpanded: false,
      allowedRoles: ['admin', 'analyst'],
      requiredPermission: 'canViewAdvancedAnalytics',
      children: [
        {
          id: 'gender-career',
          label: 'Brecha de Género',
          icon: 'users',
          route: '/advanced-analytics/gender-career',
          isActive: false,
          allowedRoles: ['admin', 'analyst']
        },
        {
          id: 'disability-impact',
          label: 'Impacto Discapacidad',
          icon: 'heart-handshake',
          route: '/advanced-analytics/disability-impact',
          isActive: false,
          allowedRoles: ['admin', 'analyst']
        },
        {
          id: 'response-strategy',
          label: 'Estrategia de Respuesta',
          icon: 'target',
          route: '/advanced-analytics/response-strategy',
          isActive: false,
          allowedRoles: ['admin', 'analyst']
        }
      ]
    },
    {
      id: 'reports',
      label: 'Reportes Institucionales',
      icon: 'file-text',
      route: '/reports',
      isActive: false,
      isExpanded: false,
      allowedRoles: ['admin', 'analyst', 'viewer'],
      requiredPermission: 'canViewReports',
      children: [
        {
          id: 'institutions-analysis',
          label: 'Por Institución & Sostenimiento',
          icon: 'building',
          route: '/reports/institutions',
          isActive: false,
          allowedRoles: ['admin', 'analyst', 'viewer']
        },
        {
          id: 'geographic-analysis',
          label: 'Análisis Geográfico',
          icon: 'map-pin',
          route: '/reports/geographic',
          isActive: false,
          allowedRoles: ['admin', 'analyst', 'viewer']
        },
        {
          id: 'careers-analysis',
          label: 'Análisis de Carreras',
          icon: 'briefcase',
          route: '/reports/careers',
          isActive: false,
          allowedRoles: ['admin', 'analyst', 'viewer']
        },
        {
          id: 'components-analysis',
          label: 'Análisis de Componentes',
          icon: 'target',
          route: '/reports/components',
          isActive: false,
          allowedRoles: ['admin', 'analyst', 'viewer']
        },
        {
          id: 'difficulty-analysis',
          label: 'Análisis de Dificultad',
          icon: 'trending-up',
          route: '/reports/difficulty',
          isActive: false,
          allowedRoles: ['admin', 'analyst', 'viewer']
        }
      ]
    },
    {
      id: 'ai-analytics',
      label: 'Análisis con IA',
      icon: 'brain',
      badge: 'IA',
      badgeClass: 'bg-[#C2354A] text-white',
      route: '/ai-analytics',
      isActive: false,
      isExpanded: false,
      allowedRoles: ['admin', 'analyst'],
      requiredPermission: 'canAccessAI',
      children: [
        {
          id: 'quartiles',
          label: 'Análisis de Cuartiles',
          icon: 'box',
          route: '/ai-analytics/quartiles',
          isActive: false,
          allowedRoles: ['admin', 'analyst']
        },
        {
          id: 'predictions',
          label: 'Predicciones',
          icon: 'trending-up',
          route: '/ai-analytics/predictions',
          isActive: false,
          allowedRoles: ['admin', 'analyst']
        },
        {
          id: 'outliers',
          label: 'Detección de Outliers',
          icon: 'alert-triangle',
          route: '/ai-analytics/outliers',
          isActive: false,
          allowedRoles: ['admin', 'analyst']
        }
      ]
    },
    {
      id: 'users',
      label: 'Gestión de Usuarios',
      icon: 'users',
      route: '/users',
      isActive: false,
      allowedRoles: ['admin'],
      requiredPermission: 'canViewUsers',
      hideWhenNoAccess: true
    }
  ]);

  filteredMenuItems = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    return this.filterMenuItems(this.fullMenuItems());
  });

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
    });
  }

  getMenuItems(): MenuItem[] {
    return this.filteredMenuItems();
  }

  canAccessMenuItem(item: MenuItem): boolean {
    return this.checkMenuItemAccess(item);
  }

  navigateToMenuItem(item: MenuItem): void {
    if (!this.canAccessMenuItem(item)) {
      console.warn(`Access denied to menu item: ${item.id}`);
      return;
    }

    if (item.route) {
      this.router.navigate([item.route]);
      this.setActiveMenuItem(item.id);
    }
  }

  toggleMenuExpanded(id: string): void {
    const currentItems = this.fullMenuItems();
    const updatedItems = this.updateMenuItemRecursive(currentItems, id, item =>
      item.children && item.children.length > 0
        ? { ...item, isExpanded: !item.isExpanded }
        : item
    );
    this.fullMenuItems.set(updatedItems);
  }

  setActiveMenuItem(id: string): void {
    const currentItems = this.fullMenuItems();
    const updatedItems = currentItems.map(item =>
      this.updateActiveState(item, id)
    );
    this.fullMenuItems.set(updatedItems);
  }

  getDefaultRouteForRole(): string {
    const permissions = this.roleService.getPermissions();

    if (permissions.canViewDashboard) return '/dashboard';
    if (permissions.canViewReports) return '/reports';
    if (permissions.canViewAdmission) return '/admission';

    return '/dashboard';
  }

  hasAccessToRoute(route: string): boolean {
    const menuItem = this.findMenuItemByRoute(this.fullMenuItems(), route);
    if (!menuItem) return true;
    return this.canAccessMenuItem(menuItem);
  }

  private filterMenuItems(items: MenuItem[]): MenuItem[] {
    return items
      .map(item => this.filterMenuItem(item))
      .filter(item => item !== null) as MenuItem[];
  }

  private filterMenuItem(item: MenuItem): MenuItem | null {
    if (!this.checkMenuItemAccess(item)) {
      return null;
    }

    let filteredChildren: MenuItem[] | undefined;
    if (item.children && item.children.length > 0) {
      filteredChildren = this.filterMenuItems(item.children);
    }

    return {
      ...item,
      children: filteredChildren && filteredChildren.length > 0 ? filteredChildren : undefined
    };
  }

  private checkMenuItemAccess(item: MenuItem): boolean {
    if (item.allowedRoles && item.allowedRoles.length > 0) {
      const hasAllowedRole = item.allowedRoles.some(role =>
        this.roleService.hasRole(role)
      );
      if (!hasAllowedRole) return false;
    }

    if (item.requiredPermission) {
      const hasPermission = this.roleService.hasPermission(item.requiredPermission);
      if (!hasPermission) return false;
    }

    return true;
  }

  private updateActiveState(item: MenuItem, activeId: string): MenuItem {
    const isItemActive = item.id === activeId;
    let hasActiveChild = false;

    let updatedChildren: MenuItem[] | undefined;
    if (item.children) {
      updatedChildren = item.children.map(child => {
        const updatedChild = this.updateActiveState(child, activeId);
        if (updatedChild.isActive) hasActiveChild = true;
        return updatedChild;
      });
    }

    return {
      ...item,
      isActive: isItemActive || hasActiveChild,
      isExpanded: hasActiveChild || (item.isExpanded && isItemActive) || false,
      children: updatedChildren
    };
  }

  private updateMenuItemRecursive(
    items: MenuItem[],
    id: string,
    updater: (item: MenuItem) => MenuItem
  ): MenuItem[] {
    return items.map(item => {
      if (item.id === id) {
        return updater(item);
      }
      if (item.children) {
        return {
          ...item,
          children: this.updateMenuItemRecursive(item.children, id, updater)
        };
      }
      return item;
    });
  }

  private findMenuItemByRoute(items: MenuItem[], route: string): MenuItem | null {
    for (const item of items) {
      if (item.route === route) return item;
      if (item.children) {
        const found = this.findMenuItemByRoute(item.children, route);
        if (found) return found;
      }
    }
    return null;
  }
}
