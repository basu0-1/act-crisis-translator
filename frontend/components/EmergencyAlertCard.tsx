"use client";

import React from "react";
import { Clock, ShieldCheck, Radio, Waves, WifiOff, AlertTriangle } from "lucide-react";
import { Alert, LanguageType } from "../types";
import { useAuth } from "../context/AuthContext";
import { getTranslation } from "../lib/translations";

interface EmergencyAlertCardProps {
  alert: Alert;
  isOffline?: boolean;
  language?: LanguageType;
  onOpenProvenance: () => void;
}

export const EmergencyAlertCard: React.FC<EmergencyAlertCardProps> = ({
  alert,
  isOffline = false,
  language = "en",
  onOpenProvenance,
}) => {
  const { isDemoMode } = useAuth();
  const t = getTranslation(language);

  const getStatusBadge = () => {
    if (isOffline) {
      return {
        label: t.offlineCached,
        sub: `${t.issuedAt}: ${new Date(alert.provenance.timestamp).toLocaleTimeString()}`,
        bg: "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-600/50",
      };
    }
    return {
      label: t.liveDecisionActive,
      sub: `${t.issuedAt}: ${new Date(alert.provenance.timestamp).toLocaleTimeString()}`,
      bg: "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/50",
    };
  };

  const status = getStatusBadge();

  return (
    <div className="bg-white dark:bg-slate-900 border border-red-500/40 rounded-2xl overflow-hidden shadow-lg transition-colors">
      {/* Top Banner Alert Strip */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-700 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-white">
        <div className="flex items-center space-x-2">
          <Waves className="h-5 w-5 animate-pulse flex-shrink-0" />
          <span className="font-black uppercase tracking-wider text-xs sm:text-sm">
            {t.emergencyAlert}: {alert.hazard_type.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${status.bg}`}>
            {status.label}
          </span>
          <span className="bg-red-950 px-2 py-0.5 rounded text-xs font-mono font-bold text-red-200 border border-red-400/40 uppercase">
            {alert.severity === "extreme" ? t.severityExtreme : alert.severity === "high" ? t.severitySevere : t.severityModerate}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-5 space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
            {alert.headline}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
            {alert.description}
          </p>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Severity */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl">
            <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider block">
              {t.severityExtreme.split(" ")[0]}
            </span>
            <span className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 capitalize">
              {alert.severity}
            </span>
          </div>

          {/* Confidence */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl">
            <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider block">
              {t.confidence}
            </span>
            <span className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 capitalize">
              {(alert.provenance.confidence * 100).toFixed(0)}%
            </span>
          </div>

          {/* Affected Area / Radius */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl">
            <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider block">
              {t.affectedArea}
            </span>
            <span className="text-xs sm:text-sm font-bold text-cyan-600 dark:text-cyan-400">
              {alert.radius_km} km
            </span>
          </div>

          {/* Time to Impact */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-red-300 dark:border-red-900/50 p-2.5 rounded-xl flex flex-col justify-between">
            <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider block flex items-center gap-1">
              <Clock className="h-3 w-3 text-red-500" /> {t.estimatedTime}
            </span>
            <span className="text-sm sm:text-base font-black text-red-600 dark:text-red-400 tracking-tight">
              {alert.time_to_impact_minutes} min
            </span>
          </div>
        </div>

        {/* Provenance Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
            <Radio className="h-3.5 w-3.5 text-emerald-500" />
            <span>{t.verifiedOfficialSource}:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{alert.provenance.source_name}</span>
          </div>
          <button
            onClick={onOpenProvenance}
            className="flex items-center space-x-1 text-cyan-600 dark:text-cyan-400 hover:underline font-semibold transition"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{t.safetyAudit}</span>
          </button>
        </div>
      </div>
    </div>
  );
};