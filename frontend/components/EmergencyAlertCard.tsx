"use client";

import React from "react";
import { AlertTriangle, Clock, ShieldCheck, MapPin, Radio, Waves, Wifi, WifiOff } from "lucide-react";
import { Alert } from "../types";
import { useAuth } from "../context/AuthContext";

interface EmergencyAlertCardProps {
  alert: Alert;
  isOffline?: boolean;
  onOpenProvenance: () => void;
}

export const EmergencyAlertCard: React.FC<EmergencyAlertCardProps> = ({
  alert,
  isOffline = false,
  onOpenProvenance,
}) => {
  const { isDemoMode } = useAuth();

  const getStatusBadge = () => {
    if (isOffline) {
      return {
        label: "CACHED OFFLINE DATA",
        sub: `Last verified: ${new Date(alert.provenance.timestamp).toLocaleTimeString()}`,
        bg: "bg-amber-950/90 text-amber-300 border-amber-600/50",
      };
    }
    if (isDemoMode) {
      return {
        label: "SIMULATED / DEMO SCENARIO",
        sub: "Deterministic Flood Evacuation Scenario",
        bg: "bg-indigo-950/90 text-indigo-300 border-indigo-500/50",
      };
    }
    return {
      label: "LIVE TELEMETRY STREAM",
      sub: `Updated: ${new Date(alert.provenance.timestamp).toLocaleTimeString()}`,
      bg: "bg-emerald-950/90 text-emerald-300 border-emerald-500/50",
    };
  };

  const status = getStatusBadge();

  return (
    <div className="bg-slate-900 border border-red-500/40 rounded-xl overflow-hidden shadow-2xl relative">
      {/* Top Banner Alert Strip */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-700 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-white">
        <div className="flex items-center space-x-2">
          <Waves className="h-5 w-5 animate-bounce flex-shrink-0" />
          <span className="font-black uppercase tracking-wider text-xs sm:text-sm">
            OFFICIAL EMERGENCY ALERT: {alert.hazard_type.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border font-mono ${status.bg}`}>
            {status.label}
          </span>
          <span className="bg-red-950 px-2 py-0.5 rounded text-xs font-mono font-bold text-red-200 border border-red-400/40">
            {alert.severity.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-5 space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
            {alert.headline}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            {alert.description}
          </p>
        </div>

        {/* 4 Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Severity */}
          <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">Severity</span>
            <span className="text-sm font-bold text-red-400 capitalize">{alert.severity}</span>
          </div>

          {/* Certainty */}
          <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">Certainty</span>
            <span className="text-sm font-bold text-amber-400 capitalize">{alert.certainty}</span>
          </div>

          {/* Radius */}
          <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">Hazard Radius</span>
            <span className="text-sm font-bold text-cyan-400">{alert.radius_km} km</span>
          </div>

          {/* Time to Impact */}
          <div className="bg-slate-950/70 border border-red-900/50 p-2.5 rounded-lg flex flex-col justify-between">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block flex items-center gap-1">
              <Clock className="h-3 w-3 text-red-400" /> Time to Impact
            </span>
            <span className="text-base font-black text-red-400 tracking-tight">
              {alert.time_to_impact_minutes} mins
            </span>
          </div>
        </div>

        {/* Provenance Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <Radio className="h-3.5 w-3.5 text-emerald-400" />
            <span>Authority:</span>
            <span className="font-semibold text-slate-200">{alert.provenance.source_name}</span>
          </div>
          <button
            onClick={onOpenProvenance}
            className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-medium transition"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Level {alert.source_level} Verified ({(alert.provenance.confidence * 100).toFixed(0)}%)</span>
          </button>
        </div>
      </div>
    </div>
  );
};