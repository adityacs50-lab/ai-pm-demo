"use client";

import { motion } from "framer-motion";

interface SidebarProps {
  onSelectHistory: (ticket: any) => void;
  onNewTriage: () => void;
  onViewChange: (view: "INPUT" | "RESULT" | "BATCH" | "SETTINGS") => void;
  currentView: string;
}

export default function Sidebar({ onSelectHistory, onNewTriage, onViewChange, currentView }: SidebarProps) {
  const navItems = [
    { label: 'Dashboard', id: 'INPUT', icon: 'emergency' },
    { label: 'History', id: 'HISTORY_VIEW', icon: 'history' }, // Dummy ID for history view logic
    { label: 'Analytics', id: 'BATCH', icon: 'query_stats' },
    { label: 'Settings', id: 'SETTINGS', icon: 'settings' },
  ];

  return (
    <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] flex flex-col py-4 z-40 bg-[#111111] border-r border-[#222222] w-16 md:w-64 transition-all duration-300">
      <div className="px-4 mb-6 hidden md:block">
        <button 
          onClick={onNewTriage}
          className="w-full bg-white text-[#0a0a0a] font-medium py-2 px-4 rounded-[8px] hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Ticket
        </button>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'HISTORY_VIEW') {
                // Logic to toggle history visibility if needed, or just switch to INPUT
                onViewChange('INPUT');
              } else {
                onViewChange(item.id as any);
              }
            }}
            className={`
              w-full flex items-center gap-3 px-3 py-3 md:py-2 border-l-2 rounded-r-lg group transition-all font-mono text-[10px] uppercase tracking-widest
              ${(currentView === item.id || (item.id === 'INPUT' && currentView === 'RESULT'))
                ? 'bg-[#1a1a1a] text-white border-blue-600'
                : 'text-[#888888] hover:bg-[#1a1a1a] hover:text-white border-transparent'}
            `}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="hidden md:inline">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto px-2 space-y-1 pb-4">
        <a className="text-[#888888] hover:bg-[#1a1a1a] hover:text-white transition-all font-mono text-[10px] uppercase tracking-widest flex items-center gap-3 px-3 py-2 border-l-2 border-transparent rounded-r-lg group" href="#">
          <span className="material-symbols-outlined text-[20px]">menu_book</span>
          <span className="hidden md:inline">Documentation</span>
        </a>
        <a className="text-[#888888] hover:bg-[#1a1a1a] hover:text-white transition-all font-mono text-[10px] uppercase tracking-widest flex items-center gap-3 px-3 py-2 border-l-2 border-transparent rounded-r-lg group" href="#">
          <span className="material-symbols-outlined text-[20px]">contact_support</span>
          <span className="hidden md:inline">Support</span>
        </a>
      </div>
    </aside>
  );
}
