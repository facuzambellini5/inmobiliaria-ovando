import { Service, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.model';

const TOKEN_KEY = 'ovando_admin_token';
const USERNAME_KEY = 'ovando_admin_username';

@Service()
export class Auth {
  private readonly http = inject(HttpClient);

  private readonly _username = signal<string | null>(localStorage.getItem(USERNAME_KEY));
  readonly username = this._username.asReadonly();
  readonly isAuthenticated = computed(() => this._username() !== null);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(tap((response) => this.persistSession(response)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    this._username.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private persistSession(response: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USERNAME_KEY, response.username);
    this._username.set(response.username);
  }
}
