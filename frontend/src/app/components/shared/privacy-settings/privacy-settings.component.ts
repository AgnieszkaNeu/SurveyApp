import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ConsentService, ConsentPreferences } from '../../../services/consent.service';
import { FingerprintService } from '../../../services/fingerprint.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-privacy-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './privacy-settings.component.html',
  styleUrls: ['./privacy-settings.component.scss']
})


export class PrivacySettingsComponent implements OnInit {
  consent: ConsentPreferences | null = null;
  localStorageSize = 0;
  localStorageItems: any[] = [];
  showExportData = false;
  exportedData: any = null;
  functionalEnabled = true;
  fingerprintingEnabled = true;
  constructor(
    private consentService: ConsentService,
    private fingerprintService: FingerprintService,
    public authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadConsent();
    this.analyzeLocalStorage();
  }

  loadConsent(): void {
    this.consent = this.consentService.getConsent();

    if (this.consent) {
      this.functionalEnabled = this.consent.functional;
      this.fingerprintingEnabled = this.consent.fingerprinting;
    }
  }

  analyzeLocalStorage(): void {
    let totalSize = 0;
    const items: any[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key) {
        const value = localStorage.getItem(key);
        const size = new Blob([value || '']).size;
        totalSize += size;
        items.push({
          key: key,
          size: size,
          sizeFormatted: this.formatBytes(size),
          value: this.truncateValue(value)
        });
      }
    }
    this.localStorageSize = totalSize;
    this.localStorageItems = items.sort((a, b) => b.size - a.size);
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  truncateValue(value: string | null): string {
    if (!value) return '';

    if (value.length > 50) {
      return value.substring(0, 50) + '...';
    }
    return value;
  }

  savePreferences(): void {
    this.consentService.saveConsent({
      functional: this.functionalEnabled,
      fingerprinting: this.fingerprintingEnabled
    });
    alert('Preferencje zapisane!');
    this.loadConsent();
  }

  clearAllData(): void {
    if (confirm('UWAGA: To usunie WSZYSTKIE dane lokalne (localStorage). Czy na pewno?')) {
      localStorage.clear();
      alert('Wszystkie dane zostały usunięte!');
      this.analyzeLocalStorage();
      this.loadConsent();
    }
  }

  clearSpecificItem(key: string): void {
    if (confirm(`Usunąć "${key}"?`)) {
      localStorage.removeItem(key);
      alert('Usunięto!');
      this.analyzeLocalStorage();

      if (key === 'user-consent') {
        this.loadConsent();
      }
    }
  }

  async exportLocalData(): Promise<void> {
    const data = this.consentService.exportUserData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ankietio-local-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    alert('Dane zostały wyeksportowane!');
  }

  exportUserData(): void {
    if (!this.authService.isLoggedIn()) {
      alert('Musisz być zalogowany, aby wyeksportować dane z serwera.');
      return;
    }
    this.userService.exportMyData().subscribe({
      next: (data) => {
        this.exportedData = data;
        this.showExportData = true;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ankietio-complete-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        alert('Kompletne dane zostały wyeksportowane!');
      },
      error: (error) => {
        alert('Błąd podczas eksportu danych. Spróbuj ponownie.');
      }
    });
  }

  deleteUserAccount(): void {
    if (!this.authService.isLoggedIn()) {
      alert('Musisz być zalogowany, aby usunąć konto.');
      return;
    }
    const confirmation = prompt(
      'UWAGA: To nieodwracalnie usunie WSZYSTKIE Twoje dane:\n' +
      '- Konto użytkownika\n' +
      '- Wszystkie ankiety\n' +
      '- Wszystkie odpowiedzi\n\n' +
      'Wpisz "USUŃ" aby potwierdzić:'
    );

    if (confirmation === 'USUŃ') {
      this.userService.deleteMyData().subscribe({
        next: () => {
          alert('Konto zostało usunięte. Zostaniesz wylogowany.');
          this.authService.logout();
          this.router.navigate(['/']);
        },
        error: (error) => {
          alert('Błąd podczas usuwania konta.');
        }
      });
    }
  }

  resetConsent(): void {
    if (confirm('Czy zresetować zgodę? Banner pojawi się ponownie.')) {
      this.consentService.clearConsent();
      alert('Zgoda została zresetowana!');
      this.loadConsent();
    }
  }
}
