import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private readonly tokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  // Login: expects { token } from backend
  login(username: string, password: string) {
    return this.http.post<{ token: string }>(`${environment.apiUrl}/login`, {
      username,
      password,
    });
  }

  // Signup
  signup(user: any) {
    return this.http.post(`${environment.apiUrl}/signup`, { user });
  }

  // === Token Handling ===
  setToken(token: string) {
    localStorage.setItem('token', token);
    this.tokenSubject.next(token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  // === Username Handling ===
  setUser(username: string) {
    localStorage.setItem('username', username);
  }

  clearUser() {
    localStorage.removeItem('username');
  }

  currentUser() {
    const username = localStorage.getItem('username');
    return username ? { username } : null;
  }

  // === Auth Checks ===
  isLoggedIn() {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('token');
    this.clearUser();
    this.tokenSubject.next(null);
    this.router.navigate(['/login']);
  }
}
