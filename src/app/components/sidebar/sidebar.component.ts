import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,  // standalone so it can be imported
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  username = 'junkaiyane';
}
