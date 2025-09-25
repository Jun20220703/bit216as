import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  templateUrl: './browse-inventory.component.html',
  styleUrls: ['./browse-inventory.component.css'],
  imports: [CommonModule, FormsModule, SidebarComponent],
})
export class InventoryComponent {
  locations = ['Fridge', 'Freezer', 'Shelf'];
  selectedLocation = 'Fridge';
  showFilter = false;
  showSearch = false;
  searchQuery: string = '';
  hoverItem: any = null;

  filter = {
    donation: false,
    inventory: true,
    categories: {
      all: true,
      fruit: true,
      vegetable: true,
      meat: false,
    },
    expiredIn: 15,
  };

  categories = [
    {
      name: 'Fruit',
      colorClass: 'fruit',
      icon: '🍎',
      items: [
        { name: 'Apple', quantity: 4 },
        { name: 'Avocado', quantity: 6 },
        { name: 'Banana', quantity: 2 },
      ],
    },
    {
      name: 'Vegetable',
      colorClass: 'vegetable',
      icon: '🥦',
      items: [
        { name: 'Broccoli', quantity: 3 },
        { name: 'Onions', quantity: 2 },
      ],
    },
    {
      name: 'Meat',
      colorClass: 'meat',
      icon: '🍖',
      items: [
        { name: 'Chicken Breast', quantity: 5 },
        { name: 'Beef', quantity: 2 },
      ],
    },
  ];

  toggleFilterPanel() {
    this.showFilter = !this.showFilter;
  }

  toggleSearchBar() {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) this.searchQuery = '';
  }

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
      this.filter.categories = {
        all: true,
        fruit: false,
        vegetable: false,
        meat: false,
      };
      return;
    }
    this.filter.categories[category] = !this.filter.categories[category];
    this.filter.categories.all = false;

    const noneSelected =
      !this.filter.categories.fruit &&
      !this.filter.categories.vegetable &&
      !this.filter.categories.meat;
    if (noneSelected) this.filter.categories.all = true;
  }

  filteredCategories() {
    let cats = this.filter.categories.all
      ? this.categories
      : this.categories.filter(
          (cat) =>
            (this.filter.categories.fruit && cat.name === 'Fruit') ||
            (this.filter.categories.vegetable && cat.name === 'Vegetable') ||
            (this.filter.categories.meat && cat.name === 'Meat')
        );

    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      cats = cats
        .map((cat) => ({
          ...cat,
          items: cat.items.filter((item) =>
            item.name.toLowerCase().includes(q)
          ),
        }))
        .filter((cat) => cat.items.length > 0);
    }

    return cats;
  }

  increaseItem(item: any) {
    item.quantity++;
  }

  decreaseItem(item: any) {
    if (item.quantity > 0) item.quantity--;
  }
}
