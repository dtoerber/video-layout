import { Routes } from '@angular/router';
import { LayoutOne } from './components/layout-one/layout-one';
import { Table } from './components/table/table';

export const routes: Routes = [
  { path: '', component: LayoutOne },
  { path: 'table', component: Table },
];
