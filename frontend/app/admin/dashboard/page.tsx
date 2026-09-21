'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { EmergencyAlert, Shelter, User as UserType, AlertSource } from '@/types';
import {
  Shield, Users, AlertTriangle, Home, Activity,
  Clock, Plus, RefreshCw, FileText, CheckCircle2, Lock
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<UserType[]>([]);
  const [alertsList, setAlertsList] = useState<EmergencyAlert[]>([]);
  const [sheltersList, setSheltersList] = useState<Shelter[]>([]);
  const [auditList, setAuditList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New alert form state
  const [showNewAlertModal, setShowNewAlertModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSeverity, setNewSeverity] = useState('SEVERE');
  const [newType, setNewType] = useState('FLOOD');
  const [newMinutes, setNewMinutes] = useState(30);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, u, a, sh, aud] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminAlerts(),
        api.getAdminShelters(),
        api.getAdminAudit(),
      ]);
      setStats(s);
      setUsersList(u);
      setAlertsList(a);
      setSheltersList(sh);
      setAuditList(aud);
    } catch (err: any) {
      setError(err.message || 'Access denied or error fetching admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/admin/login');
      } else if (user.role !== 'ADMIN') {
        setError('403 Forbidden: Administrative privileges required. Normal citizens cannot access this console.');
        setLoading(false);
      } else {
        fetchAdminData();
      }
    }
  }, [user, authLoading, router]);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminAlert({
        title: newTitle,
        description: newDesc,
        severity: newSeverity,
        emergency_type: newType,
        time_to_impact_minutes: Number(newMinutes),
        data_status: 'DEMO',
        is_active: true,
      });
      setShowNewAlertModal(false);
      setNewTitle('');
      setNewDesc('');
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to create alert');
    }
  };

  if (authLoading || (loading && !error)) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Verifying administrative credentials...</p>
      </div>
    );
  }

  if (error || (user && user.role !== 'ADMIN')) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-3.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-2xl inline-block">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Access Denied (403 Forbidden)</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {error || 'Administrative authorization required. This incident will be logged in security audit records.'}
        </p>
        <Link
          href="/admin/login"
          className="inline-block px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold shadow hover:bg-purple-700"
        >
          Authenticate as Emergency Director
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Emergency Authority & Master Dispatch Console
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Authoritative management of live alerts, shelters, sources, and audit logs.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowNewAlertModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Emergency Alert</span>
          </button>
          <button
            onClick={fetchAdminData}
            className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Registered Citizens</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.total_users}</div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 text-emergency-600" />
              <span>Active Alerts</span>
            </div>
            <div className="text-2xl font-black text-emergency-600">{stats.active_alerts}</div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold">
              <Home className="w-4 h-4 text-emerald-600" />
              <span>Open Shelters</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.open_shelters} / {stats.total_shelters}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Recalculations Count</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.recalculations_count}</div>
          </div>
        </div>
      )}

      {/* Tabs / Sections: Active Alerts & Shelter Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Management */}
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white">Active Alerts Master Table</h3>
            <span className="text-xs text-slate-400 font-mono">{alertsList.length} total</span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {alertsList.map((alt) => (
              <div
                key={alt.id}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{alt.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emergency-100 text-emergency-800 dark:bg-emergency-900/60 dark:text-emergency-200">
                    {alt.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{alt.description}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>Type: <strong>{alt.emergency_type}</strong></span>
                  <span>Impact: <strong>~{alt.time_to_impact_minutes} mins</strong></span>
                  <span>Status: <strong>{alt.data_status}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Shelters Master Table */}
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white">Verified Shelters Master Table</h3>
            <span className="text-xs text-slate-400 font-mono">{sheltersList.length} total</span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {sheltersList.map((sh) => (
              <div
                key={sh.id}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{sh.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      sh.status === 'OPEN'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {sh.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{sh.address}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>Capacity: <strong>{sh.capacity_available} / {sh.capacity_total}</strong></span>
                  <span>Wheelchair: <strong>{sh.wheelchair_accessible ? 'YES' : 'NO'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Security Audit Log Table */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white">Security & Audit Trail</h3>
          </div>
          <span className="text-xs text-slate-400">Chronological activity ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] uppercase font-bold text-slate-400">
              <tr>
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Action</th>
                <th className="py-2 px-3">Resource Type</th>
                <th className="py-2 px-3">User ID</th>
                <th className="py-2 px-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {auditList.slice(0, 10).map((log, idx) => (
                <tr key={log.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono text-[11px]">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{log.action}</td>
                  <td className="py-2.5 px-3">{log.resource_type}</td>
                  <td className="py-2.5 px-3 font-mono">{log.user_id ?? 'ANONYMOUS'}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{log.ip_address || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* New Alert Modal */}
      {showNewAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Publish New Emergency Alert</h3>
            <form onSubmit={handleCreateAlert} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Flash Flood Surge Warning"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Emergency details, impacted sectors..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="FLOOD">FLOOD</option>
                    <option value="WILDFIRE">WILDFIRE</option>
                    <option value="STORM">STORM</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="SEVERE">SEVERE</option>
                    <option value="EXTREME">EXTREME</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Time to Impact (m)</label>
                  <input
                    type="number"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewAlertModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow"
                >
                  Publish Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
