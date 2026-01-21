import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999">
      <div
        *ngFor="let toast of toastService.getToasts()"
        class="toast show"
        role="alert"
        [class.bg-success]="toast.type === 'success'"
        [class.bg-danger]="toast.type === 'error'"
        [class.bg-info]="toast.type === 'info'"
        [class.bg-warning]="toast.type === 'warning'"
        [class.text-white]="toast.type !== 'warning'"
      >
        <div class="d-flex">
          <div class="toast-body">
            {{ toast.message }}
          </div>
          <button
            type="button"
            class="btn-close me-2 m-auto"
            [class.btn-close-white]="toast.type !== 'warning'"
            (click)="toastService.remove(toast.id)"
            aria-label="Close"
          ></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast {
      min-width: 250px;
      margin-bottom: 0.5rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }
  `]
})


export class ToastContainerComponent {

  constructor(public toastService: ToastService) {}
}
