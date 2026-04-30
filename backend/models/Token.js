import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    tokenId: {
      type: String,
      required: true, // e.g., "A101"
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    status: {
      type: String,
      enum: ["waiting", "called", "completed", "skipped"],
      default: "waiting",
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// Ensure tokenId is unique PER service
tokenSchema.index({ tokenId: 1, serviceId: 1 }, { unique: true });

const Token = mongoose.model("Token", tokenSchema);
export default Token;
