"use client";

import React, { useState } from "react";
import {
  PanelLeft,
  Sun,
  Moon,
  Monitor,
  User,
  Globe,
  ShieldCheck,
  ChevronDown,
  Activity,
  UserCheck
} from "lucide-react";
import { LanguageType, SimulationState, UserProfile } from "../types";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getTranslation } from "../lib/translations";
import { NavTab } from "./Sidebar";

interface HeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  language: LanguageType;
  onLanguageChange: (lang: LanguageType) => void;
  state: SimulationState | null;
  onOpenProfile: () => void;
  onOpenProvenance: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isSidebarOpen,
  onToggleSidebar,
  language,
  onLanguageChange,
  state,
  onOpenProfile,
  onOpenProvenance,
  onOpenAuth,
  onOpenAdmin,
}) => {
  const { user: authUser, isAuthenticated, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const t = getTranslation(language);

  const getLangLabel = (l: LanguageType) => {
    switch (l) {
      case "hi": return "हिन्दी (HI)";
      case "bn": return "বাংলা (BN)";
      case "or": return "ଓଡ଼ିଆ (OR)";
      case "ur": return "اردو (UR)";
      case "ja": return "日本語 (JA)";
      default: return "English (EN)";
    }
  };

  const getActiveTabTitle = () => {
    switch (activeTab) {
      case "dashboard": return t.emergencyDashboard;
      case "how-it-works": return t.howItWorks;
      case "features": return t.features;
      case "safety": return t.safetyTrust;
      default: return t.brandName + " " + t.brandTagline;
    }
  };

  const currentMobility = authUser?.mobility || state?.user.mobility || "limited";
  const mobilityLabel =
    currentMobility === "wheelchair"
      ? t.wheelchairMobility
      : currentMobility === "limited"
      ? t.limitedMobility
      : t.normalMobility;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="px-3 sm:px-6 h-14 flex items-center justify-between">
        {/* Left Side: Sidebar Toggle & Breadcrumb / Status */}
        <div className="flex items-center space-x-3 min-w-0">
          {/* ChatGPT Sidebar Toggle Button */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center"
            title={isSidebarOpen ? t.collapseSidebar : t.expandSidebar}
          >
            <PanelLeft className="h-5 w-5" />
          </button>

          {/* Active View Title */}
          <div className="flex items-center space-x-2 truncate">
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
              {getActiveTabTitle()}
            </span>

            {/* Live Indicator Chip */}
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{state?.is_offline ? t.offlineCached : t.liveDecisionActive}</span>
            </div>

            {/* Mobility Chip in Top Bar */}
            {isAuthenticated && (
              <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
                <UserCheck className="h-3 w-3 text-amber-600" />
                <span>{t.mobility}: {mobilityLabel}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Language, Theme, Safety Provenance, User */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 flex-shrink-0">
          {/* Multi-Language Switcher (EN, HI, BN, OR, UR, JA) */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={t.selectLanguage}
            >
              <Globe className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
              <span className="hidden sm:inline">{getLangLabel(language)}</span>
              <span className="sm:hidden">{language.toUpperCase()}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-1.5 z-50 text-xs animate-scale-up">
                {[
                  { code: "en" as LanguageType, label: "English (EN)" },
                  { code: "hi" as LanguageType, label: "हिन्दी (HI)" },
                  { code: "bn" as LanguageType, label: "বাংলা (BN)" },
                  { code: "or" as LanguageType, label: "ଓଡ଼ିଆ (OR)" },
                  { code: "ur" as LanguageType, label: "اردو (UR)" },
                  { code: "ja" as LanguageType, label: "日本語 (JA)" },
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      onLanguageChange(item.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition ${
                      language === item.code
                        ? "text-red-600 dark:text-red-400 font-bold bg-red-50/50 dark:bg-red-950/30"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span>{item.label}</span>
                    {language === item.code && <span className="font-bold text-red-600">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Switcher (☀️ Light, 🌙 Dark, 💻 System) */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-0.5 text-slate-500 dark:text-slate-400">
            <button
              onClick={() => setTheme("light")}
              className={`p-1.5 rounded-lg transition ${
                theme === "light"
                  ? "bg-white dark:bg-slate-800 text-amber-500 shadow-sm"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
              title={t.lightMode}
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`p-1.5 rounded-lg transition ${
                theme === "dark"
                  ? "bg-white dark:bg-slate-800 text-indigo-400 shadow-sm"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
              title={t.darkMode}
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`p-1.5 rounded-lg transition ${
                theme === "system"
                  ? "bg-white dark:bg-slate-800 text-cyan-500 shadow-sm"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
              title={t.systemTheme}
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Source Provenance / Audit Button */}
          <button
            onClick={onOpenProvenance}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={t.safetyAudit}
          >
            <ShieldCheck className="h-4 w-4" />
          </button>

          {/* User Button */}
          {isAuthenticated ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition"
              title={t.editProfile}
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:inline truncate max-w-[90px]">
                {authUser?.name?.split(" ")[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 transition"
            >
              {t.signIn}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
export type { NavTab };