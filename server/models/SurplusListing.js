const mongoose = require("mongoose");

const surplusListingSchema = new mongoose.Schema(
  {
    menuItem:         { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
    itemName:         { type: String, required: true },
    description:      { type: String, default: "" },
    originalPrice:    { type: Number, required: true },
    discountedPrice:  { type: Number, required: true },
    discountPercent:  { type: Number },
    quantityAvailable: { type: Number, required: true, min: 1 },
    quantityClaimed:  { type: Number, default: 0 },
    image:            { type: String, default: "" },
    category:         { type: String, default: "Food" },
    expiresAt:        { type: Date, required: true },
    postedBy:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["active", "sold-out", "expired", "cancelled"],
      default: "active",
    },
    claimedBy: [
      {
        user:        { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        quantity:    { type: Number },
        claimedAt:   { type: Date, default: Date.now },
        pickupTime:  { type: String },
      },
    ],
    isVeg: { type: Boolean, default: false },
    tags:  [String],
  },
  { timestamps: true }
);

// Auto-calculate discount percent before saving
surplusListingSchema.pre("save", function (next) {
  if (this.originalPrice > 0) {
    this.discountPercent = Math.round(
      ((this.originalPrice - this.discountedPrice) / this.originalPrice) * 100
    );
  }
  next();
});

module.exports = mongoose.model("SurplusListing", surplusListingSchema);
