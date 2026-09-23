"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  ShieldAlert,
  Sun,
  Moon,
  Monitor,
  User,
  LogOut,
  Globe,
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import { LanguageType, UserProfile } from "../types";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export type NavTab = "home" | "how-it-works" | "features" | "safety" | "dashboard";

interface HeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isOffline: boolean;
  language: LanguageType;
  onLanguageChange: (lang: LanguageType) => void;
  user: UserProfile;
  onOpenProfile: () => void;
  onOpenProvenance: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isOffline,
  language,
  onLanguageChange,
  user,
  onOpenProfile,
  onOpenProvenance,
  onOpenAuth,
  onOpenAdmin,
}) => {
  const { user: authUser, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "how-it-works", label: "How It Works" },
    { id: "features", label: "Features" },
    { id: "safety", label: "Safety & Trust" },
    { id: "dashboard", label: "Dashboard" },
  ];

  const handleTabClick = (tab: NavTab) => {
    if (tab === "dashboard" && !isAuthenticated) {
      onOpenAuth();
      return;
    }
    onTabChange(tab);
  };

  const handleLangSelect = (l: LanguageType) => {
    onLanguageChange(l);
    setLangMenuOpen(false);
  };

  const getLangLabel = (l: LanguageType) => {
    switch (l) {
      case "hi": return "HI";
      case "bn": return "BN";
      case "or": return "OR";
      case "ur": return "UR";
      case "ja": return "JA";
      default: return "EN";
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div
          className="flex items-center space-x-2.5 cursor-pointer flex-shrink-0"
          onClick={() => onTabChange("home")}
        >
          <div className="h-9 w-9 rounded-xl bg-red-600 flex items-center justify-center shadow-md shadow-red-600/30">
            <div className="flex items-center justify-center text-white font-black text-lg leading-none">
              !
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              ACT
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
              Crisis Translator
            </span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`text-sm font-semibold transition-colors ${
                activeTab === item.id
                  ? "text-red-600 dark:text-red-500 font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right: Controls & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Expanded Language Selector (EN, HI, BN, OR, UR, JA) */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Select Language"
            >
              <Globe className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <span>{getLangLabel(language)}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-1 w-36 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 text-xs">
                {[
                  { code: "en" as LanguageType, label: "English" },
                  { code: "hi" as LanguageType, label: "हिन्दी (Hindi)" },
                  { code: "bn" as LanguageType, label: "বাংলা (Bengali)" },
                  { code: "or" as LanguageType, label: "ଓଡ଼ିଆ (Odia)" },
                  { code: "ur" as LanguageType, label: "اردو (Urdu)" },
                  { code: "ja" as LanguageType, label: "日本語 (Japanese)" },
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => handleLangSelect(item.code)}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between ${
                      language === item.code ? "text-red-600 font-bold" : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span>{item.label}</span>
                    {language === item.code && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Selector (☀️ Light, 🌙 Dark, 💻 System) */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-0.5 text-slate-500 dark:text-slate-400">
            <button
              onClick={() => setTheme("light")}
              className={`p-1.5 rounded-md transition ${
                theme === "light"
                  ? "bg-white dark:bg-slate-800 text-amber-500 shadow-sm"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Light Mode"
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`p-1.5 rounded-md transition ${
                theme === "dark"
                  ? "bg-white dark:bg-slate-800 text-indigo-400 shadow-sm"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Dark Mode"
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`p-1.5 rounded-md transition ${
                theme === "system"
                  ? "bg-white dark:bg-slate-800 text-cyan-500 shadow-sm"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
              title="System Theme"
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Red Dashboard Action Button (with Auth Guard) */}
          <button
            onClick={() => handleTabClick("dashboard")}
            className="hidden sm:inline-flex items-center px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 transition transform hover:-translate-y-0.5"
          >
            Dashboard
          </button>

          {/* Admin Badge/Console Trigger */}
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="p-1.5 rounded-lg border border-cyan-500/50 bg-cyan-950/40 text-cyan-400 hover:bg-cyan-900/50 transition"
              title="Admin Developer Console"
            >
              <ShieldAlert className="h-4 w-4" />
            </button>
          )}

          {/* User Account / Profile */}
          <button
            onClick={isAuthenticated ? onOpenProfile : onOpenAuth}
            className={`p-1.5 rounded-lg border text-xs font-semibold transition flex items-center space-x-1.5 ${
              isAuthenticated
                ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title={isAuthenticated ? `Logged in as ${authUser?.name}` : "Sign In / Register"}
          >
            <User className="h-4 w-4" />
            {isAuthenticated && (
              <span className="hidden lg:inline text-[11px] font-bold">{authUser?.name?.split(" ")[0]}</span>
            )}
          </button>

          {/* Logout / Exit */}
          {isAuthenticated && (
            <button
              onClick={logout}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
              title="Log Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 bg-slate-50 dark:bg-slate-900/80 overflow-x-auto text-xs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition ${
              activeTab === item.id
                ? "bg-red-600 text-white font-bold"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};