import express from "express";
import {
  createToken,
  getTokens,
  callNextToken,
  completeToken,
  resetQueue,
} from "../controllers/tokenController.js";

const router = express.Router();

// Route definitions mapped to controller functions
router.post("/", createToken);
router.get("/", getTokens);
router.put("/call-next", callNextToken);
router.put("/complete/:id", completeToken);
router.delete("/reset", resetQueue);

export default router;
