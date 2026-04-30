import StatusBadge from "./StatusBadge";

export default function QueueTable({ tokens }) {
  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center">
          <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">Live Queue Dashboard</h2>
          <p className="text-slate-500 font-medium">Real-time token tracking</p>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto p-6">
        {tokens.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
            <svg className="w-16 h-16 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-lg font-medium">The queue is currently empty</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tokens.map((token) => (
              <div
                key={token._id}
                className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${
                  token.status === "called" ? "border-emerald-300 bg-emerald-50 shadow-md scale-[1.01]" : "border-slate-100 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-xl shadow-inner ${
                    token.status === "called" ? "bg-emerald-200 text-emerald-800" : "bg-slate-100 text-slate-700"
                  }`}>
                    {token.tokenId}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Token ID</p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">{formatTime(token.createdAt)}</p>
                  </div>
                </div>

                {/* Status Badge Component */}
                <StatusBadge status={token.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
