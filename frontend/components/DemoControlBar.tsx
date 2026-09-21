'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { useOffline } from '@/hooks/useOffline';
import {
  Sliders, AlertOctagon, Clock, Wifi, WifiOff,
  RotateCcw, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';

interface Props {
  onStateChange: () => void;
}

export default function DemoControlBar({ onStateChange }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const { isOffline, setIsOffline } = useOffline();

  const handleAction = async (actionFn: () => Promise<any>, successText: string) => {
    setLoading(true);
    setMsg(null);
    try {
      await actionFn();
      setMsg(successText);
      onStateChange();
    } catch (err: any) {
      setMsg(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside aria-label="Interactive demonstration controls" className="bg-slate-900 text-white rounded-xl border border-slate-700 shadow-lg overflow-hidden transition">
      <div
        className="px-4 py-2.5 flex items-center justify-between cursor-pointer bg-slate-800/80 hover:bg-slate-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Interactive Demonstration Controls (Demo Mode)
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span>{isOpen ? 'Collapse' : 'Expand'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-3">
          <p className="text-xs text-slate-300">
            Simulate real crisis conditions to test ACT's dynamic decision engine, route recalculation, and offline resilience:
          </p>

          <div className="flex flex-wrap gap-2.5">
            {/* Road Block Trigger */}
            <button
              onClick={() =>
                handleAction(
                  () => api.triggerDemoRoadblock(),
                  'Triggered Riverside Road Blockage -> Route Recalculated!'
                )
              }
              disabled={loading}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow transition disabled:opacity-50"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Simulate Riverside Rd Blockage</span>
            </button>

            {/* Urgency 32 -> 10 mins */}
            <button
              onClick={() =>
                handleAction(
                  () => api.triggerDemoUrgency(10),
                  'Shifted Time-to-Impact to 10 minutes -> Urgency Elevated!'
                )
              }
              disabled={loading}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white shadow transition disabled:opacity-50"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Shift Urgency: 32m → 10m</span>
            </button>

            {/* Offline / Online toggle */}
            <button
              onClick={() => {
                setIsOffline(!isOffline);
                setMsg(
                  !isOffline
                    ? 'Simulated Network Disconnected: Offline cached rescue plan active.'
                    : 'Network Restored: Online live sync re-established.'
                );
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow transition ${
                isOffline ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {isOffline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOffline ? 'Restore Network (Online)' : 'Cut Network (Offline Test)'}</span>
            </button>

            {/* Reset to baseline */}
            <button
              onClick={() =>
                handleAction(
                  () => api.resetDemo(),
                  'Demo state reset to initial baseline conditions.'
                )
              }
              disabled={loading}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-slate-200 transition disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>
          </div>

          {msg && (
            <div className="p-2 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono text-amber-300">
              {msg}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
