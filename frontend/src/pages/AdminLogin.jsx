import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginAdmin } from "../services/api";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await loginAdmin(username, password);
      // On success, api.js stores the token in localStorage
      navigate("/admin"); // Redirect to protected dashboard
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white rounded-3xl shadow-xl p-10 border border-slate-100 flex flex-col gap-6 text-center">
      <div className="w-20 h-20 mx-auto rounded-full bg-rose-100 flex items-center justify-center">
        <svg className="w-10 h-10 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-800">Admin Login</h2>
        <p className="text-sm text-slate-500 mt-2">Secure access for staff</p>
      </div>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 text-center text-lg outline-none focus:border-rose-300 transition-colors"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 text-center text-lg outline-none focus:border-rose-300 transition-colors"
        />
      </div>

      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full py-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-lg active:scale-95 transition-all shadow-md disabled:opacity-60"
      >
        {loading ? "Authenticating..." : "Login to Dashboard"}
      </button>

      <div className="text-center mt-2 border-t border-slate-100 pt-6">
        <p className="text-sm text-slate-500">
          Don't have an account?{" "}
          <Link to="/admin/register" className="text-rose-600 font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
