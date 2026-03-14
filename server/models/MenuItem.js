const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price:       { type: Number, required: true, min: 0 },
    category:    {
      type: String,
      required: true,
      enum: ["Starters", "Main Course", "Desserts", "Beverages", "Snacks", "Specials"],
    },
    image:       { type: String, default: "" },
    isAvailable: { type: Boolean, default: true },
    isVeg:       { type: Boolean, default: false },
    tags:        [String],
    preparationTime: { type: Number, default: 15 }, // minutes
    ratings: {
      average: { type: Number, default: 0 },
      count:   { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);
