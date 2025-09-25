import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface UserData {
  name: string;
  email: string;
  password: string;
  householdSize: number;
  dateOfBirth: string;
}

@Component({
  selector: 'app-account-settings',
  standalone: true,
  templateUrl: './accountSettings.component.html',
  styleUrls: ['./accountSettings.component.css'],
  imports: [CommonModule, FormsModule]
})
export class AccountSettingsComponent {
  activeTab: 'account' | 'privacy' = 'account';
  
  userData: UserData = {
    name: 'junkaiyane',
    email: 'B2301130@helplive.edu.my',
    password: '************',
    householdSize: 5,
    dateOfBirth: '2003-04-05'
  };

  constructor(private router: Router) {}

  setActiveTab(tab: 'account' | 'privacy') {
    this.activeTab = tab;
  }

  onBack() {
    this.router.navigate(['/home']);
  }

  onUploadPhoto() {
    // Handle photo upload logic here
    console.log('Upload photo clicked');
  }

  clearField(fieldName: keyof UserData) {
    if (fieldName === 'householdSize') {
      this.userData[fieldName] = 1;
    } else {
      this.userData[fieldName] = '';
    }
  }

  onCancel() {
    // Reset form data or navigate away
    this.router.navigate(['/home']);
  }

  onSave() {
    // Handle save logic here
    console.log('Saving user data:', this.userData);
    // You can add validation and API calls here
  }
}
