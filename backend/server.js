import FoodItem from './models/Food Item';

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 데이터베이스 연결
connectDB();

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트
app.use('/api/users', require('./routes/users'));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Food Shield API Server is running!' });
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 핸들링
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// ✅ 食品リストを取得
app.get("/api/foods", async (req, res) => {
  const foods = await FoodItem.find();
  res.json(foods);
});

// ✅ 食品を追加
app.post("/api/foods", async (req, res) => {
  try {
    const food = new FoodItem(req.body);
    await food.save();
    res.status(201).json(food);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ 食品を削除
app.delete("/api/foods/:id", async (req, res) => {
  await FoodItem.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
});

