import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, ShieldAlert, ArrowLeft, Home } from 'lucide-angular';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div class="max-w-md w-full text-center">
        <!-- Icono -->
        <div class="mx-auto h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
          <lucide-icon [name]="ShieldAlert" class="h-12 w-12 text-red-600 dark:text-red-400"></lucide-icon>
        </div>

        <!-- Título -->
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Acceso Denegado
        </h1>

        <!-- Descripción -->
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          No tienes permisos suficientes para acceder a esta sección.
          Tu rol actual es: <strong class="text-utmach-blue">{{ getRoleLabel() }}</strong>
        </p>

        <!-- Información de roles -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 text-left">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Niveles de acceso requeridos:
          </h3>
          <ul class="space-y-2 text-sm">
            <li class="flex items-center text-gray-600 dark:text-gray-400">
              <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Visualizador: Dashboard y Reportes básicos
            </li>
            <li class="flex items-center text-gray-600 dark:text-gray-400">
              <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Analista: + Análisis Avanzado, Estadísticas e IA
            </li>
            <li class="flex items-center text-gray-600 dark:text-gray-400">
              <span class="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Administrador: + Gestión de Usuarios
            </li>
          </ul>
        </div>

        <!-- Botones -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button (click)="goBack()"
            class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <lucide-icon [name]="ArrowLeft" class="h-4 w-4 mr-2"></lucide-icon>
            Volver atrás
          </button>
          <button (click)="goHome()"
            class="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-utmach-blue hover:bg-utmach-blue-600 transition-colors">
            <lucide-icon [name]="Home" class="h-4 w-4 mr-2"></lucide-icon>
            Ir al Dashboard
          </button>
        </div>
      </div>
    </div>
  `
})
export class AccessDeniedComponent {
  private router = inject(Router);
  private roleService = inject(RoleService);

  readonly ShieldAlert = ShieldAlert;
  readonly ArrowLeft = ArrowLeft;
  readonly Home = Home;

  getRoleLabel(): string {
    const role = this.roleService.getCurrentRole();
    const labels: { [key: string]: string } = {
      'admin': 'Administrador',
      'analyst': 'Analista',
      'viewer': 'Visualizador'
    };
    return labels[role || ''] || role || 'Desconocido';
  }

  goBack(): void {
    window.history.back();
  }

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
