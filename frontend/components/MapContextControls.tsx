"use client";

import React, { useEffect, useState } from "react";
import { Check, LocateFixed, MapPin, RefreshCw } from "lucide-react";
import { HazardType, LanguageType, SimulationState } from "../types";
import { getTranslation } from "../lib/translations";

interface MapContextControlsProps {
  state: SimulationState;
  language?: LanguageType;
  isBusy: boolean;
  onApply: (latitude: number, longitude: number, hazardType: HazardType) => Promise<void>;
}

interface PlaceOption {
  state: string;
  city: string;
  latitude: number;
  longitude: number;
  source: "backend" | "current";
}

const SEEDED_LOCATION: PlaceOption = {
  state: "Delhi",
  city: "New Delhi",
  latitude: 28.6139,
  longitude: 77.209,
  source: "backend",
};

const REAL_INDIA_PLACES: PlaceOption[] = [
  ["Delhi", "Dwarka", 28.5921, 77.046],
  ["Andhra Pradesh", "Visakhapatnam", 17.6868, 83.2185], ["Andhra Pradesh", "Vijayawada", 16.5062, 80.648],
  ["Arunachal Pradesh", "Itanagar", 27.0844, 93.6053], ["Arunachal Pradesh", "Tawang", 27.5861, 91.8594],
  ["Assam", "Guwahati", 26.1445, 91.7362], ["Assam", "Dibrugarh", 27.4728, 94.912],
  ["Bihar", "Patna", 25.5941, 85.1376], ["Bihar", "Gaya", 24.7914, 85.0002],
  ["Chhattisgarh", "Raipur", 21.2514, 81.6296], ["Chhattisgarh", "Bilaspur", 22.0797, 82.1409],
  ["Goa", "Panaji", 15.4909, 73.8278], ["Goa", "Margao", 15.2832, 73.9862],
  ["Gujarat", "Ahmedabad", 23.0225, 72.5714], ["Gujarat", "Surat", 21.1702, 72.8311],
  ["Haryana", "Gurugram", 28.4595, 77.0266], ["Haryana", "Panipat", 29.3909, 76.9635],
  ["Himachal Pradesh", "Shimla", 31.1048, 77.1734], ["Himachal Pradesh", "Dharamshala", 32.219, 76.3234],
  ["Jharkhand", "Jamshedpur", 22.8046, 86.2029], ["Jharkhand", "Ranchi", 23.3441, 85.3096],
  ["Karnataka", "Bengaluru", 12.9716, 77.5946], ["Karnataka", "Mysuru", 12.2958, 76.6394],
  ["Kerala", "Thiruvananthapuram", 8.5241, 76.9366], ["Kerala", "Kochi", 9.9312, 76.2673],
  ["Madhya Pradesh", "Bhopal", 23.2599, 77.4126], ["Madhya Pradesh", "Indore", 22.7196, 75.8577],
  ["Maharashtra", "Mumbai", 19.076, 72.8777], ["Maharashtra", "Pune", 18.5204, 73.8567],
  ["Manipur", "Imphal", 24.817, 93.9368], ["Manipur", "Thoubal", 24.638, 94.0106],
  ["Meghalaya", "Shillong", 25.5788, 91.8933], ["Meghalaya", "Tura", 25.5144, 90.2033],
  ["Mizoram", "Aizawl", 23.7271, 92.7176], ["Mizoram", "Lunglei", 22.8873, 92.736],
  ["Nagaland", "Kohima", 25.6751, 94.1086], ["Nagaland", "Dimapur", 25.8629, 93.7531],
  ["Odisha", "Bhubaneswar", 20.2961, 85.8245], ["Odisha", "Cuttack", 20.4625, 85.883],
  ["Punjab", "Amritsar", 31.634, 74.8723], ["Punjab", "Ludhiana", 30.901, 75.8573],
  ["Rajasthan", "Jaipur", 26.9124, 75.7873], ["Rajasthan", "Jodhpur", 26.2389, 73.0243],
  ["Sikkim", "Gangtok", 27.3389, 88.6065], ["Sikkim", "Namchi", 27.1667, 88.35],
  ["Tamil Nadu", "Chennai", 13.0827, 80.2707], ["Tamil Nadu", "Coimbatore", 11.0168, 76.9558],
  ["Telangana", "Hyderabad", 17.385, 78.4867], ["Telangana", "Warangal", 17.9689, 79.5941],
  ["Tripura", "Agartala", 23.8315, 91.2868], ["Tripura", "Udaipur", 23.5333, 91.4833],
  ["Uttar Pradesh", "Lucknow", 26.8467, 80.9462], ["Uttar Pradesh", "Varanasi", 25.3176, 82.9739],
  ["Uttarakhand", "Dehradun", 30.3165, 78.0322], ["Uttarakhand", "Haridwar", 29.9457, 78.1642],
  ["West Bengal", "Kolkata", 22.5726, 88.3639], ["West Bengal", "Siliguri", 26.7271, 88.3953],
].map(([state, city, latitude, longitude]) => ({
  state: state as string,
  city: city as string,
  latitude: latitude as number,
  longitude: longitude as number,
  source: "current" as const,
}));

const PLACE_OPTIONS = [SEEDED_LOCATION, ...REAL_INDIA_PLACES];

