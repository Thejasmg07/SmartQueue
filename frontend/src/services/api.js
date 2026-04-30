import axios from "axios";

// Base instance
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// ─── Axios Interceptor: Attach JWT Automatically ─────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Auth APIs ───────────────────────────────────────────────────────────────
export const loginAdmin = async (username, password) => {
  const response = await api.post("/auth/login", { username, password });
  if (response.data.token) {
    localStorage.setItem("adminToken", response.data.token);
  }
  return response.data;
};

export const registerAdmin = async (username, password, serviceName, serviceType, location) => {
  const response = await api.post("/auth/register", {
    username,
    password,
    serviceName,
    serviceType,
    location
  });
  // Auto-login on successful registration
  if (response.data.token) {
    localStorage.setItem("adminToken", response.data.token);
  }
  return response.data;
};

export const logoutAdmin = () => {
  localStorage.removeItem("adminToken");
};

// ─── Service Discovery APIs ──────────────────────────────────────────────────
export const fetchServices = async (searchQuery = "") => {
  const response = await api.get(`/services?search=${searchQuery}`);
  return response.data; // { success, count, services }
};

export const fetchServiceById = async (serviceId) => {
  const response = await api.get(`/services/${serviceId}`);
  return response.data;
};

export const createService = async (name, serviceId) => {
  const response = await api.post("/services", { name, serviceId });
  return response.data;
};

// ─── Token Queue APIs ────────────────────────────────────────────────────────
// Public: Generate token for a specific service
export const generateToken = async (serviceId) => {
  const response = await api.post("/tokens", { serviceId });
  return response.data;
};

// Public: Fetch queue for a specific service
export const fetchTokens = async (serviceId) => {
  const response = await api.get(`/tokens?serviceId=${serviceId}`);
  // Returning object to maintain compatibility with previous expectations
  return { success: true, tokens: response.data }; 
};

// Admin: Call Next Token (Admin's service derived from JWT on backend)
export const callNextToken = async () => {
  const response = await api.put("/tokens/call-next");
  return { success: true, token: response.data };
};

// Admin: Complete Token
export const completeToken = async (id) => {
  const response = await api.put(`/tokens/complete/${id}`);
  return response.data;
};

export const skipToken = async () => {
  const response = await api.put("/tokens/skip");
  return response.data;
};

export const clearCompletedTokens = async () => {
  const response = await api.delete("/tokens/completed");
  return response.data;
};

export const fetchStats = async () => {
  const response = await api.get("/tokens/stats");
  return response.data;
};

export const pauseQueue = async () => {
  const response = await api.put("/services/pause");
  return response.data;
};

export const resumeQueue = async () => {
  const response = await api.put("/services/resume");
  return response.data;
};

export const updateServiceConfig = async (config) => {
  const response = await api.put("/services/config", config);
  return response.data;
};

export const updateServiceStatus = async (status) => {
  const response = await api.put("/services/status", { status });
  return response.data;
};

// Admin: Reset Queue
export const resetQueue = async () => {
  const response = await api.delete("/tokens/reset");
  return { success: true, message: response.data.message };
};
