import { Routes } from '@angular/router';
import { FoodInventoryComponent } from './components/manageFoodInventory/manage-inventory.component';

export const routes: Routes = [
    { path: '', redirectTo: 'inventory', pathMatch: 'full' }, 
    { path:'inventory', component: FoodInventoryComponent}

];
