import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface UserData {
  name: string;
  email: string;
  password: string;
  householdSize: number | string;
  dateOfBirth: string;
}

@Component({
  selector: 'app-account-settings',
  standalone: true,
  templateUrl: './accountSettings.component.html',
  styleUrls: ['./accountSettings.component.css'],
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class AccountSettingsComponent {
  activeTab: 'account' | 'privacy' = 'account';
  
  userData: UserData = {
    name: '',
    email: '',
    password: '************',
    householdSize: 1,
    dateOfBirth: ''
  };

  // Password reset dialog states
  showPasswordResetDialog: boolean = false;
  showPasswordChangeForm: boolean = false;
  newPassword: string = '';
  confirmPassword: string = '';

  // Loading and error states
  isSaving: boolean = false;
  saveError: string = '';
  isLoadingUserData: boolean = true;

  constructor(private router: Router, private http: HttpClient) {
    this.loadUserData();
  }

  loadUserData() {
    // First try to get user data from localStorage (from login)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.userData = {
          name: user.name || '',
          email: user.email || '',
          password: '************',
          householdSize: user.householdSize || 1,
          dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ''
        };
        this.isLoadingUserData = false;
        console.log('Loaded user data from localStorage:', this.userData);
        return;
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    }

    // If no stored user data, try to get from API
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('User not authenticated. Please log in again.');
      this.router.navigate(['/login']);
      return;
    }

    // Load user data from API
    this.http.get(`http://localhost:5000/api/users/profile/${userId}`)
      .subscribe({
        next: (response: any) => {
          this.userData = {
            name: response.name || '',
            email: response.email || '',
            password: '************',
            householdSize: response.householdSize || 1,
            dateOfBirth: response.dateOfBirth ? new Date(response.dateOfBirth).toISOString().split('T')[0] : ''
          };
          this.isLoadingUserData = false;
          console.log('Loaded user data from API:', this.userData);
          
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(response));
        },
        error: (error) => {
          console.error('Failed to load user data:', error);
          alert('Failed to load user data. Please try again.');
          this.router.navigate(['/login']);
        }
      });
  }

  setActiveTab(tab: 'account' | 'privacy') {
    this.activeTab = tab;
  }


  onUploadPhoto() {
    // Handle photo upload logic here
    console.log('Upload photo clicked');
  }

  clearField(fieldName: keyof UserData) {
    if (fieldName === 'householdSize') {
      this.userData[fieldName] = 1;
    } else if (fieldName === 'password') {
      // Password field should not be cleared, just reset to masked value
      this.userData[fieldName] = '************';
    } else {
      this.userData[fieldName] = '';
    }
  }

  onCancel() {
    // Reset form data or navigate away
    this.router.navigate(['/home']);
  }

  onSave() {
    // Validate required fields
    if (!this.userData.name || !this.userData.dateOfBirth) {
      alert('Please fill in all required fields (Name and Date of Birth)');
      return;
    }

    // Validate household size if provided
    const householdSizeNum = Number(this.userData.householdSize);
    if (this.userData.householdSize && this.userData.householdSize !== 'No-Selection' && 
        (isNaN(householdSizeNum) || householdSizeNum < 1 || householdSizeNum > 20)) {
      alert('Household size must be between 1 and 20');
      return;
    }

    this.isSaving = true;
    this.saveError = '';

    // Get user ID from localStorage (assuming it's stored there after login)
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('User not authenticated. Please log in again.');
      this.router.navigate(['/login']);
      return;
    }

    // Prepare data for API call
    const updateData = {
      name: this.userData.name,
      householdSize: (this.userData.householdSize === 'No-Selection' || this.userData.householdSize === null || this.userData.householdSize === undefined) ? null : Number(this.userData.householdSize),
      dateOfBirth: this.userData.dateOfBirth
    };

    // Call the API
    this.http.put(`http://localhost:5000/api/users/profile/${userId}`, updateData)
      .subscribe({
        next: (response: any) => {
          console.log('Profile updated successfully:', response);
          this.isSaving = false;
          alert('Profile updated successfully!');
          
          // Update local storage with new user data
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
          }
        },
        error: (error) => {
          console.error('Profile update failed:', error);
          this.isSaving = false;
          this.saveError = error.error?.message || 'Failed to update profile';
          alert(`Failed to update profile: ${this.saveError}`);
        }
      });
  }

  // Password reset methods
  onPasswordClick() {
    this.showPasswordResetDialog = true;
  }

  onPasswordReset() {
    this.showPasswordResetDialog = true;
  }

  onPasswordResetCancel() {
    this.showPasswordResetDialog = false;
  }

  onPasswordResetConfirm() {
    this.showPasswordResetDialog = false;
    this.showPasswordChangeForm = true;
  }

  clearNewPassword() {
    this.newPassword = '';
  }

  clearConfirmPassword() {
    this.confirmPassword = '';
  }

  onPasswordChange() {
    if (this.newPassword && this.confirmPassword) {
      if (this.newPassword === this.confirmPassword) {
        // Validate password strength
        if (this.newPassword.length < 8) {
          alert('Password must be at least 8 characters long');
          return;
        }

        const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
        if (!specialCharRegex.test(this.newPassword)) {
          alert('Password must contain at least one special character');
          return;
        }

        // Get user ID
        const userId = localStorage.getItem('userId');
        if (!userId) {
          alert('User not authenticated. Please log in again.');
          this.router.navigate(['/login']);
          return;
        }

        // Call password update API
        this.http.put(`http://localhost:5000/api/users/profile/${userId}`, {
          password: this.newPassword
        }).subscribe({
          next: (response: any) => {
            console.log('Password changed successfully');
            this.userData.password = '************';
            this.showPasswordChangeForm = false;
            this.newPassword = '';
            this.confirmPassword = '';
            alert('Password changed successfully!');
          },
          error: (error) => {
            console.error('Password change failed:', error);
            alert(`Failed to change password: ${error.error?.message || 'Unknown error'}`);
          }
        });
      } else {
        alert('Passwords do not match!');
      }
    } else {
      alert('Please fill in both password fields!');
    }
  }

  onPasswordChangeCancel() {
    this.showPasswordChangeForm = false;
    this.newPassword = '';
    this.confirmPassword = '';
  }
}
