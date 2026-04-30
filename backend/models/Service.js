import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    serviceId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // e.g., 'dentist', 'bank-teller'
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      unique: true, // One admin = one service constraint
    },
    type: {
      type: String,
      default: "general",
    },
    location: {
      type: String,
      default: "",
    },
    isPaused: {
      type: Boolean,
      default: false,
    },
    maxTokensPerDay: {
      type: Number,
      default: 0, // 0 means unlimited
    },
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);
export default Service;
