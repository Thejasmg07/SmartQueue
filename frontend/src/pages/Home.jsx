import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchServices } from '../services/api';

export default function Home() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await fetchServices(search);
        if (data.success) {
          setServices(data.services);
        }
      } catch (err) {
        console.error("Failed to fetch services", err);
      } finally {
        setLoading(false);
      }
    };
    
    // Simple debounce for search
    const timer = setTimeout(loadServices, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="max-w-5xl mx-auto flex flex-col py-12 gap-10">
      
      <div className="text-center space-y-4 animate-fade-in">
        <h1 className="text-5xl font-black text-slate-800 tracking-tight">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-600">SmartQueue</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Find your required service below to join the digital queue and track your position in real-time.
        </p>
      </div>

      <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto mt-4">
        {/* Search Bar */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search for a service or location..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-white text-lg focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-sm pl-14"
          />
          <svg className="w-6 h-6 text-slate-400 absolute left-5 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Service List */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden min-h-[300px] flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center p-12">
              <svg className="w-8 h-8 text-indigo-500 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            </div>
          ) : services.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <svg className="w-16 h-16 mb-4 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-lg font-medium text-slate-500">No services found.</p>
              <p className="text-sm">Try a different search term.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {services.map((service) => (
                <Link 
                  key={service.serviceId} 
                  to={`/queue/${service.serviceId}`}
                  className="group flex items-center justify-between p-6 hover:bg-indigo-50 transition-colors duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{service.name}</h3>
                      <p className="text-sm font-medium text-slate-400">ID: {service.serviceId}</p>
                    </div>
                  </div>
                  <div className="text-indigo-600 bg-white shadow-sm border border-indigo-100 px-4 py-2 rounded-full text-sm font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    Join Queue →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link to="/admin/login" className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors underline decoration-slate-300 underline-offset-4">
          Admin / Staff Portal
        </Link>
      </div>

    </div>
  );
}
