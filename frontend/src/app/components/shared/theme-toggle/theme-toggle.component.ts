import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../services/theme.service';
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss']
})


export class ThemeToggleComponent {
  public currentTheme = computed(() => this.themeService.theme());

  constructor(public themeService: ThemeService) {}

  public toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
