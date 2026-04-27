"use client";

import { 
  LayoutDashboard, 
  FilePlus, 
  Layers, 
  History, 
  Zap, 
  MessageSquare, 
  Video, 
  Mail, 
  Webhook,
  ChevronRight,
  CircleCheck,
  RotateCcw
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface SidebarProps {
  onSelectHistory: (ticket: any) => void;
  onNewTriage: () => void;
  onViewChange: (view: "DASHBOARD" | "BATCH") => void;
}

export default function Sidebar({ onSelectHistory, onNewTriage, onViewChange }: SidebarProps) {
  const [activeWorkspace, setActiveWorkspace] = useState("Dashboard");
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history?limit=5");
      if (res.ok) {
        const data = await res.json();
        setHistoryItems(data.tickets || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchHistory();
  }, [session]);

  // Handle manual refresh
  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    fetchHistory();
  };

  return (
    <aside className="w-[220px] h-[calc(100vh-56px)] border-r border-white/5 bg-[#0a0a0f]/50 backdrop-blur-md p-4 flex flex-col justify-between">
      <div className="space-y-8">
        {/* Workspace Section */}
        <section>
          <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-4 ml-2">Workspace</p>
          <div className="space-y-1">
            <button
              onClick={() => {
                setActiveWorkspace("Dashboard");
                onNewTriage();
                onViewChange("DASHBOARD");
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all group ${
                activeWorkspace === "Dashboard" 
                  ? 'bg-white/5 text-white border border-white/5' 
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard size={16} className={activeWorkspace === "Dashboard" ? 'text-[#4f6ef7]' : ''} />
                <span className="text-xs font-bold">Dashboard</span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveWorkspace("Batch Mode");
                onViewChange("BATCH");
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all group ${
                activeWorkspace === "Batch Mode" 
                  ? 'bg-white/5 text-white border border-white/5' 
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers size={16} className={activeWorkspace === "Batch Mode" ? 'text-[#4f6ef7]' : ''} />
                <span className="text-xs font-bold">Batch Mode</span>
              </div>
            </button>
          </div>
        </section>

        {/* History Section */}
        <section>
          <div className="flex items-center justify-between mb-4 ml-2">
            <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em]">History</p>
            <button onClick={handleRefresh} className="hover:text-white transition-colors">
              <RotateCcw size={10} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="space-y-3 max-h-[250px] overflow-y-auto scrollbar-none">
            {isLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-8 bg-white/5 rounded-lg animate-pulse mx-2" />)
            ) : historyItems.length === 0 ? (
              <p className="text-[9px] text-neutral-700 italic ml-2">No signals recorded</p>
            ) : (
              historyItems.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => onSelectHistory(item)}
                  className="group cursor-pointer hover:bg-white/[0.02] p-2 rounded-lg transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      item.severity === 'Critical' ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]' :
                      item.severity === 'High' ? 'bg-orange-500' : 'bg-emerald-500'
                    }`} />
                    <span className="text-[9px] font-mono font-black text-neutral-500 group-hover:text-neutral-300 uppercase">{item.severity}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-medium truncate group-hover:text-white transition-colors">{item.title}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Connectors Section */}
        <section>
          <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-4 ml-2">Connectors</p>
          <div className="space-y-2">
            {[
              { id: "GitHub", icon: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>, connected: true },
              { id: "Slack", icon: MessageSquare, connected: true },
              { id: "Zoom", icon: Video, connected: true },
              { id: "Email", icon: Mail, connected: false },
              { id: "Webhook", icon: Webhook, connected: false },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between px-3 py-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                <div className="flex items-center gap-3">
                  <item.icon size={14} className="text-neutral-400" />
                  <span className="text-[11px] font-bold text-neutral-400">{item.id}</span>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full ${item.connected ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-neutral-800'}`} />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Tier Selector */}
      <div className="bg-white/5 border border-white/5 p-1 rounded-xl flex">
        {['FREE', 'PRO', 'ENT'].map((tier) => (
          <button
            key={tier}
            className={`flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all ${
              tier === 'ENT' ? 'bg-[#4f6ef7] text-white shadow-lg shadow-blue-500/20' : 'text-neutral-600 hover:text-neutral-400'
            }`}
          >
            {tier}
          </button>
        ))}
      </div>
    </aside>
  );
}
