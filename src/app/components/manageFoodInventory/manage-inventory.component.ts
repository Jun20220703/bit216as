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

  confirmDelete() {
  if (this.selectedDeleteItem) {
    this.foodService.deleteFood(this.selectedDeleteItem._id).subscribe({
      next: () => {
        console.log(`✅ Deleted: ${this.selectedDeleteItem.name}`);
        // データを再読み込み
        this.loadFoods();

        // モーダルを閉じる処理はここで行う
        this.showDeleteModal = false;
        this.selectedDeleteItem = null;
      },
      error: (err) => {
        console.error('❌ Error deleting item:', err);
        alert('Failed to delete the item. Please try again.');
      }
    });
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


  const donationData = {
    foodId: this.selectedDonateItem._id,
    qty: this.selectedDonateItem.qty,
    location: this.donationDetails.location,
    availability: this.donationDetails.availability,
    notes: this.donationDetails.notes
  };

  this.foodService.donateFood(this.selectedDonateItem._id, donationData).subscribe({
    next: (res) => {
      console.log('Donation saved:', res);
      this.showDonateModal = false;
      this.selectedDonateItem = null;
      this.donationDetails = { location: '', availability: '', notes: '' };
      this.donateError = '';

      this.loadFoods();
      this.router.navigate(['/donation-list']);
    },
    error: (err) => {
      console.error('Error saving donation:', err);
      this.donateError = 'Failed to save donation.Please try again.';
    }
  })

  
}

goToDonationList() {
  console.log('Navigate to Donation List');
}

isExpiringSoon(expiryDate: string): boolean{
  const today = new Date();
  const expiry = new Date(expiryDate);

  const diffInTime = expiry.getTime() - today.getTime();
  const diffInDays = diffInTime / (1000 * 3600 * 24);

  return diffInDays <= 5 && diffInDays >= 0;
}


}
