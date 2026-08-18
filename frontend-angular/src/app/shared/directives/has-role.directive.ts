import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect, computed } from '@angular/core';
import { RoleService, UserRole } from '../../core/services/role.service';
import { AuthService } from '../../core/services/auth.service';

@Directive({
  selector: '[hasRole]',
  standalone: true
})
export class HasRoleDirective {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private roleService = inject(RoleService);
  private authService = inject(AuthService);

  private hasView = false;
  private requiredRoles: UserRole[] = [];
  private checkType: 'any' | 'all' = 'any';

  constructor() {
    // Efecto reactivo que se ejecuta cuando cambian las dependencias
    effect(() => {
      // Dependencias reactivas
      const user = this.authService.currentUser();
      const role = this.roleService.currentRole();

      // Solo evaluar si hay roles requeridos configurados
      if (this.requiredRoles.length > 0) {
        this.updateView();
      }
    });
  }

  @Input()
  set hasRole(roles: UserRole | UserRole[] | undefined | null) {
    if (!roles) {
      this.requiredRoles = [];
      this.updateView();
      return;
    }

    this.requiredRoles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  @Input()
  set hasRoleMatchType(type: 'any' | 'all') {
    this.checkType = type;
    this.updateView();
  }

  private updateView(): void {
    // Si no hay roles requeridos, mostrar siempre
    if (this.requiredRoles.length === 0) {
      this.show();
      return;
    }

    // Verificar si el usuario está autenticado
    if (!this.authService.getIsAuthenticated()) {
      this.hide();
      return;
    }

    // Verificar roles
    let hasAccess = false;

    if (this.checkType === 'all') {
      hasAccess = this.roleService.hasAllRoles(this.requiredRoles);
    } else {
      hasAccess = this.roleService.hasAnyRole(this.requiredRoles);
    }

    if (hasAccess) {
      this.show();
    } else {
      this.hide();
    }
  }

  private show(): void {
    if (!this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    }
  }

  private hide(): void {
    if (this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}

/**
 * Directiva inversa - muestra el contenido solo si NO tiene el rol
 */
@Directive({
  selector: '[hasNotRole]',
  standalone: true
})
export class HasNotRoleDirective {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private roleService = inject(RoleService);
  private authService = inject(AuthService);

  private hasView = false;
  private forbiddenRoles: UserRole[] = [];

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      const role = this.roleService.currentRole();

      if (this.forbiddenRoles.length > 0) {
        this.updateView();
      }
    });
  }

  @Input()
  set hasNotRole(roles: UserRole | UserRole[] | undefined | null) {
    if (!roles) {
      this.forbiddenRoles = [];
      this.updateView();
      return;
    }

    this.forbiddenRoles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  private updateView(): void {
    // Si no hay usuario autenticado, ocultar
    if (!this.authService.getIsAuthenticated()) {
      this.hide();
      return;
    }

    // Mostrar solo si NO tiene ninguno de los roles prohibidos
    const hasForbiddenRole = this.forbiddenRoles.some(role => this.roleService.hasRole(role));

    if (!hasForbiddenRole) {
      this.show();
    } else {
      this.hide();
    }
  }

  private show(): void {
    if (!this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    }
  }

  private hide(): void {
    if (this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}

/**
 * Directiva para verificar permisos específicos
 */
@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private roleService = inject(RoleService);
  private authService = inject(AuthService);

  private hasView = false;
  private requiredPermission: keyof import('../../core/services/role.service').RolePermissions | null = null;

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      const permissions = this.roleService.permissions();

      if (this.requiredPermission) {
        this.updateView();
      }
    });
  }

  @Input()
  set hasPermission(permission: keyof import('../../core/services/role.service').RolePermissions | undefined | null) {
    if (!permission) {
      this.requiredPermission = null;
      this.updateView();
      return;
    }

    this.requiredPermission = permission;
    this.updateView();
  }

  private updateView(): void {
    if (!this.requiredPermission) {
      this.show();
      return;
    }

    if (!this.authService.getIsAuthenticated()) {
      this.hide();
      return;
    }

    if (this.roleService.hasPermission(this.requiredPermission)) {
      this.show();
    } else {
      this.hide();
    }
  }

  private show(): void {
    if (!this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    }
  }

  private hide(): void {
    if (this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
