import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { fetchTokens, generateToken, fetchServiceById } from "../services/api";

export default function QueuePage() {
  const { serviceId } = useParams();
  
  const [service, setService] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [actionFeedback, setActionFeedback] = useState("");
  
  // Scoped user token state
  const [myToken, setMyToken] = useState(null);
  const [queuePosition, setQueuePosition] = useState(null);
  const [animateCard, setAnimateCard] = useState(false);

  // Initialize token from storage
  useEffect(() => {
    const stored = localStorage.getItem("smartQueue_myTokens");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed[serviceId]) {
          setMyToken(parsed[serviceId]);
        }
      } catch(e) {
        console.error("Failed to parse tokens");
      }
    }
  }, [serviceId]);

  // Save to storage helper
  const saveTokenToStorage = (tokenObj) => {
    const stored = localStorage.getItem("smartQueue_myTokens");
    let parsed = {};
    if (stored) {
      try { parsed = JSON.parse(stored); } catch(e) {}
    }
    
    if (tokenObj) {
      parsed[serviceId] = tokenObj;
    } else {
      delete parsed[serviceId];
    }
    localStorage.setItem("smartQueue_myTokens", JSON.stringify(parsed));
  };

  const loadData = useCallback(async () => {
    if (!serviceId) return;
    try {
      // 1. Fetch Service Metadata
      const serviceRes = await fetchServiceById(serviceId);
      if (serviceRes.success) {
        setService(serviceRes.service);
      }

      // 2. Fetch Live Queue
      const queueRes = await fetchTokens(serviceId);
      if (queueRes.success) {
        setTokens(queueRes.tokens);
        
        // 3. Sync User Token Status & Position
        if (myToken) {
          const latestMe = queueRes.tokens.find(t => t._id === myToken._id);
          if (latestMe) {
            // Update local storage if status changed
            if (latestMe.status !== myToken.status) {
              setMyToken(latestMe);
              saveTokenToStorage(latestMe);
            }
            
            // Calculate Position
            if (latestMe.status === "waiting") {
              const waitingLine = queueRes.tokens.filter(t => t.status === "waiting");
              const myIndex = waitingLine.findIndex(t => t._id === latestMe._id);
              setQueuePosition(myIndex + 1);
            } else {
              setQueuePosition(null);
            }
          }
        }
      }
    } catch (err) {
      setError("Unable to connect to the queue. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [serviceId, myToken]);

  // Polling mechanism
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleGenerateToken = async () => {
    setGenerating(true);
    setActionFeedback("");
    try {
      const data = await generateToken(serviceId);
      if (data && data._id) {
        setMyToken(data);
        saveTokenToStorage(data);
        setAnimateCard(true);
        setTimeout(() => setAnimateCard(false), 500); // trigger css animation pop
        await loadData();
      }
    } catch (err) {
      setActionFeedback(err.response?.data?.message || "Failed to generate token.");
    } finally {
      setGenerating(false);
    }
  };

  const handleClearToken = () => {
    setMyToken(null);
    saveTokenToStorage(null);
  };

  if (loading && !service) {
    return (
      <div className="flex h-[60vh] items-center justify-center flex-col gap-4">
        <svg className="w-10 h-10 text-indigo-500 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        <p className="text-slate-500 font-medium tracking-wide">Loading Queue Data...</p>
      </div>
    );
  }

  if (error && !service) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-rose-50 border-2 border-rose-200 rounded-3xl p-10 text-center">
        <p className="text-xl font-bold text-rose-700">{error}</p>
      </div>
    );
  }

  const nowServing = tokens.find(t => t.status === "called");
  const serviceStatus = service?.status || (service?.isPaused ? "paused" : "active");
  const isLimitReached = service?.maxTokensPerDay > 0 && 
    (tokens.filter(t => new Date(t.createdAt).toDateString() === new Date().toDateString()).length >= service.maxTokensPerDay);
  const avgServiceTime = service?.avgServiceTime || 5; 
    (tokens.filter(t => new Date(t.createdAt).toDateString() === new Date().toDateString()).length >= service.maxTokensPerDay);

  return (
    <div className="max-w-5xl mx-auto mt-4 md:mt-8 flex flex-col gap-8 pb-12">
      
      {/* ── Header: Service Info ── */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 flex flex-col items-center text-center gap-3 relative overflow-hidden">
        {serviceStatus !== "active" && (
           <div className={`absolute top-0 left-0 w-full text-xs font-black py-1.5 tracking-widest uppercase shadow-md ${serviceStatus === "paused" ? "bg-amber-400 text-amber-900" : "bg-rose-500 text-rose-50"}`}>
             Queue is {serviceStatus}
           </div>
        )}
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mt-2">
          <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-slate-800">{service?.name || "Service Queue"}</h1>
        {service?.location && <p className="text-slate-500 font-medium">📍 {service.location}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* ── Left Column: User Participation Panel ── */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 h-full flex flex-col justify-center">
            
            {!myToken ? (
              // Generation View
              <div className="flex flex-col items-center text-center gap-6 py-4 animate-fade-in">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Join the Queue</h3>
                  <p className="text-slate-500 text-sm">Generate a digital token to secure your spot in line.</p>
                </div>

                {serviceStatus === "paused" ? (
                  <p className="text-amber-600 font-bold bg-amber-50 px-6 py-4 rounded-xl w-full border border-amber-200 shadow-sm flex flex-col gap-1 items-center justify-center">
                    <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Queue is currently paused. Please wait.
                  </p>
                ) : serviceStatus === "closed" ? (
                  <p className="text-rose-600 font-bold bg-rose-50 px-6 py-4 rounded-xl w-full border border-rose-200 shadow-sm flex flex-col gap-1 items-center justify-center">
                    <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Queue is closed for today.
                  </p>
                ) : isLimitReached ? (
                  <p className="text-rose-600 font-bold bg-rose-50 px-6 py-3 rounded-xl w-full border border-rose-200">
                    Queue is full for today.
                  </p>
                ) : (
                  <button
                    onClick={handleGenerateToken}
                    disabled={generating}
                    className="w-full py-5 rounded-2xl font-black text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg active:scale-95 text-lg flex items-center justify-center gap-2"
                  >
                    {generating ? (
                      <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                    ) : (
                      "GENERATE TOKEN"
                    )}
                  </button>
                )}

                {actionFeedback && <p className="text-sm font-bold text-rose-500">{actionFeedback}</p>}
              </div>
            ) : (
              // Token View
              <div className={`flex flex-col items-center text-center gap-6 transition-transform duration-300 ${animateCard ? 'scale-105' : 'scale-100'}`}>
                <div className={`w-full rounded-3xl p-8 border-4 shadow-xl relative overflow-hidden transition-colors duration-500
                  ${myToken.status === "called" ? "bg-emerald-50 border-emerald-400" : 
                    myToken.status === "completed" ? "bg-slate-50 border-slate-200" : 
                    myToken.status === "skipped" ? "bg-rose-50 border-rose-200" :
                    "bg-indigo-50 border-indigo-400"}
                `}>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-4 
                    ${myToken.status === "called" ? "text-emerald-600" : 
                      myToken.status === "completed" ? "text-slate-500" : 
                      myToken.status === "skipped" ? "text-rose-500" :
                      "text-indigo-600"}
                  `}>
                    Your Token Number
                  </p>
                  
                  <p className={`text-6xl md:text-8xl font-black tracking-tighter drop-shadow-sm mb-4
                    ${myToken.status === "called" ? "text-emerald-600 animate-pulse" : 
                      myToken.status === "completed" ? "text-slate-400" : 
                      myToken.status === "skipped" ? "text-rose-400 line-through" :
                      "text-indigo-600"}
                  `}>
                    {myToken.tokenId}
                  </p>

                  <div className="bg-white/60 rounded-xl py-3 px-4 backdrop-blur-sm shadow-sm inline-block">
                    {myToken.status === "waiting" && (
                      <div className="flex flex-col gap-2">
                        <p className="text-indigo-800 font-bold">
                          Position in Line: <span className="text-2xl ml-2">{queuePosition || "-"}</span>
                        </p>
                        {queuePosition > 1 && (
                          <div className="bg-indigo-100/50 rounded-lg p-2 text-sm text-indigo-700 font-medium">
                            <span className="opacity-75 mr-1">Estimated Wait:</span>
                            <strong>~{(queuePosition - 1) * avgServiceTime} mins</strong>
                          </div>
                        )}
                        {queuePosition === 1 && (
                          <p className="text-sm font-bold text-emerald-600 mt-1 animate-pulse">
                            You are next! Get ready.
                          </p>
                        )}
                      </div>
                    )}
                    {myToken.status === "called" && (
                      <p className="text-emerald-700 font-bold text-lg animate-bounce">
                        🎉 IT'S YOUR TURN NOW!
                      </p>
                    )}
                    {myToken.status === "completed" && (
                      <p className="text-slate-600 font-bold">Service Completed</p>
                    )}
                    {myToken.status === "skipped" && (
                      <p className="text-rose-600 font-bold">Token Skipped</p>
                    )}
                  </div>
                </div>

                {(myToken.status === "completed" || myToken.status === "skipped") && (
                  <button 
                    onClick={handleClearToken}
                    className="text-sm font-bold text-slate-400 hover:text-slate-600 underline"
                  >
                    Clear Token & Start Over
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Now Serving Display ── */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-800 rounded-3xl shadow-2xl p-8 border border-slate-700 h-full flex flex-col justify-center items-center text-center relative overflow-hidden min-h-[300px]">
            {/* Subtle background glow */}
            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-colors duration-1000 ${nowServing ? 'bg-emerald-500/20' : 'bg-slate-600/10'}`}></div>

            <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 z-10">
              Now Serving
            </p>
            
            {nowServing ? (
              <div className="z-10 animate-fade-in">
                <p className="text-7xl md:text-9xl font-black text-emerald-400 tracking-tighter drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                  {nowServing.tokenId}
                </p>
                <p className="text-emerald-500/80 font-bold tracking-widest uppercase mt-6 animate-pulse">
                  Proceed to Counter
                </p>
              </div>
            ) : (
              <div className="z-10 py-10">
                <p className="text-3xl font-medium text-slate-600">
                  — None —
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
