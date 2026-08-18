import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import {
  LucideAngularModule, Menu, X, Home, BarChart3, FileText, Users, Database,
  ChevronDown, ChevronRight, Target, HeartHandshake, Building, MapPin, TrendingUp,
  Briefcase, List, Brain, Box, AlertTriangle, GitCompare, Lock, LogOut, Sun, Moon, UserCheck
} from 'lucide-angular';
import { RoleBasedMenuService, MenuItem } from '../../core/services/role-based-menu.service';
import { RoleService } from '../../core/services/role.service';
import { AuthService } from '../../core/services/auth.service';
import { DarkModeService } from '../../services/dark-mode';

@Component({
  selector: 'app-sub-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LucideAngularModule
  ],
  templateUrl: './sub-layout.component.html',
  styleUrl: './sub-layout.component.css'
})
export class SubLayoutComponent {
  private menuService = inject(RoleBasedMenuService);
  private roleService = inject(RoleService);
  private authService = inject(AuthService);
  private darkModeService = inject(DarkModeService);
  private router = inject(Router);

  // Menú filtrado por rol
  menuItems = computed(() => this.menuService.getMenuItems());
  currentRole = computed(() => this.roleService.currentRole());
  currentUser = computed(() => this.authService.currentUser());
  isDarkMode$ = this.darkModeService.isDarkMode$;

  sidebarOpen = signal<boolean>(true);
  isUserMenuOpen = signal<boolean>(false);

  // Iconos para el menú
  readonly Menu = Menu;
  readonly X = X;
  readonly Home = Home;
  readonly BarChart3 = BarChart3;
  readonly FileText = FileText;
  readonly Users = Users;
  readonly Database = Database;
  readonly ChevronDown = ChevronDown;
  readonly ChevronRight = ChevronRight;
  readonly Target = Target;
  readonly HeartHandshake = HeartHandshake;
  readonly Building = Building;
  readonly MapPin = MapPin;
  readonly TrendingUp = TrendingUp;
  readonly Briefcase = Briefcase;
  readonly List = List;
  readonly Brain = Brain;
  readonly Box = Box;
  readonly AlertTriangle = AlertTriangle;
  readonly GitCompare = GitCompare;
  readonly Lock = Lock;
  readonly LogOut = LogOut;
  readonly Sun = Sun;
  readonly Moon = Moon;
  readonly UserCheck = UserCheck;

  toggleSidebar(): void {
    this.sidebarOpen.update(open => !open);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(open => !open);
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }

  toggleDarkMode(): void {
    this.darkModeService.toggleDarkMode();
  }

  logout(): void {
    this.isUserMenuOpen.set(false);
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateToMenuItem(item: MenuItem): void {
    if (item.children && item.children.length > 0) {
      // Si tiene hijos, solo expandir/colapsar
      this.menuService.toggleMenuExpanded(item.id);
    } else {
      // Si no tiene hijos, navegar
      this.menuService.navigateToMenuItem(item);
    }
  }

  getIconForMenuItem(iconName: string) {
    const iconMap: { [key: string]: any } = {
      'layout-dashboard': this.Home,
      'bar-chart-3': this.BarChart3,
      'database': this.Database,
      'file-text': this.FileText,
      'users': this.Users,
      'target': this.Target,
      'heart-handshake': this.HeartHandshake,
      'building': this.Building,
      'map-pin': this.MapPin,
      'trending-up': this.TrendingUp,
      'briefcase': this.Briefcase,
      'list': this.List,
      'brain': this.Brain,
      'box': this.Box,
      'alert-triangle': this.AlertTriangle,
      'git-compare': this.GitCompare,
      'lock': this.Lock
    };
    return iconMap[iconName] || this.Home;
  }

  /**
   * Obtener etiqueta amigable del rol
   */
  getRoleLabel(role: string | null): string {
    const labels: { [key: string]: string } = {
      'admin': 'Administrador',
      'analyst': 'Analista',
      'viewer': 'Visualizador'
    };
    return labels[role || ''] || role || 'Usuario';
  }
}