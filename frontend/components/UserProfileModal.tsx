"use client";

import React, { useState } from "react";
import {
  User,
  X,
  MapPin,
  Trash2,
} from "lucide-react";
import { UserProfile, MobilityType, TransportType, CompanionType, LanguageType } from "../types";
import { useAuth } from "../context/AuthContext";
import { getTranslation } from "../lib/translations";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  language?: LanguageType;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  language = "en",
}) => {
  const { user: authUser, logout, updateUserContext } = useAuth();
  const t = getTranslation(language);
  const [name, setName] = useState(authUser?.name || user.name);
  const [mobility, setMobility] = useState<MobilityType>(authUser?.mobility || user.mobility);
  const [transport, setTransport] = useState<TransportType>(authUser?.transport || user.transport);
  const [companions, setCompanions] = useState<CompanionType>(user.companions);
  const [lat, setLat] = useState<number>(user.lat);
  const [lng, setLng] = useState<number>(user.lng);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [geoConsent, setGeoConsent] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [highPriorityAlerts, setHighPriorityAlerts] = useState(true);

  if (!isOpen) return null;

  const handleRequestBrowserLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser.");
      return;
    }
    setLocationStatus("Acquiring GPS coordinates...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocationStatus(`Location locked: (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        setGeoConsent(true);
      },
      (err) => {
        setLocationStatus("Location unavailable. Using manual coordinates.");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleApply = () => {
    const updated: UserProfile = {
      ...user,
      name,
      mobility,
      transport,
      companions,
      lat,
      lng,
    };
    onUpdateUser(updated);
    updateUserContext({ name, mobility, transport, companions, lat, lng });
    onClose();
  };

  const handleResetData = () => {
    if (confirm("Reset local emergency profile to default parameters?")) {
      logout();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-950 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <User className="h-5 w-5 text-red-600 dark:text-amber-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t.editProfile}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* User Name */}
          <div>
            <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
              {t.nameLabel}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Mobility Level */}
          <div>
            <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-2">
              {t.mobilityLabel}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["normal", "limited", "wheelchair"] as MobilityType[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMobility(m)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold capitalize transition ${
                    mobility === m
                      ? "bg-red-50 dark:bg-red-950/60 border-red-500 text-red-700 dark:text-red-300 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {m === "normal" && `🚶 ${t.normalMobility}`}
                  {m === "limited" && `🦼 ${t.limitedMobility}`}
                  {m === "wheelchair" && `♿ ${t.wheelchairMobility}`}
                </button>
              ))}
            </div>
          </div>

          {/* Transport Mode */}
          <div>
            <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-2">
              {t.evacuationMap} — Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["walking", "bicycle", "car"] as TransportType[]).map((tr) => (
                <button
                  key={tr}
                  onClick={() => setTransport(tr)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold capitalize transition ${
                    transport === tr
                      ? "bg-cyan-50 dark:bg-cyan-950 border-cyan-500 text-cyan-800 dark:text-cyan-300"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tr === "walking" ? t.walking : tr === "bicycle" ? t.bicycle : t.vehicle}
                </button>
              ))}
            </div>
          </div>

          {/* Coordinates */}
          <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-white uppercase text-[11px] flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-emerald-500" /> GPS Coordinates
              </span>
              <button
                onClick={handleRequestBrowserLocation}
                className="text-[11px] bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-lg font-semibold hover:bg-emerald-200 transition"
              >
                📡 Acquire GPS Location
              </button>
            </div>
            {locationStatus && (
              <p className="text-[11px] text-amber-600 dark:text-amber-300 font-mono">{locationStatus}</p>
            )}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 dark:text-slate-300">
              <div>
                <label className="text-slate-500">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-slate-500">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handleResetData}
            className="flex items-center space-x-1 text-slate-500 hover:text-red-500 text-xs transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleApply}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs transition shadow-md shadow-red-600/20"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};