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
        <div className="flex flex-col flex-1 min-h-[300px]">
          <textarea 
            className="w-full flex-1 bg-[#111111] border border-[#222222] rounded-[12px] p-4 text-white font-body-main focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors resize-none placeholder:text-[#333333] text-sm"
            placeholder="Paste raw, messy customer feedback here..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
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
                    ? 'bg-blue-600 text-white shadow-sm' 
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
          className="flex-1 bg-white text-[#0a0a0a] font-bold py-3 px-6 rounded-[8px] hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              Generate Ticket
            </>
          )}
        </button>
      </footer>
    </section>
  );
}
