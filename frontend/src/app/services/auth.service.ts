import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Token, LoginCredentials, EmailRequest, PasswordResetRequest } from '../models/auth.model';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})


export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<Token> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    return this.http.post<Token>(`${this.API_URL}/v1/auth/token`, formData).pipe(
      tap(token => {
        this.setToken(token.access_token);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.tokenSubject.next(null);
  }

  confirmEmail(token: string): Observable<any> {
    return this.http.post(`${this.API_URL}/v1/auth/email/confirmation`, { token });
  }

  sendConfirmationEmail(email: string): Observable<any> {
    return this.http.post(`${this.API_URL}/v1/auth/email/send-confirmation-mail`, null, {
      params: { email }
    });
  }

  resetPassword(data: PasswordResetRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/v1/auth/password/reset`, data);
  }

  sendPasswordResetEmail(email: string): Observable<any> {
    return this.http.post(`${this.API_URL}/v1/auth/password/send-reset-mail`, null, {
      params: { email }
    });
  }

  private setToken(token: string): void {
    localStorage.setItem('access_token', token);
    this.tokenSubject.next(token);
  }

  getToken(): string | null {
    const token = localStorage.getItem('access_token');
    if (token && this.isTokenExpired(token)) {
      this.logout();
      return null;
    }
    return token;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      return Date.now() >= expirationTime;
    } catch (error) {
      return true;
    }
  }
}
