require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

/* 引入路由 */
const foodRoutes = require('./routes/foodRoutes');       // Foods CRUD
const browseFood = require('./routes/browseFood');       // 浏览只读
const userRoutes = require('./routes/users');            // 用户管理
const donationRoutes = require('./routes/donationRoutes'); // 捐赠管理

const app = express();
const PORT = process.env.PORT || 5001;

/* ======================
   MongoDB 连接
====================== */
mongoose.connect(
  "mongodb+srv://kkjhhyu0405:kjh030407@cluster0.chogk.mongodb.net/foodShield?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    dbName: 'foodShield'
  }
)
.then(() => console.log('✅ MongoDB Atlas connect successfully!'))
.catch((error) => {
  console.log('❌ MongoDB connection Fail:', error);
});

/* ======================
   Middleware
====================== */
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ======================
   Routes
====================== */

// 调试中间件：打印所有 /api/foods 的请求
app.use('/api/foods', (req, res, next) => {
  console.log("👉 Hit /api/foods route:", req.method, req.originalUrl);
  next();
}, foodRoutes);

app.use('/api/users', userRoutes);         
app.use('/api/browse', browseFood);        
app.use('/api/donations', donationRoutes); 

// 基础测试路由
app.get('/', (req, res) => {
  res.json({ message: 'Food Shield API Server is running!' });
});

/* ======================
   Error Handling
====================== */
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

/* ======================
   Start Server
====================== */
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
