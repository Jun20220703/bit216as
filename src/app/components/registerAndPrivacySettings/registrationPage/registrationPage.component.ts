import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration-page',
  standalone: true,
  templateUrl: './registrationPage.component.html',
  styleUrls: ['./registrationPage.component.css'],
  imports: [CommonModule, FormsModule]
})
export class RegistrationPageComponent {

  password: string = '';
  confirmPassword: string = '';
  
  // 유효성 검사 메시지
  passwordError: string = '';
  emailError: string = '';

  clearInput(inputRef: HTMLInputElement) {
    inputRef.value = '';
    // Trigger change detection for ngModel
    inputRef.dispatchEvent(new Event('input'));
  }

  openDatePicker(inputRef: HTMLInputElement) {
    inputRef.showPicker();
  }

  goToLogin() {
    // 로그인 페이지로 이동하는 로직
    // 실제 프로젝트에서는 Router를 사용하여 네비게이션
    console.log('Navigate to login page');
    // 예: this.router.navigate(['/login']);
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
      alert('Registration successful!');
      form.resetForm();
      this.password = '';
      this.confirmPassword = '';
      this.passwordError = '';
      this.emailError = '';
    } else {
      alert('Please fill in all required fields correctly.');
    }
  }
}
