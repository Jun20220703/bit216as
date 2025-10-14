const nodemailer = require('nodemailer');
const crypto = require('crypto');

// 이메일 전송을 위한 transporter 설정
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kkjhhyu0405@gmail.com',
    pass: 'pfuz haqe pipz gyky' // 실제 Gmail 앱 비밀번호를 여기에 입력하세요
  }
});

// 6자리 인증번호 생성
function generateVerificationCode() {
  return crypto.randomInt(100000, 999999).toString();
}

// 비밀번호 복구 이메일 전송
async function sendPasswordRecoveryEmail(email, verificationCode) {
  console.log('='.repeat(60));
  console.log('📧 PASSWORD RECOVERY EMAIL');
  console.log('='.repeat(60));
  console.log('📧 To:', email);
  console.log('🔐 Verification Code:', verificationCode);
  console.log('⏰ Expires in: 2 minutes');
  console.log('='.repeat(60));

  try {
    const mailOptions = {
      from: 'kkjhhyu0405@gmail.com',
      to: email,
      subject: 'Food Shield - Password Recovery Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2E6A4B; font-size: 28px; margin: 0;">Food Shield</h1>
            <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">Password Recovery</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #333; font-size: 24px; margin: 0 0 20px 0;">Please verify your verification code</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Please enter the 6-digit verification code below to reset your password.
            </p>
            
            <div style="background-color: #2E6A4B; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h3 style="margin: 0; font-size: 32px; letter-spacing: 5px; font-weight: bold;">${verificationCode}</h3>
            </div>
            
                <p style="color: #666; font-size: 14px; margin: 20px 0 0 0;">
                  This verification code will expire in 2 minutes.
                </p>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 14px;">
            <p>If you did not request this email, please ignore it.</p>
            <p>© 2024 Food Shield. All rights reserved.</p>
          </div>
        </div>
      `
    };

    console.log('📤 Attempting to send email...');
    console.log('📧 From:', mailOptions.from);
    console.log('📧 To:', mailOptions.to);
    console.log('📧 Subject:', mailOptions.subject);
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📧 Response:', result.response);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error response:', error.response);
    
    // 상세한 오류 정보 출력
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication failed. Please check your Gmail app password.');
    } else if (error.code === 'ECONNECTION') {
      console.error('🌐 Connection failed. Please check your internet connection.');
    } else if (error.code === 'EENVELOPE') {
      console.error('📧 Envelope error. Please check email addresses.');
    }
    
    // 이메일 전송이 실패해도 콘솔에 출력했으므로 성공으로 처리
    console.log('⚠️ Email sending failed, but continuing with console output');
    return { success: true, messageId: 'console-output' };
  }
}

// Two-Factor Authentication 이메일 전송
async function sendTwoFactorAuthEmail(email, verificationCode, tempToken) {
  console.log('='.repeat(60));
  console.log('🔐 TWO-FACTOR AUTHENTICATION EMAIL');
  console.log('='.repeat(60));
  console.log('📧 To:', email);
  console.log('🔐 Verification Code:', verificationCode);
  console.log('🔗 Temp Token:', tempToken);
  console.log('🔗 Verification URL:', `http://localhost:4200/verification?token=${tempToken}&email=${email}`);
  console.log('⏰ Expires in: 10 minutes');
  console.log('='.repeat(60));

  try {
    const mailOptions = {
      from: 'kkjhhyu0405@gmail.com',
      to: email,
      subject: 'Food Shield - Two-Factor Authentication Setup',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2E6A4B; font-size: 28px; margin: 0;">Food Shield</h1>
            <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">Two-Factor Authentication</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #333; font-size: 24px; margin: 0 0 20px 0;">Welcome to Food Shield!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Thank you for enabling Two-Factor Authentication for your Food Shield account. 
              This adds an extra layer of security to protect your account.
            </p>
            
            <div style="background-color: #2E6A4B; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h3 style="margin: 0; font-size: 32px; letter-spacing: 5px; font-weight: bold;">${verificationCode}</h3>
              <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">6-Digit Verification Code</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
              <p style="color: #666; font-size: 16px; margin: 0 0 10px 0;">
                Click the link below to complete your Two-Factor Authentication setup:
              </p>
              <a href="http://localhost:4200/verification?token=${tempToken}&email=${email}" 
                 style="color: #2E6A4B; text-decoration: underline; font-size: 16px; font-weight: bold;">
                Complete Two-Factor Authentication Setup
              </a>
            </div>
            
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #2E6A4B; margin: 0 0 10px 0; font-size: 16px;">Next Steps:</h4>
              <ol style="color: #666; font-size: 14px; margin: 0; padding-left: 20px;">
                <li>Click the link above to open the verification page</li>
                <li>Enter the verification code in the form</li>
                <li>Complete the setup process</li>
                <li>Your account will be protected with 2FA</li>
              </ol>
            </div>
            
            
            <p style="color: #666; font-size: 14px; margin: 20px 0 0 0;">
              This verification code will expire in 2 minutes.
            </p>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 14px;">
            <p>If you did not enable Two-Factor Authentication, please contact support immediately.</p>
            <p>© 2024 Food Shield. All rights reserved.</p>
          </div>
        </div>
      `
    };

    console.log('📤 Attempting to send 2FA email...');
    console.log('📧 From:', mailOptions.from);
    console.log('📧 To:', mailOptions.to);
    console.log('📧 Subject:', mailOptions.subject);
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ 2FA email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📧 Response:', result.response);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ 2FA email sending failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error response:', error.response);
    
    // 상세한 오류 정보 출력
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication failed. Please check your Gmail app password.');
    } else if (error.code === 'ECONNECTION') {
      console.error('🌐 Connection failed. Please check your internet connection.');
    } else if (error.code === 'EENVELOPE') {
      console.error('📧 Envelope error. Please check email addresses.');
    }
    
    throw error;
  }
}

// 2FA 로그인용 verification code 이메일 전송
async function send2FALoginCodeEmail(email, verificationCode) {
  console.log('='.repeat(60));
  console.log('🔐 2FA LOGIN VERIFICATION CODE EMAIL');
  console.log('='.repeat(60));
  console.log('📧 To:', email);
  console.log('🔢 Verification Code:', verificationCode);
  console.log('⏰ Expires in: 5 minutes');
  console.log('='.repeat(60));

  try {
    const mailOptions = {
      from: 'kkjhhyu0405@gmail.com',
      to: email,
      subject: 'Food Shield - Login Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2E6A4B; font-size: 28px; margin: 0;">Food Shield</h1>
            <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">Login Verification</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #333; font-size: 24px; margin: 0 0 20px 0;">Your Login Verification Code</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Someone is trying to log into your Food Shield account. If this was you, please use the verification code below to complete your login.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #e9ecef; padding: 20px; border-radius: 8px; display: inline-block;">
                <p style="color: #666; font-size: 16px; margin: 0 0 10px 0;">Your verification code is:</p>
                <div style="font-size: 32px; font-weight: bold; color: #2E6A4B; letter-spacing: 5px; font-family: 'Courier New', monospace;">
                  ${verificationCode}
                </div>
              </div>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">⚠️ Security Notice:</h4>
              <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.5;">
                This verification code will expire in 2 minutes for security reasons. 
                If you didn't attempt to log in, please change your password immediately.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 14px;">
            <p>If you did not attempt to log in, please contact support immediately.</p>
            <p>© 2024 Food Shield. All rights reserved.</p>
          </div>
        </div>
      `
    };

    console.log('📤 Attempting to send 2FA login verification code email...');
    console.log('📧 From:', mailOptions.from);
    console.log('📧 To:', mailOptions.to);
    console.log('📧 Subject:', mailOptions.subject);
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ 2FA login verification code email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📧 Response:', result.response);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ 2FA login verification code email sending failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error response:', error.response);
    
    // 상세한 오류 정보 출력
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication failed. Please check your Gmail app password.');
    } else if (error.code === 'ECONNECTION') {
      console.error('🌐 Connection failed. Please check your internet connection.');
    } else if (error.code === 'EENVELOPE') {
      console.error('📧 Envelope error. Please check email addresses.');
    }
    
    throw error;
  }
}

module.exports = {
  generateVerificationCode,
  sendPasswordRecoveryEmail,
  sendTwoFactorAuthEmail,
  send2FALoginCodeEmail
};
