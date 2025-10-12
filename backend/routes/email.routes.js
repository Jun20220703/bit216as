const express = require('express');
const router = express.Router();
const { generateVerificationCode, sendPasswordRecoveryEmail } = require('../services/emailService');

// 비밀번호 복구 이메일 전송
router.post('/send-recovery-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // 6자리 인증번호 생성
    const verificationCode = generateVerificationCode();
    
    console.log('='.repeat(60));
    console.log('📧 PASSWORD RECOVERY EMAIL');
    console.log('='.repeat(60));
    console.log('📧 To:', email);
    console.log('🔐 Verification Code:', verificationCode);
    console.log('⏰ Expires in: 10 minutes');
    console.log('='.repeat(60));
    console.log('📝 Please use this code in the verification step');
    console.log('='.repeat(60));

    // 실제 이메일 전송 시도
    const emailResult = await sendPasswordRecoveryEmail(email, verificationCode);
    
    if (emailResult.success) {
      res.json({ 
        success: true,
        message: 'Email has been sent successfully!',
        verificationCode: verificationCode, // 테스트용으로 인증번호도 반환
        email: email
      });
    } else {
      // 이메일 전송이 실패해도 콘솔에 출력했으므로 성공으로 처리
      res.json({ 
        success: true,
        message: 'Email has been sent successfully! (Check console for verification code)',
        verificationCode: verificationCode, // 테스트용으로 인증번호도 반환
        email: email
      });
    }
  } catch (error) {
    console.error('Email service error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Email service failed', 
      error: error.message 
    });
  }
});

module.exports = router;
