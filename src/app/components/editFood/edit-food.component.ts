import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FoodService } from '../../services/food.service';

@Component({
  selector: 'app-edit-food',
  standalone: true,
  templateUrl: './edit-food.component.html',
  styleUrls: ['./edit-food.component.css'],
  imports: [CommonModule, SidebarComponent, ReactiveFormsModule]
})
export class EditFoodComponent implements OnInit {
  foodForm!: FormGroup;
  foodId!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private foodService: FoodService
  ) {}

  ngOnInit() {
    // 1️⃣ ルートからfoodIdを取得
    this.foodId = this.route.snapshot.paramMap.get('id')!;

    // 2️⃣ フォーム初期化
    this.foodForm = this.fb.group({
      name: ['', Validators.required],
      qty: ['', [Validators.required, Validators.min(1)]],
      expiry: ['', Validators.required],
      category: ['', Validators.required],
      storage: ['', Validators.required]
    });

    // 3️⃣ APIから既存の食品データを取得してフォームにセット
    this.foodService.getFoodById(this.foodId).subscribe({
      next: (food) => {
        this.foodForm.patchValue({
          name: food.name,
          qty: food.qty,
          expiry: food.expiry?.split('T')[0], // 日付形式調整（"2025-10-10"）
          category: food.category,
          storage: food.storage
        });
      },
      error: (err) => {
        console.error('Error loading food:', err);
      }
    });
  }

  // 4️⃣ 更新ボタン
  saveFood() {
    if (this.foodForm.invalid) return;

    const updatedFood = this.foodForm.value;

    this.foodService.updateFood(this.foodId, updatedFood).subscribe({
      next: () => {
        alert('✅ Food item updated successfully!');
        this.router.navigate(['/manage-inventory']);
      },
      error: (err) => {
        console.error('Error updating food:', err);
      }
    });
  }

  // 5️⃣ キャンセルボタン
  cancel() {
    this.router.navigate(['/manage-inventory']);
  }
}
