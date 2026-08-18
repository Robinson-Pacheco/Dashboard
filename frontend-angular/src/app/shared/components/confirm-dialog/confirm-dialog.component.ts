import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertTriangle, X } from 'lucide-angular';
import { DarkModeService } from '../../../services/dark-mode';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {
  readonly AlertTriangleIcon = AlertTriangle;
  readonly XIcon = X;

  @Input() isOpen = signal<boolean>(false);
  @Input() title = signal<string>('Confirmar acción');
  @Input() message = signal<string>('¿Está seguro de que desea continuar?');
  @Input() confirmText = signal<string>('Confirmar');
  @Input() cancelText = signal<string>('Cancelar');

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  isDarkMode = toSignal(inject(DarkModeService).isDarkMode$);

  confirm(): void {
    this.onConfirm.emit();
    this.isOpen.set(false);
  }

  cancel(): void {
    this.onCancel.emit();
    this.isOpen.set(false);
  }
}
