import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BrowseFoodService, Food } from '../../services/browse-food.service';

interface Item {
  _id: string;
  name: string;
  remaining: number;
  selectedQty: number;
  source: 'inventory' | 'donation' | 'expired';
  expiry: string;
}

type CategoryKey = 'all' | 'fruit' | 'vegetable' | 'meat' | 'grain' | 'dairy' | 'others';

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
  constructor(
    private cdr: ChangeDetectorRef,
    private browseService: BrowseFoodService
  ) {}

  /** 页面状态 */
  viewTitle: string = 'Inventory';
  selectedSource: 'inventory' | 'donation' = 'inventory';
  selectedLocation: string = 'All';

  showFilter = false;
  showSearch = false;
  searchQuery: string = '';
  hoverItem: Item | null = null;

  showConfirm = false;
  confirmItem: Item | null = null;
  confirmAction: 'used' | 'meal' | 'donate' | 'edit' | null = null;

  /** 筛选条件 */
  filter = {
    donation: false,
    inventory: true,
    categories: { 
      all: true, 
      fruit: true, 
      vegetable: true, 
      meat: true, 
      grain: true, 
      dairy: true,
      others: true   // ✅ 新增 Others
    },
    expiredIn: 0
  };

  /** 数据缓存 */
  viewLocs: Location[] = [];
  rawFoods: Food[] = [];
  private expiredSet = new Set<string>();

  ngOnInit() { 
    this.loadFoods();

    // ✅ 自动补上分类字段
    this.availableCategories.forEach(cat => {
      if (!(cat.key in this.filter.categories)) {
        (this.filter.categories as any)[cat.key] = true;
      }
    });
  }

  /** 从 API 获取数据 */
  loadFoods() {
    this.browseService.getFoods().subscribe((data: Food[]) => {
      console.log("📦 拿到的数据:", data);
      this.rawFoods = data;
      this.refreshView();
    });
  }

  /** 动态 Storage 下拉 */
  get availableLocations(): string[] {
    const set = new Set<string>();
    this.rawFoods.forEach(food => {
      if (this.matchSource(food.status as 'inventory' | 'donation')) {
        set.add(food.storage);
      }
    });
    return Array.from(set);
  }

  /** 动态分类下拉 */
  get availableCategories() {
    const list: { key: CategoryKey, name: string }[] = [];
    const exists = new Set<CategoryKey>();

    this.rawFoods.forEach(food => {
      const key = this.mapCategoryKey(food.category);
      if (this.matchSource(food.status as 'inventory' | 'donation') && !exists.has(key)) {
        exists.add(key);
        list.push({ key, name: food.category });
      }
    });
    return list;
  }

  /** 构建数据结构 */
  private buildLocations(): Location[] {
    const map: { [storage: string]: Location } = {};

    this.rawFoods.forEach(food => {
      if (!this.matchSource(food.status as 'inventory' | 'donation')) return;

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
        _id: food._id!,
        name: food.name,
        remaining: Number(food.qty),
        selectedQty: 0,
        source: (food.status === 'donation') ? 'donation' : 'inventory',
        expiry: food.expiry
      });
    });

    return Object.values(map);
  }

  /** 分类名映射 */
  private mapCategoryKey(category: string): CategoryKey {
    switch (category.toLowerCase()) {
      case 'fruit': return 'fruit';
      case 'vegetable': return 'vegetable';
      case 'meat': return 'meat';
      case 'carbohydrates':
      case 'carb':
      case 'grain': return 'grain';
      case 'dairy': return 'dairy';
      case 'others': return 'others';
      default: return 'all';
    }
  }

  /** 分类图标 */
  private getCategoryIcon(key: CategoryKey): string {
    switch (key) {
      case 'fruit': return '🍎';
      case 'vegetable': return '🥦';
      case 'meat': return '🍖';
      case 'grain': return '🌾';
      case 'dairy': return '🥛';
      default: return '📦';
    }
  }

  /** 匹配数据源 */
  private matchSource(source: 'inventory' | 'donation') {
    if (this.filter.inventory && !this.filter.donation) return source === 'inventory';
    if (this.filter.donation && !this.filter.inventory) return source === 'donation';
    return true;
  }

  /** 刷新界面 */
  refreshView() {
    let locs = this.buildLocations();

    if (this.selectedLocation !== 'All') {
      locs = locs.filter(l => l.name === this.selectedLocation);
    }

    locs = locs.map(loc => ({
      ...loc,
      categories: loc.categories.filter(cat =>
        this.filter.categories.all || (this.filter.categories as any)[cat.key] === true
      )
    }));

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

  /** 只显示即将过期食物 */
  applyExpiredFilter() {
    const limit = Number(this.filter.expiredIn);
    if (!limit || limit <= 0) {
      this.refreshView();
      return;
    }

    let locs = this.buildLocations();

    locs = locs.map(loc => ({
      ...loc,
      categories: loc.categories.map(cat => ({
        ...cat,
        items: cat.items.filter(i => {
          const days = this.getRemainingDays(i.expiry);
          return days >= 0 && days <= limit;
        })
      })).filter(cat => cat.items.length > 0)
    })).filter(loc => loc.categories.length > 0);

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

    this.showSearch = false;
    this.showFilter = false;
  }

  toggleCategory(category: CategoryKey | string) {
    if (category === 'all') {
      const enabled = !this.filter.categories.all;
      const currentKeys = this.availableCategories.map(c => c.key);
      currentKeys.forEach(k => (this.filter.categories as any)[k] = enabled);
      this.filter.categories.all = enabled;
    } else {
      const current = (this.filter.categories as any)[category];
      (this.filter.categories as any)[category] = !current;

      const currentKeys = this.availableCategories.map(c => c.key);
      const allSelected = currentKeys.every(k => (this.filter.categories as any)[k]);
      this.filter.categories.all = allSelected;
    }

    this.refreshView();
  }

  /** 数量调整 */
  increaseSelected(item: Item) {
    if (item.selectedQty < item.remaining) item.selectedQty++;
  }
  decreaseSelected(item: Item) {
    if (item.selectedQty > 0) item.selectedQty--;
  }

  /** 弹窗逻辑 ✅（修正函数名）*/
  openConfirm(item: Item, action: 'used' | 'meal' | 'donate' | 'edit') {
    // donation 模式允许 edit 直接打开，不需要选数量
    console.log('🟢 openConfirm called with', item.name, action);
    if (action !== 'edit' && item.selectedQty <= 0) return;
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

  /** 执行动作 */
  confirmActionProceed() {
    if (!this.confirmItem || !this.confirmAction) return;

    if (this.confirmAction === 'donate') {
      this.browseService.updateFoodStatus(this.confirmItem._id, 'donation').subscribe({
        next: () => {
          console.log(`✅ ${this.confirmItem?.name} 已标记为 donation`);
          this.loadFoods();
        },
        error: err => console.error('❌ Error updating status:', err)
      });

    } else if (this.confirmAction === 'edit') {
      console.log(`📝 Editing donation item: ${this.confirmItem.name}`);
      alert(`Editing donation item: ${this.confirmItem.name}`);
      this.closeConfirm();

    } else {
      const newQty = Math.max(0, this.confirmItem.remaining - this.confirmItem.selectedQty);
      this.browseService.updateFoodQty(this.confirmItem._id, newQty).subscribe({
        next: () => {
          console.log(`✅ ${this.confirmItem?.name} 数量更新为 ${newQty}`);
          this.loadFoods();
        },
        error: err => console.error('❌ Error updating quantity:', err)
      });
    }

    this.closeConfirm();
  }

  /** 计算剩余天数 */
  getRemainingDays(expiryDate: string): number {
    if (!expiryDate) return 0;
    const exp = new Date(expiryDate);
    if (isNaN(exp.getTime())) return 0;
    const today = new Date();
    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return diffDays;
  }

  /** 根据过期天数返回样式 */
  getExpiryClass(item: Item): string {
    const days = this.getRemainingDays(item.expiry);
    if (days <= 0) {
      this.autoExpireItem(item);
      return 'expired';
    }
    if (days < 5) return 'red';
    if (days < 7) return 'yellow';
    return 'green';
  }

  /** 自动过期处理 */
  private autoExpireItem(item: Item) {
    if (item.source === 'expired' || this.expiredSet.has(item._id)) return;
    this.expiredSet.add(item._id);

    console.log(`⚠️ ${item.name} 已过期，自动标记为 expired`);
    this.browseService.updateFoodStatus(item._id, 'expired').subscribe({
      next: () => this.loadFoods(),
      error: err => console.error('❌ Error auto-expiring item:', err)
    });
  }
}
