'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/hooks/useI18n';
import {
  ShieldAlert, ArrowRight, CheckCircle, Navigation, Home,
  Accessibility, RefreshCw, WifiOff, Globe, ShieldCheck,
  AlertTriangle, Zap, Eye, Compass, Users
} from 'lucide-react';

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-20 pb-20">
      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-12 bg-gradient-to-b from-slate-100/70 via-white to-transparent dark:from-slate-900/60 dark:via-slate-950 dark:to-transparent border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emergency-100 dark:bg-emergency-900/50 text-emergency-700 dark:text-emergency-300 text-xs font-bold tracking-wide border border-emergency-200 dark:border-emergency-800 shadow-sm">
            <ShieldAlert className="w-4 h-4 text-emergency-600 dark:text-emergency-400" />
            <span>Emergency Decision-Support Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {t.heroTitle}
          </h1>

          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-emergency-600 hover:bg-emergency-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2"
            >
              <span>{t.heroGetStarted}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-sm shadow-sm transition flex items-center justify-center space-x-2"
            >
              <span>{t.heroTryDemo}</span>
            </Link>
          </div>

          {/* Core Visual Pipeline: ALERT → RISK → ACTION → ROUTE → SHELTER */}
          <div className="pt-8">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
              Decision Intelligence Pipeline
            </div>
            <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-black">
              <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 flex flex-col items-center">
                <span className="text-[10px] text-red-500 font-mono">01</span>
                <span>{t.heroPipelineAlert}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 flex flex-col items-center">
                <span className="text-[10px] text-amber-500 font-mono">02</span>
                <span>{t.heroPipelineRisk}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 flex flex-col items-center">
                <span className="text-[10px] text-blue-500 font-mono">03</span>
                <span>{t.heroPipelineAction}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex flex-col items-center">
                <span className="text-[10px] text-indigo-500 font-mono">04</span>
                <span>{t.heroPipelineRoute}</span>
              </div>
              <div className="col-span-2 sm:col-span-1 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex flex-col items-center">
                <span className="text-[10px] text-emerald-500 font-mono">05</span>
                <span>{t.heroPipelineShelter}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION --- */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Methodology
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            How ACT Works
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            From official alerts to a clear personal plan in 5 transparent steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              step: 'Step 1',
              title: 'Understand the emergency',
              desc: 'Official dispatch verification, flood surge perimeter, and time-to-impact urgency.',
              icon: <Eye className="w-5 h-5 text-red-600" />,
            },
            {
              step: 'Step 2',
              title: 'Understand personal risk',
              desc: 'Calculates transparent multi-factor score adjusted for mobility and distance.',
              icon: <Zap className="w-5 h-5 text-amber-600" />,
            },
            {
              step: 'Step 3',
              title: 'Get clear immediate actions',
              desc: 'Separates immediate DO NOW actions from follow-up preparation and hazards to avoid.',
              icon: <CheckCircle className="w-5 h-5 text-blue-600" />,
            },
            {
              step: 'Step 4',
              title: 'Find a safer route',
              desc: 'Mobility-aware routing steering clear of low-lying flood plains and flooded underpasses.',
              icon: <Compass className="w-5 h-5 text-indigo-600" />,
            },
            {
              step: 'Step 5',
              title: 'Adapt when conditions change',
              desc: 'Dynamic recalculation rerouting around blocked roads and updating destination shelters.',
              icon: <RefreshCw className="w-5 h-5 text-emerald-600" />,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase font-mono">{item.step}</span>
                <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800">{item.icon}</div>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Core Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Designed for Critical Reliability
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Personalized Risk',
              desc: 'Multi-factor calculation considering severity, proximity, time-to-impact, and mobility needs.',
              icon: <Zap className="w-6 h-6 text-amber-500" />,
            },
            {
              title: 'Accessibility-Aware Routing',
              desc: 'Ensures wheelchair users and those with limited mobility avoid steep grades, stairs, and debris.',
              icon: <Accessibility className="w-6 h-6 text-blue-500" />,
            },
            {
              title: 'Shelter Recommendations',
              desc: 'Identifies verified open emergency shelters with verified medical and capacity data.',
              icon: <Home className="w-6 h-6 text-emerald-500" />,
            },
            {
              title: 'Dynamic Route Recalculation',
              desc: 'Instantly redirects around submerged roads like Riverside Road Bridge in real time.',
              icon: <RefreshCw className="w-6 h-6 text-indigo-500" />,
            },
            {
              title: 'Offline Emergency Plan',
              desc: 'Saves emergency directives and topological maps locally so they remain accessible when cell towers fail.',
              icon: <WifiOff className="w-6 h-6 text-rose-500" />,
            },
            {
              title: 'Multilingual Interface',
              desc: 'Native support for English, Hindi (हिन्दी), and Japanese (日本語) with accurate terminology.',
              icon: <Globe className="w-6 h-6 text-teal-500" />,
            },
            {
              title: 'Trusted Data Provenance',
              desc: 'Every alert clearly displays its official source, trust score, and verification timestamp.',
              icon: <ShieldCheck className="w-6 h-6 text-sky-500" />,
            },
          ].map((feat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 w-fit">{feat.icon}</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{feat.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- SAFETY & TRUST DISCLAIMER SECTION --- */}
      <section id="safety" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-3">
          <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-200 font-extrabold text-sm uppercase tracking-wider">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Safety, Authority & Provenance Policy</span>
          </div>
          <p className="text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
            {t.safetyDisclaimer} ACT does not issue independent government mandates. All emergency information displays its source agency, timestamp, and verification status. In demo scenarios, information is prominently watermarked as simulated to prevent misinterpretation.
          </p>
        </div>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Be ready before the situation changes.
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Create your personalized mobility and location profile in less than two minutes.
        </p>
        <div className="pt-2">
          <Link
            href="/register"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition"
          >
            <span>{t.heroGetStarted}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
