"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Power, User } from "lucide-react";

interface TopbarProps {
  currentView: "DASHBOARD" | "BATCH" | "SETTINGS";
  onViewChange: (view: "DASHBOARD" | "BATCH" | "SETTINGS") => void;
}

export default function Topbar({ currentView, onViewChange }: TopbarProps) {
  const { data: session } = useSession();

  const tabs = [
    { label: 'Dashboard', id: 'DASHBOARD' },
    { label: 'Connectors', id: 'BATCH' },
    { label: 'Settings', id: 'SETTINGS' },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full h-[56px] backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-[#4f6ef7] to-[#7c3aed] rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-tighter italic">TRIAGE</h1>
            <span className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-neutral-400 font-mono">v2.5</span>
          </div>
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest -mt-1">AI PM Command Center</p>
        </div>
      </div>

      {/* Center: Nav Tabs */}
      <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentView === tab.id ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Right: Auth & Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Gemini 2.5 Flash • ACTIVE</span>
        </div>

        {session ? (
          <div className="flex items-center gap-3 group relative">
            <div className="text-right">
              <p className="text-xs font-bold text-white line-clamp-1">{session.user?.name}</p>
              <button 
                onClick={() => signOut()}
                className="text-[9px] text-neutral-500 hover:text-red-400 uppercase font-black tracking-tighter"
              >
                Sign Out
              </button>
            </div>
            {session.user?.image ? (
              <img 
                src={session.user.image} 
                alt="Avatar" 
                className="w-9 h-9 rounded-lg border border-white/10 group-hover:border-white/30 transition-all"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400">
                {session.user?.name?.charAt(0)}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => signIn('github')}
            className="flex items-center gap-2 bg-white text-black px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-neutral-200 transition-all"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
