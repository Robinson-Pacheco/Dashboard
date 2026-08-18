import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LucideAngularModule, Save, ArrowLeft, Eye, EyeOff } from 'lucide-angular';
import { UserService } from '../../services/user.service';
import { User, CreateUserRequest, UpdateUserRequest } from '../../models/user.model';
import { DarkModeService } from '../../../../services/dark-mode';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  readonly Save = Save;
  readonly ArrowLeft = ArrowLeft;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  
  userForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  userId: string | null = null;
  showPassword = signal<boolean>(false);
  
  isDarkMode = toSignal(inject(DarkModeService).isDarkMode$);
  
  roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'analyst', label: 'Analista' },
    { value: 'viewer', label: 'Visualizador' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      names: ['', Validators.required],
      role: ['viewer', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.userId = params['id'];
        if (this.userId) {
          this.loadUser(this.userId);
        }
        // Remove password validation in edit mode
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();
      }
    });
  }

  loadUser(id: string): void {
    this.isLoading = true;
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          names: user.names,
          role: user.role
        });
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Error al cargar usuario', 'Error');
        this.isLoading = false;
        this.router.navigate(['/users']);
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }

    this.isLoading = true;
    
    if (this.isEditMode && this.userId) {
      const userData: UpdateUserRequest = this.userForm.value;
      this.userService.updateUser(this.userId, userData).subscribe({
        next: () => {
          this.toastr.success('Usuario actualizado correctamente', 'Éxito');
          this.router.navigate(['/users']);
        },
        error: () => {
          this.toastr.error('Error al actualizar usuario', 'Error');
          this.isLoading = false;
        }
      });
    } else {
      const userData: CreateUserRequest = this.userForm.value;
      this.userService.createUser(userData).subscribe({
        next: () => {
          this.toastr.success('Usuario creado correctamente', 'Éxito');
          this.router.navigate(['/users']);
        },
        error: () => {
          this.toastr.error('Error al crear usuario', 'Error');
          this.isLoading = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}