import { useState, useEffect, useCallback } from "react";
import UserPanel from "./components/UserPanel";
import AdminPanel from "./components/AdminPanel";
import QueueTable from "./components/QueueTable";

const API = "http://localhost:5000/api/tokens";

export default function App() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  // ─── Fetch Data ─────────────────────────────────────────────────────────────
  const fetchTokens = useCallback(async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      if (data.success) {
        setTokens(data.tokens);
      }
    } catch (err) {
      console.error("Failed to fetch tokens:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Polling ────────────────────────────────────────────────────────────────
  // Refresh data every 3 seconds to keep multiple clients in sync (no websockets needed)
  useEffect(() => {
    fetchTokens(); // initial fetch
    const interval = setInterval(fetchTokens, 3000);
    return () => clearInterval(interval);
  }, [fetchTokens]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <header className="max-w-6xl mx-auto mb-8 flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-inner">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">SmartQueue</h1>
            <p className="text-xs font-medium text-slate-500 tracking-wider uppercase">Management System</p>
          </div>
        </div>
        
        {/* Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-semibold text-emerald-700">System Live</span>
        </div>
      </header>

      {/* ── Main Content Grid ────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Column (User & Admin Panels) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <UserPanel onTokenGenerated={fetchTokens} />
          <AdminPanel tokens={tokens} onAction={fetchTokens} />
        </div>

        {/* Right Column (Queue Table) */}
        <div className="lg:col-span-8 h-[calc(100vh-12rem)] min-h-[600px]">
          {loading && tokens.length === 0 ? (
            <div className="h-full bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <svg className="w-8 h-8 text-indigo-500 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                <p className="text-sm font-medium text-slate-500">Loading queue data…</p>
              </div>
            </div>
          ) : (
            <QueueTable tokens={tokens} />
          )}
        </div>

      </main>
    </div>
  );
}