'use client';

import React from 'react';
import { WifiOff, Clock, AlertCircle } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';
import { OfflineStorage } from '@/lib/offline';

export default function OfflineBanner() {
  const { isOffline, cachedTimestamp } = useOffline();

  if (!isOffline) return null;

  return (
    <aside
      aria-label="Offline status banner"
      className="bg-amber-500 text-slate-950 px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between text-xs font-semibold"
    >
      <div className="flex items-center space-x-2">
        <WifiOff className="w-4 h-4 text-slate-950 animate-pulse" />
        <span>OFFLINE MODE — Network disconnected. Displaying locally cached emergency plan.</span>
      </div>
      <div className="flex items-center space-x-1.5 mt-1 sm:mt-0 font-mono text-[11px] bg-amber-600/30 px-2 py-0.5 rounded">
        <Clock className="w-3.5 h-3.5" />
        <span>{OfflineStorage.formatCachedTime(cachedTimestamp)}</span>
      </div>
    </aside>
  );
}
