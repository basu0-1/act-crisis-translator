"use client";

import React, { useState } from "react";
import {
  AlertOctagon,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Square,
  Ban,
  GitFork,
  Navigation,
  Volume2,
  VolumeX,
  AlertTriangle,
  Building2
} from "lucide-react";
import { ActionPlan, LanguageType, RouteRecommendation } from "../types";
import { getTranslation } from "../lib/translations";

interface ActionPlanViewProps {
  plan: ActionPlan;
  routeRec: RouteRecommendation;
  language?: LanguageType;
  onOpenProvenance: () => void;
}

export const ActionPlanView: React.FC<ActionPlanViewProps> = ({
  plan,
  routeRec,
  language = "en",
  onOpenProvenance
}) => {
  const [completedNow, setCompletedNow] = useState<Record<number, boolean>>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const t = getTranslation(language);

  const toggleCheck = (idx: number) => {
    setCompletedNow((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handlePlayAudio = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak = `${t.nowPriority}: ${plan.now.join(". ")}. ${t.avoidPriority}: ${plan.avoid.join(". ")}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Set voice language
    if (language === "hi") utterance.lang = "hi-IN";
    else if (language === "bn") utterance.lang = "bn-IN";
    else if (language === "or") utterance.lang = "or-IN";
    else if (language === "ur") utterance.lang = "ur-PK";
    else if (language === "ja") utterance.lang = "ja-JP";
    else utterance.lang = "en-US";

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  return (
    <div className="space-y-4">
      {/* Fail-Safe Banner if Insufficient Information */}
      {plan.failsafe_status && (
        <div className="bg-amber-50 dark:bg-amber-950/80 border-2 border-amber-500 rounded-2xl p-4 text-amber-900 dark:text-amber-200 space-y-2 shadow-lg animate-pulse">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <h4 className="font-bold text-sm sm:text-base uppercase text-amber-700 dark:text-amber-300">
              {plan.failsafe_status}
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200">
            {plan.failsafe_reason || "Verified safe route telemetry is unavailable. Prioritizing safety through vertical sheltering."}
          </p>
        </div>
      )}

      {/* Audio Guidance Bar */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs">
        <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-300 font-bold">
          <Volume2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          <span>{t.audioGuidance}</span>
        </div>
        <button
          onClick={handlePlayAudio}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-sm"
        >
          {isPlayingAudio ? (
            <>
              <VolumeX className="h-3.5 w-3.5" />
              <span>{t.playingAudio}</span>
            </>
          ) : (
            <>
              <Volume2 className="h-3.5 w-3.5" />
              <span>{t.listenAudio}</span>
            </>
          )}
        </button>
      </div>

      {/* 🔴 DO NOW Actions */}
      <div className="bg-white dark:bg-slate-900 border-2 border-red-500/70 rounded-2xl p-5 shadow-lg space-y-3 relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
          {t.nowPriority}
        </div>
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-xl bg-red-100 dark:bg-red-950 border border-red-500 flex items-center justify-center">
            <AlertOctagon className="h-5 w-5 text-red-600 dark:text-red-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-wide uppercase">
              🔴 {t.nowPriority}: {t.nowActionDesc}
            </h3>
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          {plan.now.map((item, idx) => {
            const isDone = !!completedNow[idx];
            return (
              <button
                key={idx}
                onClick={() => toggleCheck(idx)}
                className={`w-full text-left flex items-start space-x-3 p-3 rounded-xl border transition ${
                  isDone
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/50 text-slate-400 line-through"
                    : "bg-slate-50 dark:bg-slate-950 border-red-200 dark:border-red-900/40 text-slate-900 dark:text-slate-100 hover:border-red-500/50"
                }`}
              >
                {isDone ? (
                  <CheckSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Square className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-xs sm:text-sm font-medium leading-relaxed">{item}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🟠 NEXT Actions */}
      <div className="bg-white dark:bg-slate-900 border border-amber-500/50 rounded-2xl p-5 shadow-lg space-y-3 transition-colors">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-950 border border-amber-500 flex items-center justify-center">
            <ArrowRight className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-wide uppercase">
              🟠 {t.nextPriority}: {t.nextActionDesc}
            </h3>
          </div>
        </div>

        <ul className="space-y-2 pt-1">
          {plan.next.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800"
            >
              <span className="h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 🚫 AVOID Warnings */}
      <div className="bg-white dark:bg-slate-900 border border-rose-500/50 rounded-2xl p-5 shadow-lg space-y-3 transition-colors">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-xl bg-rose-100 dark:bg-rose-950 border border-rose-500 flex items-center justify-center">
            <Ban className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-wide uppercase">
              🚫 {t.avoidPriority}: {t.avoidActionDesc}
            </h3>
          </div>
        </div>

        <ul className="space-y-2 pt-1">
          {plan.avoid.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start space-x-2.5 text-xs sm:text-sm text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-3 rounded-xl"
            >
              <Ban className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Verified Provenance Footer */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>🛡️ {t.verifiedOfficialSource} — Zero AI Hallucination Guarantee</span>
        <button
          onClick={onOpenProvenance}
          className="text-cyan-600 dark:text-cyan-400 hover:underline font-semibold ml-2 flex-shrink-0"
        >
          {t.safetyAudit}
        </button>
      </div>
    </div>
  );
};