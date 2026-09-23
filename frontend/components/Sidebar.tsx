"use client";

import React from "react";
import {
  ShieldAlert,
  Home,
  FileText,
  Sparkles,
  ShieldCheck,
  LayoutDashboard,
  User,
  LogOut,
  Sliders,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  MapPin,
  Waves,
  Zap,
  UserCheck
} from "lucide-react";
import { LanguageType, SimulationState, UserProfile } from "../types";
import { useAuth } from "../context/AuthContext";
import { getTranslation } from "../lib/translations";

export type NavTab = "home" | "how-it-works" | "features" | "safety" | "dashboard";

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isOpen: boolean;
  onToggle: () => void;
  language: LanguageType;
  state: SimulationState | null;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  showDemoDrawer: boolean;
  onToggleDemoDrawer: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpen,
  onToggle,
  language,
  state,
  onOpenProfile,
  onOpenAuth,
  onOpenAdmin,
  showDemoDrawer,
  onToggleDemoDrawer,
}) => {
  const { user: authUser, isAuthenticated, isAdmin, logout } = useAuth();
  const t = getTranslation(language);

  const navItems: { id: NavTab; label: string; icon: any; requiresAuth?: boolean }[] = [
    { id: "dashboard", label: t.emergencyDashboard, icon: LayoutDashboard, requiresAuth: true },
    { id: "home", label: t.home, icon: Home },
    { id: "how-it-works", label: t.howItWorks, icon: FileText },
    { id: "features", label: t.features, icon: Sparkles },
    { id: "safety", label: t.safetyTrust, icon: ShieldCheck },
  ];

  const handleNavClick = (item: (typeof navItems)[0]) => {
    if (item.requiresAuth && !isAuthenticated) {
      onOpenAuth();
      return;
    }
    onTabChange(item.id);
  };

  const currentMobility = authUser?.mobility || state?.user.mobility || "limited";
  const mobilityLabel =
    currentMobility === "wheelchair"
      ? t.wheelchairMobility
      : currentMobility === "limited"
      ? t.limitedMobility
      : t.normalMobility;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onToggle}
        />
      )}

      {/* ChatGPT-style Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${
          isOpen ? "w-64 sm:w-72 translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-0 lg:border-r-0 lg:overflow-hidden"
        }`}
      >
        {/* Top Header: Brand & Collapse Toggle */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div
            className="flex items-center space-x-2.5 cursor-pointer"
            onClick={() => onTabChange("home")}
          >
            <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center shadow-md shadow-red-600/30 text-white font-black text-sm">
              !
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-none">
                {t.brandName}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
                {t.brandTagline}
              </span>
            </div>
          </div>

          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            title={t.collapseSidebar}
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
        </div>

        {/* Action Button (Like ChatGPT New Chat) */}
        <div className="p-3 flex-shrink-0">
          <button
            onClick={() => {
              if (!isAuthenticated) {
                onOpenAuth();
              } else {
                onTabChange("dashboard");
              }
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-sm hover:border-red-500 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 transition group"
          >
            <span className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span>{t.newAssessment}</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-red-50 dark:group-hover:bg-red-950/40 group-hover:text-red-600 dark:group-hover:text-red-400">
              ACT
            </span>
          </button>
        </div>

        {/* Navigation Items (ChatGPT List Style) */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {t.overview}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold border border-red-200 dark:border-red-900/50 shadow-sm"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400"}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          {/* Active Hazard & Shelter Context Snippet */}
          {state?.alert && (
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 px-2 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t.activeCrisis}
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs">
                <div className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-300 font-bold">
                  <Waves className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="truncate">{state.alert.headline}</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 flex items-center space-x-1">
                  <MapPin className="h-3 w-3 text-red-500" />
                  <span className="truncate">{state.alert.radius_km} km radius</span>
                </div>
              </div>

              {state.route_recommendation?.destination && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs">
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">
                    {t.assignedHaven}:
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 font-semibold truncate mt-0.5">
                    {state.route_recommendation.destination.name}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {state.route_recommendation.recommended_route?.is_accessible ? `✓ ${t.stepFreeVerified}` : ""}
                  </div>
                </div>
              )}

              {/* Simulation drawer button */}
              <button
                onClick={onToggleDemoDrawer}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
              >
                <span className="flex items-center space-x-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  <span>{t.simulationControls}</span>
                </span>
                <span className="text-[10px] text-indigo-500 dark:text-indigo-400">
                  {showDemoDrawer ? t.hideControls : t.showControls}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Section: User Profile Card (ChatGPT Style) */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 flex-shrink-0">
          {isAuthenticated ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs shadow">
                    {(authUser?.name || state?.user.name || "U")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {authUser?.name || state?.user.name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {mobilityLabel}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={onOpenProfile}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                    title={t.editProfile}
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    onClick={logout}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                    title={t.logout}
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={onOpenAdmin}
                  className="w-full py-1.5 px-2 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-400 text-[11px] font-bold flex items-center justify-center space-x-1.5 hover:bg-cyan-900/50 transition"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>{t.adminConsole}</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 flex items-center justify-center space-x-2 transition"
            >
              <User className="h-4 w-4" />
              <span>{t.signIn}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
