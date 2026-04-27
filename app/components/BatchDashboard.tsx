"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  BarChart3, 
  FileText, 
  ChevronRight,
  Database,
  ArrowUpRight,
  Clock
} from "lucide-react";

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
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white/5 rounded-3xl" />)}
        </div>
        <div className="h-96 bg-white/5 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <BarChart3 className="text-[#4f6ef7]" size={28} />
          BATCH ANALYTICS
        </h2>
        <p className="text-neutral-500 text-xs font-bold uppercase tracking-[0.3em]">Aggregate business impact across multiple signals</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel-glass p-6 rounded-[2rem] space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <TrendingUp className="text-indigo-400" size={18} />
            </div>
            <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1">
              <ArrowUpRight size={10} /> +12.5%
            </span>
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Total MRR at Risk</p>
            <p className="text-2xl font-black text-white mt-1">${stats?.totalMrrAtRisk?.toLocaleString() || '0'}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel-glass p-6 rounded-[2rem] space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Users className="text-amber-400" size={18} />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">User Signals Analyzed</p>
            <p className="text-2xl font-black text-white mt-1">{stats?.totalTickets || '0'}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel-glass p-6 rounded-[2rem] space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="text-red-400" size={18} />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Critical Clusters</p>
            <p className="text-2xl font-black text-white mt-1">
              {stats?.severityBreakdown?.find((b: any) => b.severity === 'Critical')?.count || '0'}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Main Analysis List */}
      <div className="space-y-6">
        <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] ml-2">Recent Batches</h3>
        <div className="grid gap-4">
          {batches.map((batch, i) => (
            <motion.div 
              key={batch.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group panel-glass p-5 rounded-[1.5rem] border-white/5 hover:border-white/10 transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white/2 rounded-2xl flex items-center justify-center text-neutral-600 group-hover:text-white transition-colors">
                  <Database size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-200 group-hover:text-white transition-colors">{batch.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-mono text-neutral-600 uppercase">Batch #{batch.id}</span>
                    <span className="w-1 h-1 rounded-full bg-neutral-800" />
                    <div className="flex items-center gap-1">
                      <Clock size={10} className="text-neutral-700" />
                      <span className="text-[10px] text-neutral-600">{new Date(batch.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-tighter">Cluster Impact</p>
                  <p className="text-sm font-black text-white">${batch.mrr_at_risk?.toLocaleString()}</p>
                </div>
                <div className="flex -space-x-2">
                  {batch.labels?.slice(0, 3).map((l: string, i: number) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-[#0a0a0f] flex items-center justify-center text-[8px] font-black">
                      {l.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
                <ChevronRight className="text-neutral-800 group-hover:text-white transition-all transform group-hover:translate-x-1" size={18} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {batches.length === 0 && (
        <div className="h-60 border border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center text-center p-12 space-y-4">
          <FileText size={32} className="text-neutral-800" />
          <p className="text-neutral-600 text-xs font-bold uppercase tracking-widest leading-relaxed">
            No batch signal detected.<br/>Upload a CSV or Excel file to begin aggregate triage.
          </p>
        </div>
      )}
    </div>
  );
}
