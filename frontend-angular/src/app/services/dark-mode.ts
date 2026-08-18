import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DarkModeService {
  private isDarkModeSubject: BehaviorSubject<boolean>;
  public isDarkMode$: Observable<boolean>;
  private initialized = false;

  constructor() {
    // Initialize with the correct value from the start
    const savedTheme = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialValue = savedTheme ? savedTheme === 'true' : prefersDark;
    
    this.isDarkModeSubject = new BehaviorSubject<boolean>(initialValue);
    this.isDarkMode$ = this.isDarkModeSubject.asObservable();
    
    this.initializeDarkMode();
  }

  private initializeDarkMode(): void {
    if (this.initialized) {
      return;
    }
    
    this.initialized = true;
    const isDark = this.isDarkModeSubject.value;
    
    console.log('Initializing dark mode, setting to:', isDark);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleDarkMode(): void {
    const currentMode = this.isDarkModeSubject.value;
    this.setDarkMode(!currentMode);
  }

  setDarkMode(isDark: boolean): void {
    console.log('Setting dark mode to:', isDark);
    
    this.isDarkModeSubject.next(isDark);
    localStorage.setItem('darkMode', isDark.toString());
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
