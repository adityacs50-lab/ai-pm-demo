"use client";

import { useState } from "react";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import GitHubFeed from "./components/GitHubFeed";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signIn } from "next-auth/react";


import SettingsView from "./components/SettingsView";
import HistoryView from "./components/HistoryView";
import InputScreen from "./components/InputScreen";
import OutputScreen from "./components/OutputScreen";

export default function Home() {
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");

  const [mode, setMode] = useState("ENTERPRISE");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"INPUT" | "RESULT" | "SETTINGS" | "HISTORY">("INPUT");

  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="animate-pulse w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
           <span className="material-symbols-outlined text-blue-500 animate-spin">sync</span>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0a] text-white p-6">
        <div className="max-w-md w-full bg-[#111111] border border-[#222222] rounded-[2rem] p-10 text-center space-y-6">
          <div className="w-16 h-16 bg-blue-600/10 mx-auto rounded-2xl flex items-center justify-center border border-blue-500/20">
            <span className="material-symbols-outlined text-blue-500 text-3xl">lock</span>
          </div>
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">Access Restricted</h1>
            <p className="text-xs text-[#888888] mt-2 leading-relaxed">
              The 'Cursor for PMs' Engine is currently in private beta. Please authenticate to access the discovery command center.
            </p>
          </div>
          <button 
            onClick={() => signIn("github")}
            className="w-full bg-white text-black font-black uppercase tracking-widest text-[10px] py-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined text-[16px]">terminal</span>
            Authenticate with GitHub
          </button>
        </div>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (transcripts.length === 0 && !currentTranscript.trim()) return;

    // If there's text in the box, add it to transcripts before generating
    const allTranscripts = currentTranscript.trim() 
      ? [...transcripts, currentTranscript.trim()] 
      : transcripts;
    
    // We update state for UX but proceed with allTranscripts
    if (currentTranscript.trim()) {
      setTranscripts(allTranscripts);
      setCurrentTranscript("");
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    let attempts = 0;
    const maxAttempts = 3;
    let lastError = null;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        const formData = new FormData();
        formData.append("transcripts", JSON.stringify(allTranscripts));
        formData.append("mode", mode.toLowerCase());

        const response = await fetch("/api/triage", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to triage feedback");
        }

        setResult(data);
        setIsLoading(false);
        return; // Success, exit loop
      } catch (err: any) {
        console.error(`Attempt ${attempts} failed:`, err.message);
        lastError = err;
        
        // Wait 1 second before retrying, unless it's the last attempt
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // If we've exhausted all attempts, show the final error
    setError(lastError?.message || "Synthesis failed due to high load. Please try again.");
    setIsLoading(false);
  };

  const handleSelectHistory = async (item: any) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    setCurrentView("INPUT"); // Stay on split view
    try {
      const res = await fetch(`/api/history/${item.id}`);
      if (res.ok) {
        const data = await res.json();
        setResult(typeof data.full_result === 'string' ? JSON.parse(data.full_result) : data.full_result);
        setTranscripts(data.raw_feedback ? [data.raw_feedback] : []);
        setCurrentTranscript("");
      }
    } catch (err) {
      setError("Failed to load history item");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewTriage = () => {
    setResult(null);
    setTranscripts([]);
    setCurrentTranscript("");
    setError(null);
    setCurrentView("INPUT");
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-on-surface">
      <Topbar currentView={currentView} onViewChange={setCurrentView} />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          onSelectHistory={handleSelectHistory} 
          onNewTriage={handleNewTriage} 
          onViewChange={setCurrentView}
          currentView={currentView}
        />
        
        <main className="flex-1 ml-16 md:ml-64 flex h-full overflow-hidden">
          <AnimatePresence mode="wait">
            {(currentView === "INPUT" || currentView === "RESULT") ? (
              <motion.div 
                key="split-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-1 w-full h-full overflow-hidden flex-col md:flex-row"
              >
                <div className="w-full md:w-[45%] h-full">
                  <InputScreen 
                    transcripts={transcripts}
                    setTranscripts={setTranscripts}
                    currentTranscript={currentTranscript}
                    setCurrentTranscript={setCurrentTranscript}

                    mode={mode}
                    setMode={setMode}
                    onGenerate={handleGenerate}
                    isLoading={isLoading}
                    error={error}
                  />
                </div>
                <div className="w-full md:w-[55%] h-full">
                  <OutputScreen 
                    ticket={result}
                    onBack={() => {}} // No longer used in split view
                    onPushToGitHub={() => {}}
                    isPushing={false}
                    pushStatus={null}
                  />
                </div>
              </motion.div>
            ) : currentView === "HISTORY" ? (
              <motion.div 
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 h-full overflow-y-auto"
              >
                <HistoryView onSelect={handleSelectHistory} />
              </motion.div>
            ) : (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 h-full overflow-y-auto"
              >
                <SettingsView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        {/* Only show GitHub Feed on large screens if desired, or keep it hidden as per co-founder's mockup */}
        {/* <GitHubFeed /> */}
      </div>
    </div>
  );
}
