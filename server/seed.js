/**
 * Seed script — run once to populate sample data
 * Usage: node seed.js
 * Make sure your .env file has MONGO_URI set
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const User           = require("./models/User");
const MenuItem       = require("./models/MenuItem");
const SurplusListing = require("./models/SurplusListing");

const menuItems = [
  { name: "Veg Spring Rolls",        category: "Starters",    price: 149, isVeg: true,  preparationTime: 10, tags: ["crispy","popular"], description: "Crispy golden rolls stuffed with seasoned vegetables." },
  { name: "Paneer Tikka",            category: "Starters",    price: 249, isVeg: true,  preparationTime: 15, tags: ["spicy","tandoor"],  description: "Marinated cottage cheese cubes grilled in tandoor." },
  { name: "Chicken Wings",           category: "Starters",    price: 299, isVeg: false, preparationTime: 20, tags: ["spicy","non-veg"],  description: "Crispy wings tossed in tangy hot sauce." },
  { name: "Paneer Butter Masala",    category: "Main Course", price: 299, isVeg: true,  preparationTime: 20, tags: ["creamy","popular"], description: "Rich tomato-based curry with soft paneer cubes." },
  { name: "Dal Makhani",             category: "Main Course", price: 249, isVeg: true,  preparationTime: 25, tags: ["punjabi","healthy"],description: "Slow-cooked black lentils in butter and cream." },
  { name: "Chicken Biryani",         category: "Main Course", price: 349, isVeg: false, preparationTime: 30, tags: ["rice","bestseller"],description: "Fragrant basmati rice layered with spiced chicken." },
  { name: "Veg Fried Rice",          category: "Main Course", price: 199, isVeg: true,  preparationTime: 15, tags: ["rice","quick"],     description: "Wok-tossed rice with fresh vegetables." },
  { name: "Gulab Jamun",             category: "Desserts",    price: 99,  isVeg: true,  preparationTime: 5,  tags: ["sweet","hot"],     description: "Soft milk-solid dumplings soaked in rose syrup." },
  { name: "Chocolate Brownie",       category: "Desserts",    price: 149, isVeg: true,  preparationTime: 5,  tags: ["chocolate","popular"], description: "Warm fudgy brownie served with vanilla ice cream." },
  { name: "Mango Lassi",             category: "Beverages",   price: 99,  isVeg: true,  preparationTime: 5,  tags: ["cold","summer"],   description: "Chilled yogurt drink blended with fresh mango." },
  { name: "Masala Chai",             category: "Beverages",   price: 49,  isVeg: true,  preparationTime: 5,  tags: ["hot","classic"],   description: "Spiced Indian tea brewed with ginger and cardamom." },
  { name: "Cold Coffee",             category: "Beverages",   price: 129, isVeg: true,  preparationTime: 5,  tags: ["cold","coffee"],   description: "Creamy iced coffee blended to perfection." },
  { name: "French Fries",            category: "Snacks",      price: 129, isVeg: true,  preparationTime: 10, tags: ["crispy","popular"], description: "Golden crispy fries served with dipping sauce." },
  { name: "Chef's Special Thali",    category: "Specials",    price: 399, isVeg: true,  preparationTime: 25, tags: ["value","complete"], description: "A wholesome meal with dal, sabzi, roti, rice & dessert." },
  { name: "Grilled Fish",            category: "Specials",    price: 449, isVeg: false, preparationTime: 25, tags: ["healthy","grilled"],description: "Fresh fish marinated in herbs and grilled to perfection." },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      MenuItem.deleteMany({}),
      SurplusListing.deleteMany({}),
    ]);
    console.log("🗑  Cleared existing data");

    // Create users
    const users = await User.insertMany([
      { name: "Admin User",   email: "admin@restaurant.com",   password: await bcrypt.hash("admin123",  12), role: "admin",    phone: "+91 9000000001" },
      { name: "Staff Member", email: "staff@restaurant.com",   password: await bcrypt.hash("staff123",  12), role: "staff",    phone: "+91 9000000002" },
      { name: "Test Customer",email: "customer@example.com",   password: await bcrypt.hash("customer123",12), role: "customer", phone: "+91 9000000003" },
    ]);
    console.log("👥 Created users");

    // Create menu items
    const menu = await MenuItem.insertMany(menuItems);
    console.log(`🍽️  Created ${menu.length} menu items`);

    // Create sample surplus listing
    const expiry = new Date();
    expiry.setHours(23, 59, 0, 0);
    await SurplusListing.create({
      itemName:          "Leftover Dal Makhani",
      description:       "Freshly made, slightly surplus — grab it before it's gone!",
      originalPrice:     249,
      discountedPrice:   99,
      quantityAvailable: 5,
      category:          "Food",
      isVeg:             true,
      expiresAt:         expiry,
      postedBy:          users[1]._id,
      tags:              ["punjabi","hot"],
    });
    console.log("🌿 Created sample surplus listing");

    console.log("\n✅ Seed complete!\n");
    console.log("Login credentials:");
    console.log("  Admin:    admin@restaurant.com   / admin123");
    console.log("  Staff:    staff@restaurant.com   / staff123");
    console.log("  Customer: customer@example.com   / customer123");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seed();
