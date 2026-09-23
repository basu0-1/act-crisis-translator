"use client";

import React, { useState } from "react";
import {
  User,
  X,
  ShieldAlert,
  Check,
  Accessibility,
  Compass,
  Users,
  MapPin,
  Bell,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { UserProfile, MobilityType, TransportType, CompanionType } from "../types";
import { useAuth } from "../context/AuthContext";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  const { user: authUser, logout, updateUserContext } = useAuth();
  const [name, setName] = useState(user.name);
  const [mobility, setMobility] = useState<MobilityType>(user.mobility);
  const [transport, setTransport] = useState<TransportType>(user.transport);
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
        setLocationStatus("Location unavailable (Permission denied or timeout). Using manual coordinates.");
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
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <User className="h-5 w-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">
              Personalized Emergency Settings
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Privacy Notice */}
          <div className="bg-amber-950/40 border border-amber-500/30 p-3 rounded-lg text-amber-200">
            <span className="font-bold">Privacy & Data Minimization: </span>
            Information is strictly used for routing and risk calculations. No medical data is stored.
          </div>

          {/* User Name */}
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Display / Profile Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Mobility Level */}
          <div>
            <label className="text-slate-400 font-semibold block mb-2">Physical Mobility Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(["normal", "limited", "wheelchair"] as MobilityType[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMobility(m)}
                  className={`py-2 px-2.5 rounded-lg border text-xs font-bold capitalize transition ${
                    mobility === m
                      ? "bg-amber-950 border-amber-500 text-amber-300"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {m === "normal" && "🚶 Normal"}
                  {m === "limited" && "🦼 Limited"}
                  {m === "wheelchair" && "♿ Wheelchair"}
                </button>
              ))}
            </div>
          </div>

          {/* Transport Mode */}
          <div>
            <label className="text-slate-400 font-semibold block mb-2">Evacuation Transport Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {(["walking", "bicycle", "car", "public_transport"] as TransportType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTransport(t)}
                  className={`py-2 px-2.5 rounded-lg border text-xs font-bold capitalize transition ${
                    transport === t
                      ? "bg-cyan-950 border-cyan-500 text-cyan-300"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {t.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Geolocation & Current Location Settings */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-emerald-400" /> Current Coordinates
              </span>
              <button
                onClick={handleRequestBrowserLocation}
                className="text-[11px] bg-emerald-950 border border-emerald-500/50 text-emerald-300 px-2.5 py-1 rounded font-semibold hover:bg-emerald-900 transition"
              >
                📡 Acquire GPS Location
              </button>
            </div>
            {locationStatus && (
              <p className="text-[11px] text-amber-300 font-mono">{locationStatus}</p>
            )}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div>
                <label className="text-slate-500">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                />
              </div>
              <div>
                <label className="text-slate-500">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                />
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-2 pt-1 border-t border-slate-800">
            <span className="font-bold text-slate-400 uppercase text-[11px] block">
              Emergency Alerts & Notifications
            </span>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-300">Audible Siren / Voice Instructions</span>
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => setSoundAlerts(e.target.checked)}
                className="h-4 w-4 accent-red-600 rounded"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-300">High-Priority Recalculation Prompts</span>
              <input
                type="checkbox"
                checked={highPriorityAlerts}
                onChange={(e) => setHighPriorityAlerts(e.target.checked)}
                className="h-4 w-4 accent-red-600 rounded"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleResetData}
            className="flex items-center space-x-1 text-slate-400 hover:text-red-400 text-xs transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Reset Local Data</span>
          </button>
          <button
            onClick={handleApply}
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs transition shadow-md"
          >
            Apply & Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};