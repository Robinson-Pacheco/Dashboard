import { Component, Input } from '@angular/core';
import { LucideAngularModule, Info } from 'lucide-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info-tooltip',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './info-tooltip.component.html'
})
export class InfoTooltipComponent {
  readonly Info = Info;

  @Input() title?: string;
  @Input() description?: string;
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() width: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() iconColor: string = 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300';

  get widthClass(): string {
    switch (this.width) {
      case 'sm': return 'w-48';
      case 'md': return 'w-72';
      case 'lg': return 'w-80';
      case 'xl': return 'w-96';
      default: return 'w-72';
    }
  }

  get positionClass(): string {
    switch (this.position) {
      case 'top': return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom': return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left': return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right': return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default: return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  }

  get arrowClass(): string {
    switch (this.position) {
      case 'top': return 'bottom-0 left-1/2 -translate-x-1/2';
      case 'bottom': return 'top-0 left-1/2 -translate-x-1/2';
      case 'left': return 'right-0 top-1/2 -translate-y-1/2 rotate-90';
      case 'right': return 'left-0 top-1/2 -translate-y-1/2 -rotate-90';
      default: return 'bottom-0 left-1/2 -translate-x-1/2';
    }
  }
}
