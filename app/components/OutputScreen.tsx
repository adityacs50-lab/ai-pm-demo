"use client";

import { motion } from "framer-motion";
import TicketCard from "./TicketCard";
import SkeletonOutput from "./SkeletonOutput";

interface OutputScreenProps {
  ticket: any;
  onBack: () => void;
  onPushToGitHub: () => void;
  isPushing: boolean;
  pushStatus: any;
}

export default function OutputScreen({
  ticket,
  onBack,
  onPushToGitHub,
  isPushing,
  pushStatus
}: OutputScreenProps) {
  return (
    <section className="w-full h-full bg-[#0a0a0a] flex flex-col relative overflow-y-auto">
      <div className="flex-1 p-6 lg:p-8">
        {ticket ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <TicketCard 
              ticket={ticket}
              onPushToGitHub={onPushToGitHub}
              isPushing={isPushing}
              pushStatus={pushStatus}
            />
          </motion.div>
        ) : (
          <div className="h-full flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#111111] border border-[#222222] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-[#333333] text-3xl">terminal</span>
              </div>
              <p className="font-mono text-[10px] text-[#555555] uppercase tracking-[0.4em] font-black italic">
                Waiting for discovery signal...
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
