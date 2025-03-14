import axios, { AxiosInstance } from 'axios';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private api: AxiosInstance;
  private readonly TOKEN_KEY = 'auth_token';

  constructor(
    private router: Router,
    private storage: StorageService
  ) {
    this.api = axios.create({
      baseURL: 'http://localhost:3000',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = this.storage.getItem(this.TOKEN_KEY);
        if (token && !config.url?.includes('/login')) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.storage.removeItem(this.TOKEN_KEY);
          this.router.navigate(['/']);
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  async get<T>(url: string) {
    const response = await this.api.get<T>(url);
    return response.data;
  }

  async post<T>(url: string, data: any) {
    const response = await this.api.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data: any) {
    const response = await this.api.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string) {
    const response = await this.api.delete<T>(url);
    return response.data;
  }
}
