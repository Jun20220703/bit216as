import { Component } from '@angular/core';

@Component({
  selector: 'app-registration-page',
  templateUrl: './registrationPage.component.html',
  styleUrls: ['./registrationPage.component.css']
})
export class RegistrationPageComponent {

  password: string = '';
  confirmPassword: string = '';

  clearInput(inputRef: HTMLInputElement) {
    inputRef.value = '';
  }

  onSubmit(form: any) {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    alert('Registration successful!');
    form.resetForm();
  }
}
