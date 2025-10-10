import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';

interface DayInfo {
  name: string;
  date: number;
  fullDate: Date;
}

interface InventoryItem {
  name: string;
  quantity: number;
  category: string;
  marked: boolean;
  expiry: string;
}

@Component({
  selector: 'app-plan-weekly-meal',
  standalone: true,
  templateUrl: './planWeeklyMeal.component.html',
  styleUrls: ['./planWeeklyMeal.component.css'],
  imports: [CommonModule, FormsModule, SidebarComponent]
})
export class PlanWeeklyMealComponent implements OnInit {
  currentMonth: string = 'September';
  weekDays: DayInfo[] = [];
  mealTypes: string[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  
  searchTerm: string = '';
  selectedItemIndex: number = -1;
  
  inventory: InventoryItem[] = [
    {
      name: 'Apple',
      quantity: 4,
      category: 'Fruit',
      marked: false,
      expiry: '12/11/2025'
    },
    {
      name: 'Avocado',
      quantity: 6,
      category: 'Fruit',
      marked: false,
      expiry: '25/11/2025'
    },
    {
      name: 'Banana',
      quantity: 2,
      category: 'Fruit',
      marked: false,
      expiry: '30/9/2025'
    },
    {
      name: 'Broccoli',
      quantity: 3,
      category: 'Vegetable',
      marked: false,
      expiry: '17/10/2025'
    },
    {
      name: 'Chicken',
      quantity: 3,
      category: 'Meat',
      marked: true,
      expiry: '19/9/2025'
    }
  ];
  
  filteredInventory: InventoryItem[] = [];

  constructor() {}

  ngOnInit() {
    this.initializeWeekDays();
    this.filteredInventory = [...this.inventory];
  }

  initializeWeekDays() {
    const today = new Date();
    const currentDay = today.getDay();
    
    // Get the start of the current week (Saturday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay - 1);
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      
      this.weekDays.push({
        name: dayNames[day.getDay()],
        date: day.getDate(),
        fullDate: day
      });
    }
    
    // Update month name
    this.currentMonth = startOfWeek.toLocaleString('default', { month: 'long' });
  }

  previousWeek() {
    const firstDay = this.weekDays[0].fullDate;
    firstDay.setDate(firstDay.getDate() - 7);
    this.initializeWeekDays();
  }

  nextWeek() {
    const firstDay = this.weekDays[0].fullDate;
    firstDay.setDate(firstDay.getDate() + 7);
    this.initializeWeekDays();
  }

  previousDay() {
    const firstDay = this.weekDays[0].fullDate;
    firstDay.setDate(firstDay.getDate() - 1);
    this.initializeWeekDays();
  }

  nextDay() {
    const firstDay = this.weekDays[0].fullDate;
    firstDay.setDate(firstDay.getDate() + 1);
    this.initializeWeekDays();
  }

  filterInventory() {
    if (!this.searchTerm.trim()) {
      this.filteredInventory = [...this.inventory];
    } else {
      this.filteredInventory = this.inventory.filter(item =>
        item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  toggleFilter() {
    // Toggle filter functionality can be implemented here
    console.log('Filter toggled');
  }

  selectItem(index: number) {
    this.selectedItemIndex = index;
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Fruit': '🍎',
      'Vegetable': '🥬',
      'Meat': '🥩',
      'Dairy': '🥛',
      'Grains': '🌾',
      'Other': '📦'
    };
    return icons[category] || '📦';
  }
}

