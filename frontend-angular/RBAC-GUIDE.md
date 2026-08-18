# Sistema de Control de Acceso Basado en Roles (RBAC)

Este documento describe cómo usar el sistema de control de acceso implementado en la aplicación Angular.

## Roles Disponibles

| Rol | Permisos |
|-----|----------|
| `admin` | Acceso completo: Dashboard, Reportes, Análisis Avanzado, Distribución Estadística, Análisis con IA, Gestión de Usuarios, Subir Datos |
| `analyst` | Dashboard, Reportes, Análisis Avanzado, Distribución Estadística, Análisis con IA, **Subir Datos** |
| `viewer` | Dashboard, Reportes, **Ver Datos de Admisión** (solo lectura) |

## 1. Protección de Rutas

### Guard de Roles (`roleGuard`)

Usa el `roleGuard` para proteger rutas específicas:

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'advanced-analytics',
    canActivateChild: [roleGuard],
    data: { roles: ['admin', 'analyst'] }, // Solo admin y analyst pueden acceder
    children: advancedAnalyticsRoutes
  },
  {
    path: 'users',
    canActivateChild: [roleGuard],
    data: { roles: ['admin'] }, // Solo admin puede acceder
    children: USER_ROUTES
  }
];
```

### Combinar Guards

Para requerir autenticación Y roles específicos:

```typescript
{
  path: 'admin-only',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['admin'] },
  component: AdminComponent
}
```

## 2. Mostrar/Ocultar Elementos en Templates

### Directiva `hasRole`

Muestra contenido solo si el usuario tiene el rol especificado:

```html
<!-- Solo para administradores -->
<button *hasRole="'admin'">
  Administrar Usuarios
</button>

<!-- Para múltiples roles (cualquiera de ellos) -->
<div *hasRole="['admin', 'analyst']">
  Panel de Análisis Avanzado
</div>

<!-- Requerir TODOS los roles -->
<div *hasRole="['admin', 'analyst']; matchType: 'all'">
  Solo si es admin Y analyst
</div>
```

### Directiva `hasNotRole`

Muestra contenido si el usuario NO tiene el rol:

```html
<!-- Ocultar para visualizadores -->
<div *hasNotRole="'viewer'">
  Esta sección no es para visualizadores
</div>
```

### Directiva `hasPermission`

Muestra contenido basado en permisos específicos:

```html
<!-- Basado en permisos -->
<button *hasPermission="'canUploadData'">
  Subir Archivo
</button>

<button *hasPermission="'canDeleteData'">
  Eliminar Registro
</button>

<div *hasPermission="'canAccessAI'">
  Herramientas de IA
</div>
```

## 3. Servicio de Roles (`RoleService`)

### Inyectar el servicio

```typescript
import { Component, inject } from '@angular/core';
import { RoleService } from './core/services/role.service';

@Component({...})
export class MyComponent {
  private roleService = inject(RoleService);
}
```

### Verificar rol actual

```typescript
// Obtener rol actual
const role = this.roleService.getCurrentRole(); // 'admin' | 'analyst' | 'viewer' | null

// Verificar rol específico
if (this.roleService.hasRole('admin')) {
  // Solo admin
}

// Verificar rol mínimo (jerarquía: viewer < analyst < admin)
if (this.roleService.hasMinimumRole('analyst')) {
  // Es analyst o admin
}

// Verificar múltiples roles
if (this.roleService.hasAnyRole(['admin', 'analyst'])) {
  // Es admin o analyst
}

// Verificar todos los roles
if (this.roleService.hasAllRoles(['admin', 'analyst'])) {
  // Es admin Y analyst (poco común)
}
```

### Verificar permisos

```typescript
// Verificar permiso específico
if (this.roleService.hasPermission('canManageUsers')) {
  // Puede gestionar usuarios
}

// Obtener todos los permisos
const permissions = this.roleService.getPermissions();
// {
//   canViewDashboard: true,
//   canViewReports: true,
//   canViewAdvancedAnalytics: true/false,
//   ...
// }
```

### Signals reactivos

```typescript
export class MyComponent {
  private roleService = inject(RoleService);

