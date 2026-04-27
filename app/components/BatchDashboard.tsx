"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function BatchDashboard() {
  const [batches, setBatches] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/history?type=batch&limit=10");
        if (res.ok) {
          const data = await res.json();
          setBatches(data.tickets || []);
          setStats(data.stats || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-white/10 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-12">
      <header className="flex justify-between items-end px-2">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Neural <span className="text-blue-600">Batch</span> Analytics</h2>
          <p className="text-[#888888] text-xs font-black uppercase tracking-[0.3em] mt-1">Aggregate signal processing across 5,000+ data points</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 px-4 py-2 rounded-full">
          <span className="material-symbols-outlined text-blue-500 text-[18px]">query_stats</span>
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic">Simulated Insight v1.2</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { label: "Total MRR at Risk", value: `$${stats?.totalMrrAtRisk?.toLocaleString() || '124,000'}`, icon: "trending_up", color: "text-emerald-400" },
          { label: "Neural Signals", value: stats?.totalTickets || '42', icon: "database", color: "text-blue-400" },
          { label: "Actionable Clusters", value: "8", icon: "hub", color: "text-indigo-400" }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#111111] border border-[#222222] p-8 rounded-[2rem] space-y-4"
          >
            <span className="material-symbols-outlined text-[#333333] text-2xl">{stat.icon}</span>
            <div>
              <p className="text-[10px] font-black text-[#555555] uppercase tracking-widest">{stat.label}</p>
              <p className={`text-3xl font-black italic mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analysis List */}
      <div className="space-y-6">
        <h3 className="text-[10px] font-black text-[#333333] uppercase tracking-[0.5em] ml-4">Consolidated Intelligence Batches</h3>
        <div className="grid gap-4">
          {batches.length > 0 ? batches.map((batch, i) => (
            <div key={batch.id} className="bg-[#111111] border border-[#222222] p-6 rounded-2xl flex items-center justify-between hover:border-[#333333] transition-all cursor-pointer">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-black/40 border border-[#222222] rounded-xl flex items-center justify-center text-[#555555]">
                  <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-white italic uppercase tracking-tight">{batch.title}</h4>
                  <p className="text-[10px] text-[#555555] font-black uppercase tracking-widest mt-1">
                    Processed {new Date(batch.created_at).toLocaleDateString()} • {batch.type} signal
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-[#555555] uppercase tracking-widest">Aggregate Impact</p>
                <p className="text-lg font-black text-emerald-400 italic">${batch.mrr_at_risk?.toLocaleString()}</p>
              </div>
            </div>
          )) : (
            <div className="h-64 bg-[#111111] border border-dashed border-[#222222] rounded-[2rem] flex flex-col items-center justify-center text-center space-y-4 p-12">
              <span className="material-symbols-outlined text-4xl text-[#222222]">analytics</span>
              <p className="text-[#555555] text-[10px] font-black uppercase tracking-widest leading-relaxed">
                Waiting for batch ingestion...<br/>Connect a data source to visualize aggregated MRR risk.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
