import { Injectable } from '@angular/core';


export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}
@Injectable({
  providedIn: 'root'
})


export class ToastService {
  private toasts: (ToastMessage & { id: number })[] = [];
  private idCounter = 0;

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000): void {
    const id = this.idCounter++;
    const toast = { id, message, type, duration };
    this.toasts.push(toast);
    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  remove(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  getToasts(): (ToastMessage & { id: number })[] {
    return this.toasts;
  }
}