  // Signals computadas
  currentRole = computed(() => this.roleService.currentRole());
  isAdmin = computed(() => this.roleService.isAdmin());
  permissions = computed(() => this.roleService.permissions());
}
```

## 4. Menú Lateral por Roles

El menú lateral se filtra automáticamente según el rol del usuario mediante el `RoleBasedMenuService`.

### Configuración de ítems de menú

```typescript
const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'layout-dashboard',
    route: '/dashboard',
    allowedRoles: ['admin', 'analyst', 'viewer'], // Quién puede ver
    requiredPermission: 'canViewDashboard'        // Permiso necesario
  },
  {
    id: 'ai-analytics',
    label: 'Análisis con IA',
    icon: 'brain',
    route: '/ai-analytics',
    allowedRoles: ['admin', 'analyst'],           // Solo analyst y admin
    requiredPermission: 'canAccessAI'
  },
  {
    id: 'users',
    label: 'Gestión de Usuarios',
    icon: 'users',
    route: '/users',
    allowedRoles: ['admin'],                      // Solo admin
    requiredPermission: 'canViewUsers',
    hideWhenNoAccess: true                        // Ocultar si no tiene acceso
  }
];
```

## 5. Ejemplos Completos

### Componente de Usuarios (solo Admin)

```typescript
@Component({
  selector: 'app-users',
  template: `
    <div *hasRole="'admin'">
      <h1>Gestión de Usuarios</h1>
      <!-- contenido -->
    </div>

    <div *hasNotRole="'admin'">
      <app-access-denied></app-access-denied>
    </div>
  `
})
export class UsersComponent { }
```

### Botón de subida (Analyst+)

```typescript
@Component({
  selector: 'app-data-upload',
  template: `
    <button *hasPermission="'canUploadData'"
            (click)="uploadFile()">
      Subir Datos
    </button>

    <p *hasNotRole="['admin', 'analyst']">
      Contacta a un administrador para subir archivos.
    </p>
  `
})
export class DataUploadComponent {
  uploadFile() {
    // solo analyst y admin pueden llegar aquí
  }
}
```

### Verificación en el componente

```typescript
@Component({...})
export class ReportComponent implements OnInit {
  private roleService = inject(RoleService);
  private router = inject(Router);

  ngOnInit() {
    // Verificar acceso programáticamente
    if (!this.roleService.hasPermission('canViewReports')) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Cargar datos
    this.loadData();
  }
}
```

## 6. Permisos Disponibles

| Permiso | Descripción | Admin | Analyst | Viewer |
|---------|-------------|-------|---------|--------|
| `canViewDashboard` | Ver dashboard | ✅ | ✅ | ✅ |
| `canViewReports` | Ver reportes | ✅ | ✅ | ✅ |
| `canViewAdvancedAnalytics` | Análisis avanzado | ✅ | ✅ | ❌ |
| `canViewStatisticalDistribution` | Distribución estadística | ✅ | ✅ | ❌ |
| `canViewAIAnalytics` | Análisis con IA | ✅ | ✅ | ❌ |
| `canViewUsers` | Ver gestión de usuarios | ✅ | ❌ | ❌ |
| `canViewAdmission` | Ver datos de admisión | ✅ | ✅ | ✅ |
| `canManageUsers` | Crear/editar/eliminar usuarios | ✅ | ❌ | ❌ |
| `canUploadData` | Subir archivos Excel | ✅ | ✅ | ❌ |
| `canDeleteData` | Eliminar datos | ✅ | ❌ | ❌ |
| `canAccessAI` | Acceder a features de IA | ✅ | ✅ | ❌ |

## 7. Módulo de Datos de Admisión (Admission)

El módulo de admission tiene controles específicos de acceso:

### Estructura del Menú

```
Datos de Admisión
├── Ver Datos          (todos: admin, analyst, viewer)
└── Subir Datos        (solo: admin, analyst)
```

### Protección de Rutas

```typescript
// admission.routes.ts
export const admissionRoutes: Routes = [
  {
    path: '',  // Ver datos
    component: AdmissionListComponent,
    canActivate: [authGuard]  // Cualquier usuario autenticado
  },
  {
    path: 'upload',
    component: AdmissionUploadComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'analyst'] }  // Solo admin y analyst
  }
];
```

### Uso en Templates

```html
<!-- Botón de subida solo para admin/analyst -->
<button *hasPermission="'canUploadData'" routerLink="/admission/upload">
  Subir Archivo Excel
</button>

<!-- Mensaje para viewers -->
<div *hasRole="'viewer'">
  <p>Modo solo lectura. Contacta a un administrador para subir nuevos datos.</p>
</div>
```

## 8. Página de Acceso Denegado

Cuando un usuario intenta acceder a una ruta sin permisos, es redirigido al dashboard. Puedes usar el componente `AccessDeniedComponent` para mostrar mensajes personalizados:

```typescript
import { AccessDeniedComponent } from './shared/components/access-denied.component';

@Component({
  template: `
    <app-access-denied></app-access-denied>
  `,
  imports: [AccessDeniedComponent]
})
export class NoAccessPage { }
```

## 9. Tips

1. **Siempre usa guards en rutas** - No confíes solo en ocultar elementos del menú
2. **Combina directivas** - `*hasRole` para roles, `*hasPermission` para permisos específicos
3. **Verifica en el backend también** - El frontend es solo la primera línea de defensa
4. **Usa signals** - Las signals reactivas se actualizan automáticamente cuando cambia el usuario
