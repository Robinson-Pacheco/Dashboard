import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  console.log('AuthGuard: Checking route:', state.url);
  
  // Use the synchronous checkAuthStatus method which initializes auth if needed
  const isAuthenticated = authService.checkAuthStatus();
  console.log('AuthGuard: Is authenticated:', isAuthenticated);
  
  if (isAuthenticated) {
    // Check if token is expired
    const token = authService.getToken();
    if (token) {
      try {
        const tokenPayload = authService.decodeTokenPublic(token);
        if (tokenPayload && authService.isTokenExpiredPublic(tokenPayload)) {
          console.log('AuthGuard: Token expired, redirecting to session-expired');
          // Clear session
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('current_user');
          authService.currentUser.set(null);
          authService.isAuthenticated.set(false);
          return router.createUrlTree(['/session-expired']);
        }
      } catch (error) {
        console.error('AuthGuard: Error checking token expiration:', error);
      }
    }
    return true;
  }
  
  console.log('AuthGuard: Redirecting to login');
  // Redirect to the login page with the return URL
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};