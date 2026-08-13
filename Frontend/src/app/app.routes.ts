import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SendComponent } from './pages/send/send.component';
import { ReceiveComponent } from './pages/receive/receive.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'envoyer', component: SendComponent },
  { path: 'recevoir', component: ReceiveComponent },
  { path: '**', redirectTo: '' }
];
