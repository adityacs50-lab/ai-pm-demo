"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  Video, 
  Shield, 
  Key, 
  Save, 
  CircleCheck,
  Lock,
  MessageSquare,
  Database
} from "lucide-react";

export default function SettingsView() {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Settings className="text-[#4f6ef7]" size={28} />
          SYSTEM CONFIGURATION
        </h2>
        <p className="text-neutral-500 text-xs font-bold uppercase tracking-[0.3em]">Manage credentials and security protocols</p>
      </div>

      <div className="grid gap-8">
        {/* API Credentials */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 ml-2">
            <Key size={14} className="text-neutral-600" />
            <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">Integration Tokens</h3>
          </div>

          <div className="panel-glass p-8 rounded-[2.5rem] space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">GitHub Personal Access Token</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center text-neutral-600 group-focus-within:text-[#4f6ef7] transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                  </div>
                  <input 
                    type="password" 
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 pl-12 text-sm text-neutral-300 placeholder:text-neutral-700 focus:outline-none focus:border-[#4f6ef7]/50 transition-all font-mono"
                    placeholder="ghp_xxxxxxxxxxxx"
                    defaultValue="************************"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Slack Webhook URL</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center text-neutral-600 group-focus-within:text-[#4f6ef7] transition-colors">
                    <MessageSquare size={16} />
                  </div>
                  <input 
                    type="text" 
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 pl-12 text-sm text-neutral-300 placeholder:text-neutral-700 focus:outline-none focus:border-[#4f6ef7]/50 transition-all font-mono"
                    placeholder="https://hooks.slack.com/services/..."
                    defaultValue="https://hooks.slack.com/services/T0123/B456/XYZ"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Webhook Endpoints */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 ml-2">
            <Database size={14} className="text-neutral-600" />
            <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">Automated Ingest Endpoints</h3>
          </div>

          <div className="panel-glass p-8 rounded-[2.5rem] space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5">
                <div>
                  <p className="text-xs font-bold text-white">Universal Webhook URL</p>
                  <p className="text-[10px] font-mono text-neutral-500 mt-1">https://{typeof window !== 'undefined' ? window.location.host : 'ai-pm-triage.vercel.app'}/api/connectors/webhook</p>
                </div>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase transition-all">Copy URL</button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5">
                <div>
                  <p className="text-xs font-bold text-white">Email Inbound Endpoint</p>
                  <p className="text-[10px] font-mono text-neutral-500 mt-1">https://{typeof window !== 'undefined' ? window.location.host : 'ai-pm-triage.vercel.app'}/api/connectors/email</p>
                </div>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase transition-all">Copy URL</button>
              </div>
            </div>
          </div>
        </section>

        {/* Security Settings */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 ml-2">
            <Shield size={14} className="text-neutral-600" />
            <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">Security & Escalation</h3>
          </div>

          <div className="panel-glass p-8 rounded-[2.5rem] space-y-8">
            <div className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
              <div className="space-y-1">
                <p className="text-xs font-bold text-white">Auto-Escalate Security Signals</p>
                <p className="text-[10px] text-neutral-500">Force CRITICAL severity on PII or vulnerability detections</p>
              </div>
              <div className="w-12 h-6 bg-[#4f6ef7] rounded-full relative p-1 cursor-pointer">
                <div className="absolute right-1 w-4 h-4 bg-white rounded-full shadow-lg" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5 hover:border-white/10 transition-all opacity-50 cursor-not-allowed">
              <div className="space-y-1">
                <p className="text-xs font-bold text-white">PII Redaction (PRO)</p>
                <p className="text-[10px] text-neutral-500">Mask emails and names before sending to Gemini</p>
              </div>
              <Lock size={14} className="text-neutral-700" />
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className={`
              px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-3
              ${isSaved ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-neutral-200'}
            `}
          >
            {isSaved ? (
              <>
                <CircleCheck size={16} />
                Configuration Saved
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
