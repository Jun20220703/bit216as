import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ⚠️ 根据你 sidebar 的位置选择正确路径：
// 如果在 src/app/components/sidebar/sidebar.component.ts
// import { SidebarComponent } from '../sidebar/sidebar.component';
// 如果在 src/app/sidebar/sidebar.component.ts
// import { SidebarComponent } from '../../sidebar/sidebar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

type CategoryKey = 'all' | 'fruit' | 'vegetable' | 'meat' | 'carb';

@Component({
  selector: 'app-inventory',
  standalone: true,
  templateUrl: './browse-inventory.component.html',
  styleUrls: ['./browse-inventory.component.css'],
  imports: [CommonModule, FormsModule, SidebarComponent],
})
export class InventoryComponent {
  locations = ['All', 'Fridge', 'Freezer', 'Shelf'];
  selectedLocation = 'All';
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
      meat: true,
      carb: true
    },
    expiredIn: 0
  };

  data = [
    {
      name: 'Fridge',
      categories: [
        {
          name: 'Carbohydrates',
          key: 'carb' as CategoryKey,
          colorClass: 'carb',
          icon: '🍞',
          items: [{ name: 'Rice', quantity: 5 }]
        },
        {
          name: 'Fruit',
          key: 'fruit' as CategoryKey,
          colorClass: 'fruit',
          icon: '🍎',
          items: [{ name: 'Apple', quantity: 4 }, { name: 'Grape', quantity: 1 }]
        },
        {
          name: 'Meat',
          key: 'meat' as CategoryKey,
          colorClass: 'meat',
          icon: '🍖',
          items: [{ name: 'Chicken', quantity: 3 }]
        }
      ]
    },
    {
      name: 'Freezer',
      categories: [
        {
          name: 'Meat',
          key: 'meat' as CategoryKey,
          colorClass: 'meat',
          icon: '🍖',
          items: [{ name: 'Fish', quantity: 2 }]
        }
      ]
    },
    {
      name: 'Shelf',
      categories: [
        {
          name: 'Carbohydrates',
          key: 'carb' as CategoryKey,
          colorClass: 'carb',
          icon: '🍞',
          items: [{ name: 'Pasta', quantity: 3 }]
        }
      ]
    }
  ];

  // --- UI 控制 ---
  toggleFilterPanel() { this.showFilter = !this.showFilter; }
  toggleSearchBar() { this.showSearch = !this.showSearch; if (!this.showSearch) this.searchQuery = ''; }

  toggleSource(source: 'donation' | 'inventory') {
    if (source === 'donation') {
      this.filter.donation = true;
      this.filter.inventory = false;
    } else {
      this.filter.inventory = true;
      this.filter.donation = false;
    }
  }

  toggleCategory(category: CategoryKey) {
    if (category === 'all') {
      const enabled = !this.filter.categories.all;
      this.filter.categories = { all: enabled, fruit: enabled, vegetable: enabled, meat: enabled, carb: enabled };
      return;
    }
    this.filter.categories[category] = !this.filter.categories[category];
    this.filter.categories.all = false;
  }

  // --- 数据过滤 ---
  filteredLocations() {
    let locs = this.selectedLocation === 'All'
      ? this.data
      : this.data.filter(loc => loc.name === this.selectedLocation);

    // 过滤 category
    locs = locs.map(loc => ({
      ...loc,
      categories: loc.categories.filter(cat => this.filter.categories.all || this.filter.categories[cat.key])
    }));

    // 搜索
    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      locs = locs.map(loc => ({
        ...loc,
        categories: loc.categories.map(cat => ({
          ...cat,
          items: cat.items.filter(item => item.name.toLowerCase().includes(q))
        })).filter(cat => cat.items.length > 0)
      })).filter(loc => loc.categories.length > 0);
    }

    return locs;
  }

  // --- Item 修改 ---
  increaseItem(item: any) { item.quantity++; }
  decreaseItem(item: any) { if (item.quantity > 0) item.quantity--; }
}
