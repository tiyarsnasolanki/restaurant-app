const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerName:  { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String, required: true },
    date:          { type: Date, required: true },
    timeSlot:      { type: String, required: true }, // e.g. "19:00"
    partySize:     { type: Number, required: true, min: 1, max: 20 },
    tableNumber:   { type: Number, default: null },
    status: {
      type: String,
      enum: ["pending", "confirmed", "seated", "completed", "cancelled", "no-show"],
      default: "pending",
    },
    specialRequests: { type: String, default: "" },
    occasion: {
      type: String,
      enum: ["", "Birthday", "Anniversary", "Business Dinner", "Date Night", "Other"],
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);
