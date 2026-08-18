import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, History, FileText, Calendar, Hash } from 'lucide-angular';
import { AdmissionService } from '../../services/admission.service';
import { UploadHistoryItem } from '../../models/admission.model';

@Component({
  selector: 'app-upload-history',
  imports: [CommonModule, LucideAngularModule],
  template: `
<div class="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
  <div class="flex items-center mb-6">
    <lucide-icon [name]="History" class="w-6 h-6 text-utmach-blue mr-3"></lucide-icon>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Historial de Archivos Cargados</h1>
  </div>

  @if (isLoading()) {
    <div class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-utmach-blue"></div>
    </div>
  } @else if (history().length === 0) {
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
      <lucide-icon [name]="FileText" class="w-16 h-16 text-gray-400 mx-auto mb-4"></lucide-icon>
      <p class="text-gray-500 dark:text-gray-400 text-lg">No hay archivos cargados aún</p>
    </div>
  } @else {
    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Año</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Período</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Archivo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha de Carga</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Registros</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            @for (item of history(); track item.uploadedAt) {
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ item.year }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{{ item.period }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{{ item.originalFileName }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{{ item.uploadedAt | date:'dd/MM/yyyy HH:mm' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{{ item.recordCount }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  }
</div>
  `
})
export class UploadHistoryComponent implements OnInit {
  readonly History = History;
  readonly FileText = FileText;
  readonly Calendar = Calendar;
  readonly Hash = Hash;

  private admissionService = inject(AdmissionService);
  history = signal<UploadHistoryItem[]>([]);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading.set(true);
    this.admissionService.getUploadHistory().subscribe({
      next: (response) => { this.history.set(response.data); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); }
    });
  }
}
