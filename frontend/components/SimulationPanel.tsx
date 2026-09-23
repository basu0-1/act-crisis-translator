"use client";

import React, { useState } from "react";
import {
  Sliders,
  AlertOctagon,
  Accessibility,
  Clock,
  WifiOff,
  RotateCcw,
  Radio,
  Check,
  Zap,
  ShieldAlert,
  Flame,
  Globe
} from "lucide-react";
import { MobilityType, Road, RoadStatus, SimulationState } from "../types";

interface SimulationPanelProps {
  state: SimulationState;
  onTriggerEvent: (event: any) => void;
  onReset: () => void;
  isRecalculating: boolean;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({
  state,
  onTriggerEvent,
  onReset,
  isRecalculating
}) => {
  const [activeTab, setActiveTab] = useState<"demo" | "roads" | "mobility">("demo");

  // Check current road status for R3 (Highland Blvd) and R2 (Riverside)
  const roadR3 = state.roads.find((r) => r.id === "R3");
  const roadR2 = state.roads.find((r) => r.id === "R2");
  const isR3Blocked = roadR3?.status === "blocked";
  const isR2Blocked = roadR2?.status === "blocked";

  return (
    <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-xl overflow-hidden shadow-2xl">
      {/* Simulation Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 px-4 py-3 border-b border-indigo-500/40 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-indigo-400 animate-pulse" />
          <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide uppercase">
            ⚡ KILLER DEMO: Live Scenario Control
          </h3>
        </div>
        <button
          onClick={onReset}
          className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-md border border-slate-600 transition"
        >
          <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
          <span>Reset Scenario</span>
        </button>
      </div>

      {/* Live Event Log Bar */}
      <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center space-x-2 text-xs">
        <span className="font-bold text-indigo-400 uppercase tracking-wider flex-shrink-0">
          Last Event:
        </span>
        <span className="text-slate-300 truncate font-mono">
          {state.last_event_description}
        </span>
      </div>

      {/* Main Interactive Controls */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Step 1: Road Blockage Toggle (The WOW Moment) */}
        <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertOctagon className="h-4 w-4 text-red-400" />
              <span className="text-xs sm:text-sm font-bold text-white uppercase">
                1. Roadblock Recalculation Trigger
              </span>
            </div>
            <span className="text-[11px] text-amber-400 font-medium">Core Wow Moment</span>
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
              className={`p-3 rounded-lg border text-left flex items-center justify-between transition ${
                isR3Blocked
                  ? "bg-red-950/80 border-red-500 text-red-200"
                  : "bg-slate-900 border-slate-700 hover:border-red-500/50 text-slate-200"
              }`}
            >
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-xs">Highland Blvd (Route C)</span>
                  {isR3Blocked && <span className="text-[10px] bg-red-800 px-1.5 rounded">BLOCKED</span>}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isR3Blocked ? "Click to Reopen" : "Click to Block Route C → Switch to Shelter C"}
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-slate-800 font-mono font-bold text-amber-400">
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
              className={`p-3 rounded-lg border text-left flex items-center justify-between transition ${
                isR2Blocked
                  ? "bg-red-950/80 border-red-500 text-red-200"
                  : "bg-slate-900 border-slate-700 hover:border-red-500/50 text-slate-200"
              }`}
            >
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-xs">Riverside Road (R2)</span>
                  {isR2Blocked && <span className="text-[10px] bg-red-800 px-1.5 rounded">BLOCKED</span>}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isR2Blocked ? "Click to Reopen" : "Click to simulate total debris blockage"}
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-slate-800 font-mono font-bold text-amber-400">
                {isR2Blocked ? "OPEN" : "BLOCK"}
              </span>
            </button>
          </div>
        </div>

        {/* Step 2: Mobility Constraint Switcher */}
        <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Accessibility className="h-4 w-4 text-cyan-400" />
              <span className="text-xs sm:text-sm font-bold text-white uppercase">
                2. User Mobility Constraint
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Current: {state.user.mobility.toUpperCase()}
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
                  className={`py-2 px-3 rounded-lg border text-center text-xs font-bold capitalize transition ${
                    isSelected
                      ? "bg-cyan-950 border-cyan-500 text-cyan-200 shadow-md"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  {m === "normal" && "🚶 Normal"}
                  {m === "limited" && "🦼 Limited Walking"}
                  {m === "wheelchair" && "♿ Wheelchair"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Time Pressure & Connectivity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Time Pressure Trigger */}
          <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase">Time to Impact</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  onTriggerEvent({
                    event_type: "time_reduced",
                    time_to_impact_minutes: 32,
                  })
                }
                className={`flex-1 py-1.5 text-xs rounded border transition ${
                  state.alert.time_to_impact_minutes === 32
                    ? "bg-amber-950 border-amber-500 text-amber-300 font-bold"
                    : "bg-slate-900 border-slate-700 text-slate-400"
                }`}
              >
                32 Mins (Normal)
              </button>
              <button
                onClick={() =>
                  onTriggerEvent({
                    event_type: "time_reduced",
                    time_to_impact_minutes: 10,
                  })
                }
                className={`flex-1 py-1.5 text-xs rounded border transition ${
                  state.alert.time_to_impact_minutes === 10
                    ? "bg-red-950 border-red-500 text-red-300 font-bold"
                    : "bg-slate-900 border-slate-700 text-slate-400"
                }`}
              >
                10 Mins (Urgent Surge)
              </button>
            </div>
          </div>

          {/* Offline Mode Simulator */}
          <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center space-x-2">
              <WifiOff className="h-4 w-4 text-rose-400" />
              <span className="text-xs font-bold text-white uppercase">Connectivity Mode</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  onTriggerEvent({
                    event_type: "offline_toggled",
                    is_offline: false,
                  })
                }
                className={`flex-1 py-1.5 text-xs rounded border transition ${
                  !state.is_offline
                    ? "bg-emerald-950 border-emerald-500 text-emerald-300 font-bold"
                    : "bg-slate-900 border-slate-700 text-slate-400"
                }`}
              >
                Online
              </button>
              <button
                onClick={() =>
                  onTriggerEvent({
                    event_type: "offline_toggled",
                    is_offline: true,
                  })
                }
                className={`flex-1 py-1.5 text-xs rounded border transition ${
                  state.is_offline
                    ? "bg-amber-950 border-amber-500 text-amber-300 font-bold"
                    : "bg-slate-900 border-slate-700 text-slate-400"
                }`}
              >
                Simulate Offline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};