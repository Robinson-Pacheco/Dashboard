import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Brain, Sparkles } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';
import { AIAnalysisService } from './services/ai-analysis.service';
import { ProviderStatusData } from './models/ai-analysis.models';

@Component({
  selector: 'app-ai-analytics',
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './ai-analytics.component.html'
})
export class AIAnalyticsComponent implements OnInit {
  readonly Brain = Brain;
  readonly Sparkles = Sparkles;

  private aiAnalysisService = inject(AIAnalysisService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  // State
  currentRoute = signal<string>('quartiles');
  isLoading = signal<boolean>(false);
  providerStatus = signal<ProviderStatusData | null>(null);

  ngOnInit(): void {
    this.checkProviderStatus();

    // Set initial route
    const currentUrl = this.router.url;
    const route = currentUrl.split('/').pop() || 'quartiles';
    this.currentRoute.set(route);

    // Listen to route changes
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const route = event.url.split('/').pop() || 'quartiles';
        this.currentRoute.set(route);
      }
    });
  }

  checkProviderStatus(): void {
    this.aiAnalysisService.getProviderStatus().subscribe({
      next: (response) => {
        if (response.success) {
          this.providerStatus.set(response.data);
        } else {
          this.toastr.error('No se puede conectar con el servicio de IA', 'Error de conexión');
        }
      },
      error: (error) => {
        console.error('Error checking AI provider status:', error);
        this.providerStatus.set({
          status: 'disconnected',
          provider: 'Desconocido',
          message: 'No se puede conectar con el servicio de IA'
        });
        this.toastr.error('Verifica que el servicio de IA esté configurado correctamente', 'Error de conexión');
      }
    });
  }

  getProviderStatusClass(): string {
    const status = this.providerStatus()?.status;
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'disconnected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'error':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  getProviderStatusIcon(): string {
    const status = this.providerStatus()?.status;
    switch (status) {
      case 'connected':
        return '✓';
      case 'disconnected':
        return '✗';
      case 'error':
        return '⚠';
      default:
        return '?';
    }
  }

  isProviderConnected(): boolean {
    return this.providerStatus()?.status === 'connected';
  }
}
