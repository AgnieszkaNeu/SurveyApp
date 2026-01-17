import { Injectable, signal, effect, Injector, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConsentService } from './consent.service';


export type Theme = 'light' | 'dark';
@Injectable({
  providedIn: 'root'
})


export class ThemeService {
  private readonly STORAGE_KEY = 'ankietio-theme';
  public theme = signal<Theme>('light');
  public themeChange$ = new BehaviorSubject<Theme>('light');
  private injector = inject(Injector);
  private consentService = inject(ConsentService);

  constructor() {
    this.loadTheme();
    this.applyTheme();
    effect(() => {
      const currentTheme = this.theme();
      this.applyTheme();
    }, { injector: this.injector });
  }

  private loadTheme(): void {
    if (!this.consentService.canUseFunctionalCookies()) {
      this.theme.set('light');
      return;
    }
    try {
      const savedTheme = localStorage.getItem(this.STORAGE_KEY) as Theme;
      if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
        this.theme.set(savedTheme);
      }
    } catch (error) {
    }
  }

  private saveTheme(theme: Theme): void {
    if (!this.consentService.canUseFunctionalCookies()) {
      return;
    }
    try {
      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch (error) {
    }
  }

  public setTheme(theme: Theme): void {
    this.theme.set(theme);
    this.saveTheme(theme);
    this.applyTheme();
    this.themeChange$.next(theme);
  }

  public toggleTheme(): void {
    const current = this.theme();
    const newTheme: Theme = current === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  private applyTheme(): void {
    const theme = this.theme();
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    this.updateMetaThemeColor(theme);
  }

  private updateMetaThemeColor(theme: Theme): void {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const color = theme === 'dark' ? '#0f172a' : '#ffffff';

    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', color);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = color;
      document.head.appendChild(meta);
    }
  }

  public isDarkMode(): boolean {
    return this.theme() === 'dark';
  }

  public isLightMode(): boolean {
    return this.theme() === 'light';
  }

  public getCurrentTheme(): Theme {
    return this.theme();
  }
}
