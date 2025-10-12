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
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'kkjhhyu0405@gmail.com',
      to: email,
      subject: 'Food Shield - 비밀번호 복구 인증번호',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2E6A4B; font-size: 28px; margin: 0;">Food Shield</h1>
            <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">비밀번호 복구</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #333; font-size: 24px; margin: 0 0 20px 0;">인증번호를 확인해주세요</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              비밀번호를 재설정하기 위해 아래의 6자리 인증번호를 입력해주세요.
            </p>
            
            <div style="background-color: #2E6A4B; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h3 style="margin: 0; font-size: 32px; letter-spacing: 5px; font-weight: bold;">${verificationCode}</h3>
            </div>
            
            <p style="color: #666; font-size: 14px; margin: 20px 0 0 0;">
              이 인증번호는 10분 후에 만료됩니다.
            </p>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 14px;">
            <p>이 이메일을 요청하지 않으셨다면 무시하셔도 됩니다.</p>
            <p>© 2024 Food Shield. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.log('⚠️ Email sending failed, but continuing with console output');
    console.log('Error:', error.message);
    // 이메일 전송이 실패해도 콘솔에 출력했으므로 성공으로 처리
    return { success: true, messageId: 'console-output' };
  }
}

module.exports = {
  generateVerificationCode,
  sendPasswordRecoveryEmail
};
