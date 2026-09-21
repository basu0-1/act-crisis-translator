'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/hooks/useI18n';
import { LanguageCode } from '@/types';
import {
  ShieldAlert, Menu, X, Sun, Moon, Laptop,
  Globe, LogOut, User as UserIcon, Settings as SettingsIcon, LayoutDashboard, Shield
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages: { code: LanguageCode; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ja', label: '日本語' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="bg-emergency-600 text-white p-2 rounded-lg shadow-sm group-hover:bg-emergency-700 transition">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                ACT
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Crisis Translator
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-700 dark:text-slate-200">
            <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
              {t.navHome}
            </Link>
            <Link href="/#how-it-works" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
              {t.navHowItWorks}
            </Link>
            <Link href="/#features" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
              {t.navFeatures}
            </Link>
            <Link href="/#safety" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
              {t.navSafety}
            </Link>
            <Link href="/dashboard" className="text-emergency-600 dark:text-emergency-400 font-semibold hover:underline">
              {t.navDashboard}
            </Link>
          </nav>

          {/* Controls & Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                aria-label="Select language"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language.toUpperCase()}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black/5 dark:ring-white/10 py-1 z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-1.5 text-xs ${
                        language === l.code
                          ? 'bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Selector */}
            <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded ${theme === 'light' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}
                title="Light mode"
                aria-label="Light mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded ${theme === 'dark' ? 'bg-slate-900 text-brand-400 shadow-sm' : 'text-slate-500'}`}
                title="Dark mode"
                aria-label="Dark mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`p-1.5 rounded ${theme === 'system' ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500'}`}
                title="System mode"
                aria-label="System mode"
              >
                <Laptop className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* User Session */}
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/dashboard"
                  className="px-3 py-1.5 text-xs font-semibold rounded-md bg-emergency-600 text-white hover:bg-emergency-700 transition shadow-sm"
                >
                  {t.navDashboard}
                </Link>
                <Link
                  href="/profile"
                  className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  title="Profile"
                >
                  <UserIcon className="w-4 h-4" />
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin/dashboard"
                    className="p-2 text-purple-600 dark:text-purple-400 hover:text-purple-700"
                    title="Admin Console"
                  >
                    <Shield className="w-4 h-4" />
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-red-600 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400"
                >
                  {t.navLogin}
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 text-xs font-semibold rounded-md bg-brand-600 text-white hover:bg-brand-700 transition shadow-sm"
                >
                  {t.navRegister}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>{t.navHome}</Link>
            <Link href="/#how-it-works" onClick={() => setMobileMenuOpen(false)}>{t.navHowItWorks}</Link>
            <Link href="/#features" onClick={() => setMobileMenuOpen(false)}>{t.navFeatures}</Link>
            <Link href="/#safety" onClick={() => setMobileMenuOpen(false)}>{t.navSafety}</Link>
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-emergency-600 font-bold">{t.navDashboard}</Link>
            {user && (
              <>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>{t.navProfile}</Link>
                <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>{t.navSettings}</Link>
                {user.role === 'ADMIN' && (
                  <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-purple-600">{t.navAdmin}</Link>
                )}
              </>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex space-x-1">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`px-2 py-1 text-xs rounded ${language === l.code ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {user ? (
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="text-xs text-red-600 font-semibold flex items-center space-x-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.navLogout}</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  {t.navLogin}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1 text-xs font-semibold bg-brand-600 text-white rounded"
                >
                  {t.navRegister}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
