'use client';

import React from 'react';
import { ActionPlan } from '@/types';
import { useI18n } from '@/hooks/useI18n';
import {
  Zap, AlertOctagon, CheckCircle2, ArrowRight,
  ShieldAlert, HelpCircle, XCircle, ArrowUpRight, Flame
} from 'lucide-react';

interface Props {
  plan: ActionPlan;
  isBlocked?: boolean;
}

export default function ActionPlanCards({ plan, isBlocked }: Props) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {/* 3. DO NOW */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border-2 border-emergency-500/80 dark:border-emergency-500/60 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded bg-emergency-600 text-white">
              <Zap className="w-4 h-4" />
            </span>
            <span className="text-sm font-black uppercase tracking-wider text-emergency-600 dark:text-emergency-400">
              3. DO NOW
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
          {plan.do_now.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-3.5 rounded-lg bg-emergency-50/60 dark:bg-emergency-950/30 border border-emergency-200 dark:border-emergency-900/50 flex items-start space-x-3"
            >
              <div className="w-6 h-6 rounded-full bg-emergency-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {item.text}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emergency-200 dark:bg-emergency-800 text-emergency-900 dark:text-emergency-100">
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

      {/* 6. NEXT & 7. AVOID (Grid side-by-side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 6. NEXT */}
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <span className="p-1 rounded bg-blue-600 text-white">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              6. NEXT
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t.qDoNext}
            </span>
          </div>

          <div className="space-y-2">
            {plan.do_next.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex items-start space-x-2.5"
              >
                <ArrowRight className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
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
            <span className="p-1 rounded bg-red-600 text-white">
              <XCircle className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              7. AVOID
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t.qAvoid}
            </span>
          </div>

          <div className="space-y-2">
            {plan.avoid.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 flex items-start space-x-2.5"
              >
                <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
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
            <span className="p-1 rounded bg-amber-500 text-slate-900">
              <HelpCircle className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              8. IF → THEN
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t.qIfThen}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Contingency Rules
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {plan.if_then.map((rule, idx) => (
            <div
              key={rule.id || idx}
              className={`p-3.5 rounded-lg border ${
                rule.severity === 'CRITICAL'
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
              } space-y-1.5`}
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
    </div>
  );
}
