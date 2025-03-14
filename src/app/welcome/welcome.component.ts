import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ]
})
export class WelcomeComponent {
  userName: string;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    const user = this.authService.getUser();
    this.userName = user?.name || 'User';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