export const MapContextControls: React.FC<MapContextControlsProps> = ({
  state,
  language = "en",
  isBusy,
  onApply,
}) => {
  const t = getTranslation(language);
  const [places, setPlaces] = useState<PlaceOption[]>(PLACE_OPTIONS);
  const [selectedPlace, setSelectedPlace] = useState(SEEDED_LOCATION);
  const [selectedHazard, setSelectedHazard] = useState<HazardType>(state.alert.hazard_type);
  const [message, setMessage] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    setSelectedHazard(state.alert.hazard_type);
  }, [state.alert.hazard_type]);

  useEffect(() => {
    const { lat, lng } = state.user;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const currentPlace: PlaceOption = {
      state: "Current location",
      city: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      latitude: lat,
      longitude: lng,
      source: "current",
    };
    setPlaces((current) => [
      ...PLACE_OPTIONS,
      currentPlace,
    ]);
    setSelectedPlace(currentPlace);

    const controller = new AbortController();
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10`, {
      headers: { "Accept-Language": language },
      signal: controller.signal,
    })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        const address = data?.address;
        const stateName = address?.state || address?.region;
        const cityName = address?.city || address?.town || address?.municipality || address?.village;
        if (!stateName || !cityName) return;
        const reverseGeocodedPlace: PlaceOption = {
          state: stateName,
          city: cityName,
          latitude: lat,
          longitude: lng,
          source: "current",
        };
        setPlaces((current) => [
          ...PLACE_OPTIONS.filter((place) => place.city !== reverseGeocodedPlace.city || place.state !== reverseGeocodedPlace.state),
          reverseGeocodedPlace,
        ]);
        setSelectedPlace(reverseGeocodedPlace);
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, [state.user.lat, state.user.lng, language]);

  const situations = [
    ["flood", t.floodSituation],
    ["wildfire", t.wildfireSituation],
    ["cyclone", t.cycloneSituation],
    ["earthquake", t.earthquakeSituation],
    ["extreme_heat", t.extremeHeatSituation],
    ["urban_emergency", t.urbanEmergencySituation],
  ] as const;

  const applyContext = async () => {
    setMessage(null);
    await onApply(selectedPlace.latitude, selectedPlace.longitude, selectedHazard);
    setMessage(t.locationUpdated);
  };

  const useLiveLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setMessage(t.locationUnavailable);
      return;
    }

    setIsLocating(true);
    setMessage(t.findingLocation);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const livePlace: PlaceOption = {
          state: "Live location",
          city: "Current position",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          source: "current",
        };
        setPlaces((current) => [
          ...current.filter((place) => place.state !== "Live location"),
          livePlace,
        ]);
        setSelectedPlace(livePlace);
        try {
          await onApply(livePlace.latitude, livePlace.longitude, selectedHazard);
          const accuracy = Number.isFinite(position.coords.accuracy)
            ? ` (${Math.round(position.coords.accuracy)}m accuracy)`
            : "";
          setMessage(`${t.locationUpdated}${accuracy}`);
        } catch {
          setMessage(t.locationUnavailable);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? t.locationPermissionDenied
          : t.locationUnavailable;
        setMessage(message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const stateOptions = Array.from(new Set(places.map((place) => place.state)));
  const cityOptions = places.filter((place) => place.state === selectedPlace.state);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Map context</p>
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Choose what the map shows</h3>
        </div>
        <MapPin className="h-5 w-5 text-emerald-500 shrink-0" aria-hidden="true" />
      </div>

      <button
        type="button"
        onClick={useLiveLocation}
        disabled={isBusy || isLocating}
        className="mb-3 min-h-10 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 px-3 text-xs font-black flex items-center gap-2 disabled:opacity-50"
      >
        {isLocating ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LocateFixed className="h-4 w-4" aria-hidden="true" />}
        {isLocating ? t.findingLocation : t.useMyLocation}
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          State
          <select
            value={selectedPlace.state}
            onChange={(event) => {
              const next = places.find((place) => place.state === event.target.value) || selectedPlace;
              setSelectedPlace(next);
            }}
            className="mt-1.5 w-full min-h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 text-sm font-normal text-slate-900 dark:text-white"
          >
            {stateOptions.map((stateName) => <option key={stateName} value={stateName}>{stateName}</option>)}
          </select>
        </label>

        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          City
          <select
            value={selectedPlace.city}
            onChange={(event) => {
              const next = cityOptions.find((place) => place.city === event.target.value);
              if (next) setSelectedPlace(next);
            }}
            className="mt-1.5 w-full min-h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 text-sm font-normal text-slate-900 dark:text-white"
          >
            {cityOptions.map((place) => <option key={`${place.state}-${place.city}`} value={place.city}>{place.city}</option>)}
          </select>
        </label>

        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {t.whatsHappening}
          <select
            value={selectedHazard}
            onChange={(event) => setSelectedHazard(event.target.value as HazardType)}
            className="mt-1.5 w-full min-h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 text-sm font-normal text-slate-900 dark:text-white"
          >
            {situations.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{selectedPlace.city}, {selectedPlace.state} · {selectedPlace.latitude.toFixed(4)}, {selectedPlace.longitude.toFixed(4)}</p>
        <button
          type="button"
          onClick={applyContext}
          disabled={isBusy}
          className="min-h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 text-xs font-black flex items-center gap-2"
        >
          {isBusy ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
          {isBusy ? t.checkingSafety : "Update map"}
        </button>
      </div>
      {message && <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-300" role="status">{message}</p>}
    </div>
  );
};
