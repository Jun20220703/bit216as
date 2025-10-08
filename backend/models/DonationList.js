const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  qty: { type: Number, required: true }, // 用户要捐赠的数量
  donatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DonationList', donationSchema);
