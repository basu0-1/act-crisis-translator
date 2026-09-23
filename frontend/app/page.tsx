"use client";

import React, { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Sidebar, NavTab } from "../components/Sidebar";
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
import { getTranslation } from "../lib/translations";
import {
  fetchSimulationState,
  triggerSimulationEvent,
  resetSimulation,
  updateLanguage,
  getOfflineCachedState,
  recordUserTimelineEvent
} from "../lib/api";
import {
  Building2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Waves,
  Zap,
  Layers,
  Compass,
  Globe,
  ShieldAlert,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function DashboardPage() {
  const { user: authUser, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [state, setState] = useState<SimulationState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isProvenanceOpen, setIsProvenanceOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [showDemoDrawer, setShowDemoDrawer] = useState<boolean>(false);
  const [pendingDashboardAfterLogin, setPendingDashboardAfterLogin] = useState<boolean>(false);

  // Responsive sidebar: auto-collapse on small screens
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

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

  // If user logs out while on dashboard, navigate to home
  useEffect(() => {
    if (!isAuthenticated && activeTab === "dashboard") {
      setActiveTab("home");
    }
  }, [isAuthenticated, activeTab]);

  const currentLanguage: LanguageType = state?.user?.language || "en";
  const t = getTranslation(currentLanguage);

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
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
          ACT CRISIS DECISION LAYER INITIALIZING...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* ==================================================
          1. CHATGPT-STYLE COLLAPSIBLE SIDEBAR
          ================================================== */}
      <Sidebar
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
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        language={currentLanguage}
        state={state}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        showDemoDrawer={showDemoDrawer}
        onToggleDemoDrawer={() => setShowDemoDrawer(!showDemoDrawer)}
      />

      {/* ==================================================
          2. MAIN CONTENT AREA WITH STREAMLINED TOP BAR
          ================================================== */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarOpen ? "lg:pl-64 sm:lg:pl-72" : "lg:pl-0"
        }`}
      >
        {/* Streamlined Top Bar */}
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          language={currentLanguage}
          onLanguageChange={handleLanguageChange}
          state={state}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenProvenance={() => setIsProvenanceOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />

        {/* Offline Banner */}
        <OfflineBanner isOffline={state.is_offline} cachedTimestamp={state.action_plan.timestamp} />

        {/* ==================================================
            VIEW A: LANDING / OVERVIEW PAGES (MULTI-LANGUAGE)
            ================================================== */}
        {activeTab !== "dashboard" ? (
          <div className="flex-1 flex flex-col">
            {/* Hero Section */}
            <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs sm:text-sm font-bold shadow-sm mb-6">
                <span>🛡️</span>
                <span>{t.brandName} — {t.brandTagline}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
                {currentLanguage === "hi"
                  ? "आपातकालीन जानकारी को स्पष्ट व्यक्तिगत निर्णयों में बदलें।"
                  : currentLanguage === "bn"
                  ? "জরুরি সতর্কবার্তাকে স্পষ্ট ব্যক্তিগত পদক্ষেপে রূপান্তর করুন।"
                  : currentLanguage === "or"
                  ? "ଜରୁରୀ ସୂଚନାକୁ ସ୍ପଷ୍ଟ ବ୍ୟକ୍ତିଗତ ନିଷ୍ପତ୍ତିରେ ପରିଣତ କରନ୍ତୁ।"
                  : currentLanguage === "ur"
                  ? "ہنگامی معلومات کو واضح ذاتی فیصلوں میں تبدیل کریں۔"
                  : currentLanguage === "ja"
                  ? "緊急災害情報を、具体的で確実な個人の避難行動へ。"
                  : "Turn emergency information into clear personal decisions."}
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
                {currentLanguage === "hi"
                  ? "ACT वास्तविक समय में आपदा जोखिम का आकलन करता है, सीढ़ी-रहित सुरक्षित निकासी मार्ग खोजता है और नजदीकी आश्रय आवंटित करता है।"
                  : currentLanguage === "bn"
                  ? "ACT রিয়েল-টাইমে ব্যক্তিগত ঝুঁকি মূল্যায়ন করে, সিঁড়িমুক্ত নিরাপদ পথ নির্ধারণ করে এবং আশ্রয়কেন্দ্র বরাদ্দ করে।"
                  : currentLanguage === "or"
                  ? "ACT ରିଅଲ-ଟାଇମରେ ବ୍ୟକ୍ତିଗତ ବିପଦ ଆକଳନ କରେ, ସିଡ଼ିମୁକ୍ତ ସୁରକ୍ଷିତ ରାସ୍ତା ଖୋଜେ ଏବଂ ଆଶ୍ରୟସ୍ଥଳୀ ଆବଣ୍ଟନ କରେ।"
                  : currentLanguage === "ur"
                  ? "ACT حقیقی وقت میں ذاتی خطرے کا جائزہ لیتا ہے اور محفوظ ترین راستہ اور پناہ گاہ فراہم کرتا ہے۔"
                  : currentLanguage === "ja"
                  ? "ACTはリアルタイムに個人の被災リスクを判定し、段差のない安全な避難ルートと指定避難所を即座に特定します。"
                  : "ACT helps people understand emergencies, assess personal risk, find safer routes, and identify nearby shelters in real time."}
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <button
                  onClick={() => navigateToDashboard(false)}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                >
                  <span>{isAuthenticated ? t.emergencyDashboard : t.signIn}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => navigateToDashboard(true)}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-sm shadow-md transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                >
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span>{t.simulationControls}</span>
                </button>
              </div>

              {/* 5-Step Pipeline Grid */}
              <div className="mt-14 max-w-4xl mx-auto">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-3">
                  {t.howItWorks} — 5-Agent Pipeline
                </span>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-sm grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl py-3 px-2 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold text-red-500 dark:text-red-400 tracking-wider">01</span>
                    <span className="text-xs font-black text-red-700 dark:text-red-400 tracking-wide mt-0.5">{t.emergencyAlert.split(" ")[0]}</span>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl py-3 px-2 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400 tracking-wider">02</span>
                    <span className="text-xs font-black text-amber-700 dark:text-amber-400 tracking-wide mt-0.5">{t.riskScore.split(" ")[0]}</span>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-xl py-3 px-2 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold text-blue-500 dark:text-blue-400 tracking-wider">03</span>
                    <span className="text-xs font-black text-blue-700 dark:text-blue-400 tracking-wide mt-0.5">{t.actionDirectives.split(" ")[0]}</span>
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 rounded-xl py-3 px-2 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 tracking-wider">04</span>
                    <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 tracking-wide mt-0.5">{t.tacticalEvacuationMap.split(" ")[0]}</span>
                  </div>

                  <div className="col-span-2 sm:col-span-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl py-3 px-2 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 tracking-wider">05</span>
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 tracking-wide mt-0.5">{t.assignedHaven.split(" ")[0]}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Grid */}
            <section className="py-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Waves className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t.emergencyAlert}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{t.safeRouteDescription}</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Zap className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t.triggerRoadblock}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{t.roadblockDetected}</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Compass className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t.stepFreeVerified}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{t.quickMobilityAdjustment}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* ==================================================
              VIEW B: MINIMAL & ORGANIZED USER DASHBOARD (AUTH-GATED)
              ================================================== */
          <div className="flex-1 flex flex-col">
            {/* If unauthenticated, show Authentication Guard */}
            {!isAuthenticated ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-5">
                  <div className="h-16 w-16 rounded-2xl bg-red-100 dark:bg-red-950/60 border border-red-400 mx-auto flex items-center justify-center">
                    <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      {t.authRequired}
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {t.authRequiredDesc}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition transform hover:-translate-y-0.5"
                  >
                    {t.signIn} / {t.createProfile}
                  </button>
                </div>
              </div>
            ) : (
              /* Authenticated User Dashboard */
              <div className="flex-1 flex flex-col">
                {/* Interactive Simulation Drawer (Collapsible) */}
                {showDemoDrawer && (
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/30 border-b border-indigo-200 dark:border-indigo-800/40 p-4 sm:px-6">
                    <div className="max-w-7xl mx-auto">
                      <SimulationPanel
                        state={state}
                        onTriggerEvent={handleTriggerEvent}
                        onReset={handleReset}
                        isRecalculating={isRecalculating}
                        language={currentLanguage}
                      />
                    </div>
                  </div>
                )}

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
                          {t.emergencyAlert}
                        </h2>
                      </div>
                      <EmergencyAlertCard
                        alert={state.alert}
                        isOffline={state.is_offline}
                        language={currentLanguage}
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
                          {t.personalRiskAssessment}
                        </h2>
                      </div>
                      <PersonalRiskGauge risk={state.risk} language={currentLanguage} />
                    </div>
                  </div>

                  {/* ROW 2: Priority Hero Actions (NOW, NEXT, AVOID + Audio Voice) */}
                  <section className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="h-5 w-5 rounded-full bg-red-600 text-white text-[11px] font-black flex items-center justify-center shadow-md shadow-red-600/40">
                          3
                        </span>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                          {t.priorityActionPlan}
                        </h2>
                      </div>
                      <span className="text-xs bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 px-2 py-0.5 rounded border border-red-300 dark:border-red-700 font-bold uppercase">
                        {t.actionDirectives}
                      </span>
                    </div>

                    <ActionPlanView
                      plan={state.action_plan}
                      routeRec={state.route_recommendation}
                      language={currentLanguage}
                      onOpenProvenance={() => setIsProvenanceOpen(true)}
                    />
                  </section>

                  {/* ROW 3: Safe Evacuation Route Map & Assigned Safe Haven */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Tactical Map */}
                    <div className="lg:col-span-7 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="h-5 w-5 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center">
                          4
                        </span>
                        <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                          {t.tacticalEvacuationMap}
                        </h2>
                      </div>
                      <EmergencyMap
                        user={state.user}
                        alert={state.alert}
                        roads={state.roads}
                        shelters={state.shelters}
                        routeRec={state.route_recommendation}
                        isRecalculating={isRecalculating}
                        language={currentLanguage}
                      />
                    </div>

                    {/* Shelter Details */}
                    <div className="lg:col-span-5 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="h-5 w-5 rounded-full bg-cyan-600 text-white text-[11px] font-black flex items-center justify-center">
                          5
                        </span>
                        <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                          {t.assignedHaven}
                        </h2>
                      </div>

                      {state.route_recommendation.destination ? (
                        <div className="bg-white dark:bg-slate-900 border border-cyan-500/40 rounded-2xl p-5 shadow-lg space-y-4 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-xl bg-cyan-100 dark:bg-cyan-950 border border-cyan-500/50 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 tracking-wider">
                                  {t.assignedHaven}
                                </span>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                                  {state.route_recommendation.destination.name}
                                </h3>
                              </div>
                            </div>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold uppercase border border-emerald-300 dark:border-emerald-500/40">
                              {state.route_recommendation.destination.status}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {state.route_recommendation.destination.address}
                          </p>

                          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200 dark:border-slate-800 text-xs">
                            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">
                                Available Capacity
                              </span>
                              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                {state.route_recommendation.destination.capacity - state.route_recommendation.destination.current_occupancy} open slots
                              </span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">
                                {t.mobility}
                              </span>
                              <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                                {state.route_recommendation.destination.is_accessible ? `✓ ${t.stepFreeVerified}` : "Standard"}
                              </span>
                            </div>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-950/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                            <span className="font-bold text-slate-900 dark:text-white block text-[11px] uppercase">
                              Reception Advisory
                            </span>
                            <p>• {t.stepFreeVerified}</p>
                            <p>• Emergency medical staff on standby for mobility support.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl text-xs text-slate-500">
                          Shelter information currently unavailable.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ROW 4: Quick Mobility & Household Adjustment */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {t.quickMobilityAdjustment}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {t.safeRouteDescription}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {(["normal", "limited", "wheelchair"] as MobilityType[]).map((mob) => (
                          <button
                            key={mob}
                            onClick={() => handleQuickMobilityChange(mob)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                              (authUser?.mobility || state.user.mobility) === mob
                                ? "bg-red-600 text-white shadow-sm"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                          >
                            {mob === "wheelchair" ? `♿ ${t.wheelchairMobility}` : mob === "limited" ? `🚶 ${t.limitedMobility}` : `🏃 ${t.normalMobility}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <UserProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={state.user}
          onUpdateUser={handleUpdateUser}
          language={currentLanguage}
        />

        <SourceProvenanceModal
          isOpen={isProvenanceOpen}
          onClose={() => setIsProvenanceOpen(false)}
          provenance={state.alert.provenance}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          language={currentLanguage}
        />

        <AdminDashboard
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
        />

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-5 text-center text-xs text-slate-500">
          <p>{t.brandName} — {t.brandTagline} © 2026. {t.verifiedOfficialSource}.</p>
        </footer>
      </div>
    </div>
  );
}