require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const foodRoutes = require('./routes/foodRoutes');
const browseFoodRoutes = require('./routes/browseFood');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// 데이터베이스 연결
connectDB();

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log(`MongoDB Atlas Connected: ${mongoose.connection.host}`))
  .catch((err) => console.error(err));

// 라우트
app.use('/api/users', require('./routes/users'));
app.use('/api/browse', browseFoodRoutes);
app.use('/api/foods', foodRoutes);

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

// --- API routes ---
app.post("/api/foods", async (req, res) => {
  try {
    console.log("📩 Received POST /api/foods:", req.body);
    const newFood = new Food(req.body);
    await newFood.save();
    res.status(201).json(newFood);
  } catch (error) {
    console.error("❌ Error saving food:", error);
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/foods", async (req, res) => {
  const foods = await Food.find();
  res.json(foods);
});
