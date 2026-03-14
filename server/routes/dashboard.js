const express        = require("express");
const Order          = require("../models/Order");
const Reservation    = require("../models/Reservation");
const MenuItem       = require("../models/MenuItem");
const SurplusListing = require("../models/SurplusListing");
const User           = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// GET /api/dashboard/stats — admin/staff only
router.get("/stats", protect, authorize("admin", "staff"), async (req, res) => {
  try {
    const today      = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow   = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      totalRevenue,
      todayRevenue,
      totalReservations,
      todayReservations,
      totalMenuItems,
      activeMenuItems,
      activeSurplus,
      totalCustomers,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      Order.countDocuments({ status: { $in: ["pending", "confirmed", "preparing"] } }),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Reservation.countDocuments(),
      Reservation.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
      MenuItem.countDocuments(),
      MenuItem.countDocuments({ isAvailable: true }),
      SurplusListing.countDocuments({ status: "active", expiresAt: { $gt: new Date() } }),
      User.countDocuments({ role: "customer" }),
    ]);

    // Weekly revenue (last 7 days)
    const weeklyRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top selling items
    const topItems = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.name", totalQty: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      totalOrders,
      todayOrders,
      pendingOrders,
      totalRevenue:      totalRevenue[0]?.total || 0,
      todayRevenue:      todayRevenue[0]?.total || 0,
      totalReservations,
      todayReservations,
      totalMenuItems,
      activeMenuItems,
      activeSurplus,
      totalCustomers,
      weeklyRevenue,
      topItems,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
