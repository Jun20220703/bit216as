import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-verification',
  standalone: true,
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.css'],
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class VerificationComponent implements OnInit, OnDestroy {
  verificationCode: string = '';
  isVerifyingCode: boolean = false;
  verificationMessage: string = '';
  verificationSuccess: boolean = false;
  verificationTimeLeft: number = 120; // 2분 = 120초
  verificationTimer: any = null;
  userEmail: string = '';
  tempToken: string = '';
  formattedTime: string = '02:00';

  constructor(
    private router: Router, 
    private route: ActivatedRoute, 
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    console.log('VerificationComponent initialized');
    
    // URL에서 토큰과 이메일 정보 가져오기
    this.route.queryParams.subscribe(params => {
      console.log('All URL params:', params);
      
      this.tempToken = params['token'] || '';
      this.userEmail = params['email'] || '';
      
      console.log('Token from URL:', this.tempToken);
      console.log('Email from URL:', this.userEmail);
      console.log('Token type:', typeof this.tempToken);
      console.log('Token empty?', this.tempToken === '');
      
      // 타이머는 한 번만 시작
      setTimeout(() => {
        this.startVerificationTimer();
      }, 100);
      
      if (this.tempToken && this.tempToken.trim() !== '') {
        this.performTemporaryLogin(this.tempToken);
      } else {
        console.log('No valid token found');
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    console.log('=== COMPONENT DESTROY ===');
    this.stopVerificationTimer();
  }

  // Temporary login from email link
  performTemporaryLogin(token: string) {
    console.log('Performing temporary login with token:', token);
    console.log('Token length:', token.length);
    console.log('API URL:', `http://localhost:5001/api/users/temp-login/${token}`);
    
    this.http.get(`http://localhost:5001/api/users/temp-login/${token}`)
      .subscribe({
        next: (response: any) => {
          console.log('Temporary login successful:', response);
          this.userEmail = response.user.email || '';
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Temporary login failed:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.error?.message);
          // 오류가 발생해도 사용자 이메일을 URL에서 가져와서 설정
          this.userEmail = this.userEmail || 'user@example.com';
          this.cdr.detectChanges();
        }
      });
  }

  // Verification methods
  onVerifyCode() {
    if (!this.verificationCode || this.verificationCode.length !== 6) {
      this.verificationMessage = 'Please enter a valid 6-digit verification code.';
      this.verificationSuccess = false;
      this.cdr.detectChanges();
      return;
    }

    this.isVerifyingCode = true;
    this.verificationMessage = '';
    this.cdr.detectChanges();


    // Verify the code with backend
    this.http.post('http://localhost:5001/api/users/verify-2fa-code', {
      email: this.userEmail,
      verificationCode: this.verificationCode
    }).subscribe({
      next: (response: any) => {
        console.log('2FA verification successful:', response);
        this.isVerifyingCode = false;
        this.verificationSuccess = true;
        this.verificationMessage = 'Verification is successful!';
        this.stopVerificationTimer();
        
        // Set flag to indicate verification is complete
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('2faVerificationComplete', 'true');
        }
        
        // UI 업데이트를 즉시 실행
        this.cdr.detectChanges();
        
        // 메시지를 alert로도 표시하여 확실히 보이게 함
        alert('Verification is successful!');
        
        // 메시지가 표시되도록 충분한 시간을 기다린 후 리다이렉트
        setTimeout(() => {
          console.log('Redirecting to home page...');
          this.router.navigate(['/home']);
        }, 2000);
      },
      error: (error) => {
        console.error('2FA verification failed:', error);
        this.isVerifyingCode = false;
        this.verificationSuccess = false;
        this.verificationMessage = 'This is invalid verification code. Try again.';
        this.cdr.detectChanges();
      }
    });
  }

  onCancelVerification() {
    console.log('=== CANCEL VERIFICATION ===');
    console.log('Current timer:', this.verificationTimer);
    
    // 타이머 강제 정리
    if (this.verificationTimer) {
      console.log('Clearing timer:', this.verificationTimer);
      clearInterval(this.verificationTimer);
      this.verificationTimer = null;
      console.log('Timer cleared successfully');
    } else {
      console.log('No timer to clear');
    }
    
    // 로그인 페이지로 이동
    this.router.navigate(['/login']);
  }

  // Timer methods
  startVerificationTimer() {
    console.log('=== START VERIFICATION TIMER ===');
    console.log('Current timer before start:', this.verificationTimer);
    
    // 기존 타이머가 있다면 먼저 정리
    if (this.verificationTimer) {
      console.log('Stopping existing timer before starting new one');
      clearInterval(this.verificationTimer);
      this.verificationTimer = null;
    }
    
    // 타이머 초기화
    this.verificationTimeLeft = 120; // 2분으로 리셋
    this.formattedTime = this.getFormattedTime();
    
    this.verificationTimer = setInterval(() => {
      this.verificationTimeLeft--;
      this.formattedTime = this.getFormattedTime();
      
      // UI 업데이트를 강제로 실행
      this.ngZone.run(() => {
        this.cdr.markForCheck();
      });
      
      if (this.verificationTimeLeft <= 0) {
        this.stopVerificationTimer();
        this.onVerificationTimeout();
      }
    }, 1000);
    
    console.log('New timer started:', this.verificationTimer);
  }

  stopVerificationTimer() {
    console.log('=== STOP VERIFICATION TIMER ===');
    console.log('Current timer before stop:', this.verificationTimer);
    
    if (this.verificationTimer) {
      console.log('Stopping verification timer:', this.verificationTimer);
      clearInterval(this.verificationTimer);
      this.verificationTimer = null;
      console.log('Timer stopped successfully');
    } else {
      console.log('No timer to stop');
    }
  }

  forceStopTimer() {
    console.log('=== FORCE STOP TIMER ===');
    // verification 타이머만 정리
    if (this.verificationTimer) {
      console.log('Force clearing verification timer:', this.verificationTimer);
      clearInterval(this.verificationTimer);
      this.verificationTimer = null;
    }
    
    console.log('Verification timer stopped');
  }

  onVerificationTimeout() {
    this.verificationMessage = 'Verification code has expired. Please request a new one.';
    this.verificationSuccess = false;
    this.cdr.detectChanges();
  }

  getFormattedTime(): string {
    const minutes = Math.floor(this.verificationTimeLeft / 60);
    const seconds = this.verificationTimeLeft % 60;
    const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return formatted;
  }

}
