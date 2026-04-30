import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerAdmin } from "../services/api";

export default function AdminRegister() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    serviceName: "",
    serviceType: "hospital",
    location: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password || !formData.serviceName) {
      setError("Please fill out all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await registerAdmin(
        formData.username,
        formData.password,
        formData.serviceName,
        formData.serviceType,
        formData.location
      );
      // Auto-login happens in api.js, redirect to dashboard
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white rounded-3xl shadow-xl p-10 border border-slate-100 flex flex-col gap-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-800">Create an Account</h2>
        <p className="text-sm text-slate-500 mt-2">Set up your admin profile and queue service.</p>
      </div>

      <form onSubmit={handleRegister} className="flex flex-col gap-4 mt-2">
        
        {/* Admin Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-1">Admin Credentials</h3>
          <input
            type="text"
            name="username"
            placeholder="Username *"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none transition-colors"
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 chars) *"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none transition-colors"
          />
        </div>

        {/* Service Details */}
        <div className="space-y-3 mt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-1">Service Queue Details</h3>
          <input
            type="text"
            name="serviceName"
            placeholder="Queue Name (e.g., Dr. Smith Checkups) *"
            value={formData.serviceName}
            onChange={handleChange}
            className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none transition-colors"
          />
          
          <div className="grid grid-cols-2 gap-3">
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none transition-colors bg-white text-slate-600"
            >
              <option value="hospital">Hospital/Clinic</option>
              <option value="bank">Bank</option>
              <option value="temple">Temple</option>
              <option value="retail">Retail Store</option>
              <option value="other">Other</option>
            </select>
            
            <input
              type="text"
              name="location"
              placeholder="Location (Optional)"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none transition-colors"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500 font-medium text-center bg-red-50 p-2 rounded-lg">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 mt-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg active:scale-95 transition-all shadow-md disabled:opacity-60"
        >
          {loading ? "Setting up..." : "Register & Create Queue"}
        </button>
      </form>

      <div className="text-center mt-2 border-t border-slate-100 pt-6">
        <p className="text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/admin/login" className="text-indigo-600 font-bold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
