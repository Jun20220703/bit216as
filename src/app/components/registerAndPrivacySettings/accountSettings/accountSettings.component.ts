import { Component, ChangeDetectorRef, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from '../../sidebar/sidebar.component';

interface UserData {
  name: string;
  email: string;
  password: string;
  householdSize: string;
  dateOfBirth: string;
  profilePhoto?: string;
}

@Component({
  selector: 'app-account-settings',
  standalone: true,
  templateUrl: './accountSettings.component.html',
  styleUrls: ['./accountSettings.component.css'],
  imports: [CommonModule, FormsModule, HttpClientModule, SidebarComponent]
})
export class AccountSettingsComponent implements OnInit {
  activeTab: 'account' | 'privacy' = 'account';
  
  userData: UserData = {
    name: '',
    email: '',
    password: '************',
    householdSize: 'No-Selection',
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

  // Two-Factor Authentication state
  twoFactorEnabled: boolean = false;
  showTwoFactorDialog: boolean = false;
  isEnablingTwoFactor: boolean = false;

  // Email link access state
  showEmailLinkMessage: boolean = false;

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient, private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

  ngOnInit() {
    console.log('AccountSettingsComponent initialized');
    console.log('Initial showTwoFactorDialog:', this.showTwoFactorDialog);
    
    // Check URL parameters for tab selection and email link access
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'privacy') {
        this.activeTab = 'privacy';
      }
      // Check if accessed via email link (2FA setup)
      if (params['from'] === 'email' || params['2fa'] === 'setup') {
        this.activeTab = 'privacy';
        // Show a special message for email link access
        this.showEmailLinkMessage = true;
      }
    });

    // Use setTimeout to ensure component is fully initialized
    setTimeout(() => {
      this.loadUserData();
    }, 100);
  }

  loadUserData() {
    this.isLoadingUserData = true;
    
    // SSR 호환성을 위한 localStorage 체크
    if (typeof window === 'undefined' || !window.localStorage) {
      this.isLoadingUserData = false;
      return;
    }
    
    const userId = localStorage.getItem('userId');
    
    // If accessed via email link, show special message instead of redirecting
    if (!userId && this.showEmailLinkMessage) {
      this.isLoadingUserData = false;
      this.cdr.detectChanges();
      return;
    }
    
    if (!userId) {
      alert('User not authenticated. Please log in again.');
      this.router.navigate(['/login']);
      this.isLoadingUserData = false;
      return;
    }

    // Always load fresh data from database to get latest profile photo
    console.log('Loading fresh user data from database...');
    this.http.get(`http://localhost:5001/api/users/profile/${userId}`)
      .subscribe({
        next: (response: any) => {
          console.log('Raw response from API:', response);
          
          this.userData = {
            name: response.name || '',
            email: response.email || '',
            password: '************',
            householdSize: response.householdSize || 'No-Selection',
            dateOfBirth: response.dateOfBirth ? new Date(response.dateOfBirth).toISOString().split('T')[0] : '',
            profilePhoto: response.profilePhoto || ''
          };
          
          // Load actual password from localStorage
          if (typeof window !== 'undefined' && window.localStorage) {
            this.actualPassword = localStorage.getItem('userPassword') || '';
          }
          
          this.isLoadingUserData = false;
          console.log('Loaded fresh user data from database:', this.userData);
          console.log('Profile photo from database:', response.profilePhoto);
          
          // Update localStorage with fresh data
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('user', JSON.stringify(response));
          }
          
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
      this.userData[fieldName] = 'No-Selection';
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
    if (this.userData.householdSize && this.userData.householdSize !== 'No-Selection') {
      const validValues = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];
      if (!validValues.includes(this.userData.householdSize)) {
        alert('Please select a valid household size');
        return;
      }
    }

    // Confirm before saving
    const confirmed = confirm('Are you sure to save?');
    if (!confirmed) {
      this.isSaving = false;
      this.cdr.detectChanges();
      return;
    }

    this.isSaving = true;
    this.saveError = '';
    
    // Force UI update to show saving state immediately
    this.cdr.detectChanges();

    // Get user ID from localStorage (assuming it's stored there after login)
    if (typeof window === 'undefined' || !window.localStorage) {
      alert('User not authenticated. Please log in again.');
      this.router.navigate(['/login']);
      return;
    }
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('User not authenticated. Please log in again.');
      this.isSaving = false;
      this.cdr.detectChanges();
      this.router.navigate(['/login']);
      return;
    }

    // Prepare data for API call
    const updateData = {
      name: this.userData.name,
      householdSize: (this.userData.householdSize === 'No-Selection' || this.userData.householdSize === null || this.userData.householdSize === undefined) ? null : this.userData.householdSize,
      dateOfBirth: this.userData.dateOfBirth,
      profilePhoto: this.profilePhotoPreview || this.userData.profilePhoto
    };

    console.log('Sending update data:', updateData);
    console.log('User ID:', userId);

    // Call the API
    this.http.put(`http://localhost:5001/api/users/profile/${userId}`, updateData)
      .subscribe({
        next: (response: any) => {
          console.log('Profile updated successfully:', response);
          this.isSaving = false;
          alert('Updates have been saved successfully');
          
          // Update local storage with new user data
          if (typeof window !== 'undefined' && window.localStorage && response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
          }
          
          // Force UI update to ensure buttons are re-enabled
          this.cdr.detectChanges();
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
          
          // Force UI update to ensure buttons are re-enabled even on error
          this.cdr.detectChanges();
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
        if (typeof window === 'undefined' || !window.localStorage) {
          alert('User not authenticated. Please log in again.');
          this.router.navigate(['/login']);
          return;
        }
        const userId = localStorage.getItem('userId');
        if (!userId) {
          alert('User not authenticated. Please log in again.');
          this.router.navigate(['/login']);
          return;
        }

        // Call password update API
        this.http.put(`http://localhost:5001/api/users/profile/${userId}`, {
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
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('userId');
              localStorage.removeItem('userPassword');
            }
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

  // Two-Factor Authentication methods
  onTwoFactorToggle(newValue: boolean) {
    console.log('=== Two-Factor Toggle Event ===');
    console.log('New value:', newValue);
    console.log('Previous twoFactorEnabled:', this.twoFactorEnabled);
    console.log('Current showTwoFactorDialog:', this.showTwoFactorDialog);
    
    if (newValue === true) {
      // 토글을 켜려고 할 때
      console.log('🔄 Enabling 2FA - showing dialog');
      this.showTwoFactorDialog = true;
      this.twoFactorEnabled = true; // ngModelChange에서는 수동으로 설정해야 함
      
      // UI 강제 업데이트
      this.cdr.detectChanges();
      
      // 추가 확인을 위한 setTimeout
      setTimeout(() => {
        console.log('✅ After timeout - Dialog visible:', this.showTwoFactorDialog);
        console.log('✅ After timeout - Toggle enabled:', this.twoFactorEnabled);
      }, 100);
      
      console.log('✅ Dialog should be visible now:', this.showTwoFactorDialog);
    } else {
      // 토글을 끄려고 할 때는 바로 끄기
      console.log('🔄 Disabling 2FA');
      this.twoFactorEnabled = false;
      this.showTwoFactorDialog = false;
      this.cdr.detectChanges();
      console.log('✅ 2FA disabled, dialog closed');
    }
  }

  onTwoFactorCancel() {
    // 취소 시 토글을 다시 끄기
    console.log('2FA cancelled, turning off toggle');
    this.twoFactorEnabled = false;
    this.showTwoFactorDialog = false;
    this.cdr.detectChanges();
    console.log('Toggle reset to OFF, dialog closed');
  }

  onTwoFactorConfirm() {
    // 확인 시 이메일 발송
    console.log('2FA confirmed, sending email to:', this.userData.email);
    this.showTwoFactorDialog = false;
    this.isEnablingTwoFactor = true;
    this.cdr.detectChanges();
    
    // 백엔드 API 호출
    this.http.post('http://localhost:5001/api/users/enable-2fa', {
      email: this.userData.email
    }).subscribe({
      next: (response: any) => {
        console.log('2FA email sent successfully:', response);
        this.twoFactorEnabled = true;
        this.isEnablingTwoFactor = false;
        this.cdr.detectChanges();
        alert('A welcome message with confirmation link and 6-digit verification code has been sent to your email!');
      },
      error: (error) => {
        console.error('Failed to send 2FA email:', error);
        this.twoFactorEnabled = false;
        this.isEnablingTwoFactor = false;
        this.cdr.detectChanges();
        alert('Failed to send 2FA email. Please try again.');
      }
    });
  }

  // Email link access methods
  goToLogin() {
    this.router.navigate(['/login']);
  }

  dismissEmailMessage() {
    this.showEmailLinkMessage = false;
    this.cdr.detectChanges();
  }
}
