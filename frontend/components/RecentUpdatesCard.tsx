'use client';

import React from 'react';
import { RouteEvent } from '@/types';
import { useI18n } from '@/hooks/useI18n';
import { Clock, AlertTriangle, RefreshCw, Radio } from 'lucide-react';

interface Props {
  events: RouteEvent[];
}

export default function RecentUpdatesCard({ events }: Props) {
  const { t } = useI18n();

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <span className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Radio className="w-4 h-4 text-brand-600 animate-pulse" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.sectionRecentUpdates}
          </span>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            What Changed?
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">Live Timeline</span>
      </div>

      {events.length === 0 ? (
        <div className="text-xs text-slate-500 dark:text-slate-400 py-3 text-center italic">
          No critical route changes detected. Primary evacuation corridors open.
        </div>
      ) : (
        <div className="space-y-2.5">
          {events.map((evt, idx) => (
            <div
              key={evt.id || idx}
              className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-start space-x-3"
            >
              <div className="p-1.5 rounded-full bg-emergency-100 dark:bg-emergency-900/60 text-emergency-600 dark:text-emergency-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
                    {evt.event_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(evt.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {evt.description}
                </p>
                {evt.location_name && (
                  <span className="inline-block text-[10px] font-bold text-slate-500">
                    Location: {evt.location_name}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
