import { Component } from '@angular/core';

@Component({
  selector: 'app-inventory',
  templateUrl: './browse-inventory.component.html',
  styleUrls: ['./browse-inventory.component.css']
})
export class InventoryComponent {
  locations = ['Fridge', 'Freezer', 'Shelf'];
  selectedLocation = 'Fridge';
  showFilter = false;

  filter = {
    donation: false,
    inventory: true,
    categories: {
      all: true,
      fruit: true,
      vegetable: true,
      meat: false
    },
    expiredIn: 15
  };

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

  toggleFilterPanel() {
    this.showFilter = !this.showFilter;
  }

  filteredCategories() {
    // Filter logic
    if (this.filter.categories.all) return this.categories;

    return this.categories.filter(cat =>
      (this.filter.categories.fruit && cat.name === 'Fruit') ||
      (this.filter.categories.vegetable && cat.name === 'Vegetable') ||
      (this.filter.categories.meat && cat.name === 'Meat')
    );
  }

  increaseItem(item: any) {
    item.quantity++;
  }

  decreaseItem(item: any) {
    if (item.quantity > 0) item.quantity--;
  }
}
