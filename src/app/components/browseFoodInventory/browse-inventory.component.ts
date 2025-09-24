import { Component } from '@angular/core';
<<<<<<< Updated upstream
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';    
=======
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
>>>>>>> Stashed changes

@Component({
  selector: 'app-inventory',
  standalone: true,
  templateUrl: './browse-inventory.component.html',
  styleUrls: ['./browse-inventory.component.css'],
  imports: [CommonModule, FormsModule]  
})

export class InventoryComponent {
  locations = ['Fridge', 'Freezer', 'Shelf'];
  selectedLocation = 'Fridge';
  showFilter = false;
<<<<<<< Updated upstream
=======
  hoverItem: any = null;
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
=======
  toggleSource(source: 'donation' | 'inventory') {
    if (source === 'donation') {
      this.filter.donation = true;
      this.filter.inventory = false;
    } else {
      this.filter.inventory = true;
      this.filter.donation = false;
    }
  }

  toggleCategory(category: 'all' | 'fruit' | 'vegetable' | 'meat'): void {
    if (category === 'all') {
      this.filter.categories = { all: true, fruit: false, vegetable: false, meat: false };
      return;
    }

    this.filter.categories[category] = !this.filter.categories[category];
    this.filter.categories.all = false;

    const noneSelected = !this.filter.categories.fruit
                      && !this.filter.categories.vegetable
                      && !this.filter.categories.meat;
    if (noneSelected) {
      this.filter.categories.all = true;
    }
  }

>>>>>>> Stashed changes
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
