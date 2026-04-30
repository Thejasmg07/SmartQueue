import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-12 gap-10">
      
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black text-slate-800 tracking-tight">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-600">SmartQueue</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          A real-world queue management system. Streamline your customer flow with digital token generation, real-time dashboard updates, and efficient admin controls.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 w-full mt-8">
        
        {/* User Card */}
        <Link to="/user" className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800">Get a Token</h3>
          <p className="text-sm text-slate-500">Join the queue as a user and get your token number instantly.</p>
          <span className="mt-4 px-5 py-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            Go to User Page →
          </span>
        </Link>

        {/* Queue Dashboard Card */}
        <Link to="/queue" className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800">Live Display</h3>
          <p className="text-sm text-slate-500">View the real-time queue status and see who is currently being served.</p>
          <span className="mt-4 px-5 py-2 rounded-full bg-emerald-50 text-emerald-600 text-sm font-semibold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            View Dashboard →
          </span>
        </Link>

        {/* Admin Card */}
        <Link to="/admin" className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-rose-100 transition-all duration-300 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800">Admin Controls</h3>
          <p className="text-sm text-slate-500">Manage the queue flow, call the next token, and mark them as completed.</p>
          <span className="mt-4 px-5 py-2 rounded-full bg-rose-50 text-rose-600 text-sm font-semibold group-hover:bg-rose-600 group-hover:text-white transition-colors">
            Go to Admin →
          </span>
        </Link>
        
      </div>
    </div>
  );
}
