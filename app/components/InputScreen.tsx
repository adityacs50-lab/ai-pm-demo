"use client";

import { motion } from "framer-motion";
import ModeSelector from "./ModeSelector";

interface InputScreenProps {
  transcripts: string[];
  setTranscripts: (val: string[]) => void;
  currentTranscript: string;
  setCurrentTranscript: (val: string) => void;
  mode: string;
  setMode: (mode: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function InputScreen({
  transcripts,
  setTranscripts,
  currentTranscript,
  setCurrentTranscript,
  mode,
  setMode,
  onGenerate,
  isLoading,
  error
}: InputScreenProps) {
  return (
    <section className="w-full h-full flex flex-col bg-[#0a0a0a] p-6 lg:p-8 overflow-y-auto border-r border-[#222222]">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="font-h1 text-h1 text-white mb-2 uppercase tracking-tight italic">Cursor for PMs</h1>
          <p className="font-body-muted text-body-muted text-[#888888] text-xs">Synthesize customer feedback into agent-ready features</p>
        </div>
        <div className="flex items-center gap-2 bg-[#111111] border border-[#222222] px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#888888]">Gemini 2.5 Flash Active</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-6">
        {/* Added Transcripts List */}
        {transcripts.length > 0 && (
          <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-2">
            {transcripts.map((t, idx) => (
              <div key={idx} className="bg-[#111111] border border-[#333333] rounded-[8px] p-3 flex justify-between items-start text-xs">
                <p className="text-[#cccccc] line-clamp-2 italic">"{t.substring(0, 100)}..."</p>
                <button 
                  onClick={() => setTranscripts(transcripts.filter((_, i) => i !== idx))}
                  className="text-[#888888] hover:text-red-500 transition-colors ml-4"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Area */}
        <div className="flex flex-col flex-1 min-h-[250px] relative">
          <textarea 
            className="w-full flex-1 bg-[#111111] border border-[#222222] rounded-[12px] p-4 pb-14 text-white font-body-main focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors resize-none placeholder:text-[#333333] text-sm"
            placeholder="Paste raw customer interviews, user feedback, or sales call transcripts here..."
            value={currentTranscript}
            onChange={(e) => setCurrentTranscript(e.target.value)}
          />
          <div className="absolute bottom-4 right-4">
            <button
              onClick={() => {
                if (currentTranscript.trim()) {
                  setTranscripts([...transcripts, currentTranscript.trim()]);
                  setCurrentTranscript("");
                }
              }}
              disabled={!currentTranscript.trim()}
              className="bg-[#222222] text-[#aaaaaa] hover:text-white hover:bg-[#333333] transition-colors rounded-[6px] px-3 py-1.5 text-xs font-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed border border-[#333]"
            >
              Add Transcript
            </button>
          </div>
        </div>


        {/* Tier Selector Removed for V1 Simplicity */}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-950/30 border border-red-900/50 rounded-xl flex items-start gap-3">
          <span className="material-symbols-outlined text-red-500 text-[18px] shrink-0 mt-0.5">error</span>
          <p className="text-red-200 text-xs leading-relaxed italic">{error}</p>
        </div>
      )}

      <footer className="mt-8 pt-6 border-t border-[#222222] flex items-center gap-4">
        <button 
          onClick={onGenerate}
          disabled={isLoading || (transcripts.length === 0 && !currentTranscript.trim())}
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
              {transcripts.length > 0 ? `Synthesize Across All (${transcripts.length + (currentTranscript.trim() ? 1 : 0)})` : "Synthesize Feature"}
            </>
          )}
        </button>
      </footer>
    </section>
  );
}
