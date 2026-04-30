import mongoose from "mongoose";

/**
 * Token Schema
 * Represents a single queue token in the SmartQueue system.
 */
const tokenSchema = new mongoose.Schema(
  {
    tokenId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["waiting", "called", "completed"],
      default: "waiting",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

const Token = mongoose.model("Token", tokenSchema);
export default Token;
