'use client';

import React from 'react';
import { RiskAssessment, MobilityTier } from '@/types';
import { useI18n } from '@/hooks/useI18n';
import {
  AlertCircle, ShieldAlert, Clock, Info,
  TrendingUp, CheckCircle, Navigation, Accessibility
} from 'lucide-react';

interface Props {
  risk: RiskAssessment;
  mobility?: MobilityTier;
}

export default function PersonalRiskCard({ risk, mobility }: Props) {
  const { t } = useI18n();

  const getRiskColor = (score: number) => {
    if (score >= 75) return { text: 'text-red-600', bg: 'bg-red-500', ring: 'border-red-500' };
    if (score >= 50) return { text: 'text-amber-600', bg: 'bg-amber-500', ring: 'border-amber-500' };
    if (score >= 25) return { text: 'text-blue-600', bg: 'bg-blue-500', ring: 'border-blue-500' };
    return { text: 'text-emerald-600', bg: 'bg-emerald-500', ring: 'border-emerald-500' };
  };

  const riskColors = getRiskColor(risk.risk_score);

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.sectionPersonalRisk}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">|</span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t.qHowAffectsMe}
          </span>
        </div>

        {/* Mobility Profile Indicator */}
        {mobility && (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Accessibility className="w-3.5 h-3.5 text-brand-600" />
            <span>Profile: <strong>{mobility.replace('_', ' ')}</strong></span>
          </div>
        )}
      </div>

      {/* Main Score Display & Action Window */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Risk Score Circle / Bar */}
        <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className={`relative flex items-center justify-center w-16 h-16 rounded-full border-4 ${riskColors.ring} bg-white dark:bg-slate-900 shrink-0`}>
            <span className={`text-xl font-black ${riskColors.text}`}>
              {Math.round(risk.risk_score)}
            </span>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Risk Level
            </div>
            <div className={`text-lg font-black uppercase ${riskColors.text}`}>
              {risk.risk_level}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Out of 100 max index
            </div>
          </div>
        </div>

        {/* Action Window */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center space-x-3">
          <Clock className="w-8 h-8 text-emergency-600 dark:text-emergency-400 shrink-0" />
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {t.actionWindow}
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              ~{risk.action_window_minutes} minutes
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Safe transit time buffer included
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-center">
          <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
            <span>Exposure Index</span>
            <span className={riskColors.text}>{Math.round(risk.risk_score)}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${riskColors.bg}`}
              style={{ width: `${Math.min(100, Math.max(5, risk.risk_score))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Low (0-24)</span>
            <span>Moderate (25-49)</span>
            <span>High (50-74)</span>
            <span>Critical (75+)</span>
          </div>
        </div>
      </div>

      {/* Transparent Breakdown Factors */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Transparent Risk Factor Breakdown
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {risk.risk_factors.map((factor, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-start justify-between gap-2"
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{factor.name}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {factor.severity_level}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {factor.description}
                </p>
              </div>
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 shrink-0">
                +{factor.score_impact} pts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Disclaimer Badge */}
      <div className="pt-2 flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          <strong>{risk.disclaimer}</strong>: {t.prototypeScoreNote}
        </span>
      </div>
    </section>
  );
}
