import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  // Active highlight: exact for Home, prefix match for nested routes
  const isActive = (path) => {
    const match = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
    return match ? 'bg-indigo-600 text-white shadow-inner' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900';
  };

  return (
    <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 gap-4">
      
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-inner">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">SmartQueue</h1>
          <p className="text-xs font-medium text-slate-500 tracking-wider uppercase">Management System</p>
        </div>
      </Link>

      {/* Nav Links */}
      <nav className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
        <Link to="/" className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive('/')}`}>
          Find a Queue
        </Link>
        <Link to="/admin" className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive('/admin')}`}>
          Admin Panel
        </Link>
      </nav>

      {/* Live Status Pill */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="text-xs font-semibold text-emerald-700">System Live</span>
      </div>
    </header>
  );
}
