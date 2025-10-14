const mongoose = require('mongoose');

const donationListSchema = new mongoose.Schema({
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  qty: { type: Number, required: true },
  location: { type: String, required: true },        // ← これ追加
  availability: { type: String, required: true },    // ← これ追加
  notes: { type: String },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // または Attendee
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DonationList', donationListSchema);
