import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FoodService } from '../../services/food.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-food-item',
  standalone: true,
  templateUrl: './add-food-item.component.html',
  styleUrls: ['./add-food-item.component.css'],
  imports: [CommonModule, FormsModule, SidebarComponent, ReactiveFormsModule]
})


export class AddFoodItemComponent {
  foodForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private foodService: FoodService, 
    private router: Router,
  ){

    this.foodForm = this.fb.group({
      name: ['', Validators.required],
      qty: ['', Validators.required],
      expiry: ['', Validators.required],
      category: ['', Validators.required],
      storage: ['', Validators.required],
      notes: ['']
    });
  }

  saveFood() {
    console.log('Save button clicked');
    if(this.foodForm.invalid){
      this.foodForm.markAllAsTouched();
      return;
    }

    this.foodService.addFood(this.foodForm.value).subscribe({
      next: (res) =>{
        console.log('Food saved Successfully:', res);
        this.router.navigate(['/manage-inventory']);
      },
      error: (err) =>{
        console.log('Error saving food:', err);
        alert('Failed to save item. Check backend connection.');
      }
    });
  }

  cancel() {
    this.router.navigate(['/manage-inventory']);
  }
}
