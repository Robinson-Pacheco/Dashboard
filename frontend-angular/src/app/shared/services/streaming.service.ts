import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StreamingService {
  /**
   * Simulates streaming text effect
   * Updates the signal progressively with chunks of text
   */
  streamText(
    fullText: string,
    updateSignal: (text: string) => void,
    options: {
      chunkSize?: number;
      delayMs?: number;
      onComplete?: () => void;
    } = {}
  ): void {
    const {
      chunkSize = 3,
      delayMs = 15,
      onComplete
    } = options;

    let currentIndex = 0;

    const streamInterval = setInterval(() => {
      if (currentIndex >= fullText.length) {
        clearInterval(streamInterval);
        onComplete?.();
        return;
      }

      const nextIndex = Math.min(currentIndex + chunkSize, fullText.length);
      updateSignal(fullText.substring(0, nextIndex));
      currentIndex = nextIndex;
    }, delayMs);
  }

  /**
   * Streams text character by character for slower, more dramatic effect
   */
  streamTextByCharacter(
    fullText: string,
    updateSignal: (text: string) => void,
    options: {
      delayMs?: number;
      onComplete?: () => void;
    } = {}
  ): void {
    const {
      delayMs = 20,
      onComplete
    } = options;

    let currentIndex = 0;

    const streamInterval = setInterval(() => {
      if (currentIndex >= fullText.length) {
        clearInterval(streamInterval);
        onComplete?.();
        return;
      }

      updateSignal(fullText.substring(0, currentIndex + 1));
      currentIndex++;
    }, delayMs);
  }

  /**
   * Streams text word by word for natural reading effect
   */
  streamTextByWord(
    fullText: string,
    updateSignal: (text: string) => void,
    options: {
      delayMs?: number;
      onComplete?: () => void;
    } = {}
  ): void {
    const {
      delayMs = 50,
      onComplete
    } = options;

    const words = fullText.split(' ');
    let currentIndex = 0;

    const streamInterval = setInterval(() => {
      if (currentIndex >= words.length) {
        clearInterval(streamInterval);
        onComplete?.();
        return;
      }

      updateSignal(words.slice(0, currentIndex + 1).join(' '));
      currentIndex++;
    }, delayMs);
  }
}
