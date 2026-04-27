"use client";

import { useState } from "react";
import { Upload, X, FileText, Video as VideoIcon, Table } from "lucide-react";

interface FileUploadProps {
  file: File | null;
  setFile: (file: File | null) => void;
}

export default function FileUpload({ file, setFile }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSet(droppedFile);
  };

  const validateAndSet = (f: File) => {
    if (!f) return;
    const validExtensions = ['.pdf', '.csv', '.xlsx', '.xls', '.mp4', '.mov'];
    const isValid = f.type === "application/pdf" || 
                    f.type.startsWith("video/") || 
                    validExtensions.some(ext => f.name.toLowerCase().endsWith(ext));
    
    if (isValid && f.size <= 4 * 1024 * 1024) {
      setFile(f);
    }
  };

  const getIcon = () => {
    if (!file) return <Upload size={24} />;
    if (file.name.endsWith('.pdf')) return <FileText size={20} className="text-red-400" />;
    if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) return <Table size={20} className="text-emerald-400" />;
    if (file.type.startsWith('video/')) return <VideoIcon size={20} className="text-blue-400" />;
    return <FileText size={20} className="text-neutral-400" />;
  };

  return (
    <div className="space-y-4">
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`
          relative w-full p-8 border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center gap-3 group
          ${file 
            ? 'border-emerald-500/30 bg-emerald-500/5' 
            : isDragging 
              ? 'border-[#4f6ef7] bg-blue-500/10 scale-[1.02]' 
              : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'}
        `}
      >
        {!file ? (
          <>
            <input 
              type="file" 
              accept=".pdf,.csv,.xlsx,.xls,.mp4,.mov" 
              onChange={(e) => validateAndSet(e.target.files?.[0]!)} 
              className="absolute inset-0 opacity-0 cursor-pointer" 
            />
            <div className="p-3 bg-white/5 rounded-2xl text-neutral-500 group-hover:text-neutral-300 transition-colors">
              <Upload size={28} />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-neutral-300">Drag & Drop or <span className="text-[#4f6ef7] underline">Browse</span></p>
              <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest mt-1">PDF, CSV, Excel, or Video (Max 4MB)</p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-2xl">
                {getIcon()}
              </div>
              <div>
                <p className="text-xs font-bold text-white max-w-[180px] truncate">{file.name}</p>
                <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-tighter">
                  {(file.size / 1024).toFixed(1)} KB • Ready for analysis
                </p>
              </div>
            </div>
            <button 
              onClick={() => setFile(null)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-neutral-500 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
