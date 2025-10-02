import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,   // ← add this
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  username = 'junkaiyane';
}
