import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchTokens,
  callNextToken,
  completeToken,
  skipToken,
  clearCompletedTokens,
  resetQueue,
  fetchStats,
  pauseQueue,
  resumeQueue,
  logoutAdmin,
  updateServiceConfig,
  updateServiceStatus,
} from "../services/api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'settings'
  const [tokens, setTokens] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingAction, setLoadingAction] = useState("");
  const [feedback, setFeedback] = useState({ type: "", msg: "" });
  const navigate = useNavigate();

  const [configForm, setConfigForm] = useState({ name: "", type: "general", location: "", maxTokensPerDay: 0, avgServiceTime: 5 });
  const [formReady, setFormReady] = useState(false); // tracks whether form was pre-populated from API

  // ── Protected Route Logic ──
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const loadData = useCallback(async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    try {
      const statsData = await fetchStats();
      if (statsData) {
        setStats(statsData);
        // Using the serviceId derived from stats to fetch public token data
        const tokensData = await fetchTokens(statsData.service.serviceId);
        if (tokensData.success) {
          setTokens(tokensData.tokens);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Sync settings form from API — only on first load, not on every poll
  useEffect(() => {
    if (stats?.service && !formReady) {
      setConfigForm({
        name: stats.service.name || "",
        type: stats.service.type || "general",
        location: stats.service.location || "",
        maxTokensPerDay: stats.service.maxTokensPerDay ?? 0,
        avgServiceTime: stats.service.avgServiceTime ?? 5,
      });
      setFormReady(true);
    }
  }, [stats, formReady]);

  const nowServing = tokens.find((t) => t.status === "called");
  const waitingCount = stats?.waiting || 0;
  const isPaused = stats?.service?.isPaused || false;
  const serviceStatus = stats?.service?.status || "active";

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback({ type: "", msg: "" }), 3000);
  };

  const handleAction = async (actionFn, actionName, successMsg, requireConfirm = false) => {
    if (requireConfirm && !window.confirm(`Are you sure you want to ${actionName}?`)) return;
    
    setLoadingAction(actionName);
    try {
      await actionFn();
      showFeedback("success", successMsg);
      loadData();
    } catch (err) {
      showFeedback("error", err.response?.data?.message || err.message);
    } finally {
      setLoadingAction("");
    }
  };

  const handleCallNext = () => handleAction(callNextToken, "call", "Calling next token...");
  const handleComplete = () => handleAction(() => completeToken(nowServing._id), "complete", "Marked as completed.");
  const handleSkip = () => handleAction(skipToken, "skip", "Token skipped.");
  const handleClearCompleted = () => handleAction(clearCompletedTokens, "clear", "Completed & skipped tokens cleared.", true);
  const handleReset = () => handleAction(resetQueue, "reset", "Entire queue reset.", true);
  
  const handleStatusChange = async (newStatus) => {
    if (newStatus === serviceStatus) return;
    setLoadingAction("status");
    try {
      await updateServiceStatus(newStatus);
      showFeedback("success", `Service is now ${newStatus.toUpperCase()}`);
      loadData();
    } catch (err) {
      showFeedback("error", err.response?.data?.message || err.message);
    } finally {
      setLoadingAction("");
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin/login");
  };

  const copyServiceLink = () => {
    if (!stats) return;
    const url = `${window.location.origin}/queue/${stats.service.serviceId}`;
    navigator.clipboard.writeText(url);
    showFeedback("success", "Service link copied!");
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    setLoadingAction("config");
    try {
      await updateServiceConfig(configForm);
      showFeedback("success", "Settings saved to database!");
      // Reset formReady so the Live Info Card refreshes from the API response
      setFormReady(false);
      await loadData();
    } catch (err) {
      showFeedback("error", err.response?.data?.message || err.message);
    } finally {
      setLoadingAction("");
    }
  };

  // ── Render Views ──
  const renderDashboard = () => (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Top Header / Link */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              Queue Dashboard
              {serviceStatus === "active" && <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full uppercase tracking-widest">Active</span>}
              {serviceStatus === "paused" && <span className="bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full uppercase tracking-widest">Paused</span>}
              {serviceStatus === "closed" && <span className="bg-rose-100 text-rose-700 text-xs px-2.5 py-1 rounded-full uppercase tracking-widest">Closed</span>}
            </h2>
            <p className="text-slate-500 font-medium text-sm">Live management for {stats?.service?.name || "Queue"}</p>
          </div>
        </div>
        <button onClick={copyServiceLink} className="px-5 py-2.5 rounded-xl font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors shadow-sm active:scale-95 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Copy Public Link
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        {/* Left Column: Actions & Current Token */}
        <div className="flex flex-col gap-6">
          {/* Now Serving */}
          <div className={`rounded-3xl p-10 text-center border-2 transition-colors duration-500 relative shadow-sm ${nowServing ? "bg-emerald-50 border-emerald-200" : serviceStatus === "paused" ? "bg-amber-50 border-amber-200" : serviceStatus === "closed" ? "bg-rose-50 border-rose-200" : "bg-white border-slate-100"}`}>
            {serviceStatus !== "active" && (
              <div className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm ${serviceStatus === "paused" ? "bg-amber-200 text-amber-800" : "bg-rose-200 text-rose-800"}`}>
                {serviceStatus}
              </div>
            )}
            <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Currently Serving</p>
            {nowServing ? (
              <p className="text-8xl font-black text-emerald-600 tracking-tighter drop-shadow-sm">{nowServing.tokenId}</p>
            ) : (
              <p className="text-2xl text-slate-300 font-medium py-8">— No token called —</p>
            )}
          </div>

          {/* Primary Controls */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleCallNext}
              disabled={loadingAction !== "" || waitingCount === 0 || !!nowServing || isPaused || serviceStatus === "closed"}
              className="py-5 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-95 text-lg"
            >
              {loadingAction === "call" ? "Calling…" : "CALL NEXT"}
            </button>
            <button
              onClick={handleComplete}
              disabled={loadingAction !== "" || !nowServing}
              className="py-5 rounded-2xl font-black text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-95 text-lg"
            >
              {loadingAction === "complete" ? "Completing…" : "COMPLETE"}
            </button>
          </div>

          {/* Secondary Controls */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            <button
              onClick={handleSkip}
              disabled={loadingAction !== "" || !nowServing}
              className="py-3 rounded-xl font-bold text-rose-600 bg-white border border-rose-100 hover:bg-rose-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 text-sm"
            >
              Skip Active
            </button>
            <div className="relative">
              <select
                value={serviceStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={loadingAction !== ""}
                className="w-full py-3 px-4 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm outline-none disabled:opacity-50 appearance-none cursor-pointer text-sm text-center"
              >
                <option value="active">🟢 Active</option>
                <option value="paused">🟡 Paused</option>
                <option value="closed">🔴 Closed</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            <button
              onClick={handleClearCompleted}
              disabled={loadingAction !== "" || (stats?.completed === 0 && stats?.skipped === 0)}
              className="py-3 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 text-sm"
            >
              Clear History
            </button>
          </div>
        </div>

        {/* Right Column: Insights & Stats */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-1 ml-1">Live Insights</h3>
          
          <div className="bg-white rounded-2xl p-5 flex items-center justify-between border border-amber-100 shadow-sm border-l-4 border-l-amber-400">
            <span className="font-bold text-slate-600 text-sm tracking-wide">Waiting</span>
            <span className="text-3xl font-black text-amber-600">{stats?.waiting || 0}</span>
          </div>

          <div className="bg-white rounded-2xl p-5 flex items-center justify-between border border-slate-200 shadow-sm border-l-4 border-l-slate-400">
            <span className="font-bold text-slate-600 text-sm tracking-wide">Completed</span>
            <span className="text-3xl font-black text-slate-600">{stats?.completed || 0}</span>
          </div>

          <div className="bg-white rounded-2xl p-5 flex items-center justify-between border border-rose-100 shadow-sm border-l-4 border-l-rose-400">
            <span className="font-bold text-slate-600 text-sm tracking-wide">Skipped</span>
            <span className="text-3xl font-black text-rose-600">{stats?.skipped || 0}</span>
          </div>

          <div className="bg-white rounded-2xl p-5 flex items-center justify-between border border-indigo-100 shadow-sm border-l-4 border-l-indigo-500 mt-auto">
            <div className="flex flex-col">
              <span className="font-bold text-slate-600 text-sm tracking-wide">Generated Today</span>
              {stats?.service?.maxTokensPerDay > 0 && (
                <span className="text-xs text-slate-400">Limit: {stats.service.maxTokensPerDay}</span>
              )}
            </div>
            <span className="text-3xl font-black text-indigo-600">{stats?.todayCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="flex flex-col gap-6 animate-fade-in max-w-2xl">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Queue Settings</h2>
          <p className="text-slate-500 font-medium text-sm">Saved changes sync across all public displays in real-time</p>
        </div>
        {!formReady && (
          <svg className="w-5 h-5 text-indigo-400 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        )}
      </div>

      {/* Live Service Info Card */}
      {stats?.service && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex flex-col gap-2">
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Currently Saved in Database</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Name</p>
              <p className="font-bold text-slate-800 mt-0.5 truncate">{stats.service.name}</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Type</p>
              <p className="font-bold text-slate-800 mt-0.5 capitalize">{stats.service.type || "general"}</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Location</p>
              <p className="font-bold text-slate-800 mt-0.5 truncate">{stats.service.location || "—"}</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Daily Limit</p>
              <p className="font-bold text-slate-800 mt-0.5">
                {stats.service.maxTokensPerDay > 0 ? stats.service.maxTokensPerDay : "Unlimited"}
              </p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm col-span-2">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Status</p>
              <p className="font-bold text-slate-800 mt-0.5 uppercase flex items-center gap-2">
                {serviceStatus === "active" && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                {serviceStatus === "paused" && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
                {serviceStatus === "closed" && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}
                {serviceStatus}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm mt-1">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-1">Service ID (Public Queue URL)</p>
            <p className="font-mono text-indigo-600 font-bold text-sm break-all">
              {window.location.origin}/queue/{stats.service.serviceId}
            </p>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleConfigSubmit} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-5">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-4">Edit Configuration</h3>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Queue / Service Name</label>
            <input
              type="text"
              required
              value={configForm.name}
              onChange={(e) => setConfigForm({...configForm, name: e.target.value})}
              placeholder="e.g. City Hospital OPD"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Service Type</label>
            <select
              value={configForm.type}
              onChange={(e) => setConfigForm({...configForm, type: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none transition-all bg-white"
            >
              <option value="general">General</option>
              <option value="hospital">Hospital</option>
              <option value="bank">Bank</option>
              <option value="government">Government</option>
              <option value="retail">Retail</option>
              <option value="clinic">Clinic</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="telecom">Telecom</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-600 mb-2">Location / Branch</label>
          <input
            type="text"
            value={configForm.location}
            onChange={(e) => setConfigForm({...configForm, location: e.target.value})}
            placeholder="e.g. Main Street, Building 2, Counter 3"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-600 mb-2">Avg. Service Time (Minutes)</label>
          <input
            type="number"
            min="1"
            value={configForm.avgServiceTime}
            onChange={(e) => setConfigForm({...configForm, avgServiceTime: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
          />
          <p className="text-xs text-slate-400 mt-2">Used to calculate estimated wait times for users in the queue.</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-600 mb-2">Daily Token Limit</label>
          <input
            type="number"
            min="0"
            value={configForm.maxTokensPerDay}
            onChange={(e) => setConfigForm({...configForm, maxTokensPerDay: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
          />
          <p className="text-xs text-slate-400 mt-2">Set to <strong>0</strong> for unlimited. When the limit is reached, new token generation is blocked.</p>
        </div>

        <button
          type="submit"
          disabled={loadingAction === "config" || !formReady}
          className="py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex items-center justify-center gap-2"
        >
          {loadingAction === "config" ? (
            <>
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
              Saving to Database...
            </>
          ) : "Save Settings"}
        </button>

        <div className="border-t border-slate-100 pt-6">
          <p className="text-sm font-bold text-rose-600 mb-3">⚠️ Danger Zone</p>
          <button
            type="button"
            onClick={handleReset}
            className="w-full py-4 rounded-xl font-bold text-rose-600 border-2 border-rose-200 hover:bg-rose-50 active:scale-95 transition-all"
          >
            Reset Entire Queue (Delete All Tokens)
          </button>
          <p className="text-xs text-slate-400 mt-2 text-center">This permanently deletes all tokens. Your service settings are preserved.</p>
        </div>
      </form>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-[85vh] gap-6 mt-4">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 flex flex-col gap-3 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 p-2 mb-4 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-slate-800 leading-tight">Admin</h3>
            <p className="text-xs font-bold text-slate-400">Workspace</p>
          </div>
        </div>

        <button 
          onClick={() => setActiveTab("dashboard")} 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === "dashboard" ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Dashboard
        </button>

        <button 
          onClick={() => setActiveTab("settings")} 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === "settings" ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Settings
        </button>

        <div className="mt-auto pt-4 border-t border-slate-100">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative">
        {activeTab === "dashboard" ? renderDashboard() : renderSettings()}

        {/* Feedback Toast */}
        {feedback.msg && (
          <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 rounded-full px-6 py-3 shadow-xl text-center text-sm font-bold flex items-center gap-2 animate-bounce ${feedback.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white z-50"}`}>
            {feedback.type === "success" ? "✅" : "⚠️"} {feedback.msg}
          </div>
        )}
      </main>
    </div>
  );
}
