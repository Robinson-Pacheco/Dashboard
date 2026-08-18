import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Upload, FileText, ArrowLeft, CheckCircle, XCircle } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';
import { AdmissionService } from '../../services/admission.service';

@Component({
  selector: 'app-admission-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './admission-upload.component.html'
})
export class AdmissionUploadComponent {
  readonly Upload = Upload;
  readonly FileText = FileText;
  readonly ArrowLeft = ArrowLeft;
  readonly CheckCircle = CheckCircle;
  readonly XCircle = XCircle;

  private admissionService = inject(AdmissionService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  selectedFile = signal<File | null>(null);
  period = signal<string>('');
  year = signal<number>(new Date().getFullYear());
  isUploading = signal<boolean>(false);
  uploadSuccess = signal<boolean>(false);
  uploadError = signal<string | null>(null);
  processedRecords = signal<number>(0);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        this.toastr.error('Por favor selecciona un archivo Excel válido (.xlsx o .xls)', 'Archivo inválido');
        return;
      }

      this.selectedFile.set(file);
      this.uploadSuccess.set(false);
      this.uploadError.set(null);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];

      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        this.toastr.error('Por favor selecciona un archivo Excel válido (.xlsx o .xls)', 'Archivo inválido');
        return;
      }

      this.selectedFile.set(file);
      this.uploadSuccess.set(false);
      this.uploadError.set(null);
    }
  }

  uploadFile(): void {
    const file = this.selectedFile();
    if (!file) {
      this.toastr.warning('Por favor selecciona un archivo Excel', 'Archivo requerido');
      return;
    }

    const periodValue = this.period().trim();
    if (!periodValue) {
      this.toastr.warning('Por favor ingresa el período académico', 'Campo requerido');
      return;
    }

    const periodMatch = periodValue.match(/(\d{4})-(\d)$/);
    if (!periodMatch || !['1', '2'].includes(periodMatch[2])) {
      this.toastr.warning('El período debe tener formato YYYY-N donde N es 1 o 2', 'Período inválido');
      return;
    }

    const yearVal = this.year();
    if (!yearVal || yearVal < 2000) {
      this.toastr.warning('Por favor ingresa un año válido', 'Año inválido');
      return;
    }

    const currentYear = new Date().getFullYear();
    if (yearVal > currentYear) {
      this.toastr.warning(`El año no puede ser superior a ${currentYear}`, 'Año inválido');
      return;
    }

    this.isUploading.set(true);
    this.uploadSuccess.set(false);
    this.uploadError.set(null);

    this.admissionService.uploadAdmissionFile(file, this.period(), this.year()).subscribe({
      next: (response) => {
        this.isUploading.set(false);
        this.uploadSuccess.set(true);
        this.processedRecords.set(response.data?.processedRecords || 0);
        this.toastr.success(
          `Registros procesados correctamente`,
          '¡Importación exitosa!'
        );

        // Redirect to list after 1.5 seconds
        setTimeout(() => {
          this.router.navigate(['/admission']);
        }, 1500);
      },
      error: (error) => {
        this.isUploading.set(false);
        this.uploadError.set(error.error?.error || 'Error al subir el archivo');
        this.toastr.error(
          error.error?.error || 'No se pudo procesar el archivo. Verifica el formato.',
          'Error en la importación'
        );
      }
    });
  }

  removeFile(): void {
    this.selectedFile.set(null);
    this.uploadSuccess.set(false);
    this.uploadError.set(null);
  }

  goToList(): void {
    this.router.navigate(['/admission']);
  }

  // Test methods for different toast types
  testSuccess(): void {
    this.toastr.success(
      'Operación completada exitosamente. Todos los datos han sido procesados correctamente.',
      '¡Éxito!'
    );
  }

  testError(): void {
    this.toastr.error(
      'Ha ocurrido un error al procesar la solicitud. Por favor verifica los datos e intenta nuevamente.',
      'Error'
    );
  }

  testWarning(): void {
    this.toastr.warning(
      'Atención: Algunos campos requieren tu atención antes de continuar con el proceso.',
      'Advertencia'
    );
  }

  testInfo(): void {
    this.toastr.info(
      'Esta es una notificación informativa con un texto bastante largo para verificar el comportamiento del toast cuando el contenido es extenso y el botón de cerrar debe mantenerse visible.',
      'Información'
    );
  }

  testLongMessage(): void {
    this.toastr.success(
      'Este es un mensaje extremadamente largo para probar cómo se comporta el toast cuando el contenido excede el ancho normal del componente. El texto debe ajustarse correctamente y el botón de cerrar debe mantenerse visible y accesible sin superponerse al contenido del mensaje en ningún momento.',
      'Mensaje largo de prueba'
    );
  }
}
