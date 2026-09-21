'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Github, Heart, AlertTriangle } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2 text-white font-bold text-lg">
              <div className="bg-emergency-600 p-1.5 rounded">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <span>ACT — Actionable Crisis Translator</span>
            </div>
            <p className="text-slate-400 max-w-sm">
              {t.tagline}
            </p>
            <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-caution-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block mb-0.5">Safety & Provenance Disclaimer:</strong>
                {t.safetyDisclaimer}
              </div>
            </div>
          </div>

          {/* Product Navigation */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/#how-it-works" className="hover:text-white transition">{t.navHowItWorks}</Link></li>
              <li><Link href="/#features" className="hover:text-white transition">{t.navFeatures}</Link></li>
              <li><Link href="/#safety" className="hover:text-white transition">{t.navSafety}</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition">{t.navDashboard}</Link></li>
            </ul>
          </div>

          {/* Legal & Tech */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">System & Trust</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/docs/architecture.md" className="hover:text-white transition">Architecture Specs</Link></li>
              <li><Link href="/docs/api.md" className="hover:text-white transition">FastAPI Swagger Specs</Link></li>
              <li><Link href="/docs/security.md" className="hover:text-white transition">Security & RBAC</Link></li>
              <li><span className="text-emerald-400 font-mono text-[11px]">System Status: Operational</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ACT Emergency Decision-Support Platform. Built for human safety.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span>Open Source (MIT)</span>
            <span>No Proprietary Mapping Fees</span>
            <span>Zero Tracking Telemetry</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
