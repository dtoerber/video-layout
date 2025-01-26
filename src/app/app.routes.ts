import { Routes } from '@angular/router';
import { VideoPiPComponent } from './components/video-pip.component';

export const routes: Routes = [
  {
    path: 'pip',
    component: VideoPiPComponent
  },
  {
    path: '',
    redirectTo: 'pip',
    pathMatch: 'full',
  }
];
