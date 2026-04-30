export default function StatusBadge({ status }) {
  const getStatusClasses = (s) => {
    switch (s) {
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

  const getStatusLabel = (s) => {
    switch (s) {
      case "waiting":
        return "Waiting";
      case "called":
        return "Now Serving";
      case "completed":
        return "Completed";
      default:
        return s;
    }
  };

  return (
    <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-wide uppercase ${getStatusClasses(status)}`}>
      {getStatusLabel(status)}
    </div>
  );
}
