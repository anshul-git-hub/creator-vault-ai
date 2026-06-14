import React from 'react';
import { Skeleton, CardSkeleton } from '@/components/ui/skeleton';

export default function SearchLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div className="space-y-2">
        <Skeleton className="w-32 h-8 rounded-xl" />
        <Skeleton className="w-80 h-4 rounded-lg" />
      </div>

      {/* Control bar */}
      <div className="rounded-2xl border border-white/5 bg-[#131316]/50 p-6 space-y-6">
        <Skeleton className="w-full h-10 rounded-xl" />
        <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
          <Skeleton className="w-24 h-4 rounded" />
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[150px] space-y-2">
              <Skeleton className="w-12 h-3 rounded" />
              <Skeleton className="w-full h-9 rounded-xl" />
            </div>
            <div className="flex-1 min-w-[150px] space-y-2">
              <Skeleton className="w-12 h-3 rounded" />
              <Skeleton className="w-full h-9 rounded-xl" />
            </div>
            <div className="flex-1 min-w-[150px] space-y-2">
              <Skeleton className="w-12 h-3 rounded" />
              <Skeleton className="w-full h-9 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center px-2">
        <Skeleton className="w-20 h-4 rounded" />
      </div>

      {/* Results Section */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
