import { Routes } from '@angular/router';
import { InventoryComponent } from './components/browseFoodInventory/browse-inventory.component';
import { RegistrationPageComponent } from './components/registerAndPrivacySettings/registrationPage/registrationPage.component';
import { LoginPageComponent } from './components/registerAndPrivacySettings/loginPage/loginPage.component';
import { HomePageComponent } from './components/registerAndPrivacySettings/homePage/homePage.component';
import { AccountSettingsComponent } from './components/registerAndPrivacySettings/accountSettings/accountSettings.component';

export const routes: Routes = [
  { path: 'home', component: HomePageComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'registration', component: RegistrationPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'account-settings', component: AccountSettingsComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];
