import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  templateUrl: './accountSettings.component.html',
  styleUrls: ['./accountSettings.component.css'],
  imports: [CommonModule]
})
export class AccountSettingsComponent {
  activeTab: 'account' | 'privacy' = 'account';

  constructor(private router: Router) {}

  setActiveTab(tab: 'account' | 'privacy') {
    this.activeTab = tab;
  }

  onBack() {
    this.router.navigate(['/home']);
  }
}
