"use client";

import { useState } from "react";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import GitHubFeed from "./components/GitHubFeed";
import { motion, AnimatePresence } from "framer-motion";

import BatchDashboard from "./components/BatchDashboard";
import SettingsView from "./components/SettingsView";
import HistoryView from "./components/HistoryView";
import InputScreen from "./components/InputScreen";
import OutputScreen from "./components/OutputScreen";

export default function Home() {
  const [feedback, setFeedback] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState("ENTERPRISE");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pushStatus, setPushStatus] = useState<any>(null);
  const [currentView, setCurrentView] = useState<"INPUT" | "RESULT" | "BATCH" | "SETTINGS" | "HISTORY">("INPUT");

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
    setIsLoading(true);
    setResult(null);
    setError(null);
    setCurrentView("INPUT"); // Stay on split view
    try {
      const res = await fetch(`/api/history/${item.id}`);
      if (res.ok) {
        const data = await res.json();
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
    setCurrentView("INPUT");
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
                    feedback={feedback}
                    setFeedback={setFeedback}
                    file={file}
                    setFile={setFile}
                    mode={mode}
                    setMode={setMode}
                    onGenerate={handleGenerate}
                    isLoading={isLoading}
                  />
                </div>
                <div className="w-full md:w-[55%] h-full">
                  <OutputScreen 
                    ticket={result}
                    onBack={() => {}} // No longer used in split view
                    onPushToGitHub={handlePushToGitHub}
                    isPushing={isPushing}
                    pushStatus={pushStatus}
                  />
                </div>
              </motion.div>
            ) : currentView === "BATCH" ? (
              <motion.div 
                key="batch"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 h-full overflow-y-auto"
              >
                <BatchDashboard />
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
