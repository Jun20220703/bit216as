const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  expiry: { type: String, required: true },
  category: { type: String, required: true },
  storage: { type: String, required: true },
  notes: { type: String }
});

module.exports = mongoose.model('Food', foodSchema);