import express from "express";
import { getServices, getServiceById, createService, pauseService, resumeService, updateServiceConfig, updateStatus } from "../controllers/serviceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// List / Create
router.route("/")
  .get(getServices)
  .post(protect, createService);

// Named admin-protected routes (must be before /:serviceId to prevent conflicts)
router.put("/pause", protect, pauseService);
router.put("/resume", protect, resumeService);
router.put("/config", protect, updateServiceConfig);
router.put("/status", protect, updateStatus);

// Public: Single service lookup (wildcard, must be last)
router.get("/:serviceId", getServiceById);

export default router;

