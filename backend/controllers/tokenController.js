import Token from "../models/Token.js";

// Helper: Generate next token ID
async function generateTokenId() {
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

// POST /api/tokens — Create a new token
export const createToken = async (req, res) => {
  try {
    const tokenId = await generateTokenId();
    const token = await Token.create({ tokenId });
    res.status(201).json({ success: true, token });
  } catch (err) {
    console.error("Error creating token:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/tokens — Get all tokens (newest first)
export const getTokens = async (req, res) => {
  try {
    const tokens = await Token.find().sort({ createdAt: 1 }).lean();
    res.json({ success: true, tokens });
  } catch (err) {
    console.error("Error fetching tokens:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/tokens/call-next — Call the next waiting token (FIFO)
export const callNextToken = async (req, res) => {
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
};

// PUT /api/tokens/complete/:id — Mark token as completed
export const completeToken = async (req, res) => {
  try {
    const token = await Token.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    );

    if (!token) {
      return res.status(404).json({ success: false, message: "Token not found." });
    }

    res.json({ success: true, token });
  } catch (err) {
    console.error("Error completing token:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/tokens/reset — Clear the entire queue
export const resetQueue = async (req, res) => {
  try {
    await Token.deleteMany({});
    res.json({ success: true, message: "Queue has been reset." });
  } catch (err) {
    console.error("Error resetting queue:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
