'use client';

import React from 'react';
import { EmergencyAlert } from '@/types';
import { useI18n } from '@/hooks/useI18n';
import {
  AlertTriangle, Flame, Waves, Wind, Activity,
  Clock, ShieldCheck, Database, Info
} from 'lucide-react';

interface Props {
  alert: EmergencyAlert;
}

export default function EmergencyStatusCard({ alert }: Props) {
  const { t } = useI18n();

  const getEmergencyIcon = (type: string) => {
    switch (type) {
      case 'FLOOD': return <Waves className="w-5 h-5 text-blue-500" />;
      case 'WILDFIRE': return <Flame className="w-5 h-5 text-amber-500" />;
      case 'STORM': return <Wind className="w-5 h-5 text-sky-500" />;
      default: return <Activity className="w-5 h-5 text-emergency-500" />;
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'EXTREME': return 'bg-red-600 text-white border-red-700';
      case 'SEVERE': return 'bg-emergency-500 text-white border-emergency-600';
      case 'MODERATE': return 'bg-amber-500 text-slate-900 border-amber-600';
      default: return 'bg-blue-500 text-white border-blue-600';
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      {/* Header bar with Data Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.sectionEmergencyStatus}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">|</span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t.qWhatHappened}
          </span>
        </div>

        {/* Data Status Banner */}
        <div className="flex items-center space-x-2">
          {alert.data_status === 'DEMO' ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
              <Database className="w-3 h-3 mr-1" />
              {t.statusDemo}
            </span>
          ) : alert.data_status === 'LIVE' ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-ping" />
              {t.statusLive}
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {t.statusCached}
            </span>
          )}
        </div>
      </div>

      {/* Main Alert Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mt-1 shrink-0">
            {getEmergencyIcon(alert.emergency_type)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {alert.title}
              </h3>
              <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold uppercase border ${getSeverityBadgeClass(alert.severity)}`}>
                {alert.severity}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Certainty: {alert.certainty}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              {alert.description}
            </p>
          </div>
        </div>

        {/* Urgency countdown indicator */}
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-emergency-50 dark:bg-emergency-950/40 border border-emergency-200 dark:border-emergency-900/60 shrink-0">
          <Clock className="w-6 h-6 text-emergency-600 dark:text-emergency-400 shrink-0 animate-pulse" />
          <div>
            <div className="text-[11px] font-bold uppercase text-emergency-700 dark:text-emergency-300">
              Est. Time to Critical Impact
            </div>
            <div className="text-2xl font-black text-emergency-700 dark:text-emergency-300 tracking-tight">
              ~{alert.time_to_impact_minutes} <span className="text-sm font-semibold">minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Provenance & Source Metadata footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
        <div className="flex items-center space-x-3">
          <span className="flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 mr-1" />
            Source: <strong className="ml-1 text-slate-700 dark:text-slate-300">{alert.source?.name || 'Authorized Emergency Dispatch'}</strong>
          </span>
          <span>•</span>
          <span>Trust Score: <strong>{(alert.source?.trust_score ? alert.source.trust_score * 100 : 98).toFixed(0)}%</strong></span>
          <span>•</span>
          <span>Verification: <strong>{alert.verification_status}</strong></span>
        </div>
        <div className="text-[11px]">
          Last Updated: {new Date(alert.updated_at).toLocaleTimeString()}
        </div>
      </div>
    </section>
  );
}
