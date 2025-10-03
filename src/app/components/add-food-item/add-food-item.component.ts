import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-food-item',
  standalone: true,
  templateUrl: './add-food-item.component.html',
  styleUrls: ['./add-food-item.component.css'],
  imports: [CommonModule, FormsModule]
})
export class AddFoodItemComponent {
  item = { name: '', qty: 0, expiry: '', category: '', storage: '', notes: '' };

  saveItem() {
    console.log('New Item:', this.item);
    // TODO: DB 保存処理
  }

  cancel() {
    history.back(); // ひとつ前のページに戻る
  }
}
