const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  householdSize: {
    type: String, // Number에서 String으로 변경하여 "10+" 값 처리
    default: null,
    validate: {
      validator: function(v) {
        if (v === null || v === undefined || v === '') return true;
        return v === 'No-Selection' || v === '10+' || (parseInt(v) >= 1 && parseInt(v) <= 9);
      },
      message: 'Household size must be between 1-9, "10+", or "No-Selection"'
    }
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    privacy: {
      profileVisibility: { type: String, enum: ['public', 'private'], default: 'private' },
      dataSharing: { type: Boolean, default: false }
    }
  },
  passwordReset: {
    verificationCode: { type: String, default: null },
    codeExpires: { type: Date, default: null },
    isVerified: { type: Boolean, default: false }
  },
  twoFactorAuth: {
    verificationCode: { type: String, default: null },
    codeExpires: { type: Date, default: null },
    tempToken: { type: String, default: null },
    tempCode: { type: String, default: null },
    tempCodeExpires: { type: Date, default: null },
    isEnabled: { type: Boolean, default: false }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 업데이트 시 updatedAt 자동 갱신
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
