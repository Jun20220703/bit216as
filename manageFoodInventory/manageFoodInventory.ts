import { Component } from '@angular/core';

@Component({
  selector: 'app-food-inventory',
  templateUrl: './food-inventory.component.html',
  styleUrls: ['./food-inventory.component.css']
})
export class FoodInventoryComponent {
  foodItems = [
    { name: 'Milk', qty: 2, expiry: '14 Sep 2025', category: 'Dairy', storage: 'Fridge' },
    { name: 'Rice', qty: '5kg', expiry: '30 Nov 2025', category: 'Grain', storage: 'Pantry' },
    { name: 'Chicken', qty: '1kg', expiry: '12 Sep 2025', category: 'Meat', storage: 'Freezer' }
  ];

  addFoodItem() {
    console.log('Add food item clicked');
  }

  editItem(item: any) {
    console.log('Edit:', item);
  }

  deleteItem(item: any) {
    console.log('Delete:', item);
  }

  donateItem(item: any) {
    console.log('Donate:', item);
  }

  goToDonationList() {
    console.log('Navigate to Donation List');
  }
}
