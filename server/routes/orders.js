const express = require("express");
const Order   = require("../models/Order");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// GET /api/orders  — staff/admin see all; customer sees own
router.get("/", protect, async (req, res) => {
  try {
    const filter =
      req.user.role === "customer" ? { customer: req.user._id } : {};

    const { status, date } = req.query;
    if (status) filter.status = status;
    if (date) {
      const start = new Date(date);
      const end   = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    }

    const orders = await Order.find(filter)
      .populate("customer", "name email phone")
      .populate("items.menuItem", "name image")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("items.menuItem", "name image");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Customers can only see their own orders
    if (
      req.user.role === "customer" &&
      order.customer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorised" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/orders — customer places order
router.post("/", protect, async (req, res) => {
  try {
    const { items, tableNumber, orderType, specialInstructions, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order must have at least one item" });
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const deliveryCharge = orderType === "delivery" ? 50 : 0;
    const totalAmount = subtotal + tax + deliveryCharge;

    const order = await Order.create({
      customer: req.user._id,
      items,
      tableNumber,
      orderType,
      specialInstructions,
      paymentMethod,
      subtotal,
      tax,
      deliveryCharge,
      totalAmount,
    });

    const populated = await order.populate("customer", "name email");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/orders/:id/status  — staff/admin update order status
router.patch("/:id/status", protect, authorize("admin", "staff"), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("customer", "name email");

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/orders/:id/payment
router.patch("/:id/payment", protect, authorize("admin", "staff"), async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: req.body.paymentStatus },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/orders/:id — customer cancels own pending order
router.delete("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (
      req.user.role === "customer" &&
      order.customer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorised" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ message: "Only pending orders can be cancelled" });
    }

    order.status = "cancelled";
    await order.save();
    res.json({ message: "Order cancelled", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
