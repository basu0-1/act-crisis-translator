"use client";

import React from "react";
import { ShieldAlert, CheckCircle2, Clock, Info, HelpCircle } from "lucide-react";
import { PersonalRisk } from "../types";

interface PersonalRiskGaugeProps {
  risk: PersonalRisk;
}

export const PersonalRiskGauge: React.FC<PersonalRiskGaugeProps> = ({ risk }) => {
  const getRiskColor = (score: number) => {
    if (score >= 75) return { text: "text-red-400", bg: "bg-red-500", ring: "border-red-500", badge: "bg-red-950 text-red-300 border-red-600/60" };
    if (score >= 45) return { text: "text-amber-400", bg: "bg-amber-500", ring: "border-amber-500", badge: "bg-amber-950 text-amber-300 border-amber-600/60" };
    return { text: "text-emerald-400", bg: "bg-emerald-500", ring: "border-emerald-500", badge: "bg-emerald-950 text-emerald-300 border-emerald-600/60" };
  };

  const colors = getRiskColor(risk.score);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="h-5 w-5 text-red-400" />
          <h3 className="text-sm uppercase tracking-wider font-bold text-slate-200">
            Personal Risk Assessment
          </h3>
        </div>
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase border ${colors.badge}`}>
          {risk.level} RISK
        </span>
      </div>

      {/* Big Score and Action Window */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/70 p-4 rounded-lg border border-slate-800/80">
        {/* Risk Score */}
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center justify-center h-16 w-16 rounded-full border-4 border-slate-800 bg-slate-900">
            <div
              className={`absolute inset-0 rounded-full border-4 ${colors.ring} border-t-transparent animate-spin`}
              style={{ animationDuration: "8s" }}
            />
            <span className={`text-xl font-black ${colors.text}`}>{risk.score}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Personalized Risk Score</span>
            <span className={`text-base font-extrabold ${colors.text} uppercase tracking-tight`}>
              {risk.score} / 100
            </span>
          </div>
        </div>

        {/* Action Window */}
        <div className="flex items-center space-x-3 bg-red-950/30 border border-red-500/30 px-3.5 py-2 rounded-lg">
          <Clock className="h-5 w-5 text-red-400 flex-shrink-0 animate-pulse" />
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Estimated Action Window</span>
            <span className="text-sm font-black text-red-300">
              {risk.estimated_action_window_minutes} Minutes Remaining
            </span>
          </div>
        </div>
      </div>

      {/* Transparent Rationale Checklist */}
      <div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Transparent Risk Breakdown (Why this score?)
        </span>
        <div className="space-y-1.5">
          {risk.reasons.map((reason, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Formula Transparency & Disclaimer */}
      <div className="pt-2 border-t border-slate-800/70 flex items-start space-x-2 text-[11px] text-slate-400">
        <Info className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <p>
          <span className="font-semibold text-slate-300">Decision-Support Model: </span>
          Risk = Severity (35%) × Exposure (25%) × Personal Vulnerability (25%) × Time Pressure (15%).{" "}
          <span className="italic text-slate-500">{risk.prototype_disclaimer}</span>
        </p>
      </div>
    </div>
  );
};