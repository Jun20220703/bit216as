import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  templateUrl: './loginPage.component.html',
  styleUrls: ['./loginPage.component.css'],
  imports: [CommonModule, FormsModule]
})
export class LoginPageComponent {
  email: string = '';
  password: string = '';
  name: string = '';
  isRegisterMode: boolean = false;

  constructor(private router: Router) {}

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
  }

  onLogin() {
    if (this.email && this.password) {
      // 로그인 로직 구현
      console.log('Login attempt:', { email: this.email, password: this.password });
      alert('Login successful!');
      // 실제 로그인 성공 시 다른 페이지로 이동
      // this.router.navigate(['/dashboard']);
    } else {
      alert('Please fill in all fields.');
    }
  }

  onRegister() {
    // Registration 페이지로 이동
    this.router.navigate(['/registration']);
  }

  onForgotPassword() {
    alert('Forgot password functionality would be implemented here.');
  }
}
