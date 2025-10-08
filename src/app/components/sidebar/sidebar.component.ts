import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,  // standalone so it can be imported
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [RouterModule]
})
export class SidebarComponent {
  username = 'junkaiyane';
}
