const express = require('express');
const router = express.Router();
const Food = require('../models/Food');

// 调试中间件：打印进入 foodRoutes 的所有请求
router.use((req, res, next) => {
  console.log("🍔 foodRoutes got:", req.method, req.originalUrl);
  next();
});


// GET all foods
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { owner: userId } : {};
    const foods = await Food.find(filter);
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching foods', error: err.message });
  }
});

// POST new food
router.post('/', async (req, res) => {
  try {
    console.log("📥 Received new food:", req.body);
    const newFood = new Food(req.body);
    await newFood.save();
    res.status(201).json(newFood);
  } catch (err) {
    res.status(400).json({ message: 'Error saving food', error: err.message });
  }
});

// Debug route
router.put('/test', (req, res) => {
  console.log("✅ PUT /api/foods/test hit!");
  res.json({ message: "PUT /test works!" });
});


// PUT update food quantity
router.put('/:id', async (req, res) => {
  console.log("🛠 PUT /api/foods/:id ->", req.params.id, "qty:", req.body.qty);
  try {
    const { qty } = req.body;
    console.log("🛠 PUT /api/foods/:id triggered with:", req.params.id, "qty:", qty);
    const food = await Food.findByIdAndUpdate(
      req.params.id,
      { qty: Number(qty) },
      { new: true }
    );
    if (!food) return res.status(404).json({ message: 'Food not found' });
    res.json(food);
  } catch (err) {
    res.status(500).json({ message: 'Error updating qty', error: err.message });
  }
});

// PATCH update food status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    console.log(`🔄 PATCH status of ${req.params.id} -> ${status}`);
    const food = await Food.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!food) return res.status(404).json({ message: 'Food not found' });
    res.json(food);
  } catch (err) {
    res.status(500).json({ message: 'Error updating status', error: err.message });
  }
});

// DELETE a food
router.delete('/:id', async (req, res) => {
  try {
    console.log(`🗑️ Delete food: ${req.params.id}`);
    const deletedFood = await Food.findByIdAndDelete(req.params.id);
    if (!deletedFood) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting food', error: err.message });
  }
});

module.exports = router;
