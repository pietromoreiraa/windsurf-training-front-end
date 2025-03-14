import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent, canActivate: [authGuard] },
  { path: '', component: LoginComponent },
  { path: '**', redirectTo: '' }
];
