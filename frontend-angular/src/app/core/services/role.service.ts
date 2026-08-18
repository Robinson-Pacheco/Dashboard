import { Injectable, computed, Signal, signal } from '@angular/core';
import { AuthService } from './auth.service';

export type UserRole = 'admin' | 'analyst' | 'viewer';

export interface RolePermissions {
  canViewDashboard: boolean;
  canViewReports: boolean;
  canViewAdvancedAnalytics: boolean;
  canViewStatisticalDistribution: boolean;
  canViewAIAnalytics: boolean;
  canViewUsers: boolean;
  canViewAdmission: boolean;
  canManageUsers: boolean;
  canUploadData: boolean;
  canDeleteData: boolean;
  canAccessAI: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  // Rol jerarquía (de menor a mayor privilegio)
  private readonly roleHierarchy: UserRole[] = ['viewer', 'analyst', 'admin'];

  // Permisos por rol
  private readonly rolePermissions: Record<UserRole, RolePermissions> = {
    viewer: {
      canViewDashboard: true,
      canViewReports: true,
      canViewAdvancedAnalytics: false,
      canViewStatisticalDistribution: false,
      canViewAIAnalytics: false,
      canViewUsers: false,
      canViewAdmission: true,
      canManageUsers: false,
      canUploadData: false,
      canDeleteData: false,
      canAccessAI: false
    },
    analyst: {
      canViewDashboard: true,
      canViewReports: true,
      canViewAdvancedAnalytics: true,
      canViewStatisticalDistribution: true,
      canViewAIAnalytics: true,
      canViewUsers: false,
      canViewAdmission: true,
      canManageUsers: false,
      canUploadData: true,
      canDeleteData: false,
      canAccessAI: true
    },
    admin: {
      canViewDashboard: true,
      canViewReports: true,
      canViewAdvancedAnalytics: true,
      canViewStatisticalDistribution: true,
      canViewAIAnalytics: true,
      canViewUsers: true,
      canViewAdmission: true,
      canManageUsers: true,
      canUploadData: true,
      canDeleteData: true,
      canAccessAI: true
    }
  };

  constructor(private authService: AuthService) {}

  /**
   * Obtener el rol actual del usuario
   */
  getCurrentRole(): UserRole | null {
    const user = this.authService.getCurrentUser();
    return user?.role as UserRole || null;
  }

  /**
   * Signal computada del rol actual
   */
  currentRole = computed(() => {
    const user = this.authService.currentUser();
    return user?.role as UserRole || null;
  });

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: UserRole | string): boolean {
    const currentRole = this.getCurrentRole();
    return currentRole === role;
  }

  /**
   * Verificar si el usuario tiene al menos el rol mínimo requerido
   * (basado en jerarquía: viewer < analyst < admin)
   */
  hasMinimumRole(minRole: UserRole): boolean {
    const currentRole = this.getCurrentRole();
    if (!currentRole) return false;

    const currentIndex = this.roleHierarchy.indexOf(currentRole);
    const requiredIndex = this.roleHierarchy.indexOf(minRole);

    return currentIndex >= requiredIndex;
  }

  /**
   * Verificar si el usuario tiene alguno de los roles proporcionados
   */
  hasAnyRole(roles: UserRole[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  /**
   * Verificar si el usuario tiene todos los roles proporcionados
   */
  hasAllRoles(roles: UserRole[]): boolean {
    return roles.every(role => this.hasRole(role));
  }

  /**
   * Obtener los permisos del rol actual
   */
  getPermissions(): RolePermissions {
    const currentRole = this.getCurrentRole();
    if (!currentRole) {
      return this.getDefaultPermissions();
    }
    return this.rolePermissions[currentRole];
  }

  /**
   * Signal computada de permisos
   */
  permissions = computed(() => {
    const role = this.currentRole();
    if (!role) {
      return this.getDefaultPermissions();
    }
    return this.rolePermissions[role];
  });

  /**
   * Verificar un permiso específico
   */
  hasPermission(permission: keyof RolePermissions): boolean {
    const permissions = this.getPermissions();
    return permissions[permission] ?? false;
  }

  /**
   * Es administrador
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Es analista (o superior)
   */
  isAnalyst(): boolean {
    return this.hasMinimumRole('analyst');
  }

  /**
   * Es solo visualizador
   */
  isViewer(): boolean {
    return this.hasRole('viewer');
  }

  /**
   * Obtener permisos por defecto (todos false)
   */
  private getDefaultPermissions(): RolePermissions {
    return {
      canViewDashboard: false,
      canViewReports: false,
      canViewAdvancedAnalytics: false,
      canViewStatisticalDistribution: false,
      canViewAIAnalytics: false,
      canViewUsers: false,
      canViewAdmission: false,
      canManageUsers: false,
      canUploadData: false,
      canDeleteData: false,
      canAccessAI: false
    };
  }

  /**
   * Obtener lista de roles disponibles
   */
  getAvailableRoles(): { value: UserRole; label: string; description: string }[] {
    return [
      {
        value: 'admin',
        label: 'Administrador',
        description: 'Acceso completo al sistema'
      },
      {
        value: 'analyst',
        label: 'Analista',
        description: 'Puede analizar datos y usar IA'
      },
      {
        value: 'viewer',
        label: 'Visualizador',
        description: 'Solo puede ver reportes básicos'
      }
    ];
  }
}
