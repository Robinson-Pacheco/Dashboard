import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, User } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly tokenKey = environment.jwtTokenKey;
  
  // Signals for reactive state management
  public currentUser = signal<User | null>(null);
  public isAuthenticated = signal<boolean>(false);
  public isLoading = signal<boolean>(false);
  public authInitialized = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Don't initialize in constructor to avoid race conditions
  }

  public initializeAuth(): void {
    const token = localStorage.getItem(this.tokenKey);
    const currentUserStr = localStorage.getItem('current_user');
    console.log('Initializing auth, token found:', !!token);
    console.log('Current user found in localStorage:', !!currentUserStr);
    
    // Reset state first to ensure computed properties update
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    
    if (token) {
      try {
        // Decodificar el token JWT para obtener la información del usuario
        const tokenPayload = this.decodeToken(token);
        console.log('Token payload:', tokenPayload);
        
        if (tokenPayload) {
          // Check if token is expired
          if (this.isTokenExpired(tokenPayload)) {
            console.log('Token expired, removing from storage');
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem('current_user');
            this.currentUser.set(null);
            this.isAuthenticated.set(false);
          } else {
            // Try to get user data from localStorage first
            let user: User | null = null;
            
            if (currentUserStr) {
              try {
                user = JSON.parse(currentUserStr);
                console.log('User data from localStorage:', user);
              } catch (e) {
                console.error('Error parsing current_user from localStorage:', e);
              }
            }
            
            // If we couldn't get user from localStorage, create minimal user from token
            if (!user) {
              user = {
                id: tokenPayload.id,
                username: tokenPayload.username || '',
                email: tokenPayload.email || '',
                names: tokenPayload.names || tokenPayload.username || '',
                role: tokenPayload.role || 'viewer'
              };
              console.log('Created user from token payload:', user);
            }
            
            this.currentUser.set(user);
            this.isAuthenticated.set(true);
          }
        } else {
          // Si el token no tiene la información del usuario, lo eliminamos
          console.log('Token payload is empty, removing token');
          localStorage.removeItem(this.tokenKey);
          localStorage.removeItem('current_user');
          this.isAuthenticated.set(false);
        }
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem('current_user');
        this.isAuthenticated.set(false);
      }
    } else {
      console.log('No token found in localStorage');
      // Also remove current_user if no token exists
      localStorage.removeItem('current_user');
    }
    // Mark authentication as initialized
    this.authInitialized.set(true);
  }

  // Synchronous method to check if user is authenticated
  // This method will initialize auth if not already done
  public checkAuthStatus(): boolean {
    if (!this.authInitialized()) {
      this.initializeAuth();
    }
    return this.isAuthenticated();
  }

  private decodeToken(token: string): any {
    try {
      // Decodificar el payload del token JWT
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error al decodificar el token JWT:', error);
      return null;
    }
  }

  // Public method for external use (guard, interceptor)
  public decodeTokenPublic(token: string): any {
    return this.decodeToken(token);
  }

  private isTokenExpired(tokenPayload: any): boolean {
    // Check if the token has an expiration claim (exp)
    if (!tokenPayload.exp) {
      // If no expiration claim, assume it's not expired
      console.log('Token has no expiration claim');
      return false;
    }
    
    // Get current time in seconds
    const currentTime = Math.floor(Date.now() / 1000);
    
    console.log('Token expiration time:', tokenPayload.exp);
    console.log('Current time:', currentTime);
    
    // Check if token is expired (with a small buffer of 5 seconds)
    const isExpired = tokenPayload.exp < (currentTime - 5);
    console.log('Is token expired:', isExpired);
    
    return isExpired;
  }

  // Public method for external use (guard, interceptor)
  public isTokenExpiredPublic(tokenPayload: any): boolean {
    return this.isTokenExpired(tokenPayload);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.isLoading.set(true);
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            const { token, user } = response.data;
            localStorage.setItem(this.tokenKey, token);
            localStorage.setItem('current_user', JSON.stringify(user));
            this.currentUser.set(user);
            this.isAuthenticated.set(true);
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      })
    );
  }

  logout(): void {
    console.log('Logging out, removing token and user data');
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('current_user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  getIsAuthenticated(): boolean {
    return this.isAuthenticated();
  }

  getAuthInitialized(): boolean {
    return this.authInitialized();
  }
}