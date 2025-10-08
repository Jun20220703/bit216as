require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Food = require('./models/Food');

const app = express();
const PORT = process.env.PORT;


/* Connect to MongoDB Atlas*/
mongoose.connect("mongodb+srv://kkjhhyu0405:kjh030407@cluster0.chogk.mongodb.net/foodShield?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  dbName: 'foodShield'  // Database name
})
.then(() => {
  console.log('MongoDB Atlas connect successfully!');
})
.catch((error) => {
  console.log('MongoDB connection Fail:', error);
  // Output detailed error information when connection fails
  console.log('Detailed error information:', {
    name: error.name,
    message: error.message,
    code: error.code
  });
});

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.options('/api/foods', cors());
// Routes
app.use('/api/users', require('./routes/users'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Food Shield API Server is running!' });
});


//Add item API
app.post('/api/foods', async (req, res) => {
  try{
    console.log("Received POST /api/foods:", req.body);
    const newFood = new Food(req.body);
    await newFood.save();
    res.status(201).json(newFood);
  } catch (error){
    console.error("Error savinf food:", error);
    res.status(400).json({message: error.message});
  }
});

app.get('/api/foods', async(req, res) => {
  try{
    const foods = await Food.find();
    res.json(foods);
  } catch (error){
    res.status(500).json({message: 'Error fetching foods',error});
  }
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handling
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});



