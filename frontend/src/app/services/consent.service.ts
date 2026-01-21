import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


export interface ConsentPreferences {
  necessary: boolean;
  functional: boolean;
  fingerprinting: boolean;
  timestamp: string;
  version: string;
}
@Injectable({
  providedIn: 'root'
})


export class ConsentService {
  private readonly STORAGE_KEY = 'user-consent';
  private readonly POLICY_VERSION = '1.0';
  private consentSubject = new BehaviorSubject<ConsentPreferences | null>(this.loadConsent());
  public consent$: Observable<ConsentPreferences | null> = this.consentSubject.asObservable();

  constructor() {}

  private loadConsent(): ConsentPreferences | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);

      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
    }
    return null;
  }

  saveConsent(preferences: Partial<ConsentPreferences>): void {
    const previousConsent = this.getConsent();
    const consent: ConsentPreferences = {
      necessary: true,
      functional: preferences.functional ?? false,
      fingerprinting: preferences.fingerprinting ?? false,
      timestamp: new Date().toISOString(),
      version: this.POLICY_VERSION
    };
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(consent));
      this.consentSubject.next(consent);

      if (previousConsent?.fingerprinting === true && consent.fingerprinting === false) {
        localStorage.removeItem('fp_visitor_id');
      }
    } catch (error) {
    }
  }

  acceptAll(): void {
    this.saveConsent({
      functional: true,
      fingerprinting: true
    });
  }

  acceptNecessaryOnly(): void {
    this.saveConsent({
      functional: false,
      fingerprinting: false
    });
  }

  getConsent(): ConsentPreferences | null {
    return this.consentSubject.value;
  }

  hasConsent(): boolean {
    return this.consentSubject.value !== null;
  }

  canUseFingerprinting(): boolean {
    const consent = this.getConsent();
    return consent?.fingerprinting === true;
  }

  canUseFunctionalCookies(): boolean {
    const consent = this.getConsent();
    return consent?.functional === true;
  }

  clearConsent(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.consentSubject.next(null);
    } catch (error) {
    }
  }

  exportUserData(): string {
    const consent = this.getConsent();
    const data = {
      consent: consent,
      localStorage: {
        token: localStorage.getItem('token') ? '[ENCRYPTED]' : null,
        theme: localStorage.getItem('theme'),
        submittedSurveys: localStorage.getItem('submittedSurveys')
      },
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }
}
