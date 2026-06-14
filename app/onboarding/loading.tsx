import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-between p-6">
      <div className="max-w-4xl mx-auto w-full space-y-8 mt-10">
        <div className="flex justify-between items-center h-10">
          <Skeleton className="w-32 h-6 rounded-lg" />
          <Skeleton className="w-16 h-4 rounded" />
        </div>
        <Skeleton className="w-full h-1/2 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="w-72 h-8 rounded-xl" />
          <Skeleton className="w-96 h-4 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="p-6 rounded-2xl border border-white/5 bg-[#131316]/50 h-44 flex flex-col justify-between">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="w-20 h-4 rounded" />
                <Skeleton className="w-full h-3 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
