import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import tokenRoutes from "./routes/tokenRoutes.js";

dotenv.config();

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/tokens", tokenRoutes);

// Health-check route
app.get("/", (req, res) => {
  res.send("✅ SmartQueue API is running...");
});

// ─── MongoDB Connection ───────────────────────────────────────────────────────
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smartqueue";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });