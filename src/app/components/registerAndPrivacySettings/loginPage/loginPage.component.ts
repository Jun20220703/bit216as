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
        this.recoveryMessage = 'Password recovery link has been sent to your email address. Please check your inbox and follow the instructions to reset your password.';
        this.recoverySuccess = true;
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

  onCancelRecovery() {
    this.showPasswordRecovery = false;
    this.recoveryEmail = '';
    this.recoveryMessage = '';
    this.recoverySuccess = false;
    this.isRecoveryLoading = false;
  }
}
