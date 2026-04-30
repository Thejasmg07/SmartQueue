import Token from "../models/Token.js";
import Service from "../models/Service.js";
import { generateNextTokenId } from "../utils/tokenGenerator.js";

// POST /api/tokens — User generates a token
// Body requires: serviceId (the string ID, e.g., 'dentist')
export const createToken = async (req, res) => {
  const { serviceId } = req.body;

  if (!serviceId) {
    return res.status(400).json({ message: "serviceId is required" });
  }

  try {
    const service = await Service.findOne({ serviceId });
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (service.isPaused) {
      return res.status(403).json({ message: "Queue is currently paused." });
    }

    // Optional: Max tokens per day logic
    if (service.maxTokensPerDay > 0) {
      // Find tokens generated today for this service
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const tokensToday = await Token.countDocuments({
        serviceId: service._id,
        createdAt: { $gte: startOfDay }
      });

      if (tokensToday >= service.maxTokensPerDay) {
        return res.status(403).json({ message: "Maximum tokens reached for today." });
      }
    }

    // ── Robust Concurrency Handling ──
    let retries = 3;
    let token = null;

    while (retries > 0) {
      try {
        const tokenId = await generateNextTokenId(service._id);
        token = await Token.create({
          tokenId,
          serviceId: service._id,
        });
        break; // Success! Exit loop.
      } catch (err) {
        if (err.code === 11000) {
          retries--;
          if (retries === 0) {
            return res.status(503).json({ message: "High traffic. Please try generating again." });
          }
        } else {
          throw err;
        }
      }
    }

    res.status(201).json(token);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/tokens?serviceId=XXX — Public route to view queue
export const getQueue = async (req, res) => {
  const { serviceId } = req.query;

  if (!serviceId) {
    return res.status(400).json({ message: "serviceId query param is required" });
  }

  try {
    const service = await Service.findOne({ serviceId });
    if (!service) return res.status(404).json({ message: "Service not found" });

    const tokens = await Token.find({ serviceId: service._id }).sort({ createdAt: 1 });
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/tokens/call-next — Admin only
export const callNextToken = async (req, res) => {
  try {
    const serviceId = req.serviceId;
    
    const service = await Service.findById(serviceId);
    if (service && service.isPaused) {
      return res.status(403).json({ message: "Queue is paused. Cannot call next token." });
    }

    // Rule 1: Prevent calling next if one is already active
    const activeToken = await Token.findOne({ serviceId, status: "called" });
    if (activeToken) {
      return res.status(400).json({
        message: `Token ${activeToken.tokenId} is still active. Please mark it as completed first.`,
      });
    }

    // Rule 2: Find oldest waiting
    const nextToken = await Token.findOneAndUpdate(
      { serviceId, status: "waiting" },
      { status: "called" },
      { sort: { createdAt: 1 }, new: true } // sort ascending gets oldest first
    );

    if (!nextToken) {
      return res.status(404).json({ message: "No tokens waiting in queue." });
    }

    res.json(nextToken);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/tokens/complete/:id — Admin only
export const completeToken = async (req, res) => {
  try {
    const token = await Token.findOne({ _id: req.params.id, serviceId: req.serviceId });

    if (!token) {
      return res.status(404).json({ message: "Token not found or unauthorized" });
    }

    token.status = "completed";
    await token.save();

    res.json(token);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/tokens/skip — Admin only
export const skipToken = async (req, res) => {
  try {
    // Find the currently called token for this service
    const activeToken = await Token.findOne({ serviceId: req.serviceId, status: "called" });
    if (!activeToken) {
      return res.status(400).json({ message: "No active token to skip." });
    }

    activeToken.status = "skipped";
    await activeToken.save();
    
    res.json(activeToken);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/tokens/stats — Admin only
export const getStats = async (req, res) => {
  try {
    const serviceId = req.serviceId;
    const service = await Service.findById(serviceId);

    const total = await Token.countDocuments({ serviceId });
    const waiting = await Token.countDocuments({ serviceId, status: "waiting" });
    const completed = await Token.countDocuments({ serviceId, status: "completed" });
    const skipped = await Token.countDocuments({ serviceId, status: "skipped" });

    // Calculate current token count for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayCount = await Token.countDocuments({
      serviceId,
      createdAt: { $gte: startOfDay }
    });

    res.json({
      total,
      waiting,
      completed,
      skipped,
      todayCount,
      service: {
        serviceId: service.serviceId,
        name: service.name,
        type: service.type || "general",
        location: service.location || "",
        isPaused: service.isPaused,
        maxTokensPerDay: service.maxTokensPerDay || 0,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/tokens/completed — Admin only
export const clearCompleted = async (req, res) => {
  try {
    await Token.deleteMany({ serviceId: req.serviceId, status: { $in: ["completed", "skipped"] } });
    res.json({ message: "Completed and skipped tokens cleared." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/tokens/reset — Admin only
export const resetQueue = async (req, res) => {
  try {
    await Token.deleteMany({ serviceId: req.serviceId });
    res.json({ message: "Queue has been reset for your service." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
