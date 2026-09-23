"use client";

import React, { useState } from "react";
import { User, Lock, Mail, ShieldCheck, X, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { MobilityType, TransportType } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, demoLogin } = useAuth();
  const [tab, setTab] = useState<"login" | "register" | "demo">("demo");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mobility, setMobility] = useState<MobilityType>("limited");
  const [transport, setTransport] = useState<TransportType>("walking");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      onClose();
    } else {
      setError("Invalid email or password. Please try again.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const success = await register({
      email,
      password,
      name,
      mobility,
      transport,
      companions: "none",
      language: "en",
    });
    setLoading(false);
    if (success) {
      onClose();
    } else {
      setError("Registration failed. Please check inputs.");
    }
  };

  const handleDemoAccess = async (role: "user" | "admin") => {
    setLoading(true);
    await demoLogin(role);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 dark:bg-slate-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="h-5 w-5 text-red-500" />
            <h3 className="font-bold text-base text-white">
              ACT Account & Access Control
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1 text-xs font-semibold">
          <button
            onClick={() => { setTab("demo"); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition ${
              tab === "demo" ? "bg-red-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            ⚡ 1-Click Demo Access
          </button>
          <button
            onClick={() => { setTab("login"); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition ${
              tab === "login" ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab("register"); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition ${
              tab === "register" ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Create Profile
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="bg-red-950/60 border border-red-500/50 p-2.5 rounded-lg text-xs text-red-300">
              {error}
            </div>
          )}

          {/* ⚡ TAB 1: 1-Click Demo Access */}
          {tab === "demo" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Instantly switch roles to test end-user emergency routing or developer database management:
              </p>

              <button
                onClick={() => handleDemoAccess("user")}
                disabled={loading}
                className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-700 p-3.5 rounded-xl flex items-center justify-between text-left transition group"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-amber-400" />
                    <span className="font-bold text-sm text-white">End User (Demo Profile)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Limited mobility, step-free evacuation routing to Shelter B.
                  </p>
                </div>
                <span className="text-xs text-amber-400 font-bold group-hover:translate-x-1 transition">
                  Select →
                </span>
              </button>

              <button
                onClick={() => handleDemoAccess("admin")}
                disabled={loading}
                className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-700 p-3.5 rounded-xl flex items-center justify-between text-left transition group"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 text-cyan-400" />
                    <span className="font-bold text-sm text-white">Developer / Admin Console</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Full database table management, live alert broadcasting & audit logs.
                  </p>
                </div>
                <span className="text-xs text-cyan-400 font-bold group-hover:translate-x-1 transition">
                  Select →
                </span>
              </button>
            </div>
          )}

          {/* 🔑 TAB 2: Sign In */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Password</label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-lg transition text-xs shadow-lg mt-2"
              >
                {loading ? "Authenticating..." : "Sign In"}
              </button>
            </form>
          )}

          {/* 📝 TAB 3: Create Real User Account */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Elena Vance"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena@example.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Mobility Level</label>
                <select
                  value={mobility}
                  onChange={(e) => setMobility(e.target.value as MobilityType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                >
                  <option value="normal">Normal Walking Pace</option>
                  <option value="limited">Limited Walking (Avoid Stairs)</option>
                  <option value="wheelchair">Wheelchair User (Step-free Mandatory)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-lg transition text-xs shadow-lg mt-2"
              >
                {loading ? "Creating Profile..." : "Create Personalized Profile"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};