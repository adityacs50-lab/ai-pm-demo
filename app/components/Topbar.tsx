"use client";

import { useSession, signOut } from "next-auth/react";

interface TopbarProps {
  currentView: "INPUT" | "RESULT" | "BATCH" | "SETTINGS";
  onViewChange: (view: "INPUT" | "RESULT" | "BATCH" | "SETTINGS") => void;
}

export default function Topbar({ currentView, onViewChange }: TopbarProps) {
  const { data: session } = useSession();

  return (
    <nav className="flex justify-between items-center h-14 px-6 w-full z-50 bg-[#0a0a0a] border-b border-[#222222] shrink-0">
      <div className="flex items-center gap-4">
        <span className="font-mono font-bold text-lg tracking-tighter text-white">PM Triage AI</span>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-colors p-2 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined">notifications_active</span>
        </button>
        <button className="text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-colors p-2 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
        
        {session?.user ? (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-[10px] font-bold text-white leading-none">{session.user.name}</span>
              <button 
                onClick={() => signOut()}
                className="text-[8px] font-black uppercase tracking-tighter text-neutral-500 hover:text-red-500 transition-colors"
              >
                SIGN OUT
              </button>
            </div>
            <img 
              alt="User avatar" 
              className="w-8 h-8 rounded-full border border-[#222222]" 
              src={session.user.image || "https://avatar.vercel.sh/user"} 
            />
          </div>
        ) : (
          <img 
            alt="Default avatar" 
            className="w-8 h-8 rounded-full border border-[#222222]" 
            src="https://avatar.vercel.sh/guest" 
          />
        )}
      </div>
    </nav>
  );
}
