"use client";

import React from "react";
import { WifiOff, ShieldAlert, Clock } from "lucide-react";

interface OfflineBannerProps {
  isOffline: boolean;
  cachedTimestamp?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOffline, cachedTimestamp }) => {
  if (!isOffline) return null;

  return (
    <div className="bg-amber-500/15 border-b border-amber-500/40 text-amber-200 px-4 py-2.5 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center space-x-2">
          <WifiOff className="h-4 w-4 text-amber-400 flex-shrink-0 animate-bounce" />
          <span className="font-bold text-amber-300 uppercase tracking-wide">CONNECTION LOST</span>
          <span className="text-slate-300">
            — Showing last verified emergency action plan. Real-time updates paused.
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-mono bg-amber-950/60 px-2.5 py-1 rounded border border-amber-500/30">
          <Clock className="h-3.5 w-3.5" />
          <span>Last Verified: {cachedTimestamp ? new Date(cachedTimestamp).toLocaleTimeString() : "2 mins ago"}</span>
        </div>
      </div>
    </div>
  );
};