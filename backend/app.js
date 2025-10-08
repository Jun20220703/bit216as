require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const browseFoodRoutes = require('./routes/browseFood');

// Connect to MongoDB Atlas
mongoose.connect("mongodb+srv://kkjhhyu0405:kjh030407@cluster0.chogk.mongodb.net/foodShield?retryWrites=true&w=majority", {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 60000,
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
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
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/browse', browseFoodRoutes);


// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Food Shield API Server is running!' });
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
