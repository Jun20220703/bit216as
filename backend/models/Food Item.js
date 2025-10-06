import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: String, required: true },
  expiry: { type: String, required: true },
  category: { type: String, required: true },
  storage: { type: String, required: true },
  notes: { type: String },
  donation: { type: Boolean, default: false },
});

export default mongoose.model("FoodItem", foodItemSchema);
