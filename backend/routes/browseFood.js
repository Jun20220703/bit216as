const express = require('express');
const router = express.Router();
const Food = require('../models/Food');

// 📌 GET: 显示所有 Food 数据
router.get('/', async (req, res) => {
  try {
    const foods = await Food.find(); // 从 MongoDB 取全部数据
    res.json(foods);                 // 返回给前端
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
