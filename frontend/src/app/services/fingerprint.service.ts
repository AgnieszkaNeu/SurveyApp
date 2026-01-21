import { Injectable } from '@angular/core';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { ConsentService } from './consent.service';
@Injectable({
  providedIn: 'root'
})


export class FingerprintService {
  private fpPromise: Promise<any> | null = null;
  private readonly STORAGE_KEY = 'fp_visitor_id';

  constructor(private consentService: ConsentService) {}
  private async initFingerprint(): Promise<any> {

    if (!this.fpPromise) {
      this.fpPromise = FingerprintJS.load();
    }
    return this.fpPromise;
  }

  async getFingerprint(): Promise<string | null> {
    if (!this.consentService.canUseFingerprinting()) {
      return null;
    }
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);

      if (stored) {
        return stored;
      }
    } catch (error) {
    }
    try {
      const fp = await this.initFingerprint();
      const result = await fp.get();
      const visitorId = result.visitorId;
      try {
        localStorage.setItem(this.STORAGE_KEY, visitorId);
      } catch (error) {
      }
      return visitorId;
    } catch (error) {
      return null;
    }
  }

  clearCache(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
    }
  }

  async getFingerprintComponents(): Promise<any> {
    if (!this.consentService.canUseFingerprinting()) {
      return null;
    }
    try {
      const fp = await this.initFingerprint();
      const result = await fp.get();
      return {
        visitorId: result.visitorId,
        components: result.components,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return null;
    }
  }
}
