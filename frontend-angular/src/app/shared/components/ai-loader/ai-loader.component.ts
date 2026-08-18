import { Component, input, signal, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Brain, Sparkles } from 'lucide-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-ai-loader',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './ai-loader.component.html'
})
export class AiLoaderComponent implements OnInit {
  readonly Brain = Brain;
  readonly Sparkles = Sparkles;

  messages = input.required<string[]>();
  title = input<string>('Procesando con IA');

  currentMessage = signal<string>('');
  messageIndex = 0;

  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    // Start with first message
    this.currentMessage.set(this.messages()[0]);

    // Rotate through messages
    const interval = setInterval(() => {
      this.messageIndex = (this.messageIndex + 1) % this.messages().length;
      this.currentMessage.set(this.messages()[this.messageIndex]);
    }, 2500);

    // Cleanup on destroy
    this.destroyRef.onDestroy(() => {
      clearInterval(interval);
    });
  }
}
