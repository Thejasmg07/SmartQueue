import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Service from "../models/Service.js";

// Generate JWT Token — read secret lazily so dotenv is always loaded first
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined in environment variables.");
  return jwt.sign({ id }, secret, { expiresIn: "30d" });
};

// POST /api/auth/login
export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        username: admin.username,
        token: generateToken(admin._id),
      });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/register
export const registerAdmin = async (req, res) => {
  const { username, password, serviceName, serviceType, location } = req.body;

  if (!username || !password || !serviceName) {
    return res.status(400).json({ message: "Username, password, and service name are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long." });
  }

  try {
    const adminExists = await Admin.findOne({ username });
    if (adminExists) {
      // Check if this admin has no service (partial failure from a previous attempt)
      const existingService = await Service.findOne({ adminId: adminExists._id });
      if (!existingService) {
        // Orphaned admin — clean it up so the user can retry
        await Admin.deleteOne({ _id: adminExists._id });
      } else {
        return res.status(400).json({ message: "Username already taken." });
      }
    }

    // 1. Create the Admin account
    const admin = await Admin.create({ username, password });

    // 2. Generate readable serviceId (e.g. HOSP-4819 or SRV-9123)
    const prefix = serviceType && serviceType.length > 0
      ? serviceType.substring(0, 4).toUpperCase()
      : "SRV";
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const serviceId = `${prefix}-${randomSuffix}`.toLowerCase();

    let service;
    try {
      // 3. Create the Service and link to Admin
      service = await Service.create({
        name: serviceName,
        serviceId,
        adminId: admin._id,
        type: serviceType || "general",
        location: location || "",
      });
    } catch (serviceErr) {
      // Rollback: delete the admin if service creation fails
      await Admin.deleteOne({ _id: admin._id });
      throw new Error("Failed to create service. Please try registering again.");
    }

    // 4. Auto-login: Return success with JWT
    res.status(201).json({
      _id: admin._id,
      username: admin.username,
      service: {
        name: service.name,
        serviceId: service.serviceId,
        url: `${req.protocol}://${req.get("host")}/api/tokens?serviceId=${service.serviceId}`
      },
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
