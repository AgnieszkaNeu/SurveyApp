import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss']
})


export class ConfirmEmailComponent implements OnInit {
  loading = true;
  success = false;
  errorMessage = '';
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];

    if (token) {
      this.authService.confirmEmail(token).subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (error) => {
          this.loading = false;
          this.success = false;
          this.errorMessage = error.error?.message || 'Token wygasł lub jest nieprawidłowy';
        }
      });
    } else {
      this.loading = false;
      this.errorMessage = 'Brak tokena potwierdzającego';
    }
  }
}
