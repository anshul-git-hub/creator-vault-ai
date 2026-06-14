import React from 'react';
import { CardSkeleton, TableRowSkeleton, Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="w-48 h-8 rounded-xl" />
          <Skeleton className="w-72 h-4 rounded-lg" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="w-24 h-10 rounded-xl" />
          <Skeleton className="w-32 h-10 rounded-xl" />
        </div>
      </div>

      {/* Analytics Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Clickable Categories Grid */}
      <div className="space-y-3">
        <Skeleton className="w-64 h-4 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="p-5 rounded-2xl border border-white/5 bg-[#131316]/50 h-36 flex flex-col justify-between">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-16 h-4 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Panel & Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#131316]/50 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="w-32 h-6 rounded" />
            <Skeleton className="w-48 h-8 rounded-lg" />
          </div>
          <div className="space-y-1">
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#131316]/50 p-6 space-y-6">
          <Skeleton className="w-24 h-5 rounded" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="flex gap-3">
                <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="w-full h-3 rounded" />
                  <Skeleton className="w-12 h-2.5 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
