const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateVerificationCode, sendPasswordRecoveryEmail } = require('../services/emailService');

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, householdSize, dateOfBirth } = req.body;

    // 필수 필드 검증
    if (!name || !email || !password || !dateOfBirth) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, email, password, and dateOfBirth are required' 
      });
    }

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // 비밀번호 해싱
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 새 사용자 생성
    const user = new User({
      name,
      email,
      password: hashedPassword,
      householdSize: householdSize || undefined,
      dateOfBirth: new Date(dateOfBirth)
    });

    await user.save();

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        householdSize: user.householdSize,
        dateOfBirth: user.dateOfBirth
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 사용자 찾기
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        householdSize: user.householdSize,
        dateOfBirth: user.dateOfBirth,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// 사용자 정보 조회
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

// 사용자 정보 업데이트
router.put('/profile/:userId', async (req, res) => {
  try {
    console.log('Profile update request received:', {
      userId: req.params.userId,
      body: req.body
    });
    
    const { name, householdSize, dateOfBirth, preferences, password, profilePhoto } = req.body;
    
    // 업데이트할 데이터 준비
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (householdSize !== undefined) {
      updateData.householdSize = householdSize === null ? null : householdSize;
    }
    if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth);
    if (preferences !== undefined) updateData.preferences = preferences;
    if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;
    
    console.log('Update data prepared:', updateData);
    
    // 비밀번호가 제공된 경우 해싱
    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Profile update failed', error: error.message });
  }
});

// 비밀번호 복구 이메일 전송
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // 사용자 찾기
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // 6자리 인증번호 생성
    const verificationCode = generateVerificationCode();
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10분 후 만료

    // 사용자 정보에 인증번호 저장
    user.passwordReset = {
      verificationCode,
      codeExpires,
      isVerified: false
    };
    await user.save();

    // 이메일 전송
    const emailResult = await sendPasswordRecoveryEmail(email, verificationCode);
    
    if (emailResult.success) {
      res.json({ 
        message: 'Password recovery email sent successfully',
        email: email // 보안을 위해 이메일 주소만 반환
      });
    } else {
      // 이메일 전송 실패 시 인증번호 정보 삭제
      user.passwordReset = {
        verificationCode: null,
        codeExpires: null,
        isVerified: false
      };
      await user.save();
      
      res.status(500).json({ 
        message: 'Failed to send recovery email. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Password recovery failed', error: error.message });
  }
});

// 인증번호 확인
router.post('/verify-code', async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // 사용자 찾기
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // 인증번호 확인
    if (!user.passwordReset.verificationCode || 
        user.passwordReset.verificationCode !== verificationCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // 만료 시간 확인
    if (new Date() > user.passwordReset.codeExpires) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    // 인증 성공으로 표시
    user.passwordReset.isVerified = true;
    await user.save();

    res.json({ message: 'Verification code is valid' });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ message: 'Code verification failed', error: error.message });
  }
});

// 비밀번호 재설정
router.post('/reset-password', async (req, res) => {
  try {
    const { email, verificationCode, newPassword } = req.body;

    if (!email || !verificationCode || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // 사용자 찾기
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // 인증번호 및 인증 상태 확인
    if (!user.passwordReset.verificationCode || 
        user.passwordReset.verificationCode !== verificationCode ||
        !user.passwordReset.isVerified) {
      return res.status(400).json({ message: 'Invalid or unverified code' });
    }

    // 만료 시간 확인
    if (new Date() > user.passwordReset.codeExpires) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    // 새 비밀번호 해싱
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 비밀번호 업데이트 및 인증 정보 초기화
    user.password = hashedPassword;
    user.passwordReset = {
      verificationCode: null,
      codeExpires: null,
      isVerified: false
    };
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Password reset failed', error: error.message });
  }
});

// 테스트 라우트
router.get('/test', (req, res) => {
  res.json({ message: 'Users API is working!', timestamp: new Date().toISOString() });
});

module.exports = router;
