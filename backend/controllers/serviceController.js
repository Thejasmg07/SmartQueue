import Service from "../models/Service.js";

// GET /api/services — Public route to fetch available services (Service Discovery)
export const getServices = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    // Support case-insensitive partial matching for search
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // .lean() significantly improves read performance by returning plain JS objects
    // .select("-_id") removes internal DB IDs from public payload
    const services = await Service.find(query)
      .select("name serviceId -_id")
      .lean();

    res.json({ success: true, count: services.length, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/services/:serviceId — Public route to fetch a single service by its ID
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findOne({ serviceId: req.params.serviceId }).lean();
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/services — Create a new service (Protected route)
export const createService = async (req, res) => {
  const { name, serviceId } = req.body;

  try {
    // An admin can only have one service
    const existingService = await Service.findOne({ adminId: req.admin._id });
    if (existingService) {
      return res.status(400).json({ message: "You already have an active service." });
    }

    const serviceExists = await Service.findOne({ serviceId });
    if (serviceExists) {
      return res.status(400).json({ message: "Service ID already taken." });
    }

    const service = await Service.create({
      name,
      serviceId,
      adminId: req.admin._id, // Tied to the logged-in admin
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/services/pause — Admin only
export const pauseService = async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate(
      { adminId: req.admin._id },
      { isPaused: true },
      { new: true }
    );
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json({ message: "Queue has been paused.", isPaused: service.isPaused });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/services/resume — Admin only
export const resumeService = async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate(
      { adminId: req.admin._id },
      { isPaused: false },
      { new: true }
    );
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json({ message: "Queue has been resumed.", isPaused: service.isPaused });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/services/config — Admin only
export const updateServiceConfig = async (req, res) => {
  try {
    const { maxTokensPerDay, name, type, location } = req.body;

    const updateFields = {};
    if (name !== undefined)            updateFields.name = name;
    if (type !== undefined)            updateFields.type = type;
    if (location !== undefined)        updateFields.location = location;
    if (maxTokensPerDay !== undefined) updateFields.maxTokensPerDay = Number(maxTokensPerDay) || 0;

    const service = await Service.findOneAndUpdate(
      { adminId: req.admin._id },
      updateFields,
      { new: true }
    );
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
