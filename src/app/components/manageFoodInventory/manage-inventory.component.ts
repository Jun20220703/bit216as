import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { Router } from '@angular/router';
import { FoodService } from '../../services/food.service';
@Component({
  selector: 'app-food-inventory',
  templateUrl: './manage-inventory.component.html',
  styleUrls: ['./manage-inventory.component.css'],
  standalone: true,
  imports: [SidebarComponent, CommonModule]
})
export class ManageFoodInventory {
  foodItems: any[] = [];

  constructor (private foodService: FoodService, private router: Router){
    this.foodItems = this.foodService.getFoods();
  }
  addFoodItem() {
    this.router.navigate(['/add-food']);
  }

  editItem(item: any) {
    console.log('Edit:', item);
  }

  deleteItem(item: any) {
    this.foodService.deleteFood(item);
    this.foodItems = this.foodService.getFoods();
  }

  showDeleteModal = false;
  selectedItem: any = null;

  openDeleteModal(item: any){
    this.selectedItem = item;
    this.showDeleteModal = true;
  }

  cancelDelete(){
    this.showDeleteModal = false;
    this.selectedItem = null;
  }

  confirmDelete(){
    if(this.selectedItem){
      this.foodItems = this.foodItems.filter(i => i !== this.selectedItem);
      console.log(`Deleted: ${this.selectedItem.name}`);
      this.showDeleteModal = false;
      this.selectedItem = null;    
    }
  }
  donateItem(item: any) {
    console.log('Donate:', item);
  }

  goToDonationList() {
    console.log('Navigate to Donation List');
  }


}
