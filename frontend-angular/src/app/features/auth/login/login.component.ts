import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/interfaces/auth.interface';
import { DarkModeService } from '../../../services/dark-mode';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  LucideAngularModule,
  BarChart3,
  Eye,
  EyeOff,
  AlertCircle,
  User,
  Lock,
  ShieldCheck
} from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Lucide icons
  readonly BarChart3 = BarChart3;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly AlertCircle = AlertCircle;
  readonly User = User;
  readonly Lock = Lock;
  readonly ShieldCheck = ShieldCheck;

  credentials = signal<LoginRequest>({
    username: '',
    password: ''
  });

  errorMessage = signal<string>('');
  showPassword = signal<boolean>(false);

  // Get dark mode state as a signal
  isDarkMode = toSignal(inject(DarkModeService).isDarkMode$);

  constructor(
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  updateCredential(field: 'username' | 'password', value: string): void {
    this.credentials.update(creds => ({ ...creds, [field]: value }));
  }

  onSubmit(): void {
    this.errorMessage.set('');

    this.authService.login(this.credentials()).subscribe({
      next: (response) => {
        if (response.success) {
          // Get the return URL from query params or default to dashboard
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          this.router.navigate([returnUrl]);
        }
      },
      error: (error) => {
        this.errorMessage.set('Credenciales inválidas. Por favor, inténtalo de nuevo.');
        console.error('Login error:', error);
      }
    });
  }
}