"use client";

import React from "react";
import {
  AlertOctagon,
  Accessibility,
  Clock,
  WifiOff,
  RotateCcw,
  Zap,
} from "lucide-react";
import { LanguageType, MobilityType, SimulationState } from "../types";
import { getTranslation } from "../lib/translations";

interface SimulationPanelProps {
  state: SimulationState;
  onTriggerEvent: (event: any) => void;
  onReset: () => void;
  isRecalculating: boolean;
  language?: LanguageType;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({
  state,
  onTriggerEvent,
  onReset,
  isRecalculating,
  language = "en",
}) => {
  const t = getTranslation(language);

  // Check current road status for R3 (Highland Blvd) and R2 (Riverside)
  const roadR3 = state.roads.find((r) => r.id === "R3");
  const roadR2 = state.roads.find((r) => r.id === "R2");
  const isR3Blocked = roadR3?.status === "blocked";
  const isR2Blocked = roadR2?.status === "blocked";

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500/50 rounded-2xl overflow-hidden shadow-xl transition-colors">
      {/* Simulation Header */}
      <div className="bg-gradient-to-r from-indigo-50 dark:from-indigo-950 via-white dark:via-slate-900 to-indigo-50 dark:to-indigo-950 px-4 py-3 border-b border-indigo-200 dark:border-indigo-500/40 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          <h3 className="font-extrabold text-xs sm:text-sm text-indigo-950 dark:text-white tracking-wide uppercase">
            ⚡ {t.interactiveControls}
          </h3>
        </div>
        <button
          onClick={onReset}
          className="flex items-center space-x-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 transition"
        >
          <RotateCcw className="h-3.5 w-3.5 text-amber-500" />
          <span>{t.resetSimulation}</span>
        </button>
      </div>

      {/* Live Event Log Bar */}
      <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2 text-xs">
        <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex-shrink-0">
          Last Event:
        </span>
        <span className="text-slate-700 dark:text-slate-300 truncate font-mono text-[11px]">
          {state.last_event_description}
        </span>
      </div>

      {/* Main Interactive Controls */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Step 1: Road Blockage Toggle */}
        <div className="bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertOctagon className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase">
                1. {t.triggerRoadblock}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Block / Clear Highland Blvd (R3) */}
            <button
              onClick={() =>
                onTriggerEvent({
                  event_type: isR3Blocked ? "road_cleared" : "road_blocked",
                  road_id: "R3",
                })
              }
              disabled={isRecalculating}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                isR3Blocked
                  ? "bg-red-50 dark:bg-red-950/80 border-red-500 text-red-800 dark:text-red-200"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-red-500/50 text-slate-800 dark:text-slate-200"
              }`}
            >
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-xs">Highland Blvd (Route C)</span>
                  {isR3Blocked && <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded">BLOCKED</span>}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {isR3Blocked ? "Click to Reopen" : "Click to Block Route C → Switch Haven"}
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono font-bold text-amber-600 dark:text-amber-400">
                {isR3Blocked ? "OPEN" : "BLOCK"}
              </span>
            </button>

            {/* Block / Clear Riverside Road (R2) */}
            <button
              onClick={() =>
                onTriggerEvent({
                  event_type: isR2Blocked ? "road_cleared" : "road_blocked",
                  road_id: "R2",
                })
              }
              disabled={isRecalculating}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                isR2Blocked
                  ? "bg-red-50 dark:bg-red-950/80 border-red-500 text-red-800 dark:text-red-200"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-red-500/50 text-slate-800 dark:text-slate-200"
              }`}
            >
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-xs">Riverside Road (R2)</span>
                  {isR2Blocked && <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded">BLOCKED</span>}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {isR2Blocked ? "Click to Reopen" : "Click to simulate debris blockage"}
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono font-bold text-amber-600 dark:text-amber-400">
                {isR2Blocked ? "OPEN" : "BLOCK"}
              </span>
            </button>
          </div>
        </div>

        {/* Step 2: Mobility Constraint Switcher */}
        <div className="bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Accessibility className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase">
                2. {t.quickMobilityAdjustment}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {state.user.mobility.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(["normal", "limited", "wheelchair"] as MobilityType[]).map((m) => {
              const isSelected = state.user.mobility === m;
              return (
                <button
                  key={m}
                  onClick={() =>
                    onTriggerEvent({
                      event_type: "mobility_changed",
                      mobility: m,
                    })
                  }
                  disabled={isRecalculating}
                  className={`py-2 px-3 rounded-xl border text-center text-xs font-bold capitalize transition ${
                    isSelected
                      ? "bg-cyan-100 dark:bg-cyan-950 border-cyan-500 text-cyan-800 dark:text-cyan-200 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {m === "normal" && `🚶 ${t.normalMobility}`}
                  {m === "limited" && `🦼 ${t.limitedMobility}`}
                  {m === "wheelchair" && `♿ ${t.wheelchairMobility}`}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};