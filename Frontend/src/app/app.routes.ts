import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SendComponent } from './pages/send/send.component';
import { ReceiveComponent } from './pages/receive/receive.component';
import { HistoryComponent } from './pages/history/history.component';
import { AuthComponent } from './pages/auth/auth.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'connexion', component: AuthComponent },
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: 'envoyer', component: SendComponent, canActivate: [authGuard] },
  { path: 'recevoir', component: ReceiveComponent, canActivate: [authGuard] },
  { path: 'historique', component: HistoryComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
