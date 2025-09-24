import { Routes } from '@angular/router';
import { InventoryComponent } from './components/browseFoodInventory/browse-inventory.component';
import { RegistrationPageComponent } from './components/registerAndPrivacySettings/registrationPage/registrationPage.component';
import { LoginPageComponent } from './components/registerAndPrivacySettings/loginPage/loginPage.component';

export const routes: Routes = [
  { path: 'inventory', component: InventoryComponent },
  { path: 'registration', component: RegistrationPageComponent },
  { path: '', redirectTo: 'registration', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
