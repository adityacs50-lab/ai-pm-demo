"use client";

import { motion } from "framer-motion";

export default function SkeletonOutput() {
  return (
    <div className="card-glass p-8 rounded-[2rem] space-y-8 animate-pulse border-blue-500/20">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-2xl" />
          <div className="space-y-2">
            <div className="w-24 h-3 bg-white/5 rounded-full" />
            <div className="w-48 h-5 bg-white/5 rounded-full" />
          </div>
        </div>
        <div className="w-20 h-8 bg-white/5 rounded-xl" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-white/5 rounded-2xl" />
        ))}
      </div>

      <div className="space-y-4">
        <div className="w-32 h-3 bg-white/5 rounded-full" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-white/5 rounded-xl" />
        ))}
      </div>

      <div className="pt-6 border-t border-white/5">
        <div className="w-full h-12 bg-white/5 rounded-xl" />
      </div>
    </div>
  );
}
