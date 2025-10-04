const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB Atlas 연결 문자열
    const mongoURI = "mongodb+srv://kkjhhyu0405:kjh030407@cluster0.chogk.mongodb.net/foodShield?retryWrites=true&w=majority";
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.error('Detailed error information:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    process.exit(1);
  }
};

module.exports = connectDB;
