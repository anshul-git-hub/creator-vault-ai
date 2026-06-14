import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse rounded bg-white/5 ${className}`} 
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-white/5 bg-[#131316]/50 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="w-6 h-6 rounded" />
      </div>
      <Skeleton className="w-24 h-4 rounded" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/5">
      <div className="flex items-center gap-3">
        <Skeleton className="w-4.5 h-4.5 rounded" />
        <div className="space-y-1">
          <Skeleton className="w-32 h-4 rounded" />
          <Skeleton className="w-16 h-3 rounded" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="w-14 h-6 rounded-full" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <Skeleton className="w-20 h-4 rounded" />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="p-8 rounded-2xl border border-white/5 bg-[#131316]/50 space-y-6">
            <Skeleton className="w-1/3 h-6 rounded" />
            <Skeleton className="w-full h-10 rounded-xl" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="w-full h-8 rounded" />
              <Skeleton className="w-full h-8 rounded" />
              <Skeleton className="w-full h-8 rounded" />
            </div>
          </div>
          <div className="p-6 rounded-2xl border border-white/5 bg-[#131316]/50 space-y-4">
            <Skeleton className="w-32 h-4 rounded" />
            <Skeleton className="w-full h-64 rounded-xl" />
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="p-8 rounded-2xl border border-white/5 bg-[#131316]/50 space-y-6">
            <Skeleton className="w-1/2 h-5 rounded" />
            <Skeleton className="w-full h-32 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
