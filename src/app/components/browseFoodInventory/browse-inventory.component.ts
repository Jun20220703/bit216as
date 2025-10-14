import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BrowseFoodService, Food } from '../../services/browse-food.service';

interface Item {
  _id: string;
  name: string;
  qty: number; // 唯一数量字段
  selectedQty: number;
  source: 'inventory' | 'donation' | 'expired';
  expiry: string;
  notes?: string;
  owner?: string;
}

type CategoryKey =
  | 'all'
  | 'fruit'
  | 'vegetable'
  | 'meat'
  | 'grain'
  | 'dairy'
  | 'others';

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
    expiredIn: 0,
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
      console.log('📦 API 返回数据:', data);

      this.rawFoods = data.map((food) => ({
        ...food,
        qty: Number(food.qty ?? 0),
      }));

      this.ensureCategoryKeysInitialized(true);
      this.refreshView();
    });
  }

  /** 动态 Storage 下拉 */
  get availableLocations(): string[] {
    const set = new Set<string>();
    this.rawFoods.forEach((food) => {
      if (this.matchSource(food.status as 'inventory' | 'donation')) {
        set.add(food.storage || 'Unknown');
      }
    });
    return Array.from(set);
  }

  /** 动态分类下拉 */
  get availableCategories(): { key: CategoryKey; name: string }[] {
    const list: { key: CategoryKey; name: string }[] = [];
    const exists = new Set<CategoryKey>();

    this.rawFoods.forEach((food) => {
      const key = this.mapCategoryKey(food.category);
      if (key === 'all') return;
      if (
        this.matchSource(food.status as 'inventory' | 'donation') &&
        !exists.has(key)
      ) {
        exists.add(key);
        const displayName = key.charAt(0).toUpperCase() + key.slice(1);
        list.push({ key, name: displayName });
      }
    });

    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }

  /** 初始化分类布尔值 */
  private ensureCategoryKeysInitialized(setDefaultTrue = false) {
    const keys = this.availableCategories.map((c) => c.key);
    keys.forEach((k) => {
      if (this.filter.categories[k] === undefined) {
        this.filter.categories[k] = setDefaultTrue
          ? true
          : !!this.filter.categories.all;
      }
    });

    if (this.filter.categories.all === undefined) {
      this.filter.categories.all =
        keys.length === 0
          ? true
          : keys.every((k) => this.filter.categories[k] === true);
    } else {
      if (this.filter.categories.all) {
        keys.forEach((k) => {
          if (this.filter.categories[k] === undefined)
            this.filter.categories[k] = true;
        });
      }
    }
  }

  /** 构建 Storage → Category → Items */
  private buildLocations(): Location[] {
    const map: { [storage: string]: Location } = {};

    this.rawFoods.forEach((food) => {
      if (!this.matchSource(food.status as 'inventory' | 'donation')) return;

      const locName = food.storage || 'Unknown';
      if (!map[locName]) {
        map[locName] = { name: locName, categories: [] };
      }

      const key = this.mapCategoryKey(food.category);
      let category = map[locName].categories.find((c) => c.key === key);
      if (!category) {
        category = {
          name: key === 'all' ? 'Others' : food.category || 'Others',
          key,
          colorClass: key,
          icon: this.getCategoryIcon(key),
          items: [],
        };
        map[locName].categories.push(category);
      }

      category.items.push({
        _id: food._id!,
        name: food.name,
        qty: Number(food.qty ?? 0),
        selectedQty: 0,
        source:
          food.status === 'donation'
            ? 'donation'
            : food.status === 'expired'
            ? 'expired'
            : 'inventory',
        expiry: food.expiry,
        notes: food.notes,
        owner: food.owner,
      });
    });

    return Object.values(map);
  }

  /** 分类 key */
  private mapCategoryKey(category: string): CategoryKey {
    const c = (category || '').trim().toLowerCase();
    const singular = c.endsWith('s') ? c.slice(0, -1) : c;
    if (singular.includes('fruit')) return 'fruit';
    if (singular.includes('vegetable')) return 'vegetable';
    if (singular.includes('meat')) return 'meat';
    if (singular.includes('grain') || singular.includes('carb')) return 'grain';
    if (singular.includes('dairy')) return 'dairy';
    if (singular.includes('other')) return 'others';
    return 'all';
  }

  private getCategoryIcon(key: CategoryKey): string {
    switch (key) {
      case 'fruit':
        return '🍎';
      case 'vegetable':
        return '🥦';
      case 'meat':
        return '🍖';
      case 'grain':
        return '🌾';
      case 'dairy':
        return '🥛';
      default:
        return '📦';
    }
  }

  private matchSource(source: 'inventory' | 'donation') {
    if (this.filter.inventory && !this.filter.donation)
      return source === 'inventory';
    if (this.filter.donation && !this.filter.inventory)
      return source === 'donation';
    return true;
  }

  /** 刷新界面 */
  refreshView() {
    this.ensureCategoryKeysInitialized();
    let locs = this.buildLocations();

    if (this.selectedLocation !== 'All') {
      locs = locs.filter((l) => l.name === this.selectedLocation);
    }

    const allowed = new Set<CategoryKey>(
      this.availableCategories
        .map((c) => c.key)
        .filter((k) => this.filter.categories[k] === true)
    );

    locs = locs
      .map((loc) => ({
        ...loc,
        categories: loc.categories
          .map((cat) => ({
            ...cat,
            items: allowed.has(cat.key) ? cat.items : [],
          }))
          .filter((cat) => cat.items.length > 0),
      }))
      .filter((loc) => loc.categories.length > 0);

    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      locs = locs
        .map((loc) => ({
          ...loc,
          categories: loc.categories
            .map((cat) => ({
              ...cat,
              items: cat.items.filter((i) =>
                i.name.toLowerCase().includes(q)
              ),
            }))
            .filter((cat) => cat.items.length > 0),
        }))
        .filter((loc) => loc.categories.length > 0);
    }

    this.viewLocs = locs;
    this.cdr.detectChanges();
  }

  /** ✅ UI 控制方法（补齐防止报错） */
  toggleFilterPanel() {
    this.showFilter = !this.showFilter;
  }

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
    this.viewTitle = source === 'inventory' ? 'Inventory' : 'Donation List';

    this.ensureCategoryKeysInitialized(true);
    this.filter.categories.all = true;
    this.availableCategories.forEach(
      (c) => (this.filter.categories[c.key] = true)
    );

    if (source === 'donation') {
      this.browseService.getDonations().subscribe((donations: any[]) => {
        this.rawFoods = donations.map(d => ({
          ...d.foodId,          // 展开 Food 基本信息
          qty: d.qty,           // ✅ 用 DonationList 的数量
          notes: d.notes,       // ✅ 用 DonationList 的备注
          status: 'donation',   // 强制标记为 donation
          owner: d.owner
        }));
        this.ensureCategoryKeysInitialized(true);
        this.refreshView();
      });
    } else {
      this.loadFoods(); // 走 inventory 的逻辑
    }

    this.showSearch = false;
    this.showFilter = false;
  }

  /** 分类勾选 */
  onCategoryChange(key: CategoryKey, checked: boolean) {
    this.filter.categories[key] = checked;
    const keys = this.availableCategories.map((c) => c.key);
    this.filter.categories.all =
      keys.length === 0
        ? true
        : keys.every((k) => this.filter.categories[k] === true);
    this.refreshView();
  }

  onCategoryAllToggle(checked: boolean) {
    this.filter.categories.all = checked;
    this.availableCategories.forEach(
      (c) => (this.filter.categories[c.key] = checked)
    );
    this.refreshView();
  }

  /** Expired 过滤 */
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

    this.ensureCategoryKeysInitialized();
    let locs = this.buildLocations();

    if (this.selectedLocation !== 'All') {
      locs = locs.filter((l) => l.name === this.selectedLocation);
    }

    const allowed = new Set<CategoryKey>(
      this.availableCategories
        .map((c) => c.key)
        .filter((k) => this.filter.categories[k] === true)
    );

    locs = locs
      .map((loc) => ({
        ...loc,
        categories: loc.categories
          .map((cat) => ({
            ...cat,
            items: allowed.has(cat.key)
              ? cat.items.filter((i) => {
                  const days = this.getRemainingDays(i.expiry);
                  return days >= 0 && days <= limit;
                })
              : [],
          }))
          .filter((cat) => cat.items.length > 0),
      }))
      .filter((loc) => loc.categories.length > 0);

    this.viewLocs = locs;
    this.cdr.detectChanges();
  }

  resetExpiredFilter() {
    this.filter.expiredIn = 0;
    this.refreshView();
  }

  /** 数量调整 */
  increaseSelected(item: Item) {
    if (item.selectedQty < item.qty) item.selectedQty++;
  }

  decreaseSelected(item: Item) {
    if (item.selectedQty > 0) item.selectedQty--;
  }

  /** 弹窗逻辑 */
  openConfirm(item: Item, action: 'used' | 'meal' | 'donate' | 'edit') {
    console.log('🟢 openConfirm', item.name, 'action:', action, 'selectedQty:', item.selectedQty);
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

    if (this.confirmAction === 'used' || this.confirmAction === 'meal') {
      const targetItem = this.confirmItem; // ✅ 保存引用
      const newQty = Math.max(0, targetItem.qty - targetItem.selectedQty);

      this.browseService.updateFoodQty(targetItem._id, newQty).subscribe({
        next: (updatedFood) => {
          // ✅ 更新当前 item
          targetItem.qty = updatedFood.qty;
          targetItem.selectedQty = 0;

          // ✅ 同步 rawFoods
          const idx = this.rawFoods.findIndex(f => f._id === targetItem._id);
          if (idx !== -1) {
            this.rawFoods[idx].qty = updatedFood.qty;
          }

          console.log(`✅ ${targetItem.name} 剩余数量更新为 ${updatedFood.qty}`);

          this.refreshView(); // 🔄 重新渲染 UI
        },
        error: err => console.error('❌ Error updating quantity:', err)
      });

    }

    this.closeConfirm(); // ✅ 现在关闭弹窗不会影响 targetItem
  }


  /** 过期计算 */
  getRemainingDays(expiryDate: string): number {
    if (!expiryDate) return 0;
    const exp = new Date(expiryDate);
    if (isNaN(exp.getTime())) return 0;
    const today = new Date();
    return Math.ceil(
      (exp.getTime() - today.getTime()) / (1000 * 3600 * 24)
    );
  }

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

  private autoExpireItem(item: Item) {
    if (item.source === 'expired' || this.expiredSet.has(item._id)) return;
    this.expiredSet.add(item._id);

    this.browseService.updateFoodStatus(item._id, 'expired').subscribe({
      next: () => {
        item.qty = 0;
        console.log(`⚠️ ${item.name} 已过期 → 数量设为 0`);
      },
      error: (err) => console.error('❌ 自动过期失败:', err),
    });
  }
}
