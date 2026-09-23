"use client";

import React, { useState, useEffect } from "react";
import { Header, NavTab } from "../components/Header";
import { OfflineBanner } from "../components/OfflineBanner";
import { EmergencyAlertCard } from "../components/EmergencyAlertCard";
import { PersonalRiskGauge } from "../components/PersonalRiskGauge";
import { ActionPlanView } from "../components/ActionPlanView";
import { EmergencyMap } from "../components/EmergencyMap";
import { SimulationPanel } from "../components/SimulationPanel";
import { UserProfileModal } from "../components/UserProfileModal";
import { SourceProvenanceModal } from "../components/SourceProvenanceModal";
import { AuthModal } from "../components/AuthModal";
import { AdminDashboard } from "../components/AdminDashboard";
import { LanguageType, MobilityType, SimulationState, UserProfile } from "../types";
import { useAuth } from "../context/AuthContext";
import {
  fetchSimulationState,
  triggerSimulationEvent,
  resetSimulation,
  updateLanguage,
  getOfflineCachedState,
  recordUserTimelineEvent
} from "../lib/api";
import {
  ShieldAlert,
  Navigation,
  Building2,
  Clock,
  Activity,
  Settings,
  ChevronDown,
  ChevronUp,
  Zap,
  MapPin,
  HelpCircle,
  Radio,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Waves,
  Wind,
  SunMedium,
  Compass,
  FileCheck2,
  Users2,
  Layers,
  Globe,
  Lock,
  UserCheck
} from "lucide-react";

