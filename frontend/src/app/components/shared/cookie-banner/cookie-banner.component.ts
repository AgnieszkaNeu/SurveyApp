import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ConsentService } from '../../../services/consent.service';
@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.scss']
})


export class CookieBannerComponent implements OnInit {
  showBanner = false;
  showCustomize = false;
  functionalEnabled = true;
  fingerprintingEnabled = true;

  constructor(private consentService: ConsentService) {}

  ngOnInit(): void {
    if (!this.consentService.hasConsent()) {
      setTimeout(() => {
        this.showBanner = true;
      }, 1000);
    }
  }

  acceptAll(): void {
    this.consentService.acceptAll();
    this.showBanner = false;
    this.showCustomize = false;
  }

  acceptNecessaryOnly(): void {
    this.consentService.acceptNecessaryOnly();
    this.showBanner = false;
    this.showCustomize = false;
  }

  saveCustomPreferences(): void {
    this.consentService.saveConsent({
      functional: this.functionalEnabled,
      fingerprinting: this.fingerprintingEnabled
    });
    this.showBanner = false;
    this.showCustomize = false;
  }

  toggleCustomize(): void {
    this.showCustomize = !this.showCustomize;
  }

  closeBanner(): void {
    if (!this.consentService.hasConsent()) {
      this.acceptNecessaryOnly();
    } else {
      this.showBanner = false;
    }
  }
}
