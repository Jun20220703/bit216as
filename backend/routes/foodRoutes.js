const express = require('express');
const router = express.Router();
const Food = require('../models/Food');

// ✅ update food item status (Donate / Inventory)
router.put('/status/:name', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Food.findOneAndUpdate(
      { name: req.params.name },
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Food not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating food status', error });
  }
});



router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { owner: userId } : {};
    const foods = await Food.find(filter);
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const food = await Food.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(food);
  } catch (err) {
    res.status(500).json({ message: 'Error updating food status', error: err });
  }
});

// server.js or routes/foods.js
router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id); // Mongoose を想定
    if (!food) return res.status(404).json({ message: 'Food not found' });
    res.json(food);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// app.js または foodRoutes.js
router.put('/api/foods/:id', async (req, res) => {
  try {
    const updatedFood = await Food.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }  // 更新後のデータを返す
    );
    if (!updatedFood) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.json(updatedFood);
  } catch (error) {
    console.error('Error updating food:', error);
    res.status(500).json({ message: 'Server error while updating food', error });
  }
});






module.exports = router;
