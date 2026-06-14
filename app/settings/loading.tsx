import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-in fade-in duration-300">
      {/* Title */}
      <div className="space-y-2">
        <Skeleton className="w-36 h-8 rounded-xl" />
        <Skeleton className="w-72 h-4 rounded-lg" />
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="rounded-2xl border border-white/5 bg-[#131316]/50 p-6 space-y-6">
          <Skeleton className="w-32 h-5 rounded" />
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="w-24 h-4 rounded" />
              <Skeleton className="w-36 h-3 rounded" />
            </div>
          </div>
        </div>

        {/* Storage Card */}
        <div className="rounded-2xl border border-white/5 bg-[#131316]/50 p-6 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="w-24 h-5 rounded" />
            <Skeleton className="w-16 h-5 rounded-full" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="w-32 h-4 rounded" />
              <Skeleton className="w-20 h-4 rounded" />
            </div>
            <Skeleton className="w-full h-2 rounded-full" />
          </div>
        </div>

        {/* Integrations Card */}
        <div className="rounded-2xl border border-white/5 bg-[#131316]/50 p-6 space-y-6">
          <Skeleton className="w-36 h-5 rounded" />
          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="w-32 h-4 rounded" />
                <Skeleton className="w-56 h-3 rounded" />
              </div>
            </div>
            <Skeleton className="w-16 h-8 rounded-lg shrink-0" />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-red-500/10 bg-red-950/5 p-6 space-y-6">
          <Skeleton className="w-28 h-5 rounded" />
          <div className="flex flex-col sm:flex-row gap-3">
            <Skeleton className="flex-1 h-12 rounded-xl" />
            <Skeleton className="flex-1 h-12 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
