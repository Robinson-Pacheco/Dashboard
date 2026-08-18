import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { DarkModeService } from '../../services/dark-mode';
import { AuthService } from '../../core/services/auth.service';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, LucideAngularModule, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit {
  // Lucide icons
  readonly ChevronDown = ChevronDown;
  private darkModeService = inject(DarkModeService);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  isDarkMode$ = this.darkModeService.isDarkMode$;
  currentYear = new Date().getFullYear();
  isAuthenticated = computed(() => this.authService.getIsAuthenticated());
  currentUser = computed(() => this.authService.currentUser());
  isUserMenuOpen = signal(false);

  ngOnInit(): void {
    // Ensure authentication is initialized when component loads
    if (!this.authService.getAuthInitialized()) {
      this.authService.initializeAuth();
    }
  }

  toggleDarkMode(): void {
    this.darkModeService.toggleDarkMode();
  }
  
  toggleUserMenu(): void {
    this.isUserMenuOpen.set(!this.isUserMenuOpen());
  }
  
  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }
  
  logout(): void {
    this.isUserMenuOpen.set(false);
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
  
  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
