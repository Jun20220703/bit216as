import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FoodService, Food } from '../../services/food.service';  // 这里引入 FoodService

interface Item {
  name: string;
  remaining: number;
  selectedQty: number;
  source: 'inventory' | 'donation';
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
  constructor(private cdr: ChangeDetectorRef, private foodService: FoodService) {}

  /** 标题 & Source 选择 */
  viewTitle: string = 'Inventory';
  selectedSource: 'inventory' | 'donation' = 'inventory';

  /** Storage Location（下拉当前值） */
  selectedLocation: string = 'All';

  /** UI 状态 */
  showFilter = false;
  showSearch = false;
  searchQuery: string = '';
  hoverItem: Item | null = null;

  /** 弹窗状态 */
  showConfirm = false;
  confirmItem: Item | null = null;
  confirmAction: 'used' | 'meal' | 'donate' | null = null;

  /** 过滤状态 */
  filter = {
    donation: false,
    inventory: true,
    categories: { all: true, fruit: true, vegetable: true, meat: true, carb: true },
    expiredIn: 0
  };

  /** 最终渲染的数据 */
  viewLocs: Location[] = [];

  /** 原始数据库数据 */
  rawFoods: Food[] = [];

  ngOnInit() { 
    this.loadFoods();
  }

  /** 🔹 从 API 获取数据 */
  loadFoods() {
    this.foodService.getFoods().subscribe(data => {
      console.log("📦 从数据库拿到的数据:", data);
      this.rawFoods = data;
      this.refreshView();
    });
  }

  /** 可用 Storage Locations（随 Source 动态） */
  get availableLocations(): string[] {
    const set = new Set<string>();
    this.rawFoods.forEach(food => {
      if (this.matchSource(food.notes as 'inventory' | 'donation')) {
        set.add(food.storage);
      }
    });
    return Array.from(set);
  }

  /** 可用 Categories（随 Source 动态） */
  get availableCategories() {
    const list: { key: CategoryKey, name: string }[] = [];
    const exists = new Set<CategoryKey>();

    this.rawFoods.forEach(food => {
      const key = this.mapCategoryKey(food.category);
      if (this.matchSource(food.notes as 'inventory' | 'donation') && !exists.has(key)) {
        exists.add(key);
        list.push({ key, name: food.category });
      }
    });
    return list;
  }

  /** 🔹 转换 Food → Location/Category/Item */
  private buildLocations(): Location[] {
    const map: { [storage: string]: Location } = {};

    this.rawFoods.forEach(food => {
      // 匹配当前 Source
      if (!this.matchSource(food.notes as 'inventory' | 'donation')) return;

      const locName = food.storage || 'Unknown';
      if (!map[locName]) {
        map[locName] = { name: locName, categories: [] };
      }

      const key = this.mapCategoryKey(food.category);
      let category = map[locName].categories.find(c => c.key === key);
      if (!category) {
        category = {
          name: food.category,
          key,
          colorClass: key,
          icon: this.getCategoryIcon(key),
          items: []
        };
        map[locName].categories.push(category);
      }

      category.items.push({
        name: food.name,
        remaining: Number(food.qty),
        selectedQty: 0,
        source: (food.notes === 'donation') ? 'donation' : 'inventory'
      });
    });

    return Object.values(map);
  }

  /** 工具函数：category 映射 */
  private mapCategoryKey(category: string): CategoryKey {
    switch (category.toLowerCase()) {
      case 'fruit': return 'fruit';
      case 'vegetable': return 'vegetable';
      case 'meat': return 'meat';
      case 'carbohydrates':
      case 'carb': return 'carb';
      default: return 'all';
    }
  }

  /** 工具函数：category 图标 */
  private getCategoryIcon(key: CategoryKey): string {
    switch (key) {
      case 'fruit': return '🍎';
      case 'vegetable': return '🥦';
      case 'meat': return '🍖';
      case 'carb': return '🍞';
      default: return '📦';
    }
  }

  /** 判断是否匹配当前 source */
  private matchSource(source: 'inventory' | 'donation') {
    if (this.filter.inventory && !this.filter.donation) return source === 'inventory';
    if (this.filter.donation && !this.filter.inventory) return source === 'donation';
    return true;
  }

  /** 刷新 UI */
  refreshView() {
    let locs = this.buildLocations();

    // 过滤 Storage
    if (this.selectedLocation !== 'All') {
      locs = locs.filter(l => l.name === this.selectedLocation);
    }

    // 过滤 Category
    locs = locs.map(loc => ({
      ...loc,
      categories: loc.categories.filter(cat =>
        this.filter.categories.all || (this.filter.categories as any)[cat.key] === true
      )
    }));

    // 搜索
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

    this.viewLocs = locs;
    this.cdr.detectChanges();
  }

  /** UI 控制 */
  toggleFilterPanel() { this.showFilter = !this.showFilter; }
  toggleSearchBar() {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) { this.searchQuery = ''; this.refreshView(); }
  }

  toggleSource(source: 'donation' | 'inventory') {
    this.selectedSource = source;
    this.filter.donation = source === 'donation';
    this.filter.inventory = source === 'inventory';
    this.viewTitle = (source === 'inventory') ? 'Inventory' : 'Donation List';
    this.filter.categories.all = true;
    this.refreshView();
  }

  toggleCategory(category: CategoryKey) {
    if (category === 'all') {
      const enabled = !this.filter.categories.all;
      const currentKeys = this.availableCategories.map(c => c.key);
      currentKeys.forEach(k => (this.filter.categories as any)[k] = enabled);
      this.filter.categories.all = enabled;
    } else {
      if ((this.filter.categories as any)[category] === undefined) {
        (this.filter.categories as any)[category] = true;
      }
      (this.filter.categories as any)[category] = !(this.filter.categories as any)[category];
      this.filter.categories.all = false;
    }
    this.refreshView();
  }

  /** 数量操作 */
  increaseSelected(item: Item) {
    if (item.selectedQty < item.remaining) item.selectedQty++;
  }
  decreaseSelected(item: Item) {
    if (item.selectedQty > 0) item.selectedQty--;
  }

  /** 弹窗逻辑 */
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
