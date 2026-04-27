"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function SettingsView() {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const connectors = [
    { id: 'webhook', name: 'Universal Webhook', icon: 'webhook', desc: 'Ingest signals from any JSON payload.', url: 'https://ai-pm-triage.vercel.app/api/connectors/webhook' },
    { id: 'email', name: 'Email Inbound', icon: 'mail', desc: 'Forward customer feedback directly to triage.', url: 'triage@ai-pm-demo.vercel.app' },
    { id: 'slack', name: 'Slack Sentinel', icon: 'hub', desc: 'Monitor channels and auto-reply to feedback threads.', url: 'PENDING CONFIGURATION', disabled: true },
    { id: 'zoom', name: 'Zoom Meeting Agent', icon: 'video_call', desc: 'Analyze recorded transcripts and video sentiment.', url: 'PENDING CONFIGURATION', disabled: true }
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-12">
      <header className="px-2">
        <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">System <span className="text-blue-600">Infrastructure</span></h2>
        <p className="text-[#888888] text-xs font-black uppercase tracking-[0.3em] mt-1">Configure neural connectors and ingestion endpoints</p>
      </header>

      <div className="space-y-8">
        <h3 className="text-[10px] font-black text-[#333333] uppercase tracking-[0.5em] ml-4">Neural Connectors</h3>
        <div className="grid gap-6">
          {connectors.map((c) => (
            <motion.div 
              key={c.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`bg-[#111111] border border-[#222222] p-8 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 ${c.disabled ? 'opacity-50 grayscale' : ''}`}
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-black/40 border border-[#222222] rounded-2xl flex items-center justify-center text-[#555555]">
                  <span className="material-symbols-outlined text-[24px]">{c.icon}</span>
                </div>
                <div>
                  <h4 className="text-lg font-black text-white italic uppercase tracking-tight">{c.name}</h4>
                  <p className="text-xs text-[#888888] font-medium mt-0.5">{c.desc}</p>
                </div>
              </div>

              {!c.disabled && (
                <div className="flex items-center gap-3 bg-black/60 border border-[#222222] p-2 rounded-xl pl-4">
                  <code className="text-[10px] font-mono text-blue-400 truncate max-w-[200px]">{c.url}</code>
                  <button 
                    onClick={() => handleCopy(c.url, c.id)}
                    className="bg-[#1a1a1a] hover:bg-[#222222] text-white p-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copySuccess === c.id ? 'check' : 'content_copy'}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-widest mr-1">
                      {copySuccess === c.id ? 'COPIED' : 'COPY'}
                    </span>
                  </button>
                </div>
              )}
              {c.disabled && (
                <span className="text-[9px] font-black text-[#333333] uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5 italic">
                  Coming in v2.6
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-[#111111] border border-[#222222] p-10 rounded-[2.5rem] flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 bg-blue-600/10 border border-blue-600/20 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-blue-500 text-3xl">terminal</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Enterprise API Architecture</h3>
          <p className="text-xs text-[#888888] max-w-md mx-auto leading-relaxed">
            All connectors pipe directly into the <span className="text-blue-500">Neural Triage Engine</span>. Signals are processed in <span className="text-white">200ms</span> and stored in your primary Neon Postgres instance.
          </p>
        </div>
        <button className="bg-white text-[#0a0a0a] font-black py-3 px-8 rounded-full text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-colors">
          View Technical Blueprint
        </button>
      </div>
    </div>
  );
}
