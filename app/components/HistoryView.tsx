"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface HistoryViewProps {
  onSelect: (ticket: any) => void;
}

export default function HistoryView({ onSelect }: HistoryViewProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/history?limit=20");
        if (res.ok) {
          const data = await res.json();
          setHistory(data.tickets || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-white/10 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-12">
      <header className="px-2">
        <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Neural <span className="text-blue-600">History</span></h2>
        <p className="text-[#888888] text-xs font-black uppercase tracking-[0.3em] mt-1">Audit log of all processed signals and generated tickets</p>
      </header>

      <div className="grid gap-4">
        {history.length > 0 ? (
          history.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSelect(item)}
              className="bg-[#111111] border border-[#222222] p-5 rounded-2xl flex items-center justify-between hover:border-blue-500/50 hover:bg-[#161616] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-6">
                <div className="w-10 h-10 bg-black/40 border border-[#222222] rounded-lg flex items-center justify-center text-[#555555] group-hover:text-blue-400 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">history</span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-white italic uppercase tracking-tight group-hover:text-blue-400 transition-colors">{item.title || "Untitled Signal"}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                      item.severity === 'Critical' 
                        ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                        : 'bg-[#222222] border-[#333333] text-[#888888]'
                    }`}>
                      {item.severity}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-neutral-800" />
                    <span className="text-[9px] text-[#555555] font-black uppercase tracking-widest">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {item.github_issue_url && (
                  <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
                )}
                <span className="material-symbols-outlined text-[#333333] group-hover:text-white transition-all transform group-hover:translate-x-1">chevron_right</span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="h-64 bg-[#111111] border border-dashed border-[#222222] rounded-[2rem] flex flex-col items-center justify-center text-center space-y-4 p-12">
            <span className="material-symbols-outlined text-4xl text-[#222222]">history_toggle_off</span>
            <p className="text-[#555555] text-[10px] font-black uppercase tracking-widest leading-relaxed">
              No audit signal detected.<br/>Process a feedback signal to populate the neural history.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
