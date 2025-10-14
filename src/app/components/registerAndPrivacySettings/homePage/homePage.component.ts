import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from '../../sidebar/sidebar.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  templateUrl: './homePage.component.html',
  styleUrls: ['./homePage.component.css'],
  imports: [CommonModule, RouterModule, HttpClientModule, SidebarComponent]
})
export class HomePageComponent implements OnInit {
  showWelcomeMessage: boolean = false;

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient) {
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
      const show2FASetupMessage = localStorage.getItem('show2FASetupMessage');
      
      console.log('Checking for new user:', { isNewUser, url: window.location.href });
      console.log('Checking for 2FA setup message:', show2FASetupMessage);
      
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
      } else if (show2FASetupMessage === 'true') {
        // 2FA 설정 메시지가 있는 경우, 실제 2FA 상태를 확인
        this.check2FAStatus();
      }
    }
  }

  check2FAStatus() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.log('No userId found, not showing 2FA setup message');
      return;
    }

    console.log('Checking 2FA status for user:', userId);
    
    // 사용자의 2FA 상태를 백엔드에서 확인
    this.http.get(`http://localhost:5001/api/users/profile/${userId}`)
      .subscribe({
        next: (response: any) => {
          console.log('User profile response:', response);
          const twoFactorEnabled = response.twoFactorAuth?.isEnabled || false;
          console.log('2FA status from backend:', twoFactorEnabled);
          
          if (!twoFactorEnabled) {
            // 2FA가 비활성화된 경우에만 메시지 표시
            this.showWelcomeMessage = true;
            console.log('Showing 2FA setup message - 2FA not enabled');
          } else {
            console.log('2FA is enabled, not showing setup message');
          }
          
          // 플래그 제거
          localStorage.removeItem('show2FASetupMessage');
        },
        error: (error) => {
          console.error('Failed to check 2FA status:', error);
          // 오류가 발생해도 플래그는 제거
          localStorage.removeItem('show2FASetupMessage');
        }
      });
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
