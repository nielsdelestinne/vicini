import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LobbyComponent } from './pages/lobby/lobby.component';
import { RoomComponent } from './pages/room/room.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'lobby', component: LobbyComponent, canActivate: [AuthGuard] },
  { path: 'room/:id', component: RoomComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];
