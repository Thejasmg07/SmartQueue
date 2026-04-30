import { useState } from "react";
import { generateToken } from "../services/api";

export default function UserPage() {
  const [lastToken, setLastToken]   = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [animate, setAnimate]       = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await generateToken();
      if (!data.success) throw new Error(data.message);
      setLastToken(data.token);
      setAnimate(false);
      setTimeout(() => setAnimate(true), 10);
    } catch (err) {
      setError(err.message || "Failed to generate token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="bg-white rounded-3xl shadow-xl p-10 flex flex-col gap-8 border border-slate-100">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Get Your Token</h2>
            <p className="text-slate-500 mt-2">Join the queue instantly by generating a new token.</p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-4 px-6 rounded-2xl font-bold text-white text-lg bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Generating…
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              Generate Token
            </>
          )}
        </button>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center font-medium">
            ⚠️ {error}
          </div>
        )}

        {lastToken && (
          <div className={`mt-4 rounded-3xl border-2 border-indigo-200 bg-indigo-50 p-8 text-center transition-all duration-500 ${animate ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
            <p className="text-sm text-indigo-500 font-bold uppercase tracking-widest mb-2">Your Token Number</p>
            <p className="text-7xl font-black text-indigo-700 tracking-tighter shadow-sm">{lastToken.tokenId}</p>
            <p className="text-sm text-indigo-400 font-medium mt-4">Issued at {new Date(lastToken.createdAt).toLocaleTimeString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}
