'use client';

import { useEffect } from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js App Router error digest:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
      <div className="max-w-md w-full border border-white/5 bg-[#0d0d11]/80 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="w-14 h-14 mx-auto rounded-full bg-red-950/20 border border-red-500/20 flex items-center justify-center text-red-400">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-black text-white tracking-tight">System Crash Trapped</h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            An unexpected error interrupted your vault session. Rest assured, your encrypted database assets remain safe.
          </p>
        </div>

        <div className="p-3 bg-zinc-950 border border-white/5 rounded-xl text-[10px] font-mono text-zinc-500 text-left overflow-x-auto max-h-32">
          {error.message || error.toString()}
        </div>

        <button
          onClick={() => reset()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-zinc-950 hover:bg-zinc-100 font-bold text-xs transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Try Reloading Session
        </button>
      </div>
    </div>
  );
}
