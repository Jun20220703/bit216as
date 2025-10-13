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
  notes?: string;   // 🔹 新增，可选的 notes
  owner?: string;   // 🔹 可选，只有你需要用的时候才映射

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
  hoverItemNotes: string | null = null;


  showConfirm = false;
  confirmItem: Item | null = null;
  confirmAction: 'used' | 'meal' | 'donate' | 'edit' | null = null;

  /** 筛选条件 */
  filter = {
    donation: false,
    inventory: true,
    categories: {} as { [key in CategoryKey]?: boolean },
    expiredIn: 0
  };

  /** 数据缓存 */
  viewLocs: Location[] = [];
  rawFoods: Food[] = [];
  private expiredSet = new Set<string>();

  ngOnInit() {
    this.loadFoods();
  }

  /** 从 API 获取数据 */
  loadFoods() {
    this.browseService.getFoods().subscribe((data: Food[]) => {
      console.log('📦 拿到的数据:', data);
      this.rawFoods = data;

      // 初始化/同步分类键
      this.ensureCategoryKeysInitialized(true);

      this.refreshView();
    });
  }

  /** 动态 Storage 下拉 */
  get availableLocations(): string[] {
    const set = new Set<string>();
    this.rawFoods.forEach(food => {
      if (this.matchSource(food.status as 'inventory' | 'donation')) {
        set.add(food.storage || 'Unknown');
      }
    });
    return Array.from(set);
  }

  /** 动态分类下拉（不暴露 'all'，因为有单独的 All 复选框） */
  get availableCategories(): { key: CategoryKey; name: string }[] {
    const list: { key: CategoryKey; name: string }[] = [];
    const exists = new Set<CategoryKey>();

    this.rawFoods.forEach(food => {
      const key = this.mapCategoryKey(food.category);
      if (key === 'all') return; // UI 里不显示 'all'
      if (this.matchSource(food.status as 'inventory' | 'donation') && !exists.has(key)) {
        exists.add(key);
        const displayName = key.charAt(0).toUpperCase() + key.slice(1);
        list.push({ key, name: displayName });
      }
    });

    // 稳定排序（可选）
    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }

  /** 确保 filter.categories 拥有当前可用分类的键，必要时设默认值 */
  private ensureCategoryKeysInitialized(setDefaultTrue = false) {
    const keys = this.availableCategories.map(c => c.key);

    // 新出现的分类键设成默认（通常为 true，表示“全选”初始态）
    keys.forEach(k => {
      if (this.filter.categories[k] === undefined) {
        this.filter.categories[k] = setDefaultTrue ? true : !!this.filter.categories.all;
      }
    });

    // 如果还没定义 All，就按当前分类是否都为 true 来判定
    if (this.filter.categories.all === undefined) {
      this.filter.categories.all = keys.length === 0 ? true : keys.every(k => this.filter.categories[k] === true);
    } else {
      // 如果 All 为 true，但有分类是 undefined，则补成 true
      if (this.filter.categories.all) {
        keys.forEach(k => {
          if (this.filter.categories[k] === undefined) this.filter.categories[k] = true;
        });
      }
    }
  }

  /** 构建数据结构：Storage → Category → Items */
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
          name: key === 'all' ? 'Others' : (food.category || 'Others'),
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
        source: (food.status === 'donation') ? 'donation' : (food.status === 'expired') ? 'expired' : 'inventory',
        expiry: food.expiry,
        notes: food.notes,   // 🔹 把 notes 映射进来
        owner: food.owner   // 🔹 如果你要用 owner，就在这里映射
      });

    });

    return Object.values(map);
  }

  private mapCategoryKey(category: string): CategoryKey {
    const c = (category || '').trim().toLowerCase();
    const singular = c.endsWith('s') ? c.slice(0, -1) : c; // Fruits → fruit, Others → other

    if (singular.includes('fruit')) return 'fruit';
    if (singular.includes('vegetable')) return 'vegetable';
    if (singular.includes('meat')) return 'meat';
    if (singular.includes('grain') || singular.includes('carb')) return 'grain';
    if (singular.includes('dairy')) return 'dairy';
    if (singular.includes('other')) return 'others';

    return 'all'; // 未识别的分类归到 all（UI 不显示，视作 Others）
  }

  /** 分类图标 */
  private getCategoryIcon(key: CategoryKey): string {
    switch (key) {
      case 'fruit': return '🍎';
      case 'vegetable': return '🥦';
      case 'meat': return '🍖';
      case 'grain': return '🌾';
      case 'dairy': return '🥛';
      default: return '📦'; // others / all
    }
  }

  /** 匹配数据源 */
  private matchSource(source: 'inventory' | 'donation') {
    if (this.filter.inventory && !this.filter.donation) return source === 'inventory';
    if (this.filter.donation && !this.filter.inventory) return source === 'donation';
    return true;
  }

  /** ✅ 刷新界面（分类过滤只看每个分类布尔值，不再被 all 覆盖） */
  refreshView() {
    // 每次刷新先确保分类键存在
    this.ensureCategoryKeysInitialized();

    let locs = this.buildLocations();

    // 过滤 storage
    if (this.selectedLocation !== 'All') {
      locs = locs.filter(l => l.name === this.selectedLocation);
    }

    // 过滤分类
    const allowed = new Set<CategoryKey>(
      this.availableCategories
        .map(c => c.key)
        .filter(k => this.filter.categories[k] === true)
    );

    locs = locs.map(loc => ({
      ...loc,
      categories: loc.categories
        .map(cat => ({
          ...cat,
          items: (allowed.has(cat.key)) ? cat.items : []
        }))
        .filter(cat => cat.items.length > 0)
    })).filter(loc => loc.categories.length > 0);

    // 搜索过滤
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

  /** Expired Filter（仅 inventory） */
  applyExpiredFilter() {
    if (this.selectedSource !== 'inventory') {
      this.refreshView();
      return;
    }

    const limit = Number(this.filter.expiredIn);
    if (!limit || limit <= 0) {
      this.refreshView();
      return;
    }

    // 确保分类键存在
    this.ensureCategoryKeysInitialized();

    let locs = this.buildLocations();

    // 先按 storage
    if (this.selectedLocation !== 'All') {
      locs = locs.filter(l => l.name === this.selectedLocation);
    }

    // 再按分类勾选
    const allowed = new Set<CategoryKey>(
      this.availableCategories
        .map(c => c.key)
        .filter(k => this.filter.categories[k] === true)
    );

    // 套用过期范围
    locs = locs.map(loc => ({
      ...loc,
      categories: loc.categories.map(cat => ({
        ...cat,
        items: allowed.has(cat.key)
          ? cat.items.filter(i => {
              const days = this.getRemainingDays(i.expiry);
              return days >= 0 && days <= limit;
            })
          : []
      })).filter(cat => cat.items.length > 0)
    })).filter(loc => loc.categories.length > 0);

    this.viewLocs = locs;
    this.cdr.detectChanges();
  }

   /** Reset 过期过滤 */
  resetExpiredFilter() {
    this.filter.expiredIn = 0;
    this.refreshView();
  }

  /** UI 控制 */
  toggleFilterPanel() { this.showFilter = !this.showFilter; }

  toggleSearchBar() {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      this.searchQuery = '';
      this.refreshView();
    }
  }

  toggleSource(source: 'donation' | 'inventory') {
    this.selectedSource = source;
    this.filter.donation = source === 'donation';
    this.filter.inventory = source === 'inventory';
    this.viewTitle = (source === 'inventory') ? 'Inventory' : 'Donation List';

    // 切换数据源后，重置 All 为 true，并同步所有可用分类
    this.ensureCategoryKeysInitialized(true);
    this.filter.categories.all = true;
    this.availableCategories.forEach(c => this.filter.categories[c.key] = true);

    // Donation 模式不需要过期范围
    if (source === 'donation') this.filter.expiredIn = 0;

    this.refreshView();
    this.showSearch = false;
    this.showFilter = false;
  }

  /** ✅ 单个分类切换 */
  onCategoryChange(key: CategoryKey, checked: boolean) {
    this.filter.categories[key] = checked;

    // 如果所有分类都为 true → 勾选 All；否则取消 All
    const keys = this.availableCategories.map(c => c.key);
    this.filter.categories.all = keys.length === 0 ? true : keys.every(k => this.filter.categories[k] === true);

    this.refreshView();
  }

  /** ✅ All 开关（同步所有当前可用分类） */
  onCategoryAllToggle(checked: boolean) {
    this.filter.categories.all = checked;
    this.availableCategories.forEach(c => (this.filter.categories[c.key] = checked));
    this.refreshView();
  }

  /** 数量调整 */
  increaseSelected(item: Item) {
    if (item.selectedQty < item.remaining) item.selectedQty++;
  }
  decreaseSelected(item: Item) {
    if (item.selectedQty > 0) item.selectedQty--;
  }

  /** 弹窗逻辑 */
  openConfirm(item: Item, action: 'used' | 'meal' | 'donate' | 'edit') {
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
