"use client";

import { useState } from "react";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import GitHubFeed from "./components/GitHubFeed";
import ModeSelector from "./components/ModeSelector";
import FileUpload from "./components/FileUpload";
import TicketCard from "./components/TicketCard";
import SkeletonOutput from "./components/SkeletonOutput";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Terminal, Sparkles } from "lucide-react";

import BatchDashboard from "./components/BatchDashboard";
import SettingsView from "./components/SettingsView";

export default function Home() {
  const [feedback, setFeedback] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState("ENTERPRISE");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pushStatus, setPushStatus] = useState<any>(null);
  const [currentView, setCurrentView] = useState<"DASHBOARD" | "BATCH" | "SETTINGS">("DASHBOARD");

  const handleGenerate = async () => {
    if (!feedback.trim() && !file) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("feedback", feedback);
      formData.append("mode", mode.toLowerCase());
      if (file) formData.append("file", file);

      const response = await fetch("/api/triage", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to triage feedback");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setPushStatus(null);
    }
  };

  const handleSelectHistory = async (item: any) => {
    setCurrentView("DASHBOARD");
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch(`/api/history/${item.id}`);
      if (res.ok) {
        const data = await res.json();
        // The individual ticket data is in full_result column
        setResult(typeof data.full_result === 'string' ? JSON.parse(data.full_result) : data.full_result);
        setFeedback(data.raw_feedback || "");
        if (data.github_issue_url) {
          setPushStatus({ url: data.github_issue_url, number: data.github_issue_number });
        } else {
          setPushStatus(null);
        }
      }
    } catch (err) {
      setError("Failed to load history item");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewTriage = () => {
    setResult(null);
    setFeedback("");
    setFile(null);
    setPushStatus(null);
    setError(null);
    setCurrentView("DASHBOARD");
  };

  const handlePushToGitHub = async () => {
    if (!result) return;
    setIsPushing(true);
    try {
      const res = await fetch("/api/github/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.title,
          severity: result.severity,
          acceptanceCriteria: result.acceptanceCriteria,
          labels: result.labels,
        }),
      });
      const data = await res.json();
      if (res.ok) setPushStatus({ url: data.issueUrl, number: data.issueNumber });
    } catch (err) {
      console.error(err);
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f] text-[#ededed]">
      <Topbar currentView={currentView} onViewChange={setCurrentView} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          onSelectHistory={handleSelectHistory} 
          onNewTriage={handleNewTriage} 
          onViewChange={setCurrentView}
        />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 relative scrollbar-thin">
          <AnimatePresence mode="wait">
            {currentView === "DASHBOARD" ? (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-6xl mx-auto"
              >
                <div className="grid lg:grid-cols-2 gap-10 items-start">
                  
                  {/* Left Column: Input */}
                  <div className="space-y-8 animate-in">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                        <Zap className="text-[#4f6ef7]" size={20} />
                        COMMAND CENTER
                      </h2>
                      <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Input messy feedback for surgical triage</p>
                    </div>

                    <div className="panel-glass p-8 rounded-[2.5rem] space-y-8">
                      <div className="space-y-6">
                        <ModeSelector mode={mode} onChange={setMode} />
                        
                        <div className="relative">
                          <div className="absolute top-4 left-4 p-1 bg-white/5 rounded text-neutral-600">
                            <Terminal size={14} />
                          </div>
                          <textarea 
                            className="w-full h-48 bg-black/40 border border-white/5 rounded-2xl p-6 pl-12 text-sm text-neutral-300 placeholder:text-neutral-700 focus:outline-none focus:border-[#4f6ef7]/50 transition-all resize-none font-mono selection:bg-[#4f6ef7]/30"
                            placeholder="Paste raw, messy customer feedback here..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                          />
                        </div>

                        <FileUpload file={file} setFile={setFile} />

                        <motion.button 
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={handleGenerate}
                          disabled={isLoading || (!feedback.trim() && !file)}
                          className={`
                            w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all
                            ${isLoading || (!feedback.trim() && !file)
                              ? 'bg-neutral-900 text-neutral-700 cursor-not-allowed border border-white/5'
                              : 'bg-[#4f6ef7] text-white shadow-[0_15px_40px_-10px_rgba(79,110,247,0.4)] hover:shadow-[0_20px_50px_-10px_rgba(79,110,247,0.5)] border border-white/10'}
                          `}
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Processing Signal...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <Sparkles size={14} />
                              Generate Structured Ticket
                            </div>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Output */}
                  <div className="space-y-8 h-full">
                    <div className="space-y-2">
                      <h2 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">Structured Output</h2>
                    </div>

                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <SkeletonOutput />
                        </motion.div>
                      ) : result ? (
                        <motion.div
                          key="result"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <TicketCard 
                            ticket={result} 
                            onPushToGitHub={handlePushToGitHub}
                            isPushing={isPushing}
                            pushStatus={pushStatus}
                          />
                        </motion.div>
                      ) : error ? (
                        <motion.div 
                          key="error"
                          className="panel-glass p-8 rounded-[2rem] border-red-500/20 bg-red-500/5 text-center"
                        >
                          <p className="text-red-400 font-bold uppercase tracking-widest text-[10px] mb-2">Analysis Failed</p>
                          <p className="text-red-200/60 text-sm">{error}</p>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="empty"
                          className="h-[600px] border border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12 space-y-6"
                        >
                          <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-center text-neutral-800">
                            <Terminal size={32} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-neutral-500 font-black uppercase tracking-[0.2em] text-[10px]">Waiting for signal</p>
                            <p className="text-neutral-700 text-xs max-w-[200px] leading-relaxed">System ready for raw data ingestion. Monospaced output will appear here.</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ) : currentView === "BATCH" ? (
              <motion.div 
                key="batch"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <BatchDashboard />
              </motion.div>
            ) : (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <SettingsView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        <GitHubFeed />
      </div>
    </div>
  );
}
