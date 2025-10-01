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

  onSubmit(form: NgForm) {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (form.valid) {
      alert('Registration successful!');
      form.resetForm();
      this.password = '';
      this.confirmPassword = '';
    } else {
      alert('Please fill in all required fields correctly.');
    }
  }
}
