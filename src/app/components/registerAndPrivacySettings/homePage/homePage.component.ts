import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '../../sidebar/sidebar.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  templateUrl: './homePage.component.html',
  styleUrls: ['./homePage.component.css'],
  imports: [CommonModule, RouterModule, SidebarComponent]
})
export class HomePageComponent {

  constructor(private router: Router) {}

  onLogout() {
    const confirmed = confirm('Are you sure to log out?');
    if (confirmed) {
      // 로그아웃 처리 (토큰 제거, 로그인 페이지로 이동 등)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      alert('You have been logged out successfully.');
      this.router.navigate(['/login']);
    }
    // 'No'를 누르면 아무것도 하지 않음 (취소)
  }
}