export default function DashboardPage() {
  const { user: authUser, isAuthenticated, isDemoMode } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [state, setState] = useState<SimulationState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isProvenanceOpen, setIsProvenanceOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [showDemoDrawer, setShowDemoDrawer] = useState<boolean>(true);
  const [pendingDashboardAfterLogin, setPendingDashboardAfterLogin] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchSimulationState();
        setState(data);
      } catch (e) {
        setState(getOfflineCachedState());
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Auth gate enforcement: if user logs in and was trying to access dashboard, navigate them in
  useEffect(() => {
    if (isAuthenticated && pendingDashboardAfterLogin) {
      setPendingDashboardAfterLogin(false);
      setActiveTab("dashboard");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isAuthenticated, pendingDashboardAfterLogin]);

  // If user logs out while on dashboard, return to home
  useEffect(() => {
    if (!isAuthenticated && activeTab === "dashboard") {
      setActiveTab("home");
    }
  }, [isAuthenticated, activeTab]);

  const handleLanguageChange = async (lang: LanguageType) => {
    if (!state) return;
    setIsRecalculating(true);
    try {
      const updated = await updateLanguage(lang);
      setState(updated);
      // Persist timeline event to database per user with timestamp
      recordUserTimelineEvent(
        `Language changed to ${lang.toUpperCase()}`,
        "language_change",
        authUser?.id || "demo_user_01"
      );
    } catch (e) {
      console.error("Language update error:", e);
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleTriggerEvent = async (event: any) => {
    setIsRecalculating(true);
    try {
      const updated = await triggerSimulationEvent(event);
      setState(updated);
      // Persist timeline event to database per user with timestamp
      recordUserTimelineEvent(
        updated.last_event_description,
        event.event_type || "simulation_event",
        authUser?.id || "demo_user_01"
      );
    } catch (e) {
      console.error("Simulation event error:", e);
    } finally {
      setTimeout(() => {
        setIsRecalculating(false);
      }, 400);
    }
  };

  const handleReset = async () => {
    setIsRecalculating(true);
    try {
      const resetState = await resetSimulation();
      setState(resetState);
      // Persist reset event to database per user with timestamp
      recordUserTimelineEvent(
        "Simulation restored to default initial state.",
        "reset",
        authUser?.id || "demo_user_01"
      );
    } catch (e) {
      console.error("Reset error:", e);
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleUpdateUser = async (user: UserProfile) => {
    if (!state) return;
    setIsRecalculating(true);
    try {
      const updated = await triggerSimulationEvent({
        event_type: "mobility_changed",
        mobility: user.mobility,
      });
      setState(updated);
      // Persist profile update event to database per user with timestamp
      recordUserTimelineEvent(
        `Mobility profile updated: ${user.mobility.toUpperCase()}`,
        "profile_update",
        authUser?.id || "demo_user_01"
      );
    } catch (e) {
      console.error("Profile update error:", e);
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleQuickMobilityChange = async (mobility: MobilityType) => {
    if (!state) return;
    setIsRecalculating(true);
    try {
      const updated = await triggerSimulationEvent({
        event_type: "mobility_changed",
        mobility,
      });
      setState(updated);
      recordUserTimelineEvent(
        `Active mobility switched to ${mobility.toUpperCase()}`,
        "mobility_switch",
        authUser?.id || "demo_user_01"
      );
    } catch (e) {
      console.error("Mobility update error:", e);
    } finally {
      setIsRecalculating(false);
    }
  };

  // Auth Guard for Dashboard entry
  const navigateToDashboard = (openDrawer = false) => {
    if (!isAuthenticated) {
      setPendingDashboardAfterLogin(true);
      setIsAuthOpen(true);
      return;
    }
    setActiveTab("dashboard");
    if (openDrawer) {
      setShowDemoDrawer(true);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading || !state) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="h-14 w-14 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
        <p className="text-sm font-extrabold uppercase tracking-widest text-slate-800 dark:text-slate-300">
          INITIALIZING ACT CRISIS DECISION LAYER...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-red-500 selection:text-white transition-colors">
      {/* ==================================================
          ACT HEADER (Matching Screenshot & Navigation)
          ================================================== */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "dashboard" && !isAuthenticated) {
            setPendingDashboardAfterLogin(true);
            setIsAuthOpen(true);
            return;
          }
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        isOffline={state.is_offline}
        language={state.user.language}
        onLanguageChange={handleLanguageChange}
        user={state.user}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenProvenance={() => setIsProvenanceOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Offline Status Banner */}
      <OfflineBanner isOffline={state.is_offline} cachedTimestamp={state.action_plan.timestamp} />

      {/* ==================================================
          VIEW 1: LANDING PAGE (Hero, Pipeline, Sections)
          ================================================== */}
      {activeTab !== "dashboard" ? (
        <div className="flex-1 flex flex-col">
          {/* Hero Section */}
          <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs sm:text-sm font-bold shadow-sm mb-6">
              <span className="text-base">🛡️</span>
              <span>Emergency Decision-Support Engine</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
              Turn emergency information into clear personal decisions.
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
              ACT helps people understand emergencies, assess personal risk, find safer routes, and identify nearby shelters in real time.
            </p>

            {/* CTAs (Protected by Auth Gate) */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={() => navigateToDashboard(false)}
                className="w-full sm:w-auto px-7 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
              >
                <span>{isAuthenticated ? "Enter Dashboard" : "Sign In & Get Started"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => navigateToDashboard(true)}
                className="w-full sm:w-auto px-7 py-3 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-sm shadow-md transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
              >
                <span>Try Interactive Demo</span>
              </button>
            </div>

            {/* DECISION INTELLIGENCE PIPELINE (5 Colored Cards) */}
            <div className="mt-14 max-w-4xl mx-auto">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-3">
                DECISION INTELLIGENCE PIPELINE
              </span>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-md grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl py-3 px-2 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-red-500 dark:text-red-400 tracking-wider">01</span>
                  <span className="text-xs font-black text-red-700 dark:text-red-400 tracking-wide mt-0.5">ALERT</span>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl py-3 px-2 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400 tracking-wider">02</span>
                  <span className="text-xs font-black text-amber-700 dark:text-amber-400 tracking-wide mt-0.5">RISK</span>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-xl py-3 px-2 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-blue-500 dark:text-blue-400 tracking-wider">03</span>
                  <span className="text-xs font-black text-blue-700 dark:text-blue-400 tracking-wide mt-0.5">ACTION</span>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 rounded-xl py-3 px-2 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 tracking-wider">04</span>
                  <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 tracking-wide mt-0.5">ROUTE</span>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl py-3 px-2 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 tracking-wider">05</span>
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 tracking-wide mt-0.5">SHELTER</span>
                </div>
              </div>
            </div>
          </section>

          {/* METHODOLOGY SECTION */}
          <section id="how-it-works" className="py-14 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 tracking-widest uppercase">
                  METHODOLOGY
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  How ACT Resolves Crisis Decisions
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  A 5-agent AI pipeline bound by zero-hallucination deterministic engines converts chaotic alerts into step-by-step personal decisions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  {
                    step: "01",
                    title: "Alert Ingestion",
                    desc: "Parses authoritative feeds (NDMA, IMD, USGS) across 4 confidence levels.",
                    color: "border-red-500/30 bg-red-50/50 dark:bg-red-950/20"
                  },
                  {
                    step: "02",
                    title: "Personal Risk",
                    desc: "Evaluates exposure, mobility constraints, transport mode, and time urgency.",
                    color: "border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20"
                  },
                  {
                    step: "03",
                    title: "Hero Actions",
                    desc: "Generates explicit DO NOW, NEXT, AVOID, and IF→THEN rules.",
                    color: "border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20"
                  },
                  {
                    step: "04",
                    title: "Tactical Routing",
                    desc: "Computes step-free, barrier-free routes that automatically avoid active hazards.",
                    color: "border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/20"
                  },
                  {
                    step: "05",
                    title: "Safe Haven",
                    desc: "Assigns verified shelters with live capacity and accessibility accommodations.",
                    color: "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20"
                  },
                ].map((item, idx) => (
                  <div key={idx} className={`border rounded-xl p-4 shadow-sm space-y-2 ${item.color}`}>
                    <span className="text-xs font-black opacity-60">{item.step}</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FEATURES SECTION */}
          <section id="features" className="py-14 border-t border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-extrabold text-red-600 dark:text-red-400 tracking-widest uppercase">
                  CAPABILITIES
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  Engineered for Extreme Crisis Reliability
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Built to operate under incomplete telemetry, network disruptions, and rapidly escalating conditions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: <Waves className="h-5 w-5 text-blue-500" />,
                    title: "Multi-Emergency Support",
                    desc: "Tailored algorithms for Flood, Wildfire, Cyclone, Earthquake, Extreme Heat, and Urban Emergencies."
                  },
                  {
                    icon: <Zap className="h-5 w-5 text-amber-500" />,
                    title: "Dynamic Roadblock Recalculation",
                    desc: "Real-time rerouting when roads flood or block, automatically shifting to secondary safe havens."
                  },
                  {
                    icon: <Layers className="h-5 w-5 text-indigo-500" />,
                    title: "4-Tier Source Hierarchy",
                    desc: "Enforces strict trust hierarchy: Level 1 Official > Level 2 Sensor > Level 3 Responder > Level 4 Crowd."
                  },
                  {
                    icon: <Compass className="h-5 w-5 text-emerald-500" />,
                    title: "Accessibility-First Routing",
                    desc: "Guarantees step-free, paved pathways for wheelchair users and those with limited mobility."
                  },
                  {
                    icon: <ShieldAlert className="h-5 w-5 text-red-500" />,
                    title: "Fail-Safe Mode",
                    desc: "Never hallucinates. Missing or unverified data triggers conservative shelter-in-place instructions."
                  },
                  {
                    icon: <Globe className="h-5 w-5 text-cyan-500" />,
                    title: "6-Language Localization",
                    desc: "Zero-latency switching between English, Hindi, Bengali (বাংলা), Odia (ଓଡ଼ିଆ), Urdu (اردو), and Japanese."
                  }
                ].map((feat, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-2.5">
                    <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {feat.icon}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{feat.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SAFETY & TRUST SECTION */}
          <section id="safety" className="py-14 border-t border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30">
            <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="h-4 w-4" />
                <span>Zero Hallucination Safety Guarantee</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Trusted Decision Support, Not Automated Guesses
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                ACT is designed in accordance with NDMA and Common Alerting Protocol (CAP) standards. All routing, shelter assignments, and risk scores are backed by deterministic engines and cryptographic provenance. When reliable telemetry is absent, ACT states <span className="font-semibold text-red-600 dark:text-red-400">"Information unavailable"</span> rather than generating unverified advice.
              </p>
              <div className="pt-4 flex justify-center">
                <button
                  onClick={() => navigateToDashboard(false)}
                  className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition"
                >
                  {isAuthenticated ? "Open Dashboard →" : "Sign In to Access Dashboard →"}
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : (
        /* ==================================================
            VIEW 2: MINIMAL & ORGANIZED USER DASHBOARD (AUTH-GATED)
            ================================================== */
        <div className="flex-1 flex flex-col">
          {/* Top User Bar (Welcome & Status) */}
          <div className="bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveTab("home")}
                  className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1 font-semibold"
                >
                  <span>← Overview</span>
                </button>
                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Welcome, {authUser?.name || state.user.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800 capitalize">
                  Mobility: {authUser?.mobility || state.user.mobility}
                </span>
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="text-xs text-slate-600 dark:text-slate-400 hover:underline font-semibold"
                >
                  Edit Profile
                </button>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse ml-2" />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  {state.is_offline ? "Offline Cached" : "Live Decision Active"}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Simulation Drawer (Collapsible) */}
          <div className="bg-indigo-950/10 dark:bg-indigo-950/40 border-b border-indigo-500/20 dark:border-indigo-500/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-amber-500 dark:text-amber-400 animate-pulse" />
                  <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                    Interactive Roadblock & Recalculation Controls
                  </span>
                </div>
                <button
                  onClick={() => setShowDemoDrawer(!showDemoDrawer)}
                  className="text-xs text-indigo-600 dark:text-indigo-300 hover:underline flex items-center space-x-1 font-semibold"
                >
                  <span>{showDemoDrawer ? "Hide Controls" : "Show Controls"}</span>
                  {showDemoDrawer ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>

              {showDemoDrawer && (
                <div className="pt-3 pb-2">
                  <SimulationPanel
                    state={state}
                    onTriggerEvent={handleTriggerEvent}
                    onReset={handleReset}
                    isRecalculating={isRecalculating}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Minimal & Well-Organized Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* ROW 1: Current Emergency Status & Personalized Risk Score */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Emergency Status */}
              <div className="lg:col-span-7 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="h-5 w-5 rounded-full bg-red-600 text-white text-[11px] font-black flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                    Current Emergency Status
                  </h2>
                </div>
                <EmergencyAlertCard
                  alert={state.alert}
                  isOffline={state.is_offline}
                  onOpenProvenance={() => setIsProvenanceOpen(true)}
                />
              </div>

              {/* Personalized Risk */}
              <div className="lg:col-span-5 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="h-5 w-5 rounded-full bg-red-600 text-white text-[11px] font-black flex items-center justify-center">
                    2
                  </span>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                    Personalized Risk Score
                  </h2>
                </div>
                <PersonalRiskGauge risk={state.risk} />
              </div>
            </div>

            {/* ROW 2: Priority Hero Actions */}
            <section className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="h-5 w-5 rounded-full bg-red-600 text-white text-[11px] font-black flex items-center justify-center shadow-md shadow-red-600/40">
                    3
                  </span>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                    What You Should Do Now
                  </h2>
                </div>
                <span className="text-xs bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 px-2 py-0.5 rounded border border-red-300 dark:border-red-700 font-bold">
                  DIRECTIVES
                </span>
              </div>

              <ActionPlanView
                plan={state.action_plan}
                routeRec={state.route_recommendation}
                onOpenProvenance={() => setIsProvenanceOpen(true)}
              />
            </section>

            {/* ROW 3: Safe Evacuation Route Map & Assigned Safe Haven */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Map View */}
              <div className="lg:col-span-7 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="h-5 w-5 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center">
                    4
                  </span>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                    Safe Evacuation Route & Tactical Map
                  </h2>
                </div>
                <EmergencyMap
                  user={state.user}
                  alert={state.alert}
                  roads={state.roads}
                  shelters={state.shelters}
                  routeRec={state.route_recommendation}
                  isRecalculating={isRecalculating}
                />
              </div>

              {/* Shelter Details */}
              <div className="lg:col-span-5 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="h-5 w-5 rounded-full bg-cyan-600 text-white text-[11px] font-black flex items-center justify-center">
                    5
                  </span>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                    Designated Safe Haven
                  </h2>
                </div>

                {state.route_recommendation.destination ? (
                  <div className="bg-white dark:bg-slate-900 border border-cyan-500/40 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-xl bg-cyan-100 dark:bg-cyan-950 border border-cyan-500/50 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 tracking-wider">
                            Assigned Shelter
                          </span>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                            {state.route_recommendation.destination.name}
                          </h3>
                        </div>
                      </div>
                      <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold uppercase border border-emerald-300 dark:border-emerald-500/40">
                        {state.route_recommendation.destination.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {state.route_recommendation.destination.address}
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200 dark:border-slate-800 text-xs">
                      <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 block text-[10px] uppercase">Available Capacity</span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {state.route_recommendation.destination.capacity - state.route_recommendation.destination.current_occupancy} open slots
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 block text-[10px] uppercase">Accessibility</span>
                        <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                          {state.route_recommendation.destination.is_accessible ? "✓ Fully Accessible" : "Standard"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                      <span className="font-bold text-slate-900 dark:text-white block text-[11px] uppercase">
                        Reception Advisory
                      </span>
                      <p>• Ramp entrance located on the East Wing.</p>
                      <p>• Emergency medical staff on standby for mobility support.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl text-xs text-slate-500">
                    Shelter information currently unavailable.
                  </div>
                )}
              </div>
            </div>

            {/* ROW 4: Quick Mobility & Personal Settings Bar (Organized & Minimal) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Quick Mobility Adaptation
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Switch your mobility tier to see how evacuation routes recalculate in real time.
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {(["normal", "limited", "wheelchair"] as MobilityType[]).map((mob) => (
                    <button
                      key={mob}
                      onClick={() => handleQuickMobilityChange(mob)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                        (authUser?.mobility || state.user.mobility) === mob
                          ? "bg-red-600 text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {mob === "wheelchair" ? "♿ Wheelchair" : mob === "limited" ? "🚶 Limited" : "🏃 Normal"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Modals */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={state.user}
        onUpdateUser={handleUpdateUser}
      />

      <SourceProvenanceModal
        isOpen={isProvenanceOpen}
        onClose={() => setIsProvenanceOpen(false)}
        provenance={state.alert.provenance}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>ACT — Actionable Crisis Translator © 2026. Personal Decision Layer.</p>
        <p className="mt-1 text-slate-400 dark:text-slate-600">
          Complies with NDMA/CAP emergency guidelines. Zero hallucination guarantee.
        </p>
      </footer>
    </div>
  );
}