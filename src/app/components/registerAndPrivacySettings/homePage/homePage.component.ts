import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  templateUrl: './homePage.component.html',
  styleUrls: ['./homePage.component.css'],
  imports: [CommonModule]
})
export class HomePageComponent {

  constructor(private router: Router) {}

  onLogin() {
    this.router.navigate(['/login']);
  }

  onRegister() {
    this.router.navigate(['/registration']);
  }

  onInventory() {
    this.router.navigate(['/inventory']);
  }

  onAccountSettings() {
    this.router.navigate(['/account-settings']);
  }
}
