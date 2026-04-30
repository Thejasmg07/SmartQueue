import express from "express";
import {
  createToken,
  getQueue,
  callNextToken,
  completeToken,
  skipToken,
  getStats,
  clearCompleted,
  resetQueue,
} from "../controllers/tokenController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getQueue)      // Public: View queue for a specific service
  .post(createToken); // Public: Generate a token for a specific service

// Admin Protected Routes
router.get("/stats", protect, getStats);
router.put("/call-next", protect, callNextToken);
router.put("/complete/:id", protect, completeToken);
router.put("/skip", protect, skipToken);
router.delete("/completed", protect, clearCompleted);
router.delete("/reset", protect, resetQueue);

export default router;
