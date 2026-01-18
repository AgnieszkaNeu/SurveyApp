import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { ThemeToggleComponent } from './components/shared/theme-toggle/theme-toggle.component';
import { ToastContainerComponent } from './components/shared/toast-container/toast-container.component';
import { CookieBannerComponent } from './components/shared/cookie-banner/cookie-banner.component';
import { ThemeService } from './services/theme.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ThemeToggleComponent, ToastContainerComponent, CookieBannerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})


export class AppComponent implements OnInit {
  title = 'Ankietio';

  constructor(private themeService: ThemeService) {
  }

  ngOnInit(): void {
  }
}
