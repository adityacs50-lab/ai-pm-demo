"use client";

import { motion } from "framer-motion";

interface ModeSelectorProps {
  mode: string;
  onChange: (mode: string) => void;
}

export default function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  const modes = ['FREE', 'PRO', 'ENTERPRISE'];

  return (
    <div className="relative flex bg-white/5 p-1 rounded-xl w-full">
      {/* Animated Background Pill */}
      <motion.div
        className="absolute inset-y-1 bg-[#4f6ef7] rounded-lg shadow-lg shadow-blue-500/20"
        initial={false}
        animate={{
          x: mode === 'FREE' ? 0 : mode === 'PRO' ? '100%' : '200%',
          width: '33.333333%',
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
      
      {modes.map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`relative z-10 flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
            mode === m ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
