"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TicketCardProps {
  ticket: any;
  onPushToGitHub: () => void;
  isPushing: boolean;
  pushStatus: any;
}

export default function TicketCard({ ticket, onPushToGitHub, isPushing, pushStatus }: TicketCardProps) {
  if (!ticket) return null;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-[#111111] border border-[#222222] rounded-[12px] p-6 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <h2 className="font-h2 text-h2 text-white leading-tight italic uppercase tracking-tight">{ticket.title}</h2>
          <div className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border ${
            ticket.severity === 'Critical' 
              ? 'bg-red-500/10 border-red-500/20 text-red-500' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
          }`}>
            <span className={`w-2 h-2 rounded-full ${ticket.severity === 'Critical' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
            <span className="font-mono text-[10px] font-bold tracking-wider uppercase">{ticket.severity}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {ticket.labels?.map((label: string) => (
            <span key={label} className="px-2.5 py-1 rounded-[6px] bg-[#1a1a1a] border border-[#333333] text-[10px] text-[#aaaaaa] font-black uppercase tracking-widest">
              {label}
            </span>
          ))}
        </div>
        {ticket.securityRisk && (
          <div className="mt-2 flex items-center gap-3 bg-red-950/20 border border-red-900/50 p-3 rounded-[8px]">
            <span className="material-symbols-outlined text-red-500 text-[20px]">lock</span>
            <p className="font-body-main text-[11px] text-red-200 leading-relaxed italic">
              {ticket.securityRisk}
            </p>
          </div>
        )}
      </div>

      {/* Business Impact Card */}
      <div className="bg-[#111111] border border-[#222222] rounded-[12px] p-6 flex items-start gap-5">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-emerald-500">payments</span>
        </div>
        <div>
          <h3 className="font-label-caps text-label-caps text-[#888888] mb-1">BUSINESS IMPACT ANALYSIS</h3>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-emerald-400 font-mono italic">
              ${ticket.businessImpact?.mrrAtRisk?.toLocaleString() || 0}
            </span>
            <span className="text-[10px] text-[#666666] font-black uppercase tracking-widest">MRR at Risk</span>
          </div>
          <p className="font-body-muted text-[12px] text-[#aaaaaa] leading-relaxed italic">
            {ticket.businessImpact?.priorityReasoning}
          </p>
        </div>
      </div>

      {/* Acceptance Criteria Card */}
      <div className="bg-[#111111] border border-[#222222] rounded-[12px] overflow-hidden flex flex-col">
        <div className="bg-[#1a1a1a] px-6 py-3 border-b border-[#222222] flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#888888]">checklist</span>
          <h3 className="font-label-caps text-label-caps text-[#dddddd]">ACCEPTANCE CRITERIA</h3>
        </div>
        <div className="divide-y divide-[#222222]/50">
          {ticket.acceptanceCriteria?.map((ac: string, i: number) => (
            <div key={i} className="flex items-start gap-4 p-4 hover:bg-[#161616] transition-colors">
              <span className="font-mono text-[10px] text-[#555555] pt-0.5">{(i+1).toString().padStart(2, '0')}</span>
              <p className="font-body-main text-[13px] text-[#cccccc]">{ac}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PRD Card */}
      <div className="bg-[#050505] border border-[#222222] rounded-[12px] overflow-hidden flex flex-col">
        <div className="bg-[#111111] px-4 py-2 border-b border-[#222222] flex justify-between items-center">
          <span className="font-mono text-[10px] text-[#888888] uppercase tracking-widest font-black">Surgical PRD Spec</span>
          <button className="text-[#888888] hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[16px]">content_copy</span>
          </button>
        </div>
        <div className="p-8 prose prose-invert prose-sm max-w-none prose-headings:italic prose-headings:uppercase prose-headings:tracking-tighter prose-p:text-neutral-400 prose-li:text-neutral-400">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {ticket.prd}
          </ReactMarkdown>
        </div>
      </div>

      {/* Sync Card */}
      <div className="bg-[#111111] border border-[#222222] rounded-[12px] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left w-full">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-tight">Sync to Engineering</h3>
            <p className="text-[10px] text-[#888888] mt-0.5 uppercase tracking-widest font-black">Export to GitHub / Jira / Linear</p>
          </div>
        </div>
        
        {pushStatus ? (
          <a 
            href={pushStatus.url} 
            target="_blank" 
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2 px-6 rounded-[8px] transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            Issue #{pushStatus.number}
          </a>
        ) : (
          <button 
            onClick={onPushToGitHub}
            disabled={isPushing}
            className="w-full sm:w-auto bg-[#1a1a1a] border border-[#333333] hover:bg-[#222222] text-white font-black py-2 px-6 rounded-[8px] transition-colors flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest disabled:opacity-50"
          >
            {isPushing ? 'Pushing...' : (
              <>
                <span className="material-symbols-outlined text-[18px]">sync</span>
                Push Ticket
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
