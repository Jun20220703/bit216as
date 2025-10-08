import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';

interface Item {
  name: string;
  remaining: number;
  selectedQty: number;
  source: 'inventory' | 'donation';   // 👈 新增
}
type CategoryKey = 'all' | 'fruit' | 'vegetable' | 'meat' | 'carb';
interface Category {
  name: string;
  key: CategoryKey;
  colorClass: string;
  icon: string;
  items: Item[];
}
interface Location {
  name: string;
  categories: Category[];
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  templateUrl: './browse-inventory.component.html',
  styleUrls: ['./browse-inventory.component.css'],
  imports: [CommonModule, FormsModule, SidebarComponent],
})
export class InventoryComponent implements OnInit {
  constructor(private cdr: ChangeDetectorRef) {}

  viewTitle: string = 'Inventory';
  selectedSource: 'inventory' | 'donation' = 'inventory';


  locations = ['All', 'Fridge', 'Freezer', 'Shelf'];
  selectedLocation = 'All';
  showFilter = false;
  showSearch = false;
  searchQuery: string = '';
  hoverItem: Item | null = null;

  // 弹窗状态
  showConfirm = false;
  confirmItem: Item | null = null;
  confirmAction: 'used' | 'meal' | 'donate' | null = null;

  filter = {
    donation: false,
    inventory: true,
    categories: { all: true, fruit: true, vegetable: true, meat: true, carb: true },
    expiredIn: 0
  };

  viewLocs: Location[] = [];

  data: Location[] = [
    {
      name: 'Fridge',
      categories: [
        {
          name: 'Carbohydrates', key: 'carb', colorClass: 'carb', icon: '🍞',
          items: [
            { name: 'Rice', remaining: 5, selectedQty: 0, source: 'inventory' }
          ]
        },
        {
          name: 'Fruit', key: 'fruit', colorClass: 'fruit', icon: '🍎',
          items: [
            { name: 'Apple', remaining: 9, selectedQty: 0, source: 'donation' },
            { name: 'Grape', remaining: 1, selectedQty: 0, source: 'inventory' }
          ]
        },
        {
          name: 'Meat', key: 'meat', colorClass: 'meat', icon: '🍖',
          items: [
            { name: 'Chicken', remaining: 2, selectedQty: 0, source: 'donation' }
          ]
        }
      ]
    }
  ];

  ngOnInit() { this.refreshView(); }

  refreshView() {
    this.viewLocs = this.computeFilteredLocations();
    this.cdr.detectChanges();
  }

  get availableCategories() {
    const categories: { key: CategoryKey, name: string }[] = [];

    this.data.forEach(loc => {
      loc.categories.forEach(cat => {
        // 先检查每个 item 的来源是否符合当前 filter
        const hasMatchingItem = cat.items.some(i => {
          if (this.filter.inventory && !this.filter.donation) return i.source === 'inventory';
          if (this.filter.donation && !this.filter.inventory) return i.source === 'donation';
          return true; // 如果两个都勾选，就全显示
        });

        // 如果这个分类在当前模式下有 item 才显示
        if (hasMatchingItem && !categories.some(c => c.key === cat.key)) {
          categories.push({ key: cat.key, name: cat.name });
        }
      });
    });

    return categories;
  }

  get availableLocations(): string[] {
    const locations: string[] = [];

    this.data.forEach(loc => {
      // 检查 location 里面是否有符合当前 source 的 item
      const hasMatchingItem = loc.categories.some(cat =>
        cat.items.some(i => {
          if (this.filter.inventory && !this.filter.donation) return i.source === 'inventory';
          if (this.filter.donation && !this.filter.inventory) return i.source === 'donation';
          return true; // 如果两个都勾选，就全显示
        })
      );

      if (hasMatchingItem && !locations.includes(loc.name)) {
        locations.push(loc.name);
      }
    });

    return locations;
  }

  private computeFilteredLocations(): Location[] {
    let locs = this.selectedLocation === 'All'
      ? this.data
      : this.data.filter(l => l.name === this.selectedLocation);

    locs = locs.map(loc => ({
      ...loc,
      categories: loc.categories.filter(cat => this.filter.categories.all || this.filter.categories[cat.key])
    }));

    // ✅ 根据 inventory/donation 过滤
    locs = locs.map(loc => ({
      ...loc,
      categories: loc.categories.map(cat => ({
        ...cat,
        items: cat.items.filter(i => {
          if (this.filter.inventory && !this.filter.donation) return i.source === 'inventory';
          if (this.filter.donation && !this.filter.inventory) return i.source === 'donation';
          return true; // 如果两个都勾选，就显示全部
        })
      })).filter(cat => cat.items.length > 0)
    })).filter(loc => loc.categories.length > 0);

    // ✅ 搜索功能
    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      locs = locs.map(loc => ({
        ...loc,
        categories: loc.categories.map(cat => ({
          ...cat,
          items: cat.items.filter(i => i.name.toLowerCase().includes(q))
        })).filter(cat => cat.items.length > 0)
      })).filter(loc => loc.categories.length > 0);
    }

    return locs;
  }

  toggleFilterPanel() { this.showFilter = !this.showFilter; }
  toggleSearchBar() { this.showSearch = !this.showSearch; if (!this.showSearch) { this.searchQuery = ''; this.refreshView(); } }

  toggleSource(source: 'donation' | 'inventory') {
    this.filter.donation = source === 'donation';
    this.filter.inventory = source === 'inventory';

    // 👇 更新标题
    if (source === 'inventory') {
      this.viewTitle = 'Inventory';
    } else if (source === 'donation') {
      this.viewTitle = 'Donation List';
    }

    this.refreshView();
  }

  toggleCategory(category: CategoryKey) {
    if (category === 'all') {
      const enabled = !this.filter.categories.all;
      this.filter.categories = { all: enabled, fruit: enabled, vegetable: enabled, meat: enabled, carb: enabled };
    } else {
      this.filter.categories[category] = !this.filter.categories[category];
      this.filter.categories.all = false;
    }
    this.refreshView();
  }

increaseSelected(item: Item) {
  if (item.selectedQty < item.remaining) {
    item.selectedQty++;
  }
}
decreaseSelected(item: Item) {
  if (item.selectedQty > 0) {
    item.selectedQty--;
  }
}


  // 弹窗逻辑
  openConfirm(item: Item, action: 'used' | 'meal' | 'donate') {
    if (item.selectedQty <= 0) return;
    this.confirmItem = item;
    this.confirmAction = action;
    this.showConfirm = true;
  }

  closeConfirm() {
    this.showConfirm = false;
    this.confirmItem = null;
    this.confirmAction = null;
    this.cdr.detectChanges();
  }

  confirmActionProceed() {
    if (this.confirmItem && this.confirmAction) {
      this.confirmItem.remaining = Math.max(0, this.confirmItem.remaining - this.confirmItem.selectedQty);
      this.confirmItem.selectedQty = 0;
    }
    this.closeConfirm();
    this.refreshView();
  }
}
