import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { ManageFoodInventory } from './components/manageFoodInventory/manage-inventory.component';
//import { WaitlistComponent } from './components/waitlist/waitlist.component';

//import { AttendeeProfileComponent } from './components/profile/attendee-profile/attendee-profile.component';

const routes: Routes = [
  { path: 'manage-inventory', component: ManageFoodInventory}
  //{ path: 'waitlist', component: WaitlistComponent},
 

];

@NgModule({
  imports: [ BrowserModule, RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
