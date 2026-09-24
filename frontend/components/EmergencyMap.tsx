"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Minimize2,
  Info,
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

type SelectedEntity =
  | { type: "road"; data: Road }
  | { type: "shelter"; data: Shelter }
  | { type: "user"; data: UserProfile }
  | null;

const validCoordinate = (lat: number | undefined, lng: number | undefined) =>
  typeof lat === "number" && Number.isFinite(lat) && typeof lng === "number" && Number.isFinite(lng);

export const EmergencyMap: React.FC<EmergencyMapProps> = ({
  user,
  alert,
  roads,
  shelters,
  routeRec,
  isRecalculating = false,
  language = "en",
}) => {
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity>(null);
  const [showFloodZone, setShowFloodZone] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapShellRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const t = getTranslation(language);

  const userCoordinate = useMemo(() => {
    if (validCoordinate(user?.lat, user?.lng)) return { lat: user.lat, lng: user.lng };
    return null;
  }, [user]);

  const routeCoordinates = useMemo(() => {
    const base = routeRec?.recommended_route?.path_coordinates ?? [];
    return base
      .filter((coord): coord is [number, number] => Array.isArray(coord) && coord.length >= 2)
      .map(([lng, lat]) => [lat, lng] as [number, number]);
  }, [routeRec]);

  const routeBounds = useMemo(() => {
    const points: [number, number][] = [...routeCoordinates];
    if (userCoordinate) points.push([userCoordinate.lat, userCoordinate.lng]);
    shelters.forEach((shelter) => {
      if (validCoordinate(shelter.lat, shelter.lng)) points.push([shelter.lat, shelter.lng]);
    });
    if (points.length === 0 && alert?.active && alert.provenance.verified && validCoordinate(alert?.lat, alert?.lng)) {
      points.push([alert.lat, alert.lng]);
    }
    return points;
  }, [routeCoordinates, userCoordinate, shelters, alert]);

  const hasMapData = routeBounds.length > 0;

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInstanceRef.current || !hasMapData) return;

    let cancelled = false;

    const initMap = async () => {
      const leaflet = await import("leaflet");
      const L = leaflet.default;
      leafletRef.current = L;

      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);

      const fitBounds = () => {
        if (routeBounds.length > 1) {
          map.fitBounds(routeBounds, { padding: [36, 36], maxZoom: 14 });
        } else if (routeBounds.length === 1) {
          map.setView(routeBounds[0], 13);
        }
      };

      fitBounds();
    };

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      leafletRef.current = null;
      setMapReady(false);
    };
  }, [routeBounds, hasMapData]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!map || !L || !mapReady) return;

    const layers = L.layerGroup().addTo(map);

    if (showFloodZone && alert.active && alert.provenance.verified && validCoordinate(alert?.lat, alert?.lng)) {
      const hazardRing = L.circle([alert.lat, alert.lng], {
        radius: Math.max((alert.radius_km || 1) * 1000, 500),
        color: "#f87171",
        weight: 1,
        fillColor: "#ef4444",
        fillOpacity: 0.12,
      }).addTo(layers);
      hazardRing.bindPopup(
        `<div><strong>${alert.headline}</strong><br/>${alert.description}<br/><small>Radius: ${alert.radius_km} km</small></div>`
      );
    }

    if (userCoordinate) {
      const userMarker = L.circleMarker([userCoordinate.lat, userCoordinate.lng], {
        radius: 12,
        color: "#60a5fa",
        fillColor: "#1d4ed8",
        fillOpacity: 0.9,
        weight: 2,
      }).addTo(layers);
      userMarker.bindPopup(
        `<div><strong>You</strong><br/>Mobility: ${user.mobility}<br/>Language: ${user.language.toUpperCase()}</div>`
      );
      userMarker.on("click", () => setSelectedEntity({ type: "user", data: user }));
    }

    shelters.forEach((shelter) => {
      if (!validCoordinate(shelter.lat, shelter.lng)) return;
      const assigned = routeRec?.destination?.id === shelter.id;
      const marker = L.circleMarker([shelter.lat, shelter.lng], {
        radius: assigned ? 11 : 9,
        color: assigned ? "#34d399" : "#94a3b8",
        fillColor: assigned ? "#10b981" : "#1f2937",
        fillOpacity: 0.95,
        weight: 2,
      }).addTo(layers);

      marker.bindPopup(
        [
          `<div><strong>${shelter.name}</strong></div>`,
          shelter.status ? `<div>Status: ${shelter.status}</div>` : "",
          shelter.current_occupancy && shelter.capacity ? `<div>Capacity: ${shelter.current_occupancy} / ${shelter.capacity}</div>` : "",
          shelter.is_accessible !== undefined ? `<div>Accessible: ${shelter.is_accessible ? "Yes" : "No"}</div>` : "",
          shelter.address ? `<div>${shelter.address}</div>` : "",
        ].join("")
      );
      marker.on("click", () => setSelectedEntity({ type: "shelter", data: shelter }));
    });

    routeCoordinates.length > 0 &&
      L.polyline(routeCoordinates, {
        color: "#10b981",
        weight: 6,
        opacity: 0.9,
        dashArray: "0",
      }).addTo(layers);

    roads.forEach((road) => {
      const geo = road.coordinates?.map(([lng, lat]) => [lat, lng] as [number, number]) ?? [];
      if (geo.length < 2) return;
      const routeColor = road.status === "blocked" || road.status === "flooded" ? "#ef4444" : road.status === "inaccessible" ? "#f59e0b" : "#64748b";
      const dash = road.status === "blocked" || road.status === "flooded" ? "10, 10" : "0";
      L.polyline(geo, {
        color: routeColor,
        weight: road.status === "blocked" || road.status === "flooded" ? 5 : 3,
        opacity: 0.8,
        dashArray: dash,
      }).addTo(layers);
    });

    if (routeCoordinates.length > 1 && map) {
      const bounds = L.latLngBounds(routeCoordinates);
      if (userCoordinate) bounds.extend([userCoordinate.lat, userCoordinate.lng]);
      map.fitBounds(bounds, { padding: [42, 42], maxZoom: 15 });
    }

    return () => {
      layers.clearLayers();
      layers.remove();
    };
  }, [alert, roads, shelters, routeCoordinates, routeRec?.destination?.id, showFloodZone, userCoordinate, user, mapReady]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === mapShellRef.current);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const zoomMap = (delta: number) => {
    if (typeof window === "undefined") return;
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setZoom(map.getZoom() + delta);
  };

  const recenterMap = () => {
    if (typeof window === "undefined") return;
    const map = mapInstanceRef.current;
    if (!map) return;
    if (userCoordinate) {
      map.flyTo([userCoordinate.lat, userCoordinate.lng], 13, { duration: 1 });
      return;
    }
    if (routeBounds.length > 0) {
      map.flyTo(routeBounds[0], 12, { duration: 1 });
    }
  };

  const fitRoute = () => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!map || !L || routeCoordinates.length === 0) return;
    map.fitBounds(L.latLngBounds(routeCoordinates), { padding: [32, 32], maxZoom: 15 });
  };

  const toggleFullscreen = async () => {
    if (!mapShellRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else if (mapShellRef.current.requestFullscreen) {
      await mapShellRef.current.requestFullscreen();
    }
  };

  const activeDestinationId = routeRec.destination?.id;

  return (
    <div ref={mapShellRef} className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col relative transition-colors ${isFullscreen ? "h-screen w-screen rounded-none" : ""}`}>
      <div className="bg-slate-50 dark:bg-slate-950 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 min-w-0">
          <MapIcon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
            {t.tacticalEvacuationMap}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-cyan-300 font-mono shrink-0">
            Leaflet
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFloodZone(!showFloodZone)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition flex items-center space-x-1 ${
              showFloodZone
                ? "bg-red-50 dark:bg-red-950/80 border-red-300 dark:border-red-500/50 text-red-700 dark:text-red-300 font-bold"
                : "bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
            }`}
            aria-label={t.floodZoneProximity}
          >
            <Layers className="h-3 w-3" />
            <span className="hidden sm:inline">{t.floodZoneProximity}</span>
          </button>
          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit full screen map" : "Open full screen map"}
            className="h-8 w-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:border-emerald-500 transition"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" aria-hidden="true" /> : <Maximize2 className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isRecalculating && (
        <div className="absolute inset-0 bg-slate-950/85 z-30 flex flex-col items-center justify-center space-y-3 backdrop-blur-sm animate-fade-in">
          <div className="h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          <div className="text-center">
            <span className="text-sm sm:text-base font-black text-white uppercase tracking-wider block">
              🚨 {t.recalculatingRoute}
            </span>
            <span className="text-xs text-emerald-400">{t.safeRouteDescription}</span>
          </div>
        </div>
      )}

      <div className={`relative w-full ${isFullscreen ? "h-[calc(100vh-58px)]" : "h-[320px] sm:h-[390px] lg:h-[430px]"} bg-slate-950 overflow-hidden select-none`}>
        <div ref={mapRef} className="h-full w-full" aria-label="Emergency map" />

        {!hasMapData && (
          <div className="absolute inset-0 z-[450] flex items-center justify-center bg-slate-900/95 p-6 text-center">
            <div className="max-w-sm space-y-2">
              <MapIcon className="h-8 w-8 mx-auto text-slate-400" aria-hidden="true" />
              <p className="text-sm font-black text-white">{t.locationUnavailable}</p>
              <p className="text-xs text-slate-300">{t.safeRouteDescription}</p>
            </div>
          </div>
        )}

        <div className="absolute right-2 top-2 z-[500] flex flex-col gap-2">
          <button aria-label={t.zoomIn} onClick={() => zoomMap(1)} className="bg-slate-900/90 text-white border border-slate-700 rounded-lg h-9 w-9 flex items-center justify-center shadow-md hover:bg-slate-800">
            <ZoomIn className="h-4 w-4" aria-hidden="true" />
          </button>
          <button aria-label={t.zoomOut} onClick={() => zoomMap(-1)} className="bg-slate-900/90 text-white border border-slate-700 rounded-lg h-9 w-9 flex items-center justify-center shadow-md hover:bg-slate-800">
            <ZoomOut className="h-4 w-4" aria-hidden="true" />
          </button>
          <button aria-label={t.recenterMap} onClick={recenterMap} className="bg-slate-900/90 text-white border border-slate-700 rounded-lg h-9 w-9 flex items-center justify-center shadow-md hover:bg-slate-800">
            <Navigation className="h-4 w-4" aria-hidden="true" />
          </button>
          <button aria-label={t.fitRoute} onClick={fitRoute} disabled={routeCoordinates.length === 0} className="bg-slate-900/90 text-white border border-slate-700 rounded-lg h-9 w-9 flex items-center justify-center shadow-md hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed">
            <Maximize2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="absolute bottom-2 left-2 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-[10px] space-y-1 text-slate-300 backdrop-blur-md z-[500]">
          <span className="font-bold text-slate-200 block uppercase">Map Legend</span>
          {userCoordinate && <div className="flex items-center space-x-2"><span className="h-2 w-2 bg-blue-500 rounded-full" /><span>{t.youAreHere}</span></div>}
          <div className="flex items-center space-x-2"><span className="h-2 w-4 bg-emerald-500 rounded" /><span>{t.tacticalEvacuationMap}</span></div>
          <div className="flex items-center space-x-2"><span className="h-2 w-4 bg-red-500 rounded" /><span>{t.roadblockDetected}</span></div>
          <div className="flex items-center space-x-2"><span>🏫 {t.assignedHaven}</span></div>
        </div>

        {selectedEntity && (
          <div className="absolute top-2 right-12 bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs max-w-xs text-slate-200 z-[600] backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1.5">
              <span className="font-bold uppercase text-cyan-400">
                {selectedEntity.type === "road" ? "Road Telemetry" : selectedEntity.type === "shelter" ? "Facility Details" : "Location"}
              </span>
              <button onClick={() => setSelectedEntity(null)} className="text-slate-400 hover:text-white text-xs px-1">✕</button>
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
                {selectedEntity.data.capacity && <p>Capacity: {selectedEntity.data.current_occupancy} / {selectedEntity.data.capacity}</p>}
                {selectedEntity.data.is_accessible !== undefined && <p>Accessible: {selectedEntity.data.is_accessible ? "✓ Accessible" : "Standard"}</p>}
                {routeRec.destination?.id === selectedEntity.data.id && routeRec.recommended_route && (
                  <>
                    <p>{t.distance}: {routeRec.recommended_route.total_distance_km} km</p>
                    <p>{t.estimatedTime}: {routeRec.recommended_route.estimated_time_minutes} min</p>
                  </>
                )}
                <p>Verified: {selectedEntity.data.updated_at}</p>
                {selectedEntity.data.address && <p className="text-slate-400">{selectedEntity.data.address}</p>}
              </div>
            )}
            {selectedEntity.type === "user" && (
              <div className="space-y-1 text-[11px]">
                <p className="font-bold text-white">{selectedEntity.data.name}</p>
                <p>Mobility: {selectedEntity.data.mobility}</p>
                <p>Transport: {selectedEntity.data.transport}</p>
                <p>Language: {selectedEntity.data.language.toUpperCase()}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};