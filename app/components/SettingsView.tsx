"use client";

import { motion } from "framer-motion";

export default function SettingsView() {
  return (
    <div className="max-w-4xl mx-auto py-10 space-y-12">
      <header className="px-2">
        <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Account <span className="text-blue-600">Settings</span></h2>
      </header>

      <div className="bg-[#111111] border border-[#222222] p-8 rounded-[2rem]">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-black text-white italic uppercase tracking-tight">Profile</h3>
          <p className="text-xs text-[#888888]">
            Authenticated via GitHub.
          </p>
        </div>
      </div>
    </div>
  );
}
