import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, catchError, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';
import { User, CreateUserRequest, UpdateUserRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;
  users = signal<User[]>([]);
  readonly users$ = this.users;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  getUsers(): Observable<{success: boolean, data: User[]}> {
    return this.http.get<{success: boolean, data: User[]}>(`${this.apiUrl}/auth/users`).pipe(
      // Add debugging to see the raw response
      tap(response => console.log('Raw API response:', response)),
      catchError(this.handleError.bind(this))
    );
  }

  loadUsers(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getUsers().subscribe({
        next: (response) => {
          console.log('Response from API in service:', response);
          // Extraer el array de usuarios de la propiedad data
          const usersArray = response.data || response;
          console.log('Users array extracted:', usersArray);
          this.users.set(usersArray);
          console.log('Users signal after set:', this.users());
          resolve();
        },
        error: (error) => {
          console.error('Error loading users in service:', error);
          this.toastr.error('Error al cargar usuarios');
          reject(error);
        }
      });
    });
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/users/${id}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  createUser(userData: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/register`, userData).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  updateUser(id: string, userData: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/auth/users/${id}`, userData).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/auth/users/${id}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Código de error: ${error.status}, mensaje: ${error.message}`;
    }
    
    this.toastr.error(errorMessage, 'Error');
    return throwError(() => new Error(errorMessage));
  }
}