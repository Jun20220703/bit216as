import { Routes } from '@angular/router';
import { InventoryComponent } from './components/browseFoodInventory/browse-inventory.component';
import { RegistrationPageComponent } from './components/registerAndPrivacySettings/registrationPage/registrationPage.component';
import { LoginPageComponent } from './components/registerAndPrivacySettings/loginPage/loginPage.component';
import { HomePageComponent } from './components/registerAndPrivacySettings/homePage/homePage.component';
import { AccountSettingsComponent } from './components/registerAndPrivacySettings/accountSettings/accountSettings.component';
import { PlanWeeklyMealComponent } from './components/planWeeklyMeal/planWeeklyMeal.component';
import { ManageFoodInventory } from './components/manageFoodInventory/manage-inventory.component';
import { AddFoodItemComponent } from './components/addFoodItem/add-food-item.component';
import { DonationListComponent } from './components/donationList/donation-list.component';
import { VerificationComponent } from './components/verification/verification.component';
export const routes: Routes = [
  { path: 'home', component: HomePageComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'registration', component: RegistrationPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'account-settings', component: AccountSettingsComponent },
  { path: 'planWeeklyMeal', component: PlanWeeklyMealComponent },
  { path: 'manage-inventory', component: ManageFoodInventory},
  { path: 'add-food', component: AddFoodItemComponent},
  { path: 'donation-list', component: DonationListComponent},
  { path: 'verification', component: VerificationComponent},
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];
