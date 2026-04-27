"use client";

import { useEffect, useState } from "react";
import { 
  GitPullRequest, 
  CircleCheck, 
  MessageSquare, 
  Tag, 
  Clock,
  ExternalLink,
  Video
} from "lucide-react";

export default function GitHubFeed() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/github/webhook");
        if (res.ok) {
          const data = await res.json();
          setEvents(data.updates || []);
        }
      } catch { /* silent fail */ } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-[320px] h-[calc(100vh-56px)] border-l border-white/5 bg-[#0a0a0f]/30 backdrop-blur-sm p-4 hidden xl:flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(124,58,237,0.5)]" />
          Live Feed
        </h2>
        <span className="text-[9px] font-mono text-neutral-700 uppercase">Updates every 30s</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center space-y-3">
            <div className="p-3 bg-white/5 rounded-2xl text-neutral-800">
              <GitPullRequest size={24} />
            </div>
            <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Connecting to GitHub...</p>
          </div>
        ) : (
          events.map((event, i) => (
            <div key={i} className="group p-3 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-all animate-in">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${
                    event.action === 'closed' ? 'bg-emerald-500/10 text-emerald-500' :
                    event.action === 'labeled' ? 'bg-indigo-500/10 text-indigo-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {event.action === 'closed' ? <CircleCheck size={12} /> :
                     event.action === 'commented' ? <MessageSquare size={12} /> :
                     event.action === 'labeled' ? <Tag size={12} /> :
                     <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>}
                  </div>
                  <span className="text-[9px] font-black text-neutral-500 uppercase tracking-tighter">{event.action}</span>
                </div>
                <span className="text-[9px] font-mono text-neutral-700">#{event.issue_number}</span>
              </div>
              
              <h3 className="text-xs font-bold text-neutral-300 line-clamp-1 mb-1 group-hover:text-white transition-colors">{event.title}</h3>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-neutral-800 flex items-center justify-center text-[8px] font-bold text-neutral-500">
                    {event.actor?.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-[10px] font-bold text-neutral-600">{event.actor}</span>
                </div>
                <div className="flex items-center gap-1 text-neutral-700">
                  <Clock size={8} />
                  <span className="text-[8px] font-mono uppercase">Just now</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Connector Status Recap */}
      <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
          <div className="flex items-center gap-2">
            <Video size={12} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-400">Zoom Agent Active</span>
          </div>
          <ExternalLink size={10} className="text-emerald-800" />
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
          <div className="flex items-center gap-2">
            <MessageSquare size={12} className="text-indigo-500" />
            <span className="text-[10px] font-bold text-indigo-400">Slack Forwarding</span>
          </div>
          <span className="text-[9px] font-mono text-indigo-800">42 Inbound</span>
        </div>
      </div>
    </aside>
  );
}
