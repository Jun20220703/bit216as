import { Routes } from '@angular/router';
import { InventoryComponent } from './components/browseFoodInventory/browse-inventory.component';
import { RegistrationPageComponent } from './components/registerAndPrivacySettings/registrationPage/registrationPage.component';


export const routes: Routes = [
  { path: 'inventory', component: InventoryComponent },
  { path: 'registrationPage', component: RegistrationPageComponent },
  { path: '', redirectTo: 'inventory', pathMatch: 'full' }
];