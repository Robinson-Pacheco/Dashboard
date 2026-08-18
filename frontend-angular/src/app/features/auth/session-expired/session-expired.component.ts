import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, Clock, LogIn } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-session-expired',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './session-expired.component.html'
})
export class SessionExpiredComponent implements OnInit {
  readonly Clock = Clock;
  readonly LogIn = LogIn;

  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Session is already cleared by interceptor
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
