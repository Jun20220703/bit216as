import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-donation-list',
  standalone: true,
  templateUrl: './donation-list.component.html',
  styleUrls: ['./donation-list.component.css'],
  imports: [CommonModule, SidebarComponent]
})
export class DonationListComponent {
  donations = [
    { name: 'Milk', qty: 2, expiry: '14 Sep 2025', pickupLocation: 'Home address', availability: 'Tomorrow' },
    { name: 'Rice', qty: '5kg', expiry: '30 Nov 2025', pickupLocation: 'Community Center', availability: 'Today' }
  ];

  edit(item: any) {
    console.log('Edit:', item);
  }

  delete(item: any) {
    console.log('Delete:', item);
  }
}
