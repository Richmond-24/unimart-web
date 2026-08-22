"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sun, Cloud, Moon, Flame,
  AlertTriangle, Sparkles
} from "lucide-react";
import { apiFetch } from "@/lib/apiClient";
import { useAuth } from "../context/AuthContext";

function sanitizeName(value?: string | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.toLowerCase();
  if (["user", "users", "guest", "guest user", "new user", "unknown", "null", "undefined"].includes(normalized)) {
    return null;
  }
  return trimmed;
}

const getAvatarUrl = (gender?: string, name?: string) => {
  if (gender === 'male') return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop";
  if (gender === 'female') return "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop";
  const initial = name ? name.charAt(0).toUpperCase() : 'U';
  const colors = ['6C5CE7', 'FF6B9D', '00D9A3', 'FFB88C', '3B82F6'];
  const colorIndex = initial.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];
  return `https://ui-avatars.com/api/?name=${initial}&background=${bgColor}&color=fff&size=128&font-size=0.4`;
};

function getDisplayName(user: any): string | null {
  const candidates = [
    user?.displayName, user?.fullName, user?.name,
    user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null,
    user?.firstName, user?.lastName, user?.username,
  ];
  for (const candidate of candidates) {
    const cleaned = sanitizeName(candidate);
    if (cleaned) return cleaned;
  }
  const email = user?.email;
  if (typeof email === "string" && email.includes("@")) {
    const localPart = email.split("@")[0].trim();
    const cleanedEmailName = sanitizeName(localPart);
    if (cleanedEmailName) return cleanedEmailName;
  }
  return null;
}

const TIME_VIBES: Record<string, { label: string; sub: string; icon: React.ReactNode; gradient: string; accent: string }> = {
  morning: {
    label: "Good morning",
    sub: "Start your day with great deals",
    icon: <Sun size={16} />,
    gradient: "from-amber-100 via-orange-50 to-white",
    accent: "text-orange-500",
  },
  afternoon: {
    label: "Good afternoon",
    sub: "Keep the momentum going",
    icon: <Cloud size={16} />,
    gradient: "from-teal-50 via-cyan-50 to-white",
    accent: "text-teal-600",
  },
  evening: {
    label: "Good evening",
    sub: "Time to unwind & browse",
    icon: <Moon size={16} />,
    gradient: "from-indigo-50 via-purple-50 to-white",
    accent: "text-indigo-600",
  },
  night: {
    label: "Good night",
    sub: "Late night finds await",
    icon: <Moon size={16} />,
    gradient: "from-slate-900 via-slate-800 to-slate-900",
    accent: "text-slate-200",
  },
};

function getVibeKey(hour: number) {
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

export default function Greeting() {
  const { user: authUser } = useAuth();
  const [firstName, setFirstName] = useState<string | null>(null);
  const [userGender, setUserGender] = useState<string | undefined>(undefined);
  const [vibeKey, setVibeKey] = useState<string>("morning");
  
  // Stats
  const [streakDays, setStreakDays] = useState<number>(0);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const vibe = TIME_VIBES[vibeKey];
  const isDarkMode = vibeKey === 'night';

  useEffect(() => {
    const initialName = getDisplayName(authUser);
    if (initialName) setFirstName(initialName);

    try {
      const raw = localStorage.getItem("unimart:user");
      if (raw) {
        const u = JSON.parse(raw);
        const name = getDisplayName(u);
        if (name) setFirstName(name);
        if (u?.gender) setUserGender(u.gender);
      }
    } catch (e) {}
    setVibeKey(getVibeKey(new Date().getHours()));
  }, [authUser]);

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('unimart:token');

        // Helper to update state from data object
        const updateStateFromData = (u: any) => {
            if (!u) return;
            try { localStorage.setItem("unimart:user", JSON.stringify(u)); } catch (e) {}
            const name = getDisplayName(u);
            if (name) setFirstName(name as string);
            if (u?.gender) setUserGender(u.gender);
            setStreakDays(Number(u?.streakDays || u?.currentStreak || 0));
        };

        if (!token) {
          if (mounted) {
            setLoading(false);
            try {
              const raw = localStorage.getItem("unimart:user");
              if (raw) updateStateFromData(JSON.parse(raw));
            } catch (e) {}
          }
          return;
        }

        try {
          const res = await apiFetch('/auth/me', { method: 'GET', suppressErrorLog: true });
          if (!mounted) return;
          const u = res?.user || res?.data || res;
          if (u) updateStateFromData(u);
        } catch (err: any) {
          if (mounted) {
             // Fallback to local storage on error
             try {
                const raw = localStorage.getItem("unimart:user");
                if (raw) updateStateFromData(JSON.parse(raw));
             } catch (e) {}
             
             if (err.status === 401) localStorage.removeItem('unimart:token');
             else setError('Connection failed');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    
    loadUser();

    const onStorage = (e: StorageEvent) => { if (e.key === "unimart:user") loadUser(); };
    window.addEventListener("storage", onStorage);
    window.addEventListener("unimart:authChanged", loadUser as EventListener);
    return () => {
      mounted = false;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("unimart:authChanged", loadUser as EventListener);
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="h-[140px] w-full bg-gray-100 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-sm font-medium text-red-700">Unable to load profile</span>
          </div>
          <button onClick={() => window.dispatchEvent(new Event('unimart:authChanged'))} className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1.5 rounded-full">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const nameText = firstName || "Friend";
  const avatarUrl = getAvatarUrl(userGender, nameText);

  return (
    <div className={`max-w-7xl mx-auto px-4 py-4 font-sans transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      
      {/* Main Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-[2rem] shadow-xl shadow-black/5 bg-gradient-to-br ${vibe.gradient} border ${isDarkMode ? 'border-white/10' : 'border-white/60'}`}
      >
        {/* Decorative Background Elements */}
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${vibe.gradient} opacity-50 blur-3xl -translate-y-1/2 translate-x-1/4`} />
        
        <div className="relative z-10 p-5 sm:p-6">
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Avatar Section */}
            <div className="relative group cursor-pointer shrink-0">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 ${isDarkMode ? 'border-white/20' : 'border-white'} shadow-lg transform transition-transform group-hover:scale-105`}>
                <img src={avatarUrl} alt={nameText} className="w-full h-full object-cover" />
              </div>
              {streakDays > 0 && (
                <div className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 text-orange-500 rounded-full px-2 py-1 shadow-md flex items-center gap-1 border border-orange-100 dark:border-orange-900/30 z-20">
                  <Flame size={12} fill="currentColor" />
                  <span className="text-[10px] font-black">{streakDays}</span>
                </div>
              )}
            </div>

            {/* Text Content - Full Width Now */}
            <div className="flex-1 min-w-0 pt-1">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'bg-white/10 text-white/80' : 'bg-black/5 text-gray-600'}`}>
                {vibe.icon}
                <span>{vibe.label}</span>
              </div>
              
              {/* NAME IS NOW THE MAIN FOCUS */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight truncate leading-tight drop-shadow-sm">
                Hi, {nameText} 
                <Sparkles size={28} className={`inline-block ml-2 mb-1 ${vibe.accent}`} />
              </h1>
              
              <p className={`text-sm sm:text-base mt-2 font-medium max-w-md ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                {vibe.sub}
              </p>
            </div>

          </div>
        </div>
      </motion.div>

    </div>
  );
}