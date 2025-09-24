import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component'; //sidebar

@Component({
  selector: 'app-inventory',
  standalone: true,
  templateUrl: './browse-inventory.component.html',
  styleUrls: ['./browse-inventory.component.css'],
  imports: [CommonModule, FormsModule, SidebarComponent]
})
export class InventoryComponent {
  locations = ['Fridge', 'Freezer', 'Shelf'];
  selectedLocation = 'Fridge';
  showFilter = false;
<<<<<<< Updated upstream
  showSearch = false;
  searchTerm = '';
=======
  hoverItem: any = null;
>>>>>>> Stashed changes

  filter = {
    source: 'inventory', // default: inventory
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
    if (this.showFilter) this.showSearch = false;
  }

<<<<<<< Updated upstream
  toggleSearchBar() {
    this.showSearch = !this.showSearch;
    if (this.showSearch) this.showFilter = false;
  }

  /** ---------- SOURCE ---------- */
  setSource(value: string) {
    this.filter.source = value;
  }

  /** ---------- CATEGORY ---------- */
  toggleAllCategories() {
    this.filter.categories.all = true;
    this.filter.categories.fruit = false;
    this.filter.categories.vegetable = false;
    this.filter.categories.meat = false;
  }

  toggleCategory(category: 'fruit' | 'vegetable' | 'meat') {
    this.filter.categories[category] = !this.filter.categories[category];
    if (this.filter.categories.fruit || this.filter.categories.vegetable || this.filter.categories.meat) {
      this.filter.categories.all = false;
    } else {
      this.filter.categories.all = true; // if none selected, revert to All
    }
  }

  /** ---------- DISPLAY ---------- */
=======
  /** Source filter logic (radio-like behaviour) */
  toggleSource(source: 'donation' | 'inventory') {
    if (source === 'donation') {
      this.filter.donation = true;
      this.filter.inventory = false;
    } else {
      this.filter.inventory = true;
      this.filter.donation = false;
    }
  }

  /**
   * Category toggling — typed so TypeScript accepts indexing.
   * - 'all' clears specific categories.
   * - specific categories toggle independently, and if none selected we revert to 'all'.
   */
  toggleCategory(category: 'all' | 'fruit' | 'vegetable' | 'meat'): void {
    if (category === 'all') {
      this.filter.categories = { all: true, fruit: false, vegetable: false, meat: false };
      return;
    }

    // toggle the specific category and uncheck "all"
    this.filter.categories[category] = !this.filter.categories[category];
    this.filter.categories.all = false;

    // if none of the specific categories are true, revert to All
    const noneSelected = !this.filter.categories.fruit
                      && !this.filter.categories.vegetable
                      && !this.filter.categories.meat;
    if (noneSelected) {
      this.filter.categories.all = true;
    }
  }

>>>>>>> Stashed changes
  filteredCategories() {
    if (this.filter.categories.all) return this.categories;

    return this.categories.filter(cat =>
      (this.filter.categories.fruit && cat.name === 'Fruit') ||
      (this.filter.categories.vegetable && cat.name === 'Vegetable') ||
      (this.filter.categories.meat && cat.name === 'Meat')
    );
  }

  filteredItems(items: any[]) {
    if (!this.searchTerm.trim()) return items;
    return items.filter(item =>
      item.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  increaseItem(item: any) {
    item.quantity++;
  }

  decreaseItem(item: any) {
    if (item.quantity > 0) item.quantity--;
  }
}
