import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, Building, TrendingUp, TrendingDown } from 'lucide-angular';
import { DarkModeService } from '../../../services/dark-mode';
import { InstitutionAnalysisItem } from '../../../features/reports/models/data-mining.model';

@Component({
  selector: 'app-institutions-detail-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (isOpen()) {
      <!-- Modal Backdrop -->
      <div class="fixed inset-0 z-50 overflow-y-auto" (click)="closeModal()">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <!-- Background overlay -->
          <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"></div>

          <!-- Center modal -->
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

          <!-- Modal Panel -->
          <div 
            (click)="$event.stopPropagation()"
            class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
            
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <lucide-icon [name]="Building" class="w-6 h-6 text-white"></lucide-icon>
                  <h3 class="text-lg font-semibold text-white">
                    {{ modalTitle() }}
                  </h3>
                </div>
                <button
                  (click)="closeModal()"
                  class="text-white hover:text-gray-200 transition-colors">
                  <lucide-icon [name]="X" class="w-6 h-6"></lucide-icon>
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="px-6 py-4 max-h-[70vh] overflow-y-auto">
              @if (institutions().length === 0) {
                <div class="text-center py-8">
                  <p class="text-gray-500 dark:text-gray-400">No hay datos disponibles</p>
                </div>
              } @else {
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          #
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Institución
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Puntaje
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Nivel
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Estudiantes
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Rango
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Desv. Est.
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      @for (item of institutions(); track item.institution; let i = $index) {
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            [class.bg-blue-50]="i < 3 && isBestList()"
                            [class.dark:bg-blue-900/10]="i < 3 && isBestList()">
                          <td class="px-4 py-3 whitespace-nowrap">
                            <span class="text-sm font-bold text-gray-900 dark:text-white">
                              {{ i + 1 }}
                            </span>
                          </td>
                          <td class="px-4 py-3">
                            <div class="flex items-center gap-2">
                              @if (i < 3 && isBestList()) {
                                <lucide-icon [name]="TrendingUp" class="w-4 h-4 text-green-500 flex-shrink-0"></lucide-icon>
                              } @else if (i < 3 && !isBestList()) {
                                <lucide-icon [name]="TrendingDown" class="w-4 h-4 text-red-500 flex-shrink-0"></lucide-icon>
                              }
                              <span class="text-sm text-gray-900 dark:text-white font-medium">
                                {{ item.institution }}
                              </span>
                            </div>
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap">
                            <span [class]="getTypeClass(item.type)" class="px-2 py-1 text-xs font-semibold rounded-full">
                              {{ item.type || 'N/A' }}
                            </span>
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap">
                            <span class="text-sm font-bold text-gray-900 dark:text-white">
                              {{ item.avgScore | number:'1.1-1' }}
                            </span>
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap">
                            <span [class]="getPerformanceLevelClass(item.performanceLevel)" class="px-2 py-1 text-xs font-semibold rounded-full">
                              {{ item.performanceLevel }}
                            </span>
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap">
                            <span class="text-sm text-gray-900 dark:text-white">
                              {{ item.studentCount | number }}
                            </span>
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap">
                            <span class="text-sm text-gray-600 dark:text-gray-400">
                              {{ item.minScore }} - {{ item.maxScore }}
                            </span>
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap">
                            <span class="text-sm text-gray-900 dark:text-white">
                              {{ item.stdDev | number:'1.1-1' }}
                            </span>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <!-- Color Legend for Best Institutions -->
                @if (isBestList()) {
                  <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Clasificación por Colores:</p>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div class="w-4 h-4 rounded flex-shrink-0" style="background-color: #005ca2;"></div>
                        <span class="text-xs text-gray-600 dark:text-gray-400">
                          <strong>Top 3 - Excelencia:</strong> Éxito y Autoridad
                        </span>
                      </div>
                      <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div class="w-4 h-4 rounded flex-shrink-0" style="background-color: #53aae1;"></div>
                        <span class="text-xs text-gray-600 dark:text-gray-400">
                          <strong>4-7 - Alto Rendimiento:</strong> Serenidad
                        </span>
                      </div>
                      <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div class="w-4 h-4 rounded flex-shrink-0" style="background-color: #C2354a;"></div>
                        <span class="text-xs text-gray-600 dark:text-gray-400">
                          <strong>8-10 - Buen Desempeño:</strong> Esfuerzo
                        </span>
                      </div>
                    </div>
                  </div>
                }
              }
            </div>

            <!-- Footer -->
            <div class="bg-gray-50 dark:bg-gray-900 px-6 py-4">
              <div class="flex justify-between items-center">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Total: <strong class="text-gray-900 dark:text-white">{{ institutions().length }}</strong> instituciones
                </p>
                <button
                  (click)="closeModal()"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class InstitutionsDetailModalComponent {
  readonly X = X;
  readonly Building = Building;
  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;

  @Input() set open(value: boolean) {
    this.isOpen.set(value);
  }

  @Input() set data(value: InstitutionAnalysisItem[]) {
    this.institutions.set(value);
  }

  @Input() set title(value: string) {
    this.modalTitle.set(value);
  }

  @Input() set isBest(value: boolean) {
    this.isBestList.set(value);
  }

  @Output() closeEvent = new EventEmitter<void>();

  isOpen = signal<boolean>(false);
  institutions = signal<InstitutionAnalysisItem[]>([]);
  modalTitle = signal<string>('Detalles de Instituciones');
  isBestList = signal<boolean>(false);

  constructor(public darkModeService: DarkModeService) {}

  closeModal(): void {
    this.isOpen.set(false);
    this.closeEvent.emit();
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'FISCAL': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PARTICULAR': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'FISCOMISIONAL': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'MUNICIPAL': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  getPerformanceLevelClass(level: string): string {
    switch (level) {
      case 'Excelente': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Bueno': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Regular': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Bajo': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }
}
