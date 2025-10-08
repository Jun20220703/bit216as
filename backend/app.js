require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Food = require('./models/Food');
const foodRoutes = require('./routes/foodRoutes');   // 增删改查
const browseFood = require('./routes/browseFood');   // 只读浏览
const userRoutes = require('./routes/users');        // 用户相关
const donationRoutes = require('./routes/donationRoutes');



const app = express();
const PORT = process.env.PORT || 5001;

/* Connect to MongoDB Atlas */
mongoose.connect("mongodb+srv://kkjhhyu0405:kjh030407@cluster0.chogk.mongodb.net/foodShield?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  dbName: 'foodShield'
})
.then(() => {
  console.log('✅ MongoDB Atlas connect successfully!');
})
.catch((error) => {
  console.log('❌ MongoDB connection Fail:', error);
  console.log('Detailed error information:', {
    name: error.name,
    message: error.message,
    code: error.code
  });
});

/* Middleware */
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Routes */
app.use('/api/users', userRoutes);       // 用户路由
app.use('/api/foods', foodRoutes);       // 增删改查
app.use('/api/browse', browseFood);      // 浏览
app.use('/api/donations', donationRoutes);

// 基础测试路由
app.get('/', (req, res) => {
  res.json({ message: 'Food Shield API Server is running!' });
});

/* Error handling middleware */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

/* 404 handling */
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

/* Start server */
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
