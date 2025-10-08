import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';

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
  constructor(private cdr: ChangeDetectorRef) {}

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

  /** 过滤状态（categories 为动态使用，all=true 表示不过滤） */
  filter = {
    donation: false,
    inventory: true,
    categories: { all: true, fruit: true, vegetable: true, meat: true, carb: true },
    expiredIn: 0
  };

  /** 视图数据 */
  viewLocs: Location[] = [];

  /** Demo 数据 */
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
    },
    {
      name: 'Freezer',
      categories: [
        {
          name: 'Vegetable', key: 'vegetable', colorClass: 'fruit', icon: '🥦',
          items: [
            { name: 'Broccoli', remaining: 3, selectedQty: 0, source: 'inventory' }
          ]
        }
      ]
    },
    {
      name: 'Shelf',
      categories: [
        {
          name: 'Carbohydrates', key: 'carb', colorClass: 'carb', icon: '🍞',
          items: [
            { name: 'Pasta', remaining: 6, selectedQty: 0, source: 'donation' }
          ]
        }
      ]
    }
  ];

  ngOnInit() { this.refreshView(); }

  /** 可用 Storage Locations（随 Source 动态） */
  get availableLocations(): string[] {
    const set = new Set<string>();
    this.data.forEach(loc => {
      const has = loc.categories.some(cat =>
        cat.items.some(i => this.matchSource(i.source))
      );
      if (has) set.add(loc.name);
    });
    return Array.from(set);
  }

  /** 可用 Categories（随 Source 动态） */
  get availableCategories() {
    const list: { key: CategoryKey, name: string }[] = [];
    const exists = new Set<CategoryKey>();

    this.data.forEach(loc => {
      loc.categories.forEach(cat => {
        const hasMatchingItem = cat.items.some(i => this.matchSource(i.source));
        if (hasMatchingItem && !exists.has(cat.key)) {
          exists.add(cat.key);
          list.push({ key: cat.key, name: cat.name });
        }
      });
    });
    return list;
  }

  /** 根据当前 Source 判断 item 是否可见 */
  private matchSource(source: Item['source']) {
    if (this.filter.inventory && !this.filter.donation) return source === 'inventory';
    if (this.filter.donation && !this.filter.inventory) return source === 'donation';
    return true; // 都选或未限定 → 全部
  }

  refreshView() {
    this.viewLocs = this.computeFilteredLocations();

    // 如果当前选中的 Location 在可用列表里不存在，自动回退到 All
    if (this.selectedLocation !== 'All' && !this.availableLocations.includes(this.selectedLocation)) {
      this.selectedLocation = 'All';
      this.viewLocs = this.computeFilteredLocations();
    }

    this.cdr.detectChanges();
  }

  private computeFilteredLocations(): Location[] {
    // 先按 Location 过滤（All = 不过滤）
    let locs = this.selectedLocation === 'All'
      ? this.data
      : this.data.filter(l => l.name === this.selectedLocation);

    // 按 Category 复选过滤（All = 不过滤）
    locs = locs.map(loc => ({
      ...loc,
      categories: loc.categories.filter(cat =>
        this.filter.categories.all || (this.filter.categories as any)[cat.key] === true
      )
    }));

    // 按 Source 过滤 + 清空空分类
    locs = locs.map(loc => ({
      ...loc,
      categories: loc.categories.map(cat => ({
        ...cat,
        items: cat.items.filter(i => this.matchSource(i.source))
      })).filter(cat => cat.items.length > 0)
    })).filter(loc => loc.categories.length > 0);

    // 搜索（按名称）
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

    // （可选）ExpiredIn：示例数据没有到期日，若你加了字段，可在此处补充过滤

    return locs;
  }

  /** UI 切换 */
  toggleFilterPanel() { this.showFilter = !this.showFilter; }
  toggleSearchBar() {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) { this.searchQuery = ''; this.refreshView(); }
  }

  /** Source 单选切换 */
  toggleSource(source: 'donation' | 'inventory') {
    this.selectedSource = source;
    this.filter.donation = source === 'donation';
    this.filter.inventory = source === 'inventory';

    // 标题
    this.viewTitle = (source === 'inventory') ? 'Inventory' : 'Donation List';

    // 当 Source 变化时，若当前 Location 在新 Source 下不可用，回到 All
    if (this.selectedLocation !== 'All' && !this.availableLocations.includes(this.selectedLocation)) {
      this.selectedLocation = 'All';
    }

    // 当 Source 变化时，让 “All” 真正包含当前 availableCategories
    // （可选）如果你希望保留之前勾选，移除此行。
    this.filter.categories.all = true;

    this.refreshView();
  }

  /** Category 勾选（支持动态 key） */
  toggleCategory(category: CategoryKey) {
    if (category === 'all') {
      const enabled = !this.filter.categories.all;
      // 将当前“可用分类”全部同步到 filter.categories
      const currentKeys = this.availableCategories.map(c => c.key);
      currentKeys.forEach(k => (this.filter.categories as any)[k] = enabled);
      this.filter.categories.all = enabled;
    } else {
      // 若 key 不存在，先初始化
      if ((this.filter.categories as any)[category] === undefined) {
        (this.filter.categories as any)[category] = true;
      }
      (this.filter.categories as any)[category] = !(this.filter.categories as any)[category];
      this.filter.categories.all = false;
    }
    this.refreshView();
  }

  /** 数量增减 */
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
