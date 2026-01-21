import { Injectable } from '@angular/core';
import { ThemeService } from './theme.service';
@Injectable({
  providedIn: 'root'
})


export class ChartThemeService {

  constructor(private themeService: ThemeService) {}

  getChartColors(count: number = 10): string[] {
    const isDark = this.themeService.isDarkMode();
    const lightColors = [
      '#4f46e5',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#8b5cf6',
      '#ec4899',
      '#06b6d4',
      '#84cc16',
      '#f97316',
      '#6366f1'
    ];
    const darkColors = [
      '#818cf8',
      '#34d399',
      '#fbbf24',
      '#f87171',
      '#a78bfa',
      '#f472b6',
      '#22d3ee',
      '#a3e635',
      '#fb923c',
      '#a78bfa'
    ];
    return (isDark ? darkColors : lightColors).slice(0, count);
  }

  getBorderColor(): string {
    return this.themeService.isDarkMode()
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.05)';
  }

  getGridColor(): string {
    return this.getCSSVariable('--border-color') || '#e5e7eb';
  }

  getTextColor(): string {
    return this.getCSSVariable('--body-color') || '#1f2937';
  }

  getMutedTextColor(): string {
    return this.getCSSVariable('--gray-600') || '#6b7280';
  }

  getChartBackgroundColor(): string {
    return this.getCSSVariable('--card-bg') || '#ffffff';
  }

  getTooltipBackgroundColor(): string {
    return this.themeService.isDarkMode()
      ? 'rgba(31, 41, 55, 0.95)'
      : 'rgba(255, 255, 255, 0.95)';
  }

  getTooltipBorderColor(): string {
    return this.themeService.isDarkMode()
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(0, 0, 0, 0.1)';
  }

  getPrimaryChartColor(): string {
    const isDark = this.themeService.isDarkMode();
    return isDark ? '#818cf8' : '#4f46e5';
  }

  getSecondaryChartColor(): string {
    const isDark = this.themeService.isDarkMode();
    return isDark ? '#34d399' : '#10b981';
  }

  private getCSSVariable(variableName: string): string {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim();
  }

  getChartThemeConfig() {
    return {
      colors: this.getChartColors(),
      borderColor: this.getBorderColor(),
      gridColor: this.getGridColor(),
      textColor: this.getTextColor(),
      mutedTextColor: this.getMutedTextColor(),
      backgroundColor: this.getChartBackgroundColor(),
      tooltipBackgroundColor: this.getTooltipBackgroundColor(),
      tooltipBorderColor: this.getTooltipBorderColor(),
      primaryColor: this.getPrimaryChartColor(),
      secondaryColor: this.getSecondaryChartColor()
    };
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}
