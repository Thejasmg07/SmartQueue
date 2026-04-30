import express from "express";
import Token from "../models/Token.js";

const router = express.Router();

// ─────────────────────────────────────────────
// Helper: Generate next token ID (A101, A102…)
// ─────────────────────────────────────────────
async function generateTokenId() {
  // Find the token with the highest numeric part
  const tokens = await Token.find({}, { tokenId: 1 }).lean();

  if (tokens.length === 0) return "A101";

  const numbers = tokens
    .map((t) => {
      const match = t.tokenId.match(/^A(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);

  const max = numbers.length > 0 ? Math.max(...numbers) : 100;
  return `A${max + 1}`;
}

// ─────────────────────────────────────────────
// POST /api/tokens — Create a new token
// ─────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const tokenId = await generateTokenId();
    const token = await Token.create({ tokenId });
    res.status(201).json({ success: true, token });
  } catch (err) {
    console.error("Error creating token:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/tokens — Get all tokens (newest first by createdAt)
// ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const tokens = await Token.find().sort({ createdAt: 1 }).lean();
    res.json({ success: true, tokens });
  } catch (err) {
    console.error("Error fetching tokens:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// PUT /api/tokens/call-next — Call the next waiting token (FIFO)
// ─────────────────────────────────────────────
router.put("/call-next", async (req, res) => {
  try {
    // Enforce: only one "called" token at a time
    const alreadyCalled = await Token.findOne({ status: "called" });
    if (alreadyCalled) {
      return res.status(400).json({
        success: false,
        message: `Token ${alreadyCalled.tokenId} is already being served. Complete it first.`,
      });
    }

    // Find the oldest waiting token (FIFO)
    const next = await Token.findOneAndUpdate(
      { status: "waiting" },
      { status: "called" },
      { sort: { createdAt: 1 }, new: true }
    );

    if (!next) {
      return res.status(404).json({
        success: false,
        message: "No waiting tokens in the queue.",
      });
    }

    res.json({ success: true, token: next });
  } catch (err) {
    console.error("Error calling next token:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// PUT /api/tokens/complete/:id — Mark token as completed
// ─────────────────────────────────────────────
router.put("/complete/:id", async (req, res) => {
  try {
    const token = await Token.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    );

    if (!token) {
      return res
        .status(404)
        .json({ success: false, message: "Token not found." });
    }

    res.json({ success: true, token });
  } catch (err) {
    console.error("Error completing token:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/tokens/reset — Clear the entire queue
// ─────────────────────────────────────────────
router.delete("/reset", async (req, res) => {
  try {
    await Token.deleteMany({});
    res.json({ success: true, message: "Queue has been reset." });
  } catch (err) {
    console.error("Error resetting queue:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
