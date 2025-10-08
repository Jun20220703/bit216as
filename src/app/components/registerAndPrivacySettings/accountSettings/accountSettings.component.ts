import { Component, ChangeDetectorRef, OnInit, NgZone } from '@angular/core';
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
  profilePhoto?: string;
}

@Component({
  selector: 'app-account-settings',
  standalone: true,
  templateUrl: './accountSettings.component.html',
  styleUrls: ['./accountSettings.component.css'],
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class AccountSettingsComponent implements OnInit {
  activeTab: 'account' | 'privacy' = 'account';
  
  userData: UserData = {
    name: '',
    email: '',
    password: '************',
    householdSize: 1,
    dateOfBirth: '',
    profilePhoto: ''
  };

  // Store actual password for display
  actualPassword: string = '';

  // Profile photo properties
  selectedFile: File | null = null;
  profilePhotoPreview: string = '';


  // Password reset dialog states
  showPasswordResetDialog: boolean = false;
  showPasswordChangeForm: boolean = false;
  newPassword: string = '';
  confirmPassword: string = '';

  // Loading and error states
  isSaving: boolean = false;
  saveError: string = '';
  isLoadingUserData: boolean = true;
  
  // Password visibility state
  showPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(private router: Router, private http: HttpClient, private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

  ngOnInit() {
    // Use setTimeout to ensure component is fully initialized
    setTimeout(() => {
      this.loadUserData();
    }, 100);
  }

  loadUserData() {
    this.isLoadingUserData = true;
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('User not authenticated. Please log in again.');
      this.router.navigate(['/login']);
      this.isLoadingUserData = false;
      return;
    }

    // Always load fresh data from database to get latest profile photo
    console.log('Loading fresh user data from database...');
    this.http.get(`http://localhost:5000/api/users/profile/${userId}`)
      .subscribe({
        next: (response: any) => {
          console.log('Raw response from API:', response);
          
          this.userData = {
            name: response.name || '',
            email: response.email || '',
            password: '************',
            householdSize: response.householdSize || 1,
            dateOfBirth: response.dateOfBirth ? new Date(response.dateOfBirth).toISOString().split('T')[0] : '',
            profilePhoto: response.profilePhoto || ''
          };
          
          // Load actual password from localStorage
          this.actualPassword = localStorage.getItem('userPassword') || '';
          
          this.isLoadingUserData = false;
          console.log('Loaded fresh user data from database:', this.userData);
          console.log('Profile photo from database:', response.profilePhoto);
          
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(response));
          
          // Force UI update
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Failed to load user data from database:', error);
          alert('Failed to load user data from database. Please check your connection and try again.');
          this.isLoadingUserData = false;
        }
      });
  }

  setActiveTab(tab: 'account' | 'privacy') {
    this.activeTab = tab;
    // Force UI update when switching tabs
    this.cdr.detectChanges();
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
      const missingFields = [];
      if (!this.userData.name) missingFields.push('Name');
      if (!this.userData.dateOfBirth) missingFields.push('Date of Birth');
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate household size if provided
    const householdSizeNum = Number(this.userData.householdSize);
    if (this.userData.householdSize && this.userData.householdSize !== 'No-Selection' && 
        (isNaN(householdSizeNum) || householdSizeNum < 1 || householdSizeNum > 20)) {
      alert('Household size must be between 1 and 20');
      return;
    }

    // Confirm before saving
    const confirmed = confirm('Are you sure to save?');
    if (!confirmed) {
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
      dateOfBirth: this.userData.dateOfBirth,
      profilePhoto: this.profilePhotoPreview || this.userData.profilePhoto
    };

    console.log('Sending update data:', updateData);
    console.log('User ID:', userId);

    // Call the API
    this.http.put(`http://localhost:5000/api/users/profile/${userId}`, updateData)
      .subscribe({
        next: (response: any) => {
          console.log('Profile updated successfully:', response);
          this.isSaving = false;
          alert('Updates have been saved successfully');
          
          // Update local storage with new user data
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
          }
        },
        error: (error) => {
          console.error('Profile update failed:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error
          });
          this.isSaving = false;
          
          let errorMessage = 'Failed to update profile';
          
          if (error.status === 0) {
            errorMessage = 'Cannot connect to server. Please check if the backend server is running.';
          } else if (error.status === 404) {
            errorMessage = 'User not found. Please log in again.';
          } else if (error.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          this.saveError = errorMessage;
          alert(`Failed to update profile: ${errorMessage}`);
        }
      });
  }

  // Password reset methods
  onPasswordClick() {
    this.showPasswordResetDialog = true;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
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
        // Check if new password is different from current password
        if (this.newPassword === this.actualPassword) {
          alert('New password must be different from your current password');
          return;
        }

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
            this.actualPassword = this.newPassword;
            // For security, clear auth state and force re-login with the new password
            this.showPasswordChangeForm = false;
            this.newPassword = '';
            this.confirmPassword = '';
            this.showNewPassword = false;
            this.showConfirmPassword = false;
            alert('Password changed successfully! Please log in again with your new password.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userId');
            localStorage.removeItem('userPassword');
            this.router.navigate(['/login']);
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
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  // Profile photo upload methods
  onUploadPhoto() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.handleFileSelect(file);
      }
    };
    fileInput.click();
  }

  handleFileSelect(file: File) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    this.selectedFile = file;
    console.log('File selected:', file.name, 'Size:', file.size);

    // Show immediate preview first
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.profilePhotoPreview = e.target.result;
      console.log('Immediate preview set:', this.profilePhotoPreview);
      this.ngZone.run(() => {
        this.cdr.detectChanges();
      });
    };
    reader.readAsDataURL(file);

    // Then compress for better quality
    this.compressImage(file);
  }

  compressImage(file: File) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set maximum dimensions
      const maxWidth = 800;
      const maxHeight = 800;
      
      let { width, height } = img;
      
      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convert to base64 with compression (quality: 0.8)
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      this.profilePhotoPreview = compressedDataUrl;
      
      console.log(`Image compressed from ${file.size} bytes to ${compressedDataUrl.length} characters`);
      console.log('Profile photo preview set:', this.profilePhotoPreview);
      
      // Force UI update to show the preview immediately
      this.ngZone.run(() => {
        this.cdr.detectChanges();
      });
    };

    const reader = new FileReader();
    reader.onload = (e: any) => {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeProfilePhoto() {
    this.selectedFile = null;
    this.profilePhotoPreview = '';
    this.userData.profilePhoto = '';
  }

  // Debug methods for image loading
  onImageError(event: any) {
    console.error('Image failed to load:', event);
    console.log('Current image src:', event.target.src);
    console.log('Profile photo data:', this.userData.profilePhoto);
    console.log('Profile photo preview:', this.profilePhotoPreview);
  }

  onImageLoad(event: any) {
    console.log('Image loaded successfully:', event.target.src);
  }
}
