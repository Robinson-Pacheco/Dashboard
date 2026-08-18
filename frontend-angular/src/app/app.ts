import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private authService = inject(AuthService);
  
  constructor() {
    // Inicializar la autenticación cuando se carga la aplicación
    // This ensures auth is initialized before any route is activated
    this.authService.initializeAuth();
  }
}
