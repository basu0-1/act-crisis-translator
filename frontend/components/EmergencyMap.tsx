"use client";

import React, { useState } from "react";
import {
  Map as MapIcon,
  Navigation,
  Shield,
  Building2,
  Home,
  AlertTriangle,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info
} from "lucide-react";
import { Road, Shelter, UserProfile, RouteRecommendation, Alert, LanguageType } from "../types";
import { getTranslation } from "../lib/translations";

interface EmergencyMapProps {
  user: UserProfile;
  alert: Alert;
  roads: Road[];
  shelters: Shelter[];
  routeRec: RouteRecommendation;
  isRecalculating?: boolean;
  language?: LanguageType;
}

export const EmergencyMap: React.FC<EmergencyMapProps> = ({
  user,
  alert,
  roads,
  shelters,
  routeRec,
  isRecalculating = false,
  language = "en",
}) => {
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [showFloodZone, setShowFloodZone] = useState(true);
  const t = getTranslation(language);

  // Projected Canvas / SVG Coordinates (simulated normalized city grid)
  const nodePositions: Record<string, { x: number; y: number; label: string }> = {
    USER_HOME: { x: 260, y: 340, label: "You (Home)" },
    JUNCTION_NORTH: { x: 210, y: 220, label: "North Junction" },
    JUNCTION_EAST: { x: 380, y: 300, label: "East Junction" },
    SHELTER_A: { x: 120, y: 140, label: "Shelter A" },
    SHELTER_B: { x: 360, y: 130, label: "Shelter B (Highland)" },
    SHELTER_C: { x: 450, y: 60, label: "Shelter C (Ridge)" },
    HOSPITAL_1: { x: 480, y: 270, label: "City Hospital" },
  };

  const activeDestinationId = routeRec.destination?.id;
  const isRouteCActive = activeDestinationId === "SHELTER_B";
  const isRouteDActive = activeDestinationId === "SHELTER_C";

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col relative transition-colors">
      {/* Map Header */}
      <div className="bg-slate-50 dark:bg-slate-950 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapIcon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {t.tacticalEvacuationMap}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-cyan-300 font-mono">
            GeoJSON Grid
          </span>
        </div>

        {/* Layer Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFloodZone(!showFloodZone)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition flex items-center space-x-1 ${
              showFloodZone
                ? "bg-red-50 dark:bg-red-950/80 border-red-300 dark:border-red-500/50 text-red-700 dark:text-red-300 font-bold"
                : "bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
            }`}
          >
            <Layers className="h-3 w-3" />
            <span className="hidden sm:inline">{t.floodZoneProximity}</span>
          </button>
        </div>
      </div>

      {/* Recalculating Overlay */}
      {isRecalculating && (
        <div className="absolute inset-0 bg-slate-950/85 z-30 flex flex-col items-center justify-center space-y-3 backdrop-blur-sm animate-fade-in">
          <div className="h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          <div className="text-center">
            <span className="text-sm sm:text-base font-black text-white uppercase tracking-wider block">
              🚨 {t.recalculatingRoute}
            </span>
            <span className="text-xs text-emerald-400">
              {t.safeRouteDescription}
            </span>
          </div>
        </div>
      )}

      {/* Interactive Map Visual */}
      <div className="relative w-full h-[380px] sm:h-[430px] bg-slate-950 overflow-hidden select-none">
        <svg className="w-full h-full" viewBox="0 0 600 420">
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1E293B" strokeWidth="0.8" />
            </pattern>
            <linearGradient id="floodGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#DC2626" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#991B1B" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="safeRouteGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid Layer */}
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* River / Waterway Channel */}
          <path
            d="M 50 20 Q 150 180 180 420"
            fill="none"
            stroke="#1E3A8A"
            strokeWidth="28"
            strokeOpacity="0.4"
          />
          <text x="70" y="320" fill="#3B82F6" fontSize="10" opacity="0.6" transform="rotate(65 70 320)">
            Yamuna River Basin
          </text>

          {/* Hazard Flood Zone Overlay */}
          {showFloodZone && (
            <g className="transition-opacity duration-500">
              <ellipse
                cx="150"
                cy="190"
                rx="110"
                ry="90"
                fill="url(#floodGrad)"
                stroke="#EF4444"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              <text x="100" y="195" fill="#FCA5A5" fontSize="10" fontWeight="bold" opacity="0.8">
                ⚠️ Active Flood Inundation Zone
              </text>
            </g>
          )}

          {/* Road Network Connections */}
          {roads.map((road) => {
            const start = nodePositions[road.start_node];
            const end = nodePositions[road.end_node];
            if (!start || !end) return null;

            const isFlooded = road.status === "flooded";
            const isBlocked = road.status === "blocked";
            const isStairs = road.has_stairs;

            let strokeColor = "#475569";
            let strokeWidth = 3;
            let strokeDash = "none";

            if (isFlooded || isBlocked) {
              strokeColor = "#EF4444";
              strokeDash = "6,4";
            } else if (isStairs) {
              strokeColor = "#F97316";
            }

            return (
              <g key={road.id} className="cursor-pointer" onClick={() => setSelectedEntity({ type: "road", data: road })}>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          {/* Highlighted Safe Route */}
          {routeRec.recommended_route && (
            <g filter="url(#glow)">
              {isRouteCActive && (
                <path
                  d="M 260 340 L 380 300 L 360 130"
                  fill="none"
                  stroke="url(#safeRouteGrad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-pulse"
                />
              )}
              {isRouteDActive && (
                <path
                  d="M 260 340 L 380 300 L 450 60"
                  fill="none"
                  stroke="url(#safeRouteGrad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-pulse"
                />
              )}
            </g>
          )}

          {/* Shelters */}
          {shelters.map((shelter) => {
            const pos = nodePositions[shelter.id];
            if (!pos) return null;
            const isAssigned = activeDestinationId === shelter.id;

            return (
              <g
                key={shelter.id}
                className="cursor-pointer group"
                onClick={() => setSelectedEntity({ type: "shelter", data: shelter })}
              >
                {isAssigned && (
                  <circle cx={pos.x} cy={pos.y} r="22" fill="#10B981" fillOpacity="0.2" className="animate-ping" />
                )}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="13"
                  fill={isAssigned ? "#059669" : "#1E293B"}
                  stroke={isAssigned ? "#34D399" : "#475569"}
                  strokeWidth="2.5"
                />
                <text x={pos.x - 6} y={pos.y + 4} fill="#FFFFFF" fontSize="10">
                  🏫
                </text>
                <text
                  x={pos.x}
                  y={pos.y - 17}
                  textAnchor="middle"
                  fill={isAssigned ? "#34D399" : "#94A3B8"}
                  fontSize="10"
                  fontWeight={isAssigned ? "bold" : "normal"}
                >
                  {shelter.name}
                </text>
              </g>
            );
          })}

          {/* User Location Node */}
          <g
            className="cursor-pointer"
            onClick={() => setSelectedEntity({ type: "user", data: user })}
          >
            <circle cx="260" cy="340" r="26" fill="#1E40AF" fillOpacity="0.25" className="animate-ping" />
            <circle cx="260" cy="340" r="16" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="2.5" />
            <text x="254" y="344" fill="#93C5FD" fontSize="11">
              🏠
            </text>
            <text
              x="260"
              y="370"
              textAnchor="middle"
              fill="#60A5FA"
              fontSize="10"
              fontWeight="bold"
            >
              You ({user.mobility})
            </text>
          </g>
        </svg>

        {/* Map Legend */}
        <div className="absolute bottom-2 left-2 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-[10px] space-y-1 text-slate-300 backdrop-blur-md">
          <span className="font-bold text-slate-200 block uppercase">Map Legend</span>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-4 bg-emerald-500 rounded" />
            <span>{t.tacticalEvacuationMap}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-4 bg-red-500 rounded" />
            <span>{t.roadblockDetected}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🏫 {t.assignedHaven}</span>
          </div>
        </div>

        {/* Selected Entity Inspector Tooltip */}
        {selectedEntity && (
          <div className="absolute top-2 right-2 bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs max-w-xs text-slate-200 z-20 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1.5">
              <span className="font-bold uppercase text-cyan-400">
                {selectedEntity.type === "road" ? "Road Telemetry" : "Facility Details"}
              </span>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-slate-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>
            {selectedEntity.type === "road" && (
              <div className="space-y-1 text-[11px]">
                <p className="font-bold text-white">{selectedEntity.data.name}</p>
                <p>Status: <span className="uppercase font-semibold text-amber-400">{selectedEntity.data.status}</span></p>
                <p>Step-free: {selectedEntity.data.accessible_wheelchair ? "✓ Yes" : "❌ No"}</p>
                <p>Transit: {selectedEntity.data.travel_time_minutes} mins</p>
              </div>
            )}
            {selectedEntity.type === "shelter" && (
              <div className="space-y-1 text-[11px]">
                <p className="font-bold text-white">{selectedEntity.data.name}</p>
                <p>Status: <span className="uppercase font-semibold text-emerald-400">{selectedEntity.data.status}</span></p>
                <p>Capacity: {selectedEntity.data.current_occupancy} / {selectedEntity.data.capacity}</p>
                <p>Accessible: {selectedEntity.data.is_accessible ? "✓ Accessible" : "Standard"}</p>
                <p className="text-slate-400">{selectedEntity.data.address}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};