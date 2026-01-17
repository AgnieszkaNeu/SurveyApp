import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();


  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned).pipe(
      catchError((error) => {
        if (error.status === 401 &&
            (error.error?.detail === 'Nieprawidłowy token' || error.error?.detail === 'Token wygasł')) {
          authService.logout();
          router.navigate(['/login'], {
            queryParams: {
              message: 'Twoja sesja wygasła. Zaloguj się ponownie.'
            }
          });
        }
        return throwError(() => error);
      })
    );
  }
  return next(req);
};
