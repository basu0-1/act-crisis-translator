'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';
import { useOffline } from '@/hooks/useOffline';
import { api } from '@/lib/api';
import { OfflineStorage } from '@/lib/offline';
import { EmergencyDecisionPackage, MobilityTier } from '@/types';

import EmergencyStatusCard from '@/components/EmergencyStatusCard';
import PersonalRiskCard from '@/components/PersonalRiskCard';
import ActionPlanCards from '@/components/ActionPlanCards';
import SafeRouteMap from '@/components/SafeRouteMap';
import ShelterCard from '@/components/ShelterCard';
import RecentUpdatesCard from '@/components/RecentUpdatesCard';
import DemoControlBar from '@/components/DemoControlBar';

import {
  ShieldAlert, RefreshCw, AlertTriangle, WifiOff,
  User as UserIcon, CheckCircle
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { isOffline } = useOffline();

  const [decision, setDecision] = useState<EmergencyDecisionPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDecision = useCallback(async () => {
    setError(null);
    if (isOffline) {
      const { data } = OfflineStorage.getCachedDecisionPackage();
      if (data) {
        setDecision(data);
      } else {
        setError(t.statusUnavailable);
      }
      setLoading(false);
      return;
    }

    try {
      // If user isn't logged in yet in demo mode, login as default user Elena Chen
      if (!user) {
        try {
          await api.login('user@example.com', 'User@ACT2026!');
        } catch {
          // Continue if already authenticated via cookie
        }
      }
      const data = await api.getDecisionPackage();
      setDecision(data);
      OfflineStorage.saveDecisionPackage(data);
    } catch (err: any) {
      // Fallback to offline cache
      const { data } = OfflineStorage.getCachedDecisionPackage();
      if (data) {
        setDecision(data);
      } else {
        setError(err.message || 'Failed to load emergency data');
      }
    } finally {
      setLoading(false);
    }
  }, [isOffline, user, t]);

  useEffect(() => {
    fetchDecision();
  }, [fetchDecision]);

  const handleRecalculate = async () => {
    if (!decision?.route) return;
    setRecalculating(true);
    try {
      if (decision.route.is_blocked) {
        await api.resetDemo();
      } else {
        await api.triggerDemoRoadblock();
      }
      await fetchDecision();
    } catch (err: any) {
      alert(err.message || 'Recalculation error');
    } finally {
      setRecalculating(false);
    }
  };

  const handleMobilityChange = async (newMobility: MobilityTier) => {
    if (!decision?.alert) return;
    setRecalculating(true);
    try {
      await api.calculateRoute(decision.alert.id, newMobility);
      try {
        await api.updateProfile({ mobility: newMobility });
      } catch {
        // Keep going even if user profile endpoint returns an issue
      }
      await fetchDecision();
    } catch (err: any) {
      alert(err.message || 'Failed to update route for selected mobility tier');
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 space-y-6">
        <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
          <RefreshCw className="w-5 h-5 animate-spin text-brand-600" />
          <span className="text-sm font-semibold">
            Connecting to authorized emergency services and computing personal risk...
          </span>
        </div>
        <div className="space-y-4">
          <div className="h-36 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error && !decision) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-3 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl inline-block">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Emergency Connection Issue</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <button
          onClick={fetchDecision}
          className="px-4 py-2 rounded-lg bg-brand-600 text-white text-xs font-bold shadow hover:bg-brand-700 transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!decision) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Demo Controls Bar */}
      <DemoControlBar onStateChange={fetchDecision} />

      {/* DASHBOARD MANDATORY ORDER:
          1. Emergency Status
          2. Your Risk
          3. DO NOW
          4. SAFE ROUTE
          5. SHELTER
          6. NEXT
          7. AVOID
          8. IF → THEN
          9. Recent Updates
      */}

      {/* 1. Emergency Status */}
      <EmergencyStatusCard alert={decision.alert} />

      {/* 2. Your Risk */}
      <PersonalRiskCard
        risk={decision.risk}
        mobility={decision.route.mobility_tier || user?.profile?.mobility}
      />

      {/* 3. DO NOW (from ActionPlanCards component) */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border-2 border-emergency-500/80 dark:border-emergency-500/60 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded bg-emergency-600 text-white font-bold text-xs">3</span>
            <span className="text-sm font-black uppercase tracking-wider text-emergency-600 dark:text-emergency-400">
              DO NOW
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t.qDoNow}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emergency-100 text-emergency-800 dark:bg-emergency-900/60 dark:text-emergency-200 uppercase animate-pulse">
            Immediate Priority
          </span>
        </div>

        <div className="space-y-2">
          {decision.action_plan.do_now.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-3.5 rounded-lg bg-emergency-50/70 dark:bg-emergency-950/30 border border-emergency-200 dark:border-emergency-900/50 flex items-start space-x-3"
            >
              <div className="w-6 h-6 rounded-full bg-emergency-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {item.text}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emergency-200 dark:bg-emergency-800 text-emergency-900 dark:text-emergency-100">
                    {item.priority}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Category: {item.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SAFE ROUTE */}
      <SafeRouteMap
        route={decision.route}
        onRecalculate={handleRecalculate}
        onMobilityChange={handleMobilityChange}
        isLoading={recalculating}
      />

      {/* 5. SHELTER */}
      <ShelterCard
        shelter={decision.shelter}
        distanceMeters={decision.route.distance_meters}
        estimatedMinutes={decision.route.estimated_time_minutes}
      />

      {/* 6. NEXT & 7. AVOID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 6. NEXT */}
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <span className="p-1 rounded bg-blue-600 text-white font-bold text-xs">6</span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              NEXT
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t.qDoNext}
            </span>
          </div>

          <div className="space-y-2">
            {decision.action_plan.do_next.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex items-start space-x-2.5"
              >
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. AVOID */}
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <span className="p-1 rounded bg-red-600 text-white font-bold text-xs">7</span>
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              AVOID
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t.qAvoid}
            </span>
          </div>

          <div className="space-y-2">
            {decision.action_plan.avoid.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 flex items-start space-x-2.5"
              >
                <div className="w-2 h-2 rounded-full bg-red-600 mt-1.5 shrink-0" />
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 8. IF → THEN */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded bg-amber-500 text-slate-900 font-bold text-xs">8</span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              IF → THEN
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t.qIfThen}
            </span>
          </div>
          <span className="text-xs text-slate-400">Contingency Rules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {decision.action_plan.if_then.map((rule, idx) => (
            <div
              key={rule.id || idx}
              className={`p-3.5 rounded-lg border ${
                rule.severity === 'CRITICAL'
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
              } space-y-1`}
            >
              <div className="text-xs font-extrabold text-amber-800 dark:text-amber-300">
                {rule.condition}
              </div>
              <div className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                {rule.action}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Recent Updates */}
      <RecentUpdatesCard events={decision.recent_events || []} />
    </div>
  );
}
