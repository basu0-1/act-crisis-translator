'use client';

import React, { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/hooks/useI18n';
import { LanguageCode } from '@/types';
import {
  Settings, Sun, Moon, Laptop, Globe, Bell,
  Shield, Database, Trash2, CheckCircle
} from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();

  const [notifications, setNotifications] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [offlineCache, setOfflineCache] = useState(true);
  const [clearedMsg, setClearedMsg] = useState(false);

  const clearLocalCache = () => {
    try {
      localStorage.removeItem('act_cached_decision_plan');
      localStorage.removeItem('act_cached_timestamp');
      setClearedMsg(true);
      setTimeout(() => setClearedMsg(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">System Settings & Preferences</h1>
          <p className="text-xs text-slate-500">Configure theme, language, and local device offline storage.</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Appearance Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Appearance & Theme</h3>
          <p className="text-xs text-slate-500">Choose your visual theme. High-contrast colors ensure emergency readability.</p>
          <div className="grid grid-cols-3 gap-3 pt-1">
            <button
              onClick={() => setTheme('light')}
              className={`p-3 rounded-lg border text-xs font-bold flex flex-col items-center space-y-1.5 transition ${
                theme === 'light'
                  ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-900/20 text-brand-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Light Mode</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-lg border text-xs font-bold flex flex-col items-center space-y-1.5 transition ${
                theme === 'dark'
                  ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-900/20 text-brand-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Dark Mode</span>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-3 rounded-lg border text-xs font-bold flex flex-col items-center space-y-1.5 transition ${
                theme === 'system'
                  ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>System Default</span>
            </button>
          </div>
        </div>

        {/* Language Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-sm">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Interface Language</h3>
          </div>
          <p className="text-xs text-slate-500">Emergency guidance is accurately translated in real time.</p>
          <div className="grid grid-cols-3 gap-3 pt-1">
            {[
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'हिन्दी (Hindi)' },
              { code: 'ja', label: '日本語 (Japanese)' },
            ].map((item) => (
              <button
                key={item.code}
                onClick={() => setLanguage(item.code as LanguageCode)}
                className={`p-3 rounded-lg border text-xs font-bold transition ${
                  language === item.code
                    ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Local Storage & Privacy */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-sm">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Offline Cache & Privacy</h3>
          </div>
          <p className="text-xs text-slate-500">
            Emergency plans are cached in your browser's local sandbox to remain operational during telecommunication outages.
          </p>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
              Clear cached offline evacuation package
            </span>
            <button
              onClick={clearLocalCache}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 text-xs font-bold transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Local Cache</span>
            </button>
          </div>

          {clearedMsg && (
            <div className="text-xs text-emerald-600 font-semibold flex items-center space-x-1 pt-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Offline cache purged. New package will be fetched when online.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
