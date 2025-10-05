import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '../../sidebar/sidebar.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  templateUrl: './homePage.component.html',
  styleUrls: ['./homePage.component.css'],
  imports: [CommonModule, RouterModule, SidebarComponent]
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
