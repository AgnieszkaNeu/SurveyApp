import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserCreate, UserUpdate } from '../models/user.model';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})


export class UserService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/v1/user/`);
  }

  createUser(user: UserCreate): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/v1/user/`, user);
  }

  updateUser(user: UserUpdate): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/v1/user/update_user`, user);
  }

  deleteUser(): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/v1/user/`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/v1/user/all_users`);
  }

  getMyData(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/v1/gdpr/my-data`);
  }

  exportMyData(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/v1/gdpr/export-data`);
  }

  deleteMyData(): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/v1/gdpr/my-data`);
  }
}
