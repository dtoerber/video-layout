import { Routes } from '@angular/router';
import { LayoutOne } from './components/layout-one/layout-one';
import { LayoutTwo } from './components/layout-two/layout-two';
import { LayoutThree } from './components/layout-three/layout-three';

export const routes: Routes = [
  { path: 'layout1', component: LayoutOne },
  { path: 'layout2', component: LayoutTwo },
  { path: 'layout3', component: LayoutThree },
  { path: '', redirectTo: 'layout1', pathMatch: 'full' },
];
