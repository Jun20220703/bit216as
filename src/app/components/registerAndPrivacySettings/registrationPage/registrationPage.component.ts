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
