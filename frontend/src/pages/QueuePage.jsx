import { useState, useEffect, useCallback } from "react";
import { fetchTokens } from "../services/api";
import QueueTable from "../components/QueueTable";

export default function QueuePage() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTokens = useCallback(async () => {
    try {
      const data = await fetchTokens();
      if (data.success) {
        setTokens(data.tokens);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll every 3 seconds
  useEffect(() => {
    loadTokens();
    const interval = setInterval(loadTokens, 3000);
    return () => clearInterval(interval);
  }, [loadTokens]);

  return (
    <div className="max-w-5xl mx-auto mt-6">
      <div className="h-[calc(100vh-12rem)] min-h-[600px]">
        {loading && tokens.length === 0 ? (
          <div className="h-full bg-white rounded-3xl shadow-xl border border-slate-100 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <svg className="w-10 h-10 text-indigo-500 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              <p className="text-lg font-medium text-slate-500">Connecting to Queue Server…</p>
            </div>
          </div>
        ) : (
          <QueueTable tokens={tokens} />
        )}
      </div>
    </div>
  );
}
