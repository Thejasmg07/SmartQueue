import { useState } from "react";

const API = "http://localhost:5000/api/tokens";

/**
 * UserPanel — Lets a user generate a new queue token.
 * Shows the last generated token and calls onTokenGenerated so
 * the parent can trigger a data refresh.
 */
export default function UserPanel({ onTokenGenerated }) {
  const [lastToken, setLastToken]   = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [animate, setAnimate]       = useState(false);

  const generateToken = async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(API, { method: "POST" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setLastToken(data.token);
      // Trigger pop-in animation
      setAnimate(false);
      setTimeout(() => setAnimate(true), 10);
      onTokenGenerated?.();
    } catch (err) {
      setError(err.message || "Failed to generate token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-5 border border-slate-100">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Get Your Token</h2>
          <p className="text-xs text-slate-500">Join the queue instantly</p>
        </div>
      </div>

      {/* Generate Button */}
      <button
        id="generate-token-btn"
        onClick={generateToken}
        disabled={loading}
        className="
          w-full py-3 px-6 rounded-xl font-semibold text-white text-sm
          bg-gradient-to-r from-indigo-500 to-violet-600
          hover:from-indigo-600 hover:to-violet-700
          active:scale-95 transition-all duration-200
          shadow-md hover:shadow-lg
          disabled:opacity-60 disabled:cursor-not-allowed
          flex items-center justify-center gap-2
        "
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Generating…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Generate Token
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          ⚠️ {error}
        </div>
      )}

      {/* Last Generated Token */}
      {lastToken && (
        <div
          className={`
            rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4 text-center
            transition-all duration-500
            ${animate ? "opacity-100 scale-100" : "opacity-0 scale-90"}
          `}
        >
          <p className="text-xs text-indigo-500 font-medium uppercase tracking-widest mb-1">
            Your Token
          </p>
          <p className="text-5xl font-black text-indigo-700 tracking-tight">
            {lastToken.tokenId}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Issued at {new Date(lastToken.createdAt).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}
