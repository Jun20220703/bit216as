import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FoodService } from '../../services/food.service';
@Component({
  selector: 'app-donation-list',
  standalone: true,
  templateUrl: './donation-list.component.html',
  styleUrls: ['./donation-list.component.css'],
  imports: [CommonModule, SidebarComponent]
})
export class DonationListComponent implements OnInit{
    donations: any[] = [];

    constructor(private foodService: FoodService){}

    ngOnInit(){
        this.loadDonations();
    }

    loadDonations(){
        this.foodService.getDonations().subscribe({
            next:(data) => {
                this.donations = data;
                console.log('Donations loaded: ', data);
            },
            error: (err) =>{
                console.error('Error loading donations:', err);
            }
        });
    }
        
 
 

  edit(item: any) {
    console.log('Edit:', item);
  }

  delete(item: any) {
    console.log('Delete:', item);
  }
}
