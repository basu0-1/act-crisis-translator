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
  Sparkles,
  AlertTriangle,
  Building2
} from "lucide-react";
import { ActionPlan, RouteRecommendation } from "../types";

interface ActionPlanViewProps {
  plan: ActionPlan;
  routeRec: RouteRecommendation;
  onOpenProvenance: () => void;
}

export const ActionPlanView: React.FC<ActionPlanViewProps> = ({
  plan,
  routeRec,
  onOpenProvenance
}) => {
  const [completedNow, setCompletedNow] = useState<Record<number, boolean>>({});

  const toggleCheck = (idx: number) => {
    setCompletedNow((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-4">
      {/* Fail-Safe Banner if Insufficient Information */}
      {plan.failsafe_status && (
        <div className="bg-amber-950/80 border-2 border-amber-500 rounded-xl p-4 text-amber-200 space-y-2 shadow-xl animate-pulse">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0" />
            <h4 className="font-bold text-base uppercase text-amber-300">
              {plan.failsafe_status}
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-200">
            {plan.failsafe_reason || "Verified safe route telemetry is unavailable. Prioritizing safety through vertical sheltering."}
          </p>
        </div>
      )}

      {/* 🔴 DO NOW Actions */}
      <div className="bg-slate-900 border-2 border-red-600/70 rounded-xl p-5 shadow-xl space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-lg tracking-wider">
          IMMEDIATE PRIORITY
        </div>
        <div className="flex items-center space-x-2.5">
          <div className="h-7 w-7 rounded-full bg-red-600/20 border border-red-500 flex items-center justify-center">
            <AlertOctagon className="h-4 w-4 text-red-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-wide uppercase">
              🔴 DO NOW
            </h3>
            <p className="text-xs text-slate-400">Perform these actions immediately</p>
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          {plan.now.map((item, idx) => {
            const isDone = !!completedNow[idx];
            return (
              <button
                key={idx}
                onClick={() => toggleCheck(idx)}
                className={`w-full text-left flex items-start space-x-3 p-3 rounded-lg border transition ${
                  isDone
                    ? "bg-emerald-950/40 border-emerald-600/50 text-slate-400 line-through"
                    : "bg-slate-950/80 border-red-900/40 text-slate-100 hover:border-red-500/50"
                }`}
              >
                {isDone ? (
                  <CheckSquare className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Square className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-xs sm:text-sm font-medium leading-relaxed">{item}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🟢 RECOMMENDED ROUTE & DESTINATION */}
      <div className="bg-slate-900 border border-emerald-600/60 rounded-xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded-full bg-emerald-600/20 border border-emerald-500 flex items-center justify-center">
              <Navigation className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-wide uppercase">
                🟢 VERIFIED SAFE ROUTE
              </h3>
              <p className="text-xs text-slate-400">Accessibility-verified corridor</p>
            </div>
          </div>
          {routeRec.recommended_route && (
            <span className="text-xs bg-emerald-950 text-emerald-300 font-bold px-2.5 py-1 rounded border border-emerald-600/50">
              Safety Score: {routeRec.safety_score}/100
            </span>
          )}
        </div>

        {routeRec.recommended_route ? (
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Designated Path</span>
                <p className="text-sm sm:text-base font-extrabold text-emerald-400">
                  {routeRec.recommended_route.name}
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-300">
                <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
                  ⏱️ {routeRec.estimated_time_minutes} mins
                </span>
                <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
                  ♿ Step-Free
                </span>
              </div>
            </div>

            {/* Destination Shelter */}
            {routeRec.destination && (
              <div className="flex items-start space-x-3 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <Building2 className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[11px] text-cyan-400 uppercase font-bold">Recommended Destination</span>
                  <p className="text-xs sm:text-sm font-bold text-white">
                    {routeRec.destination.name}
                  </p>
                  <p className="text-[11px] text-slate-400">{routeRec.destination.address}</p>
                  <p className="text-[11px] text-emerald-400 font-medium pt-1">
                    ✓ Capacity: {routeRec.destination.capacity - routeRec.destination.current_occupancy} open slots available
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-950/80 p-3 rounded-lg text-xs text-slate-400">
            {plan.route_summary}
          </div>
        )}
      </div>

      {/* 🟠 NEXT Actions */}
      <div className="bg-slate-900 border border-amber-600/50 rounded-xl p-5 shadow-xl space-y-3">
        <div className="flex items-center space-x-2.5">
          <div className="h-7 w-7 rounded-full bg-amber-600/20 border border-amber-500 flex items-center justify-center">
            <ArrowRight className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-wide uppercase">
              🟠 NEXT STEPS
            </h3>
            <p className="text-xs text-slate-400">Preparation and reception</p>
          </div>
        </div>

        <ul className="space-y-2 pt-1">
          {plan.next.map((item, idx) => (
            <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-200 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="h-5 w-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 🚫 AVOID Warnings */}
      <div className="bg-slate-900 border border-rose-900/60 rounded-xl p-5 shadow-xl space-y-3">
        <div className="flex items-center space-x-2.5">
          <div className="h-7 w-7 rounded-full bg-rose-600/20 border border-rose-500 flex items-center justify-center">
            <Ban className="h-4 w-4 text-rose-400" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-wide uppercase">
              🚫 CRITICAL AVOID WARNINGS
            </h3>
            <p className="text-xs text-slate-400">Identified hazards to avoid</p>
          </div>
        </div>

        <ul className="space-y-2 pt-1">
          {plan.avoid.map((item, idx) => (
            <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-rose-200 bg-rose-950/20 border border-rose-900/40 p-2.5 rounded-lg">
              <Ban className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 🔁 IF → THEN Contingencies */}
      <div className="bg-slate-900 border border-blue-600/50 rounded-xl p-5 shadow-xl space-y-3">
        <div className="flex items-center space-x-2.5">
          <div className="h-7 w-7 rounded-full bg-blue-600/20 border border-blue-500 flex items-center justify-center">
            <GitFork className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-wide uppercase">
              🔁 IF → THEN CONTINGENCY RULES
            </h3>
            <p className="text-xs text-slate-400">Pre-calculated reactive scenarios</p>
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          {plan.if_then.map((rule, idx) => (
            <div key={idx} className="bg-slate-950/80 border border-blue-900/40 p-3 rounded-lg space-y-1.5 text-xs sm:text-sm">
              <div className="flex items-center space-x-2 text-blue-300 font-bold">
                <span className="bg-blue-950 px-2 py-0.5 rounded text-[10px] font-mono border border-blue-600/40">
                  {rule.trigger_event}
                </span>
                <span>{rule.condition}</span>
              </div>
              <div className="flex items-start space-x-2 text-slate-200 pl-4 border-l-2 border-blue-500/40">
                <ArrowRight className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{rule.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Non-Negotiable Footer */}
      <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between text-[11px] text-slate-400">
        <span>🛡️ Zero Hallucination AI Guarantee: Plan constructed solely from verified deterministic engine facts.</span>
        <button onClick={onOpenProvenance} className="text-cyan-400 hover:underline font-semibold ml-2 flex-shrink-0">
          Verify Provenance
        </button>
      </div>
    </div>
  );
};