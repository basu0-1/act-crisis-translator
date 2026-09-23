"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, MobilityType, TransportType, CompanionType, LanguageType } from "../types";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  mobility: MobilityType;
  transport: TransportType;
  companions: CompanionType;
  language: LanguageType;
  lat?: number;
  lng?: number;
  accessibility_requirements: string[];
  critical_needs: string[];
  notification_preferences: Record<string, boolean>;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  demoLogin: (role: "user" | "admin") => Promise<void>;
  logout: () => void;
  updateUserContext: (updated: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const DEFAULT_DEMO_USER: AuthUser = {
  id: "user-demo-01",
  email: "demo@emergency.ai",
  name: "Demo User",
  role: "user",
  mobility: "limited",
  transport: "walking",
  companions: "none",
  language: "en",
  lat: 28.6139,
  lng: 77.2090,
  accessibility_requirements: ["Step-free access required", "Avoid steep inclines (>8%)", "Paved pathways only"],
  critical_needs: ["Prescription medication kit"],
  notification_preferences: { sound: true, vibrate: true, high_priority: true }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(DEFAULT_DEMO_USER);
  const [token, setToken] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("act_auth_token");
    const savedUser = localStorage.getItem("act_auth_user");
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setIsDemoMode(parsed.email === "demo@emergency.ai");
      } catch (e) {}
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      setToken(data.access_token);
      setUser(data.user);
      setIsDemoMode(data.user.email === "demo@emergency.ai");
      localStorage.setItem("act_auth_token", data.access_token);
      localStorage.setItem("act_auth_user", JSON.stringify(data.user));
      return true;
    } catch (e) {
      console.error("Login failed:", e);
      return false;
    }
  };

  const register = async (formData: any): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) return false;
      const data = await res.json();
      setToken(data.access_token);
      setUser(data.user);
      setIsDemoMode(false);
      localStorage.setItem("act_auth_token", data.access_token);
      localStorage.setItem("act_auth_user", JSON.stringify(data.user));
      return true;
    } catch (e) {
      console.error("Registration failed:", e);
      return false;
    }
  };

  const demoLogin = async (role: "user" | "admin"): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE}/auth/demo-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.access_token);
        setUser(data.user);
        setIsDemoMode(role === "user");
        localStorage.setItem("act_auth_token", data.access_token);
        localStorage.setItem("act_auth_user", JSON.stringify(data.user));
      }
    } catch (e) {
      setUser(role === "admin" ? { ...DEFAULT_DEMO_USER, role: "admin", name: "Admin Architect", email: "admin@emergency.ai" } : DEFAULT_DEMO_USER);
      setIsDemoMode(role === "user");
    }
  };

  const logout = () => {
    setUser(DEFAULT_DEMO_USER);
    setToken(null);
    setIsDemoMode(true);
    localStorage.removeItem("act_auth_token");
    localStorage.removeItem("act_auth_user");
  };

  const updateUserContext = (updated: Partial<AuthUser>) => {
    if (!user) return;
    const merged = { ...user, ...updated };
    setUser(merged);
    localStorage.setItem("act_auth_user", JSON.stringify(merged));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isAdmin: user?.role === "admin",
        isDemoMode,
        setIsDemoMode,
        login,
        register,
        demoLogin,
        logout,
        updateUserContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};