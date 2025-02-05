import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home/categoryPage/:page', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: '**', component: NotFoundComponent }
];
