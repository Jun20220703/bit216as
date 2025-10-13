import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../sidebar/sidebar.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  templateUrl: './homePage.component.html',
  styleUrls: ['./homePage.component.css'],
  imports: [CommonModule, RouterModule, SidebarComponent]
})
export class HomePageComponent implements OnInit {
  showWelcomeMessage: boolean = false;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.checkForNewUser();
  }

  ngOnInit() {
    this.checkForNewUser();
  }

  checkForNewUser() {
    // URL 파라미터나 localStorage에서 새 사용자 여부 확인
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const isNewUser = urlParams.get('newUser') === 'true';
      
      console.log('Checking for new user:', { isNewUser, url: window.location.href });
      
      if (isNewUser) {
        // 새 사용자인 경우 환영 메시지 표시
        this.showWelcomeMessage = true;
        console.log('Showing welcome message for new user');
        
        // URL에서 newUser 파라미터 제거 (새로고침 시 중복 표시 방지)
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      }
    }
  }

  goToAccountSettings() {
    this.router.navigate(['/account-settings'], { queryParams: { tab: 'privacy' } });
    this.dismissWelcomeMessage();
  }

  dismissWelcomeMessage() {
    this.showWelcomeMessage = false;
    console.log('Welcome message dismissed');
  }

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
