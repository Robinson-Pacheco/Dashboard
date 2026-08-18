import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  isActive?: boolean;
  isExpanded?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MenuItemsService {
  private menuItems = signal<MenuItem[]>([
    {
      id: 'dashboard',
      label: 'Dashboard Analytics',
      icon: 'layout-dashboard',
      route: '/dashboard',
      isActive: true
    },
    {
      id: 'admission',
      label: 'Datos de Admisión',
      icon: 'database',
      route: '/admission',
      isActive: false
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: 'file-text',
      route: '/reports',
      isActive: false,
      isExpanded: false,
      children: [
        {
          id: 'components-analysis',
          label: 'Análisis de Componentes',
          icon: 'target',
          route: '/reports/components',
          isActive: false
        },
        {
          id: 'institutions-analysis',
          label: 'Análisis de Instituciones',
          icon: 'building',
          route: '/reports/institutions',
          isActive: false
        },
        {
          id: 'geographic-analysis',
          label: 'Análisis Geográfico',
          icon: 'map-pin',
          route: '/reports/geographic',
          isActive: false
        },
        {
          id: 'difficulty-analysis',
          label: 'Análisis de Dificultad',
          icon: 'trending-up',
          route: '/reports/difficulty',
          isActive: false
        },
        {
          id: 'careers-analysis',
          label: 'Análisis de Carreras',
          icon: 'briefcase',
          route: '/reports/careers',
          isActive: false
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
      children: [
        {
          id: 'gender-career',
          label: 'Análisis de Género',
          icon: 'users',
          route: '/advanced-analytics/gender-career',
          isActive: false
        },
        {
          id: 'disability-impact',
          label: 'Impacto Discapacidad',
          icon: 'heart-handshake',
          route: '/advanced-analytics/disability-impact',
          isActive: false
        },
        {
          id: 'response-strategy',
          label: 'Estrategia de Respuesta',
          icon: 'target',
          route: '/advanced-analytics/response-strategy',
          isActive: false
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
      children: [
        {
          id: 'distribution-analysis',
          label: 'Análisis de Distribución',
          icon: 'target',
          route: '/statistical-distribution/distribution',
          isActive: false
        },
        {
          id: 'components-list',
          label: 'Lista de Componentes',
          icon: 'list',
          route: '/statistical-distribution/components',
          isActive: false
        },
        {
          id: 'comparative-analysis',
          label: 'Análisis Comparativo',
          icon: 'trending-up',
          route: '/statistical-distribution/comparative',
          isActive: false
        }
      ]
    },
    {
      id: 'ai-analytics',
      label: 'Análisis con IA',
      icon: 'brain',
      route: '/ai-analytics',
      isActive: false,
      isExpanded: false,
      children: [
        {
          id: 'quartiles',
          label: 'Análisis de Cuartiles',
          icon: 'box',
          route: '/ai-analytics/quartiles',
          isActive: false
        },
        {
          id: 'predictions',
          label: 'Predicciones',
          icon: 'trending-up',
          route: '/ai-analytics/predictions',
          isActive: false
        },
        {
          id: 'outliers',
          label: 'Análisis de Outliers',
          icon: 'alert-triangle',
          route: '/ai-analytics/outliers',
          isActive: false
        }
        // TODO: Implement these features later
        // {
        //   id: 'compare-periods',
        //   label: 'Comparar Periodos',
        //   icon: 'git-compare',
        //   route: '/ai-analytics/compare-periods',
        //   isActive: false
        // },
        // {
        //   id: 'narrative-report',
        //   label: 'Reporte Narrativo',
        //   icon: 'file-text',
        //   route: '/ai-analytics/narrative-report',
        //   isActive: false
        // }
      ]
    },
    {
      id: 'users',
      label: 'Gestión de Usuarios',
      icon: 'users',
      route: '/users',
      isActive: false
    }
  ]);

  readonly menuItems$ = this.menuItems;

  constructor(private router: Router) {}

  getMenuItems(): MenuItem[] {
    return this.menuItems();
  }

  addMenuItem(item: MenuItem): void {
    const currentItems = this.menuItems();
    this.menuItems.set([...currentItems, item]);
  }

  updateMenuItem(id: string, updates: Partial<MenuItem>): void {
    const currentItems = this.menuItems();
    const updatedItems = currentItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    this.menuItems.set(updatedItems);
  }

  removeMenuItem(id: string): void {
    const currentItems = this.menuItems();
    const filteredItems = currentItems.filter(item => item.id !== id);
    this.menuItems.set(filteredItems);
  }

  setActiveMenuItem(id: string): void {
    const currentItems = this.menuItems();
    const updatedItems = currentItems.map(item => {
      // Check if the item itself is active
      const itemActive = item.id === id;
      
      // Check if any child is active
      let childrenUpdated = item.children;
      let hasActiveChild = false;
      
      if (item.children) {
        childrenUpdated = item.children.map(child => {
          const isActive = child.id === id;
          if (isActive) hasActiveChild = true;
          return { ...child, isActive };
        });
      }
      
      return { 
        ...item, 
        isActive: itemActive || hasActiveChild,
        isExpanded: hasActiveChild || item.isExpanded || false,
        children: childrenUpdated
      };
    });
    this.menuItems.set(updatedItems);
  }

  toggleMenuExpanded(id: string): void {
    const currentItems = this.menuItems();
    const updatedItems = currentItems.map(item => 
      item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
    );
    this.menuItems.set(updatedItems);
  }

  navigateToMenuItem(item: MenuItem): void {
    if (item.route) {
      this.router.navigate([item.route]);
      this.setActiveMenuItem(item.id);
    }
  }
}