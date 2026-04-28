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
          <h2 className="font-h2 text-h2 text-white leading-tight italic uppercase tracking-tight">{ticket.title || "Untitled Feature"}</h2>
          <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border bg-blue-500/10 border-blue-500/20 text-blue-500">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="font-mono text-[10px] font-bold tracking-wider uppercase">Feature Spec</span>
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

      {/* Discovery Summary Card */}
      {ticket.discoverySummary && (
        <div className="bg-[#111111] border border-[#222222] rounded-[12px] p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#888888] text-[18px]">travel_explore</span>
            <h3 className="font-label-caps text-label-caps text-[#dddddd]">DISCOVERY SUMMARY</h3>
          </div>
          <div className="prose prose-invert prose-sm max-w-none prose-p:text-[#aaaaaa] prose-li:text-[#aaaaaa] prose-strong:text-[#ffffff]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {ticket.discoverySummary}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Customer Justification Card */}
      <div className="bg-[#111111] border border-[#222222] rounded-[12px] p-6 flex items-start gap-5">
        <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-purple-500">record_voice_over</span>
        </div>
        <div>
          <h3 className="font-label-caps text-label-caps text-[#888888] mb-2">THE "WHY" (CUSTOMER JUSTIFICATION)</h3>
          <div className="font-body-muted text-[13px] text-[#aaaaaa] leading-relaxed italic border-l-2 border-[#333] pl-4 prose prose-invert prose-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {ticket.customerJustification || "No justification provided."}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Technical Architecture Card */}
      {ticket.technicalArchitecture && (
        <div className="bg-[#111111] border border-[#222222] rounded-[12px] p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#888888] text-[18px]">architecture</span>
            <h3 className="font-label-caps text-label-caps text-[#dddddd]">TECHNICAL ARCHITECTURE</h3>
          </div>
          <div className="prose prose-invert prose-sm max-w-none prose-p:text-[#cccccc] prose-li:text-[#cccccc] prose-strong:text-[#ffffff] prose-code:text-[#60a5fa] prose-code:bg-[#60a5fa]/10 prose-code:px-1 prose-code:rounded">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {ticket.technicalArchitecture}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Agent Tasks Card */}
      <div className="bg-[#111111] border border-[#222222] rounded-[12px] overflow-hidden flex flex-col">
        <div className="bg-[#1a1a1a] px-6 py-3 border-b border-[#222222] flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#888888]">smart_toy</span>
          <h3 className="font-label-caps text-label-caps text-[#dddddd]">AGENT CODING TASKS (CURSOR/CLAUDE)</h3>
        </div>
        <div className="divide-y divide-[#222222]/50">
          {ticket.agentTasks?.map((task: string, i: number) => (
            <div key={i} className="flex items-start gap-4 p-4 hover:bg-[#161616] transition-colors group">
              <span className="font-mono text-[10px] text-[#555555] pt-0.5 mt-1 bg-[#222] px-2 py-0.5 rounded-full group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">Task {(i+1)}</span>
              <p className="font-mono text-[12px] text-[#cccccc] leading-relaxed">{task}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PRD Card removed per V1 spec */}

      {/* Sync Card removed per V1 spec */}
    </div>
  );
}
