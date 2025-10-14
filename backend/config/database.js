const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB Atlas 연결 문자열 (기본)
    const mongoURI = "mongodb+srv://kkjhhyu0405:kjh030407@cluster0.chogk.mongodb.net/foodShield?retryWrites=true&w=majority";
    
    // 로컬 MongoDB 연결 문자열 (대안)
    const localMongoURI = "mongodb://localhost:27017/foodShield";
    
    // 환경변수로 MongoDB URI 선택
    const selectedURI = process.env.MONGODB_URI || mongoURI;
    
    console.log('Attempting to connect to MongoDB...');
    console.log('Using URI:', selectedURI.replace(/\/\/.*@/, '//***:***@')); // 비밀번호 숨김
    
    const conn = await mongoose.connect(selectedURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Detailed error information:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    
    // MongoDB Atlas 연결 실패 시 로컬 MongoDB 시도
    if (error.message.includes('Atlas') || error.message.includes('whitelist')) {
      console.log('🔄 Trying local MongoDB as fallback...');
      try {
        const localConn = await mongoose.connect("mongodb://localhost:27017/foodShield", {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log(`✅ Local MongoDB Connected: ${localConn.connection.host}`);
      } catch (localError) {
        console.error('❌ Local MongoDB also failed:', localError.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
