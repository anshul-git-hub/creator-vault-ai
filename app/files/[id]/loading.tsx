import React from 'react';
import { DetailSkeleton } from '@/components/ui/skeleton';

export default function FileDetailsLoading() {
  return (
    <div className="animate-in fade-in duration-300">
      <DetailSkeleton />
    </div>
  );
}
