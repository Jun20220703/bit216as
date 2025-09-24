import { Component } from '@angular/core';

@Component({
  selector: 'app-browse-inventory',
  templateUrl: './browse-inventory.component.html',
  styleUrls: ['./browse-inventory.component.css']
})
export class BrowseInventoryComponent {
  username = 'junkaiyane';

  locations = ['Fridge', 'Freezer', 'Shelf'];
  selectedLocation = 'Fridge';

  categories = [
    {
      name: 'Fruit',
      colorClass: 'fruit',
      icon: '🍎',
      items: [
        { name: 'Apple', quantity: 4 },
        { name: 'Avocado', quantity: 6 },
        { name: 'Banana', quantity: 2 }
      ]
    },
    {
      name: 'Vegetable',
      colorClass: 'vegetable',
      icon: '🥦',
      items: [
        { name: 'Broccoli', quantity: 3 },
        { name: 'Onions', quantity: 2 }
      ]
    }
  ];

  increaseItem(item: any) {
    item.quantity++;
  }

  decreaseItem(item: any) {
    if (item.quantity > 0) item.quantity--;
  }
}
