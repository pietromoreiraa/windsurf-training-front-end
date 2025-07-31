import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { RegisterComponent } from './register/register.component';
import { BateladaComponent } from './batelada/batelada.component';
import { BateladaListComponent } from './batelada-list/batelada-list.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent, canActivate: [authGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'batelada', component: BateladaComponent, canActivate: [authGuard] },
  { path: 'batelada-list', component: BateladaListComponent, canActivate: [authGuard] },
  { path: '', component: LoginComponent },
  { path: '**', redirectTo: '' }
];
