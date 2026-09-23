"use client";

import React from "react";
import { ShieldAlert, CheckCircle2, Clock, Info } from "lucide-react";
import { LanguageType, PersonalRisk } from "../types";
import { getTranslation } from "../lib/translations";

interface PersonalRiskGaugeProps {
  risk: PersonalRisk;
  language?: LanguageType;
}

export const PersonalRiskGauge: React.FC<PersonalRiskGaugeProps> = ({ risk, language = "en" }) => {
  const t = getTranslation(language);

  const getRiskColor = (score: number) => {
    if (score >= 75) {
      return {
        text: "text-red-600 dark:text-red-400",
        ring: "border-red-500",
        badge: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-600/60",
        label: t.riskCritical,
      };
    }
    if (score >= 45) {
      return {
        text: "text-amber-600 dark:text-amber-400",
        ring: "border-amber-500",
        badge: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600/60",
        label: t.riskElevated,
      };
    }
    return {
      text: "text-emerald-600 dark:text-emerald-400",
      ring: "border-emerald-500",
      badge: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600/60",
      label: t.riskLow,
    };
  };

  const colors = getRiskColor(risk.score);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
          <h3 className="text-xs sm:text-sm uppercase tracking-wider font-extrabold text-slate-800 dark:text-slate-200">
            {t.personalRiskAssessment}
          </h3>
        </div>
        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${colors.badge}`}>
          {colors.label}
        </span>
      </div>

      {/* Big Score and Action Window */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80">
        {/* Risk Score */}
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center justify-center h-16 w-16 rounded-full border-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div
              className={`absolute inset-0 rounded-full border-4 ${colors.ring} border-t-transparent animate-spin`}
              style={{ animationDuration: "8s" }}
            />
            <span className={`text-xl font-black ${colors.text}`}>{risk.score}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
              {t.riskScore}
            </span>
            <span className={`text-sm sm:text-base font-extrabold ${colors.text} uppercase tracking-tight`}>
              {risk.score} / 100
            </span>
          </div>
        </div>

        {/* Action Window */}
        <div className="flex items-center space-x-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/30 px-3.5 py-2.5 rounded-xl">
          <Clock className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 animate-pulse" />
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
              {t.estimatedTime}
            </span>
            <span className="text-xs sm:text-sm font-black text-red-700 dark:text-red-300">
              {risk.estimated_action_window_minutes} {language === "hi" ? "मिनट शेष" : language === "bn" ? "মিনিট বাকি" : language === "or" ? "ମିନିଟ ବାକି" : language === "ur" ? "منٹ باقی" : language === "ja" ? "分以内" : "Minutes Remaining"}
            </span>
          </div>
        </div>
      </div>

      {/* Transparent Rationale Checklist */}
      <div>
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
          {t.factorsAnalyzed}
        </span>
        <div className="space-y-1.5">
          {risk.reasons.map((reason, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Formula Transparency & Disclaimer */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/70 flex items-start space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
        <Info className="h-4 w-4 text-cyan-500 flex-shrink-0 mt-0.5" />
        <p>
          <span className="font-semibold text-slate-700 dark:text-slate-300">AI Model: </span>
          Severity (35%) × Exposure (25%) × Mobility (25%) × Time (15%).{" "}
          <span className="italic text-slate-400">{risk.prototype_disclaimer}</span>
        </p>
      </div>
    </div>
  );
};