require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

async function connectToDatabase() {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing from .env file!");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas successfully.");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

const gasUsageSchema = new mongoose.Schema({
  date: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 }
}, { timestamps: true });

const refillHistorySchema = new mongoose.Schema({
  date: { type: String, required: true, trim: true }
}, { timestamps: true });

const GasUsage = mongoose.model("GasUsage", gasUsageSchema);
const RefillHistory = mongoose.model("RefillHistory", refillHistorySchema);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function calculateAverageUsage(dailyUsage) {
  if (!dailyUsage.length) return 0;
  const totalUsage = dailyUsage.reduce((sum, entry) => sum + entry.amount, 0);
  return totalUsage / dailyUsage.length;
}

function estimateNextRefillDate(refillDates, dailyUsage) {
  if (!refillDates.length || !dailyUsage.length) return null;
  const lastRefillDate = new Date(refillDates[refillDates.length - 1].date);
  const averageUsage = calculateAverageUsage(dailyUsage);

  if (averageUsage <= 0 || Number.isNaN(lastRefillDate.getTime())) return null;

  const cylinderCapacity = 14.2;
  const estimatedDaysRemaining = Math.round(cylinderCapacity / averageUsage);
  const estimatedDate = new Date(lastRefillDate);
  estimatedDate.setDate(estimatedDate.getDate() + estimatedDaysRemaining);

  return estimatedDate.toISOString().split("T")[0];
}

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get("/api/data", async (req, res) => {
  try {
    const dailyUsage = await GasUsage.find().sort({ date: 1 });
    const refillDates = await RefillHistory.find().sort({ date: 1 });
    const averageDailyUsage = calculateAverageUsage(dailyUsage);
    const estimatedNextRefillDate = estimateNextRefillDate(refillDates, dailyUsage);

    res.json({
      dailyUsage: dailyUsage.map(entry => ({ id: entry._id, date: entry.date, amount: entry.amount })),
      refillDates: refillDates.map(entry => entry.date),
      averageDailyUsage: averageDailyUsage.toFixed(2),
      estimatedNextRefillDate
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load LPG dashboard data." });
  }
});

app.post("/api/usage", async (req, res) => {
  try {
    const { date, amount } = req.body;
    if (!date || typeof amount !== "number") return res.status(400).json({ message: "Valid date and numeric amount are required." });

    const newUsage = await GasUsage.create({ date, amount });
    res.status(201).json({
      message: "Daily usage record added successfully.",
      usage: { id: newUsage._id, date: newUsage.date, amount: newUsage.amount }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to save daily usage record." });
  }
});

app.post("/api/refill", async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ message: "Refill date is required." });

    const newRefill = await RefillHistory.create({ date });
    res.status(201).json({
      message: "Refill date added successfully.",
      refill: { id: newRefill._id, date: newRefill.date }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to save refill date." });
  }
});

async function startServer() {
  await connectToDatabase();
  app.listen(PORT, () => console.log(`Smart LPG Management System running at http://localhost:${PORT}`));
}
startServer();