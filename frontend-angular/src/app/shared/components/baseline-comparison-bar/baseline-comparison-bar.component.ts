import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-baseline-comparison-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './baseline-comparison-bar.component.html'
})
export class BaselineComparisonBarComponent {
  @Input() currentValue: number = 0;
  @Input() baselineValue: number = 0;
  @Input() minValue: number = 0;
  @Input() maxValue: number = 1000;
  @Input() label: string = 'Comparación';
  @Input() baselineLabel: string = 'Línea Base';
  @Input() currentLabel: string = 'Valor Actual';

  showTooltip = signal<boolean>(false);
  tooltipPosition = signal<'left' | 'right'>('right');

  get currentPercentage(): number {
    return (this.currentValue / this.maxValue) * 100;
  }

  get baselinePercentage(): number {
    return (this.baselineValue / this.maxValue) * 100;
  }

  get isAboveBaseline(): boolean {
    return this.currentValue >= this.baselineValue;
  }

  get gap(): number {
    return Math.abs(this.currentValue - this.baselineValue);
  }

  get gapDirection(): string {
    return this.currentValue >= this.baselineValue ? 'Por encima' : 'Por debajo';
  }

  get barColor(): string {
    return this.isAboveBaseline 
      ? 'bg-gradient-to-r from-green-500 to-green-700' 
      : 'bg-gradient-to-r from-red-500 to-red-700';
  }

  onMouseEnter(): void {
    this.showTooltip.set(true);
    // Determinar posición del tooltip basado en la posición de la barra
    this.tooltipPosition.set(this.currentPercentage > 50 ? 'left' : 'right');
  }

  onMouseLeave(): void {
    this.showTooltip.set(false);
  }
}
