import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoriesLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div className="space-y-2">
        <Skeleton className="w-48 h-8 rounded-xl" />
        <Skeleton className="w-96 h-4 rounded-lg" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Analytics Chart */}
        <div className="lg:col-span-1 rounded-2xl border border-white/5 bg-[#131316]/50 p-6 space-y-6">
          <Skeleton className="w-32 h-5 rounded" />
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="w-24 h-3.5 rounded" />
                  <Skeleton className="w-16 h-3 rounded" />
                </div>
                <Skeleton className="w-full h-1.5 rounded-full" />
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-4 flex justify-between">
            <Skeleton className="w-28 h-4 rounded" />
            <Skeleton className="w-12 h-4 rounded" />
          </div>
        </div>

        {/* Right Column: Folders */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#131316]/50 p-6 space-y-6">
          <Skeleton className="w-36 h-5 rounded" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <div className="space-y-1.5">
                    <Skeleton className="w-24 h-4 rounded" />
                    <Skeleton className="w-16 h-3 rounded" />
                  </div>
                </div>
                <Skeleton className="w-12 h-4 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
