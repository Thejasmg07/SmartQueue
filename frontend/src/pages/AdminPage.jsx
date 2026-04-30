import { useState, useEffect, useCallback } from "react";
import { fetchTokens, callNextToken, markTokenComplete, resetQueue } from "../services/api";

export default function AdminPage() {
  const [tokens, setTokens] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loadingAction, setLoadingAction] = useState("");
  const [feedback, setFeedback] = useState({ type: "", msg: "" });

  const ADMIN_PASSWORD = "admin123";

  const loadTokens = useCallback(async () => {
    if (!loggedIn) return;
    try {
      const data = await fetchTokens();
      if (data.success) setTokens(data.tokens);
    } catch (err) {
      console.error(err);
    }
  }, [loggedIn]);

  useEffect(() => {
    loadTokens();
    const interval = setInterval(loadTokens, 3000);
    return () => clearInterval(interval);
  }, [loadTokens]);

  const nowServing = tokens.find((t) => t.status === "called");
  const waitingCount = tokens.filter((t) => t.status === "waiting").length;

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback({ type: "", msg: "" }), 3000);
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Incorrect password. Hint: admin123");
    }
  };

  const handleCallNext = async () => {
    setLoadingAction("call");
    try {
      const data = await callNextToken();
      if (!data.success) throw new Error(data.message);
      showFeedback("success", `Now calling ${data.token.tokenId}`);
      loadTokens();
    } catch (err) {
      showFeedback("error", err.response?.data?.message || err.message);
    } finally {
      setLoadingAction("");
    }
  };

  const handleComplete = async () => {
    if (!nowServing) return;
    setLoadingAction("complete");
    try {
      const data = await markTokenComplete(nowServing._id);
      if (!data.success) throw new Error(data.message);
      showFeedback("success", `${data.token.tokenId} marked completed.`);
      loadTokens();
    } catch (err) {
      showFeedback("error", err.response?.data?.message || err.message);
    } finally {
      setLoadingAction("");
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset entire queue? This cannot be undone.")) return;
    setLoadingAction("reset");
    try {
      const data = await resetQueue();
      if (!data.success) throw new Error(data.message);
      showFeedback("success", "Queue has been reset.");
      loadTokens();
    } catch (err) {
      showFeedback("error", err.response?.data?.message || err.message);
    } finally {
      setLoadingAction("");
    }
  };

  if (!loggedIn) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white rounded-3xl shadow-xl p-10 border border-slate-100 flex flex-col gap-6 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-rose-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">Admin Login</h2>
          <p className="text-sm text-slate-500 mt-2">Enter password to access queue controls</p>
        </div>
        <input
          type="password"
          placeholder="Password…"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 text-center text-lg outline-none focus:border-rose-300 transition-colors"
        />
        {loginError && <p className="text-sm text-red-500 font-medium">{loginError}</p>}
        <button onClick={handleLogin} className="w-full py-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-lg active:scale-95 transition-transform shadow-md">
          Login to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-6 bg-white rounded-3xl shadow-xl p-8 border border-slate-100 flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">Admin Control Center</h2>
            <p className="text-slate-500 font-medium">Manage queue flow and actions</p>
          </div>
        </div>
        <button onClick={() => setLoggedIn(false)} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors">
          Logout
        </button>
      </div>

      {/* Now Serving */}
      <div className={`rounded-3xl p-8 text-center border-2 transition-colors duration-500 ${nowServing ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-100"}`}>
        <p className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3">Currently Serving</p>
        {nowServing ? (
          <p className="text-6xl font-black text-emerald-600 tracking-tighter">{nowServing.tokenId}</p>
        ) : (
          <p className="text-xl text-slate-400 font-medium">— No token currently called —</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 text-center">
          <p className="text-4xl font-black text-amber-600">{waitingCount}</p>
          <p className="text-sm text-amber-600/70 font-bold uppercase tracking-wider mt-2">Waiting</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
          <p className="text-4xl font-black text-slate-600">{tokens.filter(t => t.status === "completed").length}</p>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-2">Completed</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center">
          <p className="text-4xl font-black text-indigo-600">{tokens.length}</p>
          <p className="text-sm text-indigo-500/70 font-bold uppercase tracking-wider mt-2">Total</p>
        </div>
      </div>

      {/* Feedback */}
      {feedback.msg && (
        <div className={`rounded-xl px-6 py-4 text-center text-sm font-bold ${feedback.type === "success" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
          {feedback.type === "success" ? "✅" : "⚠️"} {feedback.msg}
        </div>
      )}

      {/* Action Controls */}
      <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
        <button
          onClick={handleCallNext}
          disabled={loadingAction === "call" || waitingCount === 0 || !!nowServing}
          className="py-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          {loadingAction === "call" ? "Calling…" : "Call Next Token"}
        </button>
        <button
          onClick={handleComplete}
          disabled={loadingAction === "complete" || !nowServing}
          className="py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          {loadingAction === "complete" ? "Completing…" : "Mark Completed"}
        </button>
        <button
          onClick={handleReset}
          disabled={loadingAction === "reset" || tokens.length === 0}
          className="py-4 rounded-xl font-bold text-rose-600 border-2 border-rose-200 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          {loadingAction === "reset" ? "Resetting…" : "Reset Queue"}
        </button>
      </div>

    </div>
  );
}
