import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login-page',
  standalone: true,
  templateUrl: './loginPage.component.html',
  styleUrls: ['./loginPage.component.css'],
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class LoginPageComponent {
  email: string = '';
  password: string = '';
  name: string = '';
  isRegisterMode: boolean = false;
  isLoading: boolean = false;
  
  // Password recovery properties
  showPasswordRecovery: boolean = false;
  recoveryEmail: string = '';
  isRecoveryLoading: boolean = false;
  recoveryMessage: string = '';
  recoverySuccess: boolean = false;
  recoveryStep: string = 'email'; // 'email', 'verify', 'reset'
  verificationCode: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(private router: Router, private http: HttpClient) {}

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
  }

  onLogin() {
    if (!this.email || !this.password) {
      alert('Please fill in all fields.');
      return;
    }

    this.isLoading = true;

    // Call login API
    this.http.post('http://localhost:5001/api/users/login', {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response: any) => {
        console.log('Login successful:', response);
        
        // Store user data in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.user.id);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('userPassword', this.password); // Store the actual password
        
        this.isLoading = false;
        alert('Login successful!');
        
        // Navigate to home page
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.isLoading = false;
        
        if (error.error && error.error.message) {
          alert(`Login failed: ${error.error.message}`);
        } else if (error.status === 0) {
          alert('Login failed: Cannot connect to server. Please check if the backend server is running.');
        } else {
          alert('Login failed: Invalid credentials. Please try again.');
        }
      }
    });
  }

  onRegister() {
    // Registration 페이지로 이동
    this.router.navigate(['/registration']);
  }

  onForgotPassword(event: Event) {
    event.preventDefault(); // Prevent default link behavior
    this.showPasswordRecovery = true;
    this.recoveryEmail = '';
    this.recoveryMessage = '';
    this.recoverySuccess = false;
    this.recoveryStep = 'email';
    this.verificationCode = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  onPasswordRecovery() {
    if (!this.recoveryEmail) {
      this.recoveryMessage = 'Please enter your email address.';
      this.recoverySuccess = false;
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.recoveryEmail)) {
      this.recoveryMessage = 'Please enter a valid email address.';
      this.recoverySuccess = false;
      return;
    }

    this.isRecoveryLoading = true;
    this.recoveryMessage = '';

    // Call password recovery API
    this.http.post('http://localhost:5001/api/users/forgot-password', {
      email: this.recoveryEmail
    }).subscribe({
      next: (response: any) => {
        console.log('Password recovery email sent:', response);
        this.isRecoveryLoading = false;
        this.recoveryMessage = 'Email has been sent successfully! A 6-digit verification code has been sent to your email address. Please check your inbox.';
        this.recoverySuccess = true;
        this.recoveryStep = 'verify';
      },
      error: (error) => {
        console.error('Password recovery failed:', error);
        this.isRecoveryLoading = false;
        
        if (error.error && error.error.message) {
          this.recoveryMessage = error.error.message;
        } else if (error.status === 0) {
          this.recoveryMessage = 'Cannot connect to server. Please check if the backend server is running.';
        } else if (error.status === 404) {
          this.recoveryMessage = 'No account found with this email address.';
        } else {
          this.recoveryMessage = 'Failed to send recovery email. Please try again later.';
        }
        this.recoverySuccess = false;
      }
    });
  }

  onVerifyCode() {
    if (!this.verificationCode) {
      this.recoveryMessage = 'Please enter the verification code.';
      this.recoverySuccess = false;
      return;
    }

    if (this.verificationCode.length !== 6) {
      this.recoveryMessage = 'Please enter a valid 6-digit verification code.';
      this.recoverySuccess = false;
      return;
    }

    this.isRecoveryLoading = true;
    this.recoveryMessage = '';

    // Call verify code API
    this.http.post('http://localhost:5001/api/users/verify-code', {
      email: this.recoveryEmail,
      verificationCode: this.verificationCode
    }).subscribe({
      next: (response: any) => {
        console.log('Verification code verified:', response);
        this.isRecoveryLoading = false;
        this.recoveryMessage = 'Verification code is valid. Please enter your new password.';
        this.recoverySuccess = true;
        this.recoveryStep = 'reset';
      },
      error: (error) => {
        console.error('Code verification failed:', error);
        this.isRecoveryLoading = false;
        
        if (error.error && error.error.message) {
          this.recoveryMessage = error.error.message;
        } else if (error.status === 0) {
          this.recoveryMessage = 'Cannot connect to server. Please check if the backend server is running.';
        } else {
          this.recoveryMessage = 'Invalid or expired verification code. Please try again.';
        }
        this.recoverySuccess = false;
      }
    });
  }

  onResendCode() {
    this.isRecoveryLoading = true;
    this.recoveryMessage = '';

    // Call password recovery API again
    this.http.post('http://localhost:5001/api/users/forgot-password', {
      email: this.recoveryEmail
    }).subscribe({
      next: (response: any) => {
        console.log('Verification code resent:', response);
        this.isRecoveryLoading = false;
        this.recoveryMessage = 'A new verification code has been sent to your email address.';
        this.recoverySuccess = true;
      },
      error: (error) => {
        console.error('Resend code failed:', error);
        this.isRecoveryLoading = false;
        
        if (error.error && error.error.message) {
          this.recoveryMessage = error.error.message;
        } else if (error.status === 0) {
          this.recoveryMessage = 'Cannot connect to server. Please check if the backend server is running.';
        } else {
          this.recoveryMessage = 'Failed to resend verification code. Please try again later.';
        }
        this.recoverySuccess = false;
      }
    });
  }

  onResetPassword() {
    if (!this.newPassword || !this.confirmPassword) {
      this.recoveryMessage = 'Please enter and confirm your new password.';
      this.recoverySuccess = false;
      return;
    }

    if (this.newPassword.length < 6) {
      this.recoveryMessage = 'Password must be at least 6 characters long.';
      this.recoverySuccess = false;
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.recoveryMessage = 'Passwords do not match. Please try again.';
      this.recoverySuccess = false;
      return;
    }

    this.isRecoveryLoading = true;
    this.recoveryMessage = '';

    // Call reset password API
    this.http.post('http://localhost:5001/api/users/reset-password', {
      email: this.recoveryEmail,
      verificationCode: this.verificationCode,
      newPassword: this.newPassword
    }).subscribe({
      next: (response: any) => {
        console.log('Password reset successful:', response);
        this.isRecoveryLoading = false;
        this.recoveryMessage = 'Password has been reset successfully. You can now log in with your new password.';
        this.recoverySuccess = true;
        
        // Close modal after 3 seconds
        setTimeout(() => {
          this.onCancelRecovery();
        }, 3000);
      },
      error: (error) => {
        console.error('Password reset failed:', error);
        this.isRecoveryLoading = false;
        
        if (error.error && error.error.message) {
          this.recoveryMessage = error.error.message;
        } else if (error.status === 0) {
          this.recoveryMessage = 'Cannot connect to server. Please check if the backend server is running.';
        } else {
          this.recoveryMessage = 'Failed to reset password. Please try again.';
        }
        this.recoverySuccess = false;
      }
    });
  }

  onCancelRecovery() {
    this.showPasswordRecovery = false;
    this.recoveryEmail = '';
    this.recoveryMessage = '';
    this.recoverySuccess = false;
    this.isRecoveryLoading = false;
    this.recoveryStep = 'email';
    this.verificationCode = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }
}
