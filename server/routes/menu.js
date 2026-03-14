const express  = require("express");
const MenuItem = require("../models/MenuItem");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// GET /api/menu  — public
router.get("/", async (req, res) => {
  try {
    const { category, isVeg, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (isVeg === "true") filter.isVeg = true;
    if (search) filter.name = { $regex: search, $options: "i" };

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/menu/:id  — public
router.get("/:id", async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/menu  — admin/staff only
router.post("/", protect, authorize("admin", "staff"), async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/menu/:id  — admin/staff only
router.put("/:id", protect, authorize("admin", "staff"), async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/menu/:id  — admin only
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Menu item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/menu/:id/availability
router.patch("/:id/availability", protect, authorize("admin", "staff"), async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { isAvailable: req.body.isAvailable },
      { new: true }
    );
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
