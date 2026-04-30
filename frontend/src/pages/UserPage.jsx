import { useState, useEffect, useCallback } from "react";
import { generateToken, fetchTokens } from "../services/api";

export default function UserPage() {
  const [myToken, setMyToken] = useState(null);
  const [queuePosition, setQueuePosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [animate, setAnimate] = useState(false);

  const [targetService, setTargetService] = useState(null);

  // ── 0. Fetch First Available Service on Mount ──
  useEffect(() => {
    async function loadService() {
      try {
        const servicesRes = await fetch("http://localhost:5000/api/services");
        const servicesData = await servicesRes.json();
        if (servicesData.success && servicesData.services.length > 0) {
          setTargetService(servicesData.services[0].serviceId);
        }
      } catch (err) {
        console.error("Failed to load service", err);
      }
    }
    loadService();
  }, []);

  // ── 1. Load Local Token on Mount ──
  useEffect(() => {
    const savedToken = localStorage.getItem("mySmartQueueToken");
    if (savedToken) {
      setMyToken(JSON.parse(savedToken));
      setAnimate(true);
    }
  }, []);

  // ── 2. Poll the Queue to Find Position ──
  const checkMyStatus = useCallback(async () => {
    if (!myToken || !targetService) return;

    try {
      const data = await fetchTokens(targetService);
      if (data.success) {
        const tokens = data.tokens;
        const me = tokens.find((t) => t._id === myToken._id);

        if (!me) return;

        // Update local status if it changed
        if (me.status !== myToken.status) {
          const updatedToken = { ...myToken, status: me.status };
          setMyToken(updatedToken);
          localStorage.setItem("mySmartQueueToken", JSON.stringify(updatedToken));

          if (me.status === "completed") {
            // Auto-clear token once they are done
            setTimeout(() => {
              localStorage.removeItem("mySmartQueueToken");
              setMyToken(null);
              setQueuePosition(null);
            }, 5000); // give them 5 seconds to see it's completed
          }
        }

        // Calculate Position in line
        if (me.status === "waiting") {
          const waitingLine = tokens.filter((t) => t.status === "waiting");
          const myIndex = waitingLine.findIndex((t) => t._id === myToken._id);
          setQueuePosition(myIndex + 1); // 0-index -> 1-index
        } else {
          setQueuePosition(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [myToken, targetService]);

  useEffect(() => {
    checkMyStatus();
    const interval = setInterval(checkMyStatus, 3000);
    return () => clearInterval(interval);
  }, [checkMyStatus]);

  // ── 3. Handle Generation ──
  const handleGenerate = async () => {
    if (!targetService) {
      setError("No services available to join right now.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await generateToken(targetService);
      if (!data) throw new Error("Generation failed");

      setMyToken(data);
      localStorage.setItem("mySmartQueueToken", JSON.stringify(data));

      setAnimate(false);
      setTimeout(() => setAnimate(true), 10);
      checkMyStatus(); // immediately check position
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to generate token.");
    } finally {
      setLoading(false);
    }
  };

  // ── UX Helpers ──
  const hasActiveToken = myToken && myToken.status !== "completed";

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="bg-white rounded-3xl shadow-xl p-10 flex flex-col gap-8 border border-slate-100">

        {/* Header */}
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

        {/* Generate Button (Disabled if already have a token) */}
        {!hasActiveToken && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl font-bold text-white text-lg bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating…
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Generate Token
              </>
            )}
          </button>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Display Active Token */}
        {myToken && (
          <div className={`mt-4 rounded-3xl border-2 p-8 text-center transition-all duration-500 ${animate ? "opacity-100 scale-100" : "opacity-0 scale-90"
            } ${myToken.status === "called"
              ? "border-emerald-400 bg-emerald-50 shadow-emerald-100 shadow-xl"
              : myToken.status === "completed"
                ? "border-slate-200 bg-slate-50"
                : "border-indigo-200 bg-indigo-50"
            }`}>
            <p className={`text-sm font-bold uppercase tracking-widest mb-2 ${myToken.status === "called" ? "text-emerald-600" : "text-indigo-500"
              }`}>
              Your Token Number
            </p>
            <p className={`text-7xl font-black tracking-tighter shadow-sm ${myToken.status === "called" ? "text-emerald-700 animate-pulse" : myToken.status === "completed" ? "text-slate-400" : "text-indigo-700"
              }`}>
              {myToken.tokenId}
            </p>

            {/* Dynamic Status Display */}
            <div className="mt-6 space-y-2">
              {myToken.status === "waiting" && queuePosition !== null && (
                <>
                  <p className="text-lg text-indigo-900 font-semibold">
                    Position in Queue: <span className="text-2xl font-black text-indigo-600 ml-1">{queuePosition}</span>
                  </p>
                  <p className="text-sm text-indigo-500">Please wait for your number to be called.</p>
                </>
              )}

              {myToken.status === "called" && (
                <p className="text-xl font-black text-emerald-600 uppercase tracking-wide">
                  🎉 It's your turn! Please proceed.
                </p>
              )}

              {myToken.status === "completed" && (
                <p className="text-slate-500 font-medium">
                  Service Completed. Thank you!
                </p>
              )}
            </div>

            {myToken.status === "waiting" && (
              <p className="text-xs text-indigo-400 font-medium mt-6">
                Issued at {new Date(myToken.createdAt).toLocaleTimeString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
