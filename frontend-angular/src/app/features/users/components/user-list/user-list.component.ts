import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LucideAngularModule, Users, Edit, Trash2, Plus } from 'lucide-angular';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ConfirmDialogComponent],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  readonly Users = Users;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;
  readonly Plus = Plus;
  
  isLoading = signal<boolean>(false);
  users: any;
  
  // Confirm dialog state
  showConfirmDialog = signal<boolean>(false);
  confirmDialogTitle = signal<string>('');
  confirmDialogMessage = signal<string>('');
  confirmButtonText = signal<string>('Eliminar');
  cancelButtonText = signal<string>('Cancelar');
  userToDelete: User | null = null;
  
  constructor(
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService
  ) {
    // Initialize the computed property after the service is injected
    this.users = computed(() => this.userService.users());
  }
  
  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.userService.loadUsers().then(() => {
      this.isLoading.set(false);
    }).catch((error) => {
      console.error('Error loading users:', error);
      this.toastr.error('Error al cargar usuarios');
      this.isLoading.set(false);
    });
  }

  deleteUser(user: User): void {
    this.userToDelete = user;
    this.confirmDialogTitle.set('Eliminar Usuario');
    this.confirmDialogMessage.set(
      `¿Está seguro de que desea eliminar al usuario "${user.username}"? Esta acción no se puede deshacer.`
    );
    this.showConfirmDialog.set(true);
  }

  onConfirmDelete(): void {
    if (this.userToDelete) {
      this.userService.deleteUser(this.userToDelete.id).subscribe({
        next: () => {
          this.toastr.success('Usuario eliminado correctamente', 'Éxito');
          this.loadUsers();
          this.userToDelete = null;
        },
        error: () => {
          this.toastr.error('Error al eliminar usuario', 'Error');
          this.userToDelete = null;
        }
      });
    }
  }

  onCancelDelete(): void {
    this.userToDelete = null;
  }

  addUser(): void {
    this.router.navigate(['/users/new']);
  }

  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'analyst':
        return 'Analista';
      case 'viewer':
        return 'Visualizador';
      default:
        return role;
    }
  }
}