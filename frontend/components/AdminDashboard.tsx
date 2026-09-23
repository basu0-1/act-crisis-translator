"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Users,
  Building2,
  Navigation,
  Activity,
  Plus,
  Trash2,
  CheckCircle,
  AlertOctagon,
  RefreshCw,
  X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const { token, isAdmin } = useAuth();
  const [tab, setTab] = useState<"users" | "alerts" | "shelters" | "roads" | "audit">("alerts");
  const [users, setUsers] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [shelters, setShelters] = useState<any[]>([]);
  const [roads, setRoads] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // New Alert form state
  const [newHeadline, setNewHeadline] = useState("");
  const [newSeverity, setNewSeverity] = useState("high");
  const [newSourceType, setNewSourceType] = useState("live");

  const fetchData = async () => {
    if (!token || !isAdmin) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [uRes, aRes, sRes, rRes, lRes, cRes] = await Promise.all([
        fetch(`${API_BASE}/admin/users`, { headers }).then((r) => r.json()),
        fetch(`${API_BASE}/admin/alerts`, { headers }).then((r) => r.json()),
        fetch(`${API_BASE}/admin/shelters`, { headers }).then((r) => r.json()),
        fetch(`${API_BASE}/admin/roads`, { headers }).then((r) => r.json()),
        fetch(`${API_BASE}/admin/audit-logs`, { headers }).then((r) => r.json()),
        fetch(`${API_BASE}/admin/config`, { headers }).then((r) => r.json()),
      ]);
      setUsers(Array.isArray(uRes) ? uRes : []);
      setAlerts(Array.isArray(aRes) ? aRes : []);
      setShelters(Array.isArray(sRes) ? sRes : []);
      setRoads(Array.isArray(rRes) ? rRes : []);
      setAuditLogs(Array.isArray(lRes) ? lRes : []);
      setConfig(cRes);
    } catch (e) {
      console.error("Admin fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen, token, isAdmin]);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeadline.trim() || !token) return;
    try {
      await fetch(`${API_BASE}/admin/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          hazard_type: "flood",
          severity: newSeverity,
          certainty: "likely",
          headline: newHeadline,
          description: "Official emergency announcement broadcasted via live telemetry feed.",
          source_type: newSourceType,
          source_name: newSourceType === "live" ? "NDMA Central Live Stream" : "Simulated Local Scenario",
          time_to_impact_minutes: 25,
        }),
      });
      setNewHeadline("");
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE}/admin/alerts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (e) {}
  };

  const handleToggleShelterStatus = async (shelter: any) => {
    if (!token) return;
    const newStatus = shelter.status === "open" ? "full" : "open";
    try {
      await fetch(`${API_BASE}/admin/shelters/${shelter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchData();
    } catch (e) {}
  };

  const handleToggleRoadStatus = async (road: any) => {
    if (!token) return;
    const newStatus = road.status === "safe" ? "blocked" : "safe";
    try {
      await fetch(`${API_BASE}/admin/roads/${road.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchData();
    } catch (e) {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base text-white">
                  Developer & Database Management Console
                </h3>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-600/40 font-mono">
                  RBAC PROTECTED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Full schema inspection, live broadcast controls, infrastructure management
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchData}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-700"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/70 px-6 text-xs font-semibold overflow-x-auto">
          {[
            { id: "alerts", label: "🚨 Emergency Alerts", count: alerts.length },
            { id: "shelters", label: "🏫 Shelters", count: shelters.length },
            { id: "roads", label: "🛣️ Road Network", count: roads.length },
            { id: "users", label: "👥 Registered Users", count: users.length },
            { id: "audit", label: "📜 Audit Trails", count: auditLogs.length },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`py-3 px-4 border-b-2 font-bold transition whitespace-nowrap flex items-center space-x-1.5 ${
                tab === t.id
                  ? "border-cyan-500 text-cyan-400 bg-cyan-950/20"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <span>{t.label}</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded-full text-slate-300">
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {/* TAB 1: ALERTS */}
          {tab === "alerts" && (
            <div className="space-y-4">
              {/* Broadcast Live/Demo Alert */}
              <form onSubmit={handleCreateAlert} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Broadcast New Emergency Alert
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Alert Headline (e.g. FLASH FLOOD: Yamuna Gate 3)"
                    value={newHeadline}
                    onChange={(e) => setNewHeadline(e.target.value)}
                    className="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                  <div className="flex space-x-2">
                    <select
                      value={newSeverity}
                      onChange={(e) => setNewSeverity(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white text-xs"
                    >
                      <option value="high">High</option>
                      <option value="extreme">Extreme</option>
                      <option value="medium">Medium</option>
                    </select>
                    <select
                      value={newSourceType}
                      onChange={(e) => setNewSourceType(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white text-xs"
                    >
                      <option value="live">🔴 Live Stream</option>
                      <option value="demo">🟡 Demo Sim</option>
                    </select>
                    <button
                      type="submit"
                      className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-3 rounded-lg text-xs flex items-center justify-center flex-shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </form>

              {/* Alert Table */}
              <div className="space-y-2">
                {alerts.map((a) => (
                  <div key={a.id} className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          a.source_type === "live" ? "bg-red-950 text-red-300 border border-red-500/40" : "bg-amber-950 text-amber-300 border border-amber-500/40"
                        }`}>
                          {a.source_type}
                        </span>
                        <span className="font-bold text-white text-sm">{a.headline}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Source: {a.source_name} • Severity: {a.severity.toUpperCase()} • Radius: {a.radius_km} km
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteAlert(a.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition"
                      title="Delete Alert"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SHELTERS */}
          {tab === "shelters" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {shelters.map((s) => (
                <div key={s.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{s.name}</span>
                    <button
                      onClick={() => handleToggleShelterStatus(s)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        s.status === "open" ? "bg-emerald-950 text-emerald-300 border border-emerald-500" : "bg-red-950 text-red-300 border border-red-500"
                      }`}
                    >
                      {s.status} (Click to toggle)
                    </button>
                  </div>
                  <p className="text-slate-400 text-[11px]">{s.address}</p>
                  <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-900">
                    <span>Occupancy: {s.current_occupancy} / {s.capacity}</span>
                    <span>Accessible: {s.is_accessible ? "✓ Yes" : "❌ No"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: ROADS */}
          {tab === "roads" && (
            <div className="space-y-2 text-xs">
              {roads.map((r) => (
                <div key={r.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{r.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({r.id})</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Wheelchair: {r.accessible_wheelchair ? "✓ Yes" : "❌ No"} • Stairs: {r.has_stairs ? "⚠️ Yes" : "✓ None"} • Risk: {(r.risk_level * 100).toFixed(0)}%
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleRoadStatus(r)}
                    className={`px-3 py-1 rounded text-xs font-bold uppercase transition ${
                      r.status === "safe"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-600/50 hover:bg-red-950"
                        : "bg-red-950 text-red-300 border border-red-600/50 hover:bg-emerald-950"
                    }`}
                  >
                    {r.status} (Toggle)
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: USERS */}
          {tab === "users" && (
            <div className="space-y-2 text-xs">
              {users.map((u) => (
                <div key={u.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{u.name}</span>
                      <span className="text-[10px] bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded font-mono">
                        {u.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {u.email} • Mobility: <span className="capitalize text-amber-300 font-medium">{u.mobility}</span> • Transport: {u.transport}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ID: {u.id}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: AUDIT LOGS */}
          {tab === "audit" && (
            <div className="space-y-2 text-xs font-mono">
              {auditLogs.map((log) => (
                <div key={log.id} className="bg-slate-950 p-3 rounded-lg border border-slate-900 flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-cyan-400 font-bold">{log.action}</span>
                      <span className="text-[10px] text-slate-500">[{log.event_type}]</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{JSON.stringify(log.details)}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap ml-4">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};