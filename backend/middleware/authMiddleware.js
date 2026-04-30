import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Service from "../models/Service.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token — read secret lazily to ensure dotenv has loaded
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error("JWT_SECRET not configured");
      const decoded = jwt.verify(token, secret);

      // Fetch admin details and attach to request
      req.admin = await Admin.findById(decoded.id).select("-password");

      if (!req.admin) {
        return res.status(401).json({ message: "Not authorized, admin not found" });
      }

      // Fetch the service owned by this admin and attach its ID
      const service = await Service.findOne({ adminId: req.admin._id });
      if (!service) {
        return res.status(403).json({ message: "Admin does not have an assigned service." });
      }

      req.serviceId = service._id; // Authorization constraint

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token provided" });
  }
};
