import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  constructor(
    private api: ApiService,
    private router: Router,
    private storage: StorageService
  ) {}

  async login(email: string, password: string): Promise<void> {
    try {
      const response = await this.api.post<LoginResponse>('/auth/login', { email, password });
      this.setSession(response);
      this.router.navigate(['/welcome']);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  private setSession(response: LoginResponse): void {
    this.storage.setItem(this.TOKEN_KEY, response.access_token);
    this.storage.setItem(this.USER_KEY, JSON.stringify(response.user));
  }

  logout(): void {
    this.storage.removeItem(this.TOKEN_KEY);
    this.storage.removeItem(this.USER_KEY);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return this.storage.getItem(this.TOKEN_KEY);
  }

  getUser(): LoginResponse['user'] | null {
    const user = this.storage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Basic JWT expiration check
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(payload.exp * 1000);
      return new Date() < expirationDate;
    } catch {
      return false;
    }
  }
}
