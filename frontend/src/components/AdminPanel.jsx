import { useState } from "react";

const API = "http://localhost:5000/api/tokens";

export default function AdminPanel({ tokens, onAction }) {
  const [loggedIn, setLoggedIn]     = useState(false);
  const [password, setPassword]     = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading]       = useState("");
  const [feedback, setFeedback]     = useState({ type: "", msg: "" });

  const ADMIN_PASSWORD = "admin123";
  const nowServing     = tokens.find((t) => t.status === "called");
  const waitingCount   = tokens.filter((t) => t.status === "waiting").length;

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback({ type: "", msg: "" }), 3000);
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) { setLoggedIn(true); setLoginError(""); }
    else setLoginError("Incorrect password. Hint: admin123");
  };

  const callNext = async () => {
    setLoading("call");
    try {
      const res  = await fetch(`${API}/call-next`, { method: "PUT" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showFeedback("success", `Now calling ${data.token.tokenId}`);
      onAction?.();
    } catch (err) { showFeedback("error", err.message); }
    finally { setLoading(""); }
  };

  const markCompleted = async () => {
    if (!nowServing) return;
    setLoading("complete");
    try {
      const res  = await fetch(`${API}/complete/${nowServing._id}`, { method: "PUT" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showFeedback("success", `${data.token.tokenId} marked completed.`);
      onAction?.();
    } catch (err) { showFeedback("error", err.message); }
    finally { setLoading(""); }
  };

  const resetQueue = async () => {
    if (!window.confirm("Reset entire queue? This cannot be undone.")) return;
    setLoading("reset");
    try {
      const res  = await fetch(`${API}/reset`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showFeedback("success", "Queue has been reset.");
      onAction?.();
    } catch (err) { showFeedback("error", err.message); }
    finally { setLoading(""); }
  };

  /* ── Login Gate ─────────────────────────────────────────────────────── */
  if (!loggedIn) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Admin Login</h2>
            <p className="text-xs text-slate-500">Enter password to access controls</p>
          </div>
        </div>
        <input
          id="admin-password-input"
          type="password"
          placeholder="Enter admin password…"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-rose-300 transition"
        />
        {loginError && <p className="text-xs text-red-500">{loginError}</p>}
        <button
          id="admin-login-btn"
          onClick={handleLogin}
          className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm active:scale-95 transition-all duration-200 shadow"
        >
          Login
        </button>
        <p className="text-xs text-slate-400 text-center">
          Password: <span className="font-mono font-medium">admin123</span>
        </p>
      </div>
    );
  }

  /* ── Admin Dashboard ────────────────────────────────────────────────── */
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Admin Panel</h2>
            <p className="text-xs text-slate-500">Queue control center</p>
          </div>
        </div>
        <button onClick={() => setLoggedIn(false)} className="text-xs text-slate-400 hover:text-slate-600 transition">
          Logout
        </button>
      </div>

      {/* Now Serving Banner */}
      <div className={`rounded-xl p-4 text-center border-2 ${nowServing ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Now Serving</p>
        {nowServing
          ? <p className="text-4xl font-black text-emerald-600 tracking-tight">{nowServing.tokenId}</p>
          : <p className="text-sm text-slate-400 font-medium">— No token currently called —</p>}
      </div>

      {/* Stats Row */}
      <div className="flex gap-3">
        <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{waitingCount}</p>
          <p className="text-xs text-amber-500 font-medium mt-0.5">Waiting</p>
        </div>
        <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-slate-600">{tokens.filter((t) => t.status === "completed").length}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Completed</p>
        </div>
        <div className="flex-1 bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-indigo-600">{tokens.length}</p>
          <p className="text-xs text-indigo-500 font-medium mt-0.5">Total</p>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback.msg && (
        <div className={`rounded-xl px-4 py-2.5 text-sm font-medium ${feedback.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {feedback.type === "success" ? "✅" : "⚠️"} {feedback.msg}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <button
          id="call-next-btn"
          onClick={callNext}
          disabled={loading === "call" || waitingCount === 0 || !!nowServing}
          className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-95 transition-all duration-200 shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {loading === "call" ? "Calling…" : "Call Next Token"}
        </button>

        <button
          id="mark-completed-btn"
          onClick={markCompleted}
          disabled={loading === "complete" || !nowServing}
          className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 active:scale-95 transition-all duration-200 shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {loading === "complete" ? "Completing…" : "Mark Completed"}
        </button>

        <button
          id="reset-queue-btn"
          onClick={resetQueue}
          disabled={loading === "reset" || tokens.length === 0}
          className="w-full py-3 rounded-xl font-semibold text-sm text-rose-600 border-2 border-rose-200 bg-white hover:bg-rose-50 hover:border-rose-400 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          {loading === "reset" ? "Resetting…" : "Reset Queue"}
        </button>
      </div>
    </div>
  );
}
