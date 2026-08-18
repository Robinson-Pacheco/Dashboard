import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authInterceptor = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Skip adding token for login and register endpoints
  const isAuthEndpoint = request.url.includes('/auth/login') || 
                        request.url.includes('/auth/register');
  
  if (!isAuthEndpoint) {
    const token = authService.getToken();
    
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors (token expired or invalid)
      if (error.status === 401 && !request.url.includes('/auth/login')) {
        console.log('AuthInterceptor: Received 401 error, session expired');
        console.log('AuthInterceptor: URL that caused 401:', request.url);
        
        // Clear session data
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('current_user');
        authService.currentUser.set(null);
        authService.isAuthenticated.set(false);
        
        // Redirect to session expired page
        router.navigate(['/session-expired']);
      }
      return throwError(() => error);
    })
  );
};