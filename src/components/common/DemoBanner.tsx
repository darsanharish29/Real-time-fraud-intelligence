import React from 'react';
import { ShieldCheck, Database, Radio } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DemoBanner() {
  const { health } = useAuth();

  return (
    <div className="bg-[#0c140e] border-b border-emerald-950/60 px-4 py-1.5 text-xs text-zinc-300 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          DEMO MODE
        </span>
        <span className="text-zinc-400">
          Synthetic Financial Intelligence Sandbox &bull; All Account Numbers, Aadhaar IDs, and Transcripts are Fictional
        </span>
      </div>

      <div className="flex items-center gap-4 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${health.connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-zinc-400">Backend:</span>
          <span className={health.connected ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
            {health.connected ? 'Online (Port 3000)' : 'Offline'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Database className="w-3 h-3 text-emerald-400" />
          <span className="text-zinc-400">Store:</span>
          <span className="text-zinc-200">PostgreSQL Schema / In-Memory Demo</span>
        </div>
      </div>
    </div>
  );
}
