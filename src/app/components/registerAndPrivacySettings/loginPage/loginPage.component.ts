import { Component, ChangeDetectorRef } from '@angular/core';
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
  
  // Timer properties
  timeLeft: number = 0; // 남은 시간 (초)
  timerInterval: any = null; // 타이머 인터벌

  constructor(private router: Router, private http: HttpClient, private cdr: ChangeDetectorRef) {}

  // 타이머 시작 (2분 = 120초)
  startTimer() {
    // 기존 타이머가 있다면 정리
    this.stopTimer();
    
    this.timeLeft = 120; // 2분
    console.log('Starting timer with timeLeft:', this.timeLeft);
    
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      console.log('Timer tick - timeLeft:', this.timeLeft);
      
      // 강제로 변경 감지 트리거
      this.cdr.markForCheck();
      this.cdr.detectChanges();
      
      if (this.timeLeft <= 0) {
        console.log('Timer expired!');
        this.stopTimer();
        this.recoveryMessage = 'Verification code has expired. Please request a new one.';
        this.recoverySuccess = false;
        this.recoveryStep = 'email';
        this.verificationCode = '';
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  // 타이머 중지
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // 남은 시간을 MM:SS 형식으로 반환
  getTimeLeftFormatted(): string {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    console.log('getTimeLeftFormatted called - timeLeft:', this.timeLeft, 'formatted:', formatted);
    return formatted;
  }

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
        
        // 응답이 성공인지 확인
        if (response && (response.success === true || response.message)) {
          this.recoveryMessage = 'Email has been sent successfully! A 6-digit verification code has been sent to your email address. Please check your inbox.';
          this.recoverySuccess = true;
          this.recoveryStep = 'verify';
        } else {
          this.recoveryMessage = 'Email has been sent successfully! Please check your inbox for the verification code.';
          this.recoverySuccess = true;
          this.recoveryStep = 'verify';
        }
        
        // 로딩 상태를 false로 명시적으로 설정
        this.isRecoveryLoading = false;
        console.log('isRecoveryLoading set to:', this.isRecoveryLoading);
        console.log('recoveryStep set to:', this.recoveryStep);
        
        // UI 업데이트를 위한 약간의 지연
        setTimeout(() => {
          console.log('Triggering change detection...');
          this.cdr.detectChanges();
          
          // 타이머 시작 (UI 업데이트 후)
          this.startTimer();
          console.log('Timer started, timeLeft:', this.timeLeft);
          
          // 추가적인 강제 업데이트
          setTimeout(() => {
            this.cdr.markForCheck();
            this.cdr.detectChanges();
            console.log('Final state check - isRecoveryLoading:', this.isRecoveryLoading, 'recoveryStep:', this.recoveryStep);
          }, 50);
        }, 100);
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
        console.log('recoveryStep changed to:', this.recoveryStep);
        
        // 강제로 변경 감지 트리거
        this.cdr.detectChanges();
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
        this.recoveryMessage = 'Password reset succeeded! Redirecting to login page...';
        this.recoverySuccess = true;
        
        // 강제로 변경 감지 트리거
        this.cdr.detectChanges();
        
        // Close modal and redirect to login after 2 seconds
        setTimeout(() => {
          this.onCancelRecovery();
          // Reset all recovery form fields
          this.recoveryEmail = '';
          this.verificationCode = '';
          this.newPassword = '';
          this.confirmPassword = '';
          this.recoveryStep = 'email';
          this.recoveryMessage = '';
          this.recoverySuccess = false;
        }, 2000);
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
    
    // 타이머 중지
    this.stopTimer();
  }
}
