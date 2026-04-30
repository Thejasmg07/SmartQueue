export default function QueueTable({ tokens }) {
  // ── Helpers ───────────────────────────────────────────────────────────────
  const getStatusClasses = (status) => {
    switch (status) {
      case "waiting":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "called":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 animate-pulse font-bold";
      case "completed":
        return "bg-slate-100 text-slate-500 border-slate-200";
      default:
        return "bg-gray-100 text-gray-500 border-gray-200";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "waiting":
        return "Waiting";
      case "called":
        return "Now Serving";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Live Queue</h2>
          <p className="text-xs text-slate-500">Real-time token status</p>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto p-4">
        {tokens.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
            <svg className="w-12 h-12 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-sm font-medium">Queue is currently empty</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {tokens.map((token) => (
              <div
                key={token._id}
                className={`
                  flex items-center justify-between p-4 rounded-xl border
                  transition-all duration-300
                  ${token.status === "called" ? "border-emerald-300 bg-emerald-50 shadow-md scale-[1.02]" : "border-slate-100 bg-white hover:border-slate-300"}
                `}
              >
                {/* Token ID */}
                <div className="flex items-center gap-4">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                    ${token.status === "called" ? "bg-emerald-200 text-emerald-800" : "bg-slate-100 text-slate-700"}
                  `}>
                    {token.tokenId}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Token ID</p>
                    <p className="text-xs text-slate-500">{formatTime(token.createdAt)}</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`
                  px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-wide uppercase
                  ${getStatusClasses(token.status)}
                `}>
                  {getStatusLabel(token.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
