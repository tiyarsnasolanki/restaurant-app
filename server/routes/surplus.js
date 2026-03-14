const express        = require("express");
const SurplusListing = require("../models/SurplusListing");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// GET /api/surplus  — public, only active listings
router.get("/", async (req, res) => {
  try {
    const now = new Date();
    const filter = {
      status:    "active",
      expiresAt: { $gt: now },
    };

    const { category, isVeg } = req.query;
    if (category) filter.category = category;
    if (isVeg === "true") filter.isVeg = true;

    const listings = await SurplusListing.find(filter)
      .populate("postedBy", "name")
      .sort({ expiresAt: 1 });

    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/surplus/all  — staff/admin see all
router.get("/all", protect, authorize("admin", "staff"), async (req, res) => {
  try {
    const listings = await SurplusListing.find()
      .populate("postedBy", "name")
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/surplus/:id
router.get("/:id", async (req, res) => {
  try {
    const listing = await SurplusListing.findById(req.params.id)
      .populate("postedBy", "name")
      .populate("claimedBy.user", "name email");
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/surplus  — staff/admin create listing
router.post("/", protect, authorize("admin", "staff"), async (req, res) => {
  try {
    const listing = await SurplusListing.create({
      ...req.body,
      postedBy: req.user._id,
    });
    res.status(201).json(listing);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/surplus/:id/claim  — customer claims a surplus item
router.post("/:id/claim", protect, async (req, res) => {
  try {
    const { quantity = 1, pickupTime } = req.body;
    const listing = await SurplusListing.findById(req.params.id);

    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.status !== "active") {
      return res.status(400).json({ message: "This listing is no longer active" });
    }
    if (listing.expiresAt < new Date()) {
      listing.status = "expired";
      await listing.save();
      return res.status(400).json({ message: "This listing has expired" });
    }
    if (quantity > listing.quantityAvailable - listing.quantityClaimed) {
      return res.status(400).json({ message: "Not enough quantity available" });
    }

    listing.claimedBy.push({ user: req.user._id, quantity, pickupTime });
    listing.quantityClaimed += quantity;

    if (listing.quantityClaimed >= listing.quantityAvailable) {
      listing.status = "sold-out";
    }

    await listing.save();
    res.json({ message: "Successfully claimed!", listing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/surplus/:id  — staff/admin update
router.patch("/:id", protect, authorize("admin", "staff"), async (req, res) => {
  try {
    const listing = await SurplusListing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/surplus/:id
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    await SurplusListing.findByIdAndDelete(req.params.id);
    res.json({ message: "Surplus listing deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
