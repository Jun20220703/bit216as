import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ManageFoodInventory } from '../manageFoodInventory/manage-inventory.component';
@Component({
  selector: 'app-sidebar',
  standalone: true,  // standalone so it can be imported
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [RouterModule, CommonModule]
})
export class SidebarComponent implements OnInit {
  username = 'User';
  profilePhoto: string = ''; // 프로필 사진이 없을 때는 빈 문자열

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadUserProfile();
    
    // 주기적으로 사용자 데이터 확인 (간단한 방법)
    setInterval(() => {
      this.loadUserProfile();
    }, 2000); // 2초마다 확인
  }

  loadUserProfile() {
    // localStorage에서 사용자 정보 로드
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const newUsername = user.name || 'User';
        const newProfilePhoto = user.profilePhoto || '';
        
        // 변경사항이 있을 때만 업데이트
        if (this.username !== newUsername || this.profilePhoto !== newProfilePhoto) {
          this.username = newUsername;
          this.profilePhoto = newProfilePhoto;
          this.cdr.detectChanges();
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }

  onImageError(event: any) {
    // 이미지 로드 실패 시 프로필 사진을 숨김
    this.profilePhoto = '';
    this.cdr.detectChanges();
  }
}
