import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-registration-page',
  standalone: true,
  templateUrl: './registrationPage.component.html',
  styleUrls: ['./registrationPage.component.css'],
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class RegistrationPageComponent {

  password: string = '';
  confirmPassword: string = '';
  
  // 유효성 검사 메시지
  passwordError: string = '';
  emailError: string = '';

  constructor(private router: Router, private http: HttpClient) {}

  clearInput(inputRef: HTMLInputElement) {
    inputRef.value = '';
    // Trigger change detection for ngModel
    inputRef.dispatchEvent(new Event('input'));
  }

  openDatePicker(inputRef: HTMLInputElement) {
    inputRef.showPicker();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  // 비밀번호 유효성 검사
  validatePassword(password: string): boolean {
    if (password.length < 8) {
      this.passwordError = 'Password must be at least 8 characters long';
      return false;
    }
    
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (!specialCharRegex.test(password)) {
      this.passwordError = 'Password must contain at least one special character';
      return false;
    }
    
    this.passwordError = '';
    return true;
  }

  // 이메일 유효성 검사
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.emailError = 'Please enter a valid email address';
      return false;
    }
    
    this.emailError = '';
    return true;
  }

  // 비밀번호 입력 시 실시간 검사
  onPasswordChange(password: string) {
    this.password = password;
    this.validatePassword(password);
  }

  // 이메일 입력 시 실시간 검사
  onEmailChange(email: string) {
    this.validateEmail(email);
  }

  onSubmit(form: NgForm) {
    // 비밀번호 유효성 검사
    if (!this.validatePassword(this.password)) {
      return;
    }

    // 이메일 유효성 검사
    const emailValue = form.value.email;
    if (!this.validateEmail(emailValue)) {
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (form.valid && this.passwordError === '' && this.emailError === '') {
      // 백엔드 API 호출을 위한 데이터 준비
      const registrationData = {
        name: form.value.name,
        email: form.value.email,
        password: this.password,
        householdSize: form.value.householdSize === 'No-Selection' ? null : parseInt(form.value.householdSize),
        dateOfBirth: form.value.dob
      };

      // 백엔드 API 호출
      console.log('Sending registration data:', registrationData);
      this.http.post('http://localhost:5000/api/users/register', registrationData)
        .subscribe({
          next: (response: any) => {
            console.log('Registration successful:', response);
            alert('Registration successful! Welcome to Food Shield!');
            form.resetForm();
            this.password = '';
            this.confirmPassword = '';
            this.passwordError = '';
            this.emailError = '';
            // 로그인 페이지로 이동
            this.router.navigate(['/login']);
          },
          error: (error) => {
            console.error('Registration failed - Full error:', error);
            console.error('Error status:', error.status);
            console.error('Error message:', error.message);
            console.error('Error body:', error.error);
            
            if (error.error && error.error.message) {
              alert(`Registration failed: ${error.error.message}`);
            } else if (error.status === 0) {
              alert('Registration failed: Cannot connect to server. Please check if the backend server is running.');
            } else {
              alert(`Registration failed: ${error.message || 'Please try again.'}`);
            }
          }
        });
    } else {
      alert('Please fill in all required fields correctly.');
    }
  }
}
