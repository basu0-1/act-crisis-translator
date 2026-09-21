'use client';

import React, { useState } from 'react';
import { Route, MobilityTier } from '@/types';
import { useI18n } from '@/hooks/useI18n';
import {
  Navigation, MapPin, AlertTriangle, ShieldCheck,
  RefreshCw, Clock, ArrowRight, Eye, Layers, Compass
} from 'lucide-react';

interface Props {
  route: Route;
  onRecalculate?: () => Promise<void>;
  isLoading?: boolean;
}

export default function SafeRouteMap({ route, onRecalculate, isLoading }: Props) {
  const { t } = useI18n();
  const [mapMode, setMapMode] = useState<'topological' | 'interactive'>('topological');

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.sectionSafeRoute}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">|</span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Where should I go?
          </span>
        </div>

        {/* Route Status Badge */}
        <div className="flex items-center space-x-2">
          {route.is_blocked ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200 border border-red-300 dark:border-red-700 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              {t.blockedNotice}
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              SAFE CORRIDOR ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* Recalculation Alert Banner if blocked */}
      {route.is_blocked && (
        <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-800 dark:text-red-300 flex items-start space-x-2.5">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="font-black block">{t.recalculatedAlert}</strong>
            <p>{route.blocked_reason || 'Riverside corridor impassable. Diverted to elevated high ground.'}</p>
          </div>
        </div>
      )}

      {/* Map Display Container */}
      <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center">
        {/* SVG Topological Map Representation with actual geo coordinates & hazards */}
        <svg
          viewBox="0 0 600 360"
          className="w-full h-full object-cover select-none"
          aria-label="Evacuation Route Topological Map"
        >
          {/* Background Grid */}
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" className="text-slate-200/40 dark:text-slate-800/40" strokeWidth="0.8" />
            </pattern>
            {/* Flood Hazard Hatch Pattern */}
            <pattern id="hazardHatch" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="12" stroke="#ef4444" strokeWidth="2.5" strokeOpacity="0.45" />
            </pattern>
          </defs>
          <rect width="600" height="360" fill="url(#grid)" />

          {/* River Basin Polygon */}
          <path
            d="M 50 140 Q 200 170 320 180 T 580 195 L 590 260 Q 320 240 180 220 Z"
            fill="#38bdf8"
            fillOpacity="0.15"
            stroke="#0284c7"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text x="70" y="160" fill="#0284c7" fontSize="10" fontWeight="bold" opacity="0.8">
            Riverside Waterway (Hazard Catchment)
          </text>

          {/* Active Flood Hazard Zone Polygon */}
          <polygon
            points="140,150 260,165 440,175 420,240 240,230 130,200"
            fill="url(#hazardHatch)"
            stroke="#ef4444"
            strokeWidth="2"
          />
          <text x="210" y="205" fill="#dc2626" fontSize="11" fontWeight="extrabold">
            INUNDATION SURGE ZONE
          </text>

          {/* Route Paths */}
          {route.is_blocked ? (
            <>
              {/* Blocked Riverside Route (Red dashed) */}
              <path
                d="M 80 290 L 180 240 L 290 200 L 400 170 L 510 130"
                fill="none"
                stroke="#ef4444"
                strokeWidth="4"
                strokeDasharray="6 6"
                strokeOpacity="0.7"
              />

              {/* Road Block Indicator Marker */}
              <circle cx="290" cy="200" r="14" fill="#ef4444" fillOpacity="0.3" className="animate-ping" />
              <circle cx="290" cy="200" r="10" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
              <text x="290" y="204" fill="#ffffff" fontSize="9" fontWeight="black" textAnchor="middle">✕</text>
              <text x="290" y="225" fill="#dc2626" fontSize="10" fontWeight="bold" textAnchor="middle">
                Riverside Rd: BLOCKED
              </text>

              {/* Active Recalculated High Ground Route (Bold Blue / Emerald) */}
              <path
                d="M 80 290 L 60 210 L 90 120 L 220 70 L 380 60 L 510 90"
                fill="none"
                stroke="#2563eb"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text x="220" y="50" fill="#2563eb" fontSize="11" fontWeight="bold">
                ▲ High-Ground Ridge Ave Bypass (+25m Elevation)
              </text>
            </>
          ) : (
            <>
              {/* Primary Direct Route (Blue) */}
              <path
                d="M 80 290 L 180 240 L 290 200 L 400 170 L 510 130"
                fill="none"
                stroke="#2563eb"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Potential high ground alternative (light gray dashed) */}
              <path
                d="M 80 290 L 60 210 L 90 120 L 220 70 L 380 60 L 510 90"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />
              <text x="220" y="50" fill="#94a3b8" fontSize="10">
                Contingency High-Ground Route
              </text>
            </>
          )}

          {/* User Origin Marker */}
          <circle cx="80" cy="290" r="8" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <circle cx="80" cy="290" r="16" fill="#10b981" fillOpacity="0.2" />
          <text x="80" y="320" fill="#047857" fontSize="11" fontWeight="bold" textAnchor="middle">
            YOU ARE HERE
          </text>

          {/* Destination Shelter Marker */}
          <circle cx="510" cy={route.is_blocked ? 90 : 130} r="10" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
          <text x="510" y={route.is_blocked ? 75 : 115} fill="#1d4ed8" fontSize="11" fontWeight="extrabold" textAnchor="middle">
            {route.is_blocked ? 'Highland Haven' : 'Civic Center'}
          </text>
        </svg>

        {/* Floating Map Legend Overlay */}
        <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-[11px] space-y-1.5 shadow-md">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Your Location</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-1 bg-blue-600 rounded-full" />
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Recommended Route</span>
          </div>
          {route.is_blocked && (
            <div className="flex items-center space-x-1.5">
              <span className="w-4 h-1 border-t-2 border-dashed border-red-500" />
              <span className="text-red-600 dark:text-red-400 font-bold">Blocked Corridor</span>
            </div>
          )}
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-red-500/40 border border-red-500" />
            <span className="text-slate-700 dark:text-slate-300">Hazard Surge Zone</span>
          </div>
        </div>
      </div>

      {/* Route Metrics & Recalculate CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center space-x-4">
          <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center space-x-2">
            <Compass className="w-4 h-4 text-brand-600" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">{t.distance}</div>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                {(route.distance_meters / 1000).toFixed(1)} km
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-brand-600" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">{t.estimatedTime}</div>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                ~{route.estimated_time_minutes} mins
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Mobility Tier:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {route.mobility_tier.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Dynamic Recalculation Trigger Button */}
        {onRecalculate && (
          <button
            onClick={onRecalculate}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-sm transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? t.recalculating : route.is_blocked ? 'Recalculate Route Again' : t.recalculatePrompt}</span>
          </button>
        )}
      </div>
    </section>
  );
}
