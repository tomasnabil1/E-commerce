const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options("/{*splat}", cors());

app.use(express.json());

// ========== Models ==========

const productSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  brand:    { type: String, default: "DIVA" },
  category: { type: String, enum: ["women", "kids", "accessories"], required: true },
  price:    { type: Number, required: true },
  image:    { type: String },
  rating:   { type: Number, default: 5 },
  sold:     { type: Number, default: 0 }
});

const orderSchema = new mongoose.Schema({
  customerName:  { type: String, required: true },
  customerPhone: { type: String, required: true },
  items: [{
    productId: { type: String, required: true },
    name:      { type: String, required: true },
    price:     { type: Number, required: true },
    quantity:  { type: Number, required: true }
  }],
  total:     { type: Number, required: true },
  status:    { type: String, enum: ["pending", "confirmed", "shipped"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

const pageVisitSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  page:      { type: String, required: true },
  visitedAt: { type: Date, default: Date.now }
});

const Product   = mongoose.model("Product",   productSchema);
const Order     = mongoose.model("Order",     orderSchema);
const PageVisit = mongoose.model("PageVisit", pageVisitSchema);

// ========== Admin Auth ==========

const adminTokens = new Map();

const adminAuth = (req, res, next) => {
  const token = (req.headers["authorization"] || "").replace("Bearer ", "");
  if (!token || !adminTokens.has(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { expiresAt } = adminTokens.get(token);
  if (Date.now() > expiresAt) {
    adminTokens.delete(token);
    return res.status(401).json({ error: "Token expired" });
  }
  next();
};

app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "The Password is incorrect" });
  }
  const token = crypto.randomBytes(32).toString("hex");
  adminTokens.set(token, { expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
  res.json({ token });
});

app.get("/api/admin/stats", adminAuth, async (req, res) => {
  try {
    const [visits, orders] = await Promise.all([
      PageVisit.find().sort({ visitedAt: -1 }),
      Order.find().sort({ createdAt: -1 })
    ]);

    const uniqueVisitors = new Set(visits.map(v => v.sessionId)).size;

    const visitsByPage = visits.reduce((acc, v) => {
      acc[v.page] = (acc[v.page] || 0) + 1;
      return acc;
    }, {});

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    res.json({
      uniqueVisitors,
      totalVisits: visits.length,
      totalOrders: orders.length,
      totalRevenue,
      visitsByPage,
      orders,
      recentVisits: visits.slice(0, 100)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== Visitor Tracking ==========

app.post("/api/visits", async (req, res) => {
  try {
    const { sessionId, page } = req.body;
    if (!sessionId || !page) return res.status(400).json({ error: "Missing fields" });
    await PageVisit.create({ sessionId, page });
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== Product Routes ==========

// GET /api/products?category=women&search=shirt
app.get("/api/products", async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search)   filter.name = { $regex: search, $options: "i" };
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products/seed  –  ملي الداتابيز بمنتجات Women
app.post("/api/products/seed", async (req, res) => {
  try {
    await Product.deleteMany({});
    const womenProducts = [
      { name: "Soft Cotton T-Shirt",    brand: "Classic Tee",  category: "women", price: 149, image: "/images/women 1/OIP (1).webp",                             rating: 5, sold: 4100 },
      { name: "Heavy Cotton T-Shirt",   brand: "Urban Fit",    category: "women", price: 229, image: "/images/women 1/navy_lisa_midi_bridesmaid_dress_03.webp",  rating: 5, sold: 4100 },
      { name: "Regular Fit Tee",        brand: "Classic Crew", category: "women", price: 189, image: "/images/women 1/OIP (2).webp",                             rating: 5, sold: 4100 },
      { name: "Slim Fit Tee",           brand: "Street Style", category: "women", price: 259, image: "/images/women 1/th.webp",                                  rating: 5, sold: 4100 },
      { name: "Slim Fit Tee",           brand: "Street Style", category: "women", price: 259, image: "/images/women 1/OIP (3).webp",                             rating: 5, sold: 4100 },
      { name: "Slim Fit Tee",           brand: "Street Style", category: "women", price: 259, image: "/images/women 1/OIP (5).webp",                             rating: 5, sold: 4100 },
      { name: "Slim Fit Tee",           brand: "Street Style", category: "women", price: 259, image: "/images/women 1/OIP.webp",                                 rating: 5, sold: 4100 },
      { name: "Slim Fit Tee",           brand: "Street Style", category: "women", price: 259, image: "/images/women 1/OIP (4).webp",                             rating: 5, sold: 4100 },
      { name: "Slim Fit Tee",           brand: "Street Style", category: "women", price: 259, image: "/images/women 1/th (1).jpg",                               rating: 5, sold: 4100 },
      { name: "Slim Fit Tee",           brand: "Street Style", category: "women", price: 259, image: "/images/women 1/OIP (6).jpg",                              rating: 5, sold: 4100 },
      { name: "Slim Fit Tee",           brand: "Street Style", category: "women", price: 259, image: "/images/women 1/OIP (7).jpg",                              rating: 5, sold: 4100 },
      { name: "Slim Fit Tee",           brand: "Street Style", category: "women", price: 259, image: "/images/women 1/OIP (3).jpg",                              rating: 5, sold: 4100 },
      { name: "Slim Fit Tee",           brand: "Street Style", category: "women", price: 259, image: "/images/women 1/OIP (2).jpg",                              rating: 5, sold: 4100 },
      { name: "Slim Fit Tee",           brand: "Street Style", category: "women", price: 259, image: "/images/women 1/OIP (4).jpg",                              rating: 5, sold: 4100 },
      { name: "Slim Fit Tee",           brand: "Street Style", category: "women", price: 259, image: "/images/women 1/th.jpg",                                   rating: 5, sold: 4100 },
      { name: "Slim Fit Tee",           brand: "Street Style", category: "women", price: 259, image: "/images/women 1/OIP (5).jpg",                              rating: 5, sold: 4100 },
    ];
    const inserted = await Product.insertMany(womenProducts);
    res.json({ message: "Seeded successfully", count: inserted.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ========== Order Routes ==========

// POST /api/orders  –  احفظ الأوردر مع بيانات العميل
app.post("/api/orders", async (req, res) => {
  try {
    const { customerName, customerPhone, items, total } = req.body;
    if (!customerName || !customerPhone) {
      return res.status(400).json({ message: "Customer name and phone are required" });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }
    const order = await Order.create({ customerName, customerPhone, items, total });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders  –  شوف كل الأوردرات
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/orders/:id/status
app.patch("/api/orders/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "confirmed", "shipped"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== Health Check ==========

app.get("/", (req, res) => {
  res.send("API is working");
});

 
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
// ========== Start ==========

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running"));


