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


module.exports = router;
