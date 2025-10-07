import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { Router } from '@angular/router';
import { FoodService } from '../../services/food.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-food-inventory',
  templateUrl: './manage-inventory.component.html',
  styleUrls: ['./manage-inventory.component.css'],
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule]
})
export class ManageFoodInventory {
  foodItems: any[] = [];

  constructor (private foodService: FoodService, private router: Router){}

  ngOnInit(){
    this.loadFoods();
  }

  loadFoods(){
    this.foodService.getFoods().subscribe({
      next: (data) => {
        this.foodItems = data;
      },
      error: (err) => {
        console.error('Error loading foods:', err);
      }
    });
  }
  addFoodItem() {
    this.router.navigate(['/add-food']);
  }

  editItem(item: any) {
    console.log('Edit:', item);
  }

  showDeleteModal = false;
  selectedDeleteItem: any = null;
  openDeleteModal(item: any){
    this.selectedDeleteItem = item;
    this.showDeleteModal = true;
  }
  cancelDelete(){
    this.showDeleteModal = false;
    this.selectedDeleteItem = null;
  }

  confirmDelete(){
    if(this.selectedDeleteItem){
      this.foodItems = this.foodItems.filter(i => i !== this.selectedDeleteItem);
      console.log(`Deleted: ${this.selectedDeleteItem.name}`);
      this.loadFoods();
      this.showDeleteModal = false;
      this.selectedDeleteItem = null;    
    }
  }

  showDonateModal = false;
  selectedDonateItem: any = null;
  donationDetails = { location: '', availability: '', notes: '' };
  donateError ='';

  openDonateModal(item: any) {
  this.selectedDonateItem = item;
  this.showDonateModal = true;
  this.donationDetails = { location: '', availability: '', notes: '' };
  this.donateError = '';
}

cancelDonate() {
  this.showDonateModal = false;
  this.selectedDonateItem = null;
  this.donationDetails = { location: '', availability: '', notes: '' };
}

confirmDonate() {
  // 必須項目チェック
  if (!this.donationDetails.location.trim() || !this.donationDetails.availability.trim()) {
    this.donateError = 'Pickup location and availability are required.';
    return;
  }

  const donatedItem = {
    ...this.selectedDonateItem,
    pickupLocation: this.donationDetails.location,
    availability: this.donationDetails.availability,
    notes: this.donationDetails.notes
  };

  console.log('✅ Donated item:', donatedItem);
  this.router.navigate(['/donation-list']); // Donationリストページへ遷移

  this.showDonateModal = false;
  this.selectedDonateItem = null;
  this.donationDetails = { location: '', availability: '', notes: '' };
  this.donateError = '';
}

goToDonationList() {
  console.log('Navigate to Donation List');
}


}
