import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [RouterModule, CommonModule]
})
export class SidebarComponent implements OnInit {
  username = 'junkaiyane';
  profilePhoto: string = 'assets/avatar.png'; // 기본 아바타

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadUserProfile();

    // ✅ 定时检测用户信息更新（2秒一次）
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.loadUserProfile();
      }, 2000);
    }
  }

  /** ✅ 安全加载用户信息，避免 SSR 报错 */
  loadUserProfile() {
    // ⚙️ SSR 环境防护：Node.js 下没有 localStorage
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('⚠️ localStorage not available (SSR mode). Skipping profile load.');
      return;
    }

    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const newUsername = user.name || 'User';
        const newProfilePhoto = user.profilePhoto || 'assets/avatar.png';

        // 仅在变化时更新视图
        if (this.username !== newUsername || this.profilePhoto !== newProfilePhoto) {
          this.username = newUsername;
          this.profilePhoto = newProfilePhoto;
          this.cdr.detectChanges();
        }
      }
    } catch (error) {
      console.error('❌ Error loading user profile from localStorage:', error);
    }
  }

  /** 图片加载失败回退 */
  onImageError(event: any) {
    event.target.src = 'assets/avatar.png';
  }
}
