const express     = require("express");
const Reservation = require("../models/Reservation");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// GET /api/reservations — staff/admin see all, customer sees own
router.get("/", protect, async (req, res) => {
  try {
    const filter =
      req.user.role === "customer" ? { customer: req.user._id } : {};

    const { date, status } = req.query;
    if (status) filter.status = status;
    if (date) {
      const start = new Date(date);
      const end   = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }

    const reservations = await Reservation.find(filter)
      .populate("customer", "name email")
      .sort({ date: 1, timeSlot: 1 });

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reservations/slots?date=YYYY-MM-DD — available time slots
router.get("/slots", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date is required" });

    const allSlots = [
      "12:00","12:30","13:00","13:30","14:00","14:30",
      "18:00","18:30","19:00","19:30","20:00","20:30","21:00"
    ];

    const start = new Date(date);
    const end   = new Date(date);
    end.setDate(end.getDate() + 1);

    const booked = await Reservation.find({
      date: { $gte: start, $lt: end },
      status: { $nin: ["cancelled", "no-show"] },
    }).select("timeSlot");

    const bookedSlots = booked.map((r) => r.timeSlot);
    const available   = allSlots.filter((s) => !bookedSlots.includes(s));

    res.json({ available, booked: bookedSlots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reservations
router.post("/", protect, async (req, res) => {
  try {
    const { date, timeSlot, partySize, specialRequests, occasion } = req.body;

    const reservation = await Reservation.create({
      customer:      req.user._id,
      customerName:  req.user.name,
      customerPhone: req.body.phone  || req.user.phone  || "",
      customerEmail: req.body.email  || req.user.email,
      date,
      timeSlot,
      partySize,
      specialRequests,
      occasion,
    });

    res.status(201).json(reservation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/reservations/:id/status — staff/admin
router.patch("/:id/status", protect, authorize("admin", "staff"), async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, tableNumber: req.body.tableNumber },
      { new: true }
    ).populate("customer", "name email");

    if (!reservation) return res.status(404).json({ message: "Reservation not found" });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/reservations/:id — customer cancels own
router.delete("/:id", protect, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: "Not found" });

    if (
      req.user.role === "customer" &&
      reservation.customer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorised" });
    }

    reservation.status = "cancelled";
    await reservation.save();
    res.json({ message: "Reservation cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
