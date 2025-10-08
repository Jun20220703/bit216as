const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },   // <-- 改成 Number
  expiry: { type: String, required: true },
  category: { type: String, required: true },
  storage: { type: String, required: true },
  notes: { type: String }
});

module.exports = mongoose.model('Food', foodSchema);
