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
import { Road, Shelter, UserProfile, RouteRecommendation, Alert } from "../types";

interface EmergencyMapProps {
  user: UserProfile;
  alert: Alert;
  roads: Road[];
  shelters: Shelter[];
  routeRec: RouteRecommendation;
  isRecalculating?: boolean;
}

export const EmergencyMap: React.FC<EmergencyMapProps> = ({
  user,
  alert,
  roads,
  shelters,
  routeRec,
  isRecalculating = false,
}) => {
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [showFloodZone, setShowFloodZone] = useState(true);

  // Projected Canvas / SVG Coordinates (simulated normalized city grid)
  // Origin: USER_HOME at (250, 320)
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
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col relative">
      {/* Map Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapIcon className="h-4 w-4 text-cyan-400" />
          <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            Live Tactical Geospatial Map
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
            OSM / GeoJSON Grid
          </span>
        </div>

        {/* Layer Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFloodZone(!showFloodZone)}
            className={`text-xs px-2.5 py-1 rounded border transition flex items-center space-x-1 ${
              showFloodZone
                ? "bg-red-950/80 border-red-500/50 text-red-300"
                : "bg-slate-900 border-slate-700 text-slate-400"
            }`}
          >
            <Layers className="h-3 w-3" />
            <span className="hidden sm:inline">Flood Zone</span>
          </button>
        </div>
      </div>

      {/* Recalculating Overlay */}
      {isRecalculating && (
        <div className="absolute inset-0 bg-slate-950/85 z-30 flex flex-col items-center justify-center space-y-3 backdrop-blur-sm animate-fade-in">
          <div className="h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          <div className="text-center">
            <span className="text-base font-black text-white uppercase tracking-wider block">
              🚨 EVENT DETECTED: RECALCULATING ROUTE...
            </span>
            <span className="text-xs text-emerald-400">
              Evaluating safe corridors & barrier-free elevation paths
            </span>
          </div>
        </div>
      )}

      {/* Interactive Map Visual (High-Fidelity Tactical SVG Map) */}
      <div className="relative w-full h-[380px] sm:h-[430px] bg-slate-950 overflow-hidden select-none">
        {/* Subtle grid background */}
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
            <g className="animate-pulse" style={{ animationDuration: "4s" }}>
              <circle
                cx="150"
                cy="180"
                r="130"
                fill="url(#floodGrad)"
                stroke="#DC2626"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text x="100" y="195" fill="#F87171" fontSize="11" fontWeight="bold" opacity="0.9">
                🔴 FLOOD HAZARD ZONE (5 km)
              </text>
            </g>
          )}

          {/* Road Network Segments */}
          {roads.map((road) => {
            const start = nodePositions[road.start_node] || { x: 260, y: 340 };
            const end = nodePositions[road.end_node] || { x: 360, y: 130 };

            let strokeColor = "#10B981"; // Safe Green
            let strokeWidth = 3;
            let strokeDash = "none";
            let isCurrentRecommended = false;

            if (road.status === "blocked") {
              strokeColor = "#DC2626";
              strokeDash = "6 6";
              strokeWidth = 4;
            } else if (road.status === "flooded") {
              strokeColor = "#EF4444";
              strokeWidth = 4;
              strokeDash = "4 4";
            } else if (road.status === "congested") {
              strokeColor = "#F59E0B";
              strokeWidth = 3;
            } else if (road.has_stairs) {
              strokeColor = "#F97316";
              strokeDash = "3 3";
            }

            if (routeRec.recommended_route) {
              if (
                (road.id === "R3" && isRouteCActive) ||
                (road.id === "R6" && isRouteDActive)
              ) {
                isCurrentRecommended = true;
                strokeColor = "#10B981";
                strokeWidth = 6;
              }
            }

            return (
              <g
                key={road.id}
                className="cursor-pointer group"
                onClick={() => setSelectedEntity({ type: "road", data: road })}
              >
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                  filter={isCurrentRecommended ? "url(#glow)" : undefined}
                />
                {/* Road label */}
                <text
                  x={(start.x + end.x) / 2 + 5}
                  y={(start.y + end.y) / 2 - 5}
                  fill={isCurrentRecommended ? "#34D399" : "#94A3B8"}
                  fontSize="9"
                  fontWeight={isCurrentRecommended ? "bold" : "normal"}
                  className="bg-slate-900"
                >
                  {road.name.split("(")[0]}
                </text>
              </g>
            );
          })}

          {/* Shelters & Facility Markers */}
          {shelters.map((shelter) => {
            const pos = nodePositions[shelter.id] || { x: 300, y: 150 };
            const isDestination = shelter.id === activeDestinationId;

            return (
              <g
                key={shelter.id}
                className="cursor-pointer"
                onClick={() => setSelectedEntity({ type: "shelter", data: shelter })}
              >
                {isDestination && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="22"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    className="animate-ping"
                  />
                )}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="14"
                  fill={isDestination ? "#065F46" : "#1E293B"}
                  stroke={isDestination ? "#10B981" : "#64748B"}
                  strokeWidth="2"
                />
                <text
                  x={pos.x - 6}
                  y={pos.y + 4}
                  fill={isDestination ? "#34D399" : "#E2E8F0"}
                  fontSize="10"
                  fontWeight="bold"
                >
                  {shelter.type === "hospital" ? "🏥" : "🏫"}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 24}
                  textAnchor="middle"
                  fill={isDestination ? "#34D399" : "#CBD5E1"}
                  fontSize="9"
                  fontWeight={isDestination ? "bold" : "normal"}
                >
                  {shelter.name.split("(")[0].trim()}
                </text>
              </g>
            );
          })}

          {/* User Location Marker (Home) */}
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
        <div className="absolute bottom-2 left-2 bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg text-[10px] space-y-1 text-slate-300 backdrop-blur-md">
          <span className="font-bold text-slate-200 block uppercase">Map Legend</span>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-4 bg-emerald-500 rounded" />
            <span>Verified Safe Route</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-4 bg-red-500 rounded" />
            <span>Flooded / Blocked</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-4 bg-orange-500 rounded" />
            <span>Inaccessible / Stairs</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🏫 Shelters</span>
            <span>🏥 Hospitals</span>
          </div>
        </div>

        {/* Selected Entity Inspector Tooltip */}
        {selectedEntity && (
          <div className="absolute top-2 right-2 bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-2xl text-xs max-w-xs text-slate-200 z-20">
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
                <p>Wheelchair Accessible: {selectedEntity.data.accessible_wheelchair ? "✓ Yes" : "❌ No"}</p>
                <p>Has Stairs: {selectedEntity.data.has_stairs ? "⚠️ Yes (Stair barrier)" : "✓ No"}</p>
                <p>Transit Time: {selectedEntity.data.travel_time_minutes} mins</p>
              </div>
            )}
            {selectedEntity.type === "shelter" && (
              <div className="space-y-1 text-[11px]">
                <p className="font-bold text-white">{selectedEntity.data.name}</p>
                <p>Status: <span className="uppercase font-semibold text-emerald-400">{selectedEntity.data.status}</span></p>
                <p>Capacity: {selectedEntity.data.current_occupancy} / {selectedEntity.data.capacity}</p>
                <p>Accessible: {selectedEntity.data.is_accessible ? "✓ Fully Accessible" : "Standard"}</p>
                <p className="text-slate-400">{selectedEntity.data.address}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};