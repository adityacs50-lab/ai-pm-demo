"use client";

import { motion } from "framer-motion";
import { 
  Copy, 
  ExternalLink, 
  MessageSquare, 
  Download, 
  CircleAlert, 
  CircleCheck,
  TrendingUp,
  User as UserIcon
} from "lucide-react";
import { useState } from "react";

interface TicketCardProps {
  ticket: any;
  onPushToGitHub: () => void;
  isPushing: boolean;
  pushStatus: any;
}

export default function TicketCard({ ticket, onPushToGitHub, isPushing, pushStatus }: TicketCardProps) {
  const [activeTab, setActiveTab] = useState<"ticket" | "prd">("ticket");

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="card-glass p-6 rounded-[2rem] space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${
            ticket.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500 animate-pulse-critical' :
            ticket.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-500' :
            'bg-emerald-500/10 text-emerald-500'
          }`}>
            <CircleAlert size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black text-neutral-600 uppercase tracking-widest">TKT-{Math.floor(1000 + Math.random() * 9000)}</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                ticket.severity === 'CRITICAL' ? 'bg-red-500 text-white' :
                ticket.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                'bg-emerald-500 text-white'
              }`}>{ticket.severity}</span>
            </div>
            <h3 className="text-xl font-black text-white mt-1 leading-tight">{ticket.title}</h3>
          </div>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('ticket')} 
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'ticket' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'
            }`}
          >
            Ticket
          </button>
          <button 
            onClick={() => setActiveTab('prd')} 
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'prd' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'
            }`}
          >
            PRD
          </button>
        </div>
      </div>

      {activeTab === 'ticket' ? (
        <>
          {/* Metadata Grid */}
          <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white/2 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={12} className="text-[#4f6ef7]" />
                <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">MRR Risk</span>
              </div>
              <p className="text-lg font-black text-white">${ticket.businessImpact?.mrrAtRisk?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-white/2 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <UserIcon size={12} className="text-indigo-400" />
                <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Assignee</span>
              </div>
              <p className="text-sm font-bold text-neutral-300">Sr. Backend Eng</p>
            </div>
            <div className="bg-white/2 p-4 rounded-2xl border border-white/5 col-span-2 md:col-span-1">
              <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-1 block">Labels</span>
              <div className="flex flex-wrap gap-1">
                {ticket.labels?.map((l: string) => (
                  <span key={l} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[9px] font-bold rounded-lg border border-indigo-500/20">{l}</span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div variants={item} className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4f6ef7]" />
                Acceptance Criteria
              </h4>
              <div className="space-y-2">
                {ticket.acceptanceCriteria?.map((ac: string, i: number) => (
                  <div key={i} className="flex gap-3 text-xs text-neutral-400 bg-white/2 p-3 rounded-xl border border-white/5">
                    <CircleCheck size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <p>{ac}</p>
                  </div>
                ))}
              </div>
            </div>

            {ticket.securityRisk && (
              <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Security Alert</p>
                <p className="text-xs text-red-200/60 italic leading-relaxed">"{ticket.securityRisk}"</p>
              </div>
            )}
          </motion.div>
        </>
      ) : (
        <motion.div variants={item} className="bg-black/40 p-6 rounded-[2rem] border border-white/5 h-[400px] overflow-y-auto scrollbar-thin">
          <pre className="text-xs text-neutral-400 font-mono whitespace-pre-wrap leading-relaxed italic">
            {ticket.prd || "PRD generation available for Enterprise users."}
          </pre>
        </motion.div>
      )}

      {/* Action Bar */}
      <motion.div variants={item} className="pt-6 border-t border-white/5 flex flex-wrap gap-3">
        {pushStatus ? (
          <a 
            href={pushStatus.url} 
            target="_blank" 
            className="flex-1 min-w-[160px] py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-center text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <ExternalLink size={14} />
            View Issue #{pushStatus.number}
          </a>
        ) : (
          <button 
            onClick={onPushToGitHub}
            disabled={isPushing}
            className="flex-1 min-w-[160px] py-3 bg-white text-black hover:bg-neutral-200 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
          >
            {isPushing ? (
              <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>}
            Push to GitHub
          </button>
        )}
        <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-neutral-400 transition-colors">
          <MessageSquare size={16} />
        </button>
        <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-neutral-400 transition-colors">
          <Download size={16} />
        </button>
        <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-neutral-400 transition-colors ml-auto">
          <Copy size={16} />
        </button>
      </motion.div>
    </motion.div>
  );
}
