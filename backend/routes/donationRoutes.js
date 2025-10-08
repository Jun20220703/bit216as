const express = require('express');
const router = express.Router();
const DonationList = require('../models/DonationList');

// ➕ Add to donation
router.post('/', async (req, res) => {
  try {
    const donation = new DonationList(req.body);
    await donation.save();
    res.status(201).json(donation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 📋 Get all donations
router.get('/', async (req, res) => {
  try {
    const donations = await DonationList.find().populate('foodId'); 
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ❌ Remove from donation list
router.delete('/:id', async (req, res) => {
  try {
    await DonationList.findByIdAndDelete(req.params.id);
    res.json({ message: 'Donation removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
