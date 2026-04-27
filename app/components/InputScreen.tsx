"use client";

import { motion } from "framer-motion";
import ModeSelector from "./ModeSelector";
import FileUpload from "./FileUpload";

interface InputScreenProps {
  feedback: string;
  setFeedback: (val: string) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  mode: string;
  setMode: (mode: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export default function InputScreen({
  feedback,
  setFeedback,
  file,
  setFile,
  mode,
  setMode,
  onGenerate,
  isLoading
}: InputScreenProps) {
  return (
    <section className="w-full h-full flex flex-col bg-[#0a0a0a] p-6 lg:p-8 overflow-y-auto border-r border-[#222222]">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="font-h1 text-h1 text-white mb-2 uppercase tracking-tight italic">AI PM Triage Tool</h1>
          <p className="font-body-muted text-body-muted text-[#888888] text-xs">Transform messy feedback into structured tickets</p>
        </div>
        <div className="flex items-center gap-2 bg-[#111111] border border-[#222222] px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#888888]">Gemini 2.5 Flash Active</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-6">
        {/* Text Area */}
        <div className="flex flex-col flex-1 min-h-[350px]">
          <textarea 
            className="w-full flex-1 bg-[#111111] border border-[#222222] rounded-[12px] p-4 text-white font-body-main focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors resize-none placeholder:text-[#333333] text-sm"
            placeholder="Paste raw, messy customer feedback here..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {["API Failure", "UI Bug", "SLA Credit", "Security Risk"].map(tag => (
              <button 
                key={tag}
                onClick={() => setFeedback(feedback + (feedback ? " " : "") + tag)}
                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-[#555555] hover:text-white hover:border-white/20 transition-all"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>

        {/* File Upload Integration */}
        <div className="bg-[#111111] border-2 border-dashed border-[#222222] rounded-[12px] hover:border-[#333333] transition-colors">
          <FileUpload file={file} setFile={setFile} />
        </div>

        {/* Tier Selector */}
        <div className="flex flex-col gap-2">
          <span className="font-label-caps text-label-caps text-[#888888] mb-1">CUSTOMER TIER</span>
          <div className="flex bg-[#111111] border border-[#222222] rounded-[8px] p-1">
            {["FREE", "PRO", "ENTERPRISE"].map((t) => (
              <button
                key={t}
                onClick={() => setMode(t)}
                className={`flex-1 py-2 text-[10px] font-black tracking-widest rounded-[6px] transition-all ${
                  mode === t 
                    ? 'bg-blue-600 text-white shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)]' 
                    : 'text-[#888888] hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <footer className="mt-8 pt-6 border-t border-[#222222] flex items-center gap-4">
        <button 
          onClick={onGenerate}
          disabled={isLoading || (!feedback.trim() && !file)}
          className="flex-1 bg-blue-600 text-white font-black py-4 px-6 rounded-[8px] hover:bg-blue-500 transition-all flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.3em] shadow-[0_20px_50px_-15px_rgba(37,99,235,0.5)] disabled:bg-neutral-900 disabled:text-neutral-700 disabled:shadow-none disabled:border border-white/5 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Signal...</span>
            </div>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              Generate Surgical Ticket
            </>
          )}
        </button>
      </footer>
    </section>
  );
}
