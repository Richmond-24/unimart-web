"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, Cloud, Moon, Flame,
  AlertTriangle, ArrowRight, RefreshCw
} from "lucide-react";
import { apiFetch } from "@/lib/apiClient";
import { useAuth } from "../context/AuthContext";

// --- Utilities ---

function sanitizeName(value?: string | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.toLowerCase();
  const blacklist = ["user", "users", "guest", "guest user", "new user", "unknown", "null", "undefined"];
  if (blacklist.includes(normalized)) return null;
  return trimmed;
}

const getAvatarUrl = (gender?: string, name?: string) => {
  if (gender === 'male') return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&q=80";
  if (gender === 'female') return "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&q=80";
  const initial = name ? name.charAt(0).toUpperCase() : 'U';
  const colors = ['6366f1', 'ec4899', '14b8a6', 'f59e0b', '8b5cf6']; 
  const colorIndex = initial.charCodeAt(0) % colors.length;
  return `https://ui-avatars.com/api/?name=${initial}&background=${colors[colorIndex]}&color=fff&size=128&font-size=0.4&rounded=true`;
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

// --- Modern Design System ---

const TIME_VIBES: Record<string, { 
  label: string; 
  sub: string; 
  icon: React.ReactNode; 
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
  textColor: string;
  subTextColor: string;
}> = {
  morning: {
    label: "Morning",
    sub: "Start strong",
    icon: <Sun size={14} />,
    gradientFrom: "from-amber-50",
    gradientTo: "to-orange-50",
    accentColor: "text-amber-500",
    textColor: "text-gray-900",
    subTextColor: "text-gray-500",
  },
  afternoon: {
    label: "Afternoon",
    sub: "Keep going",
    icon: <Cloud size={14} />,
    gradientFrom: "from-sky-50",
    gradientTo: "to-blue-50",
    accentColor: "text-sky-500",
    textColor: "text-gray-900",
    subTextColor: "text-gray-500",
  },
  evening: {
    label: "Evening",
    sub: "Wind down",
    icon: <Moon size={14} />,
    gradientFrom: "from-indigo-50",
    gradientTo: "to-purple-50",
    accentColor: "text-indigo-500",
    textColor: "text-gray-900",
    subTextColor: "text-gray-500",
  },
  night: {
    label: "Night",
    sub: "Late vibes",
    icon: <Moon size={14} />,
    gradientFrom: "from-slate-900",
    gradientTo: "to-gray-900",
    accentColor: "text-violet-400",
    textColor: "text-white",
    subTextColor: "text-gray-400",
  },
};

function getVibeKey(hour: number) {
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

// --- Compact Modern Card Component ---

export default function Greeting() {
  const { user: authUser } = useAuth();
  const [firstName, setFirstName] = useState<string | null>(null);
  const [userGender, setUserGender] = useState<string | undefined>(undefined);
  const [vibeKey, setVibeKey] = useState<string>("morning");
  const [streakDays, setStreakDays] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const vibe = TIME_VIBES[vibeKey];
  const isNight = vibeKey === 'night';

  // Data fetching logic
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

  // --- Loading State ---
  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto p-3">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-24 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 animate-pulse"
        />
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="w-full max-w-md mx-auto p-3">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-sm font-medium text-red-700 dark:text-red-300">Load error</span>
          </div>
          <button 
            onClick={() => window.dispatchEvent(new Event('unimart:authChanged'))} 
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors"
          >
            <RefreshCw size={14} className="text-red-600 dark:text-red-400" />
          </button>
        </motion.div>
      </div>
    );
  }

  const nameText = firstName || "Friend";
  const avatarUrl = getAvatarUrl(userGender, nameText);

  return (
    <div className="w-full max-w-md mx-auto p-3">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          duration: 0.4, 
          ease: [0.22, 1, 0.36, 1],
          type: "spring",
          stiffness: 300,
          damping: 25
        }}
        className={`
          relative overflow-hidden rounded-2xl 
          bg-gradient-to-br ${vibe.gradientFrom} ${vibe.gradientTo}
          dark:from-gray-900 dark:to-gray-800
          border border-white/20 dark:border-gray-700/50
          shadow-lg shadow-black/5 dark:shadow-black/20
          backdrop-blur-xl
        `}
      >
        {/* Animated gradient orb */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-40 pointer-events-none
            ${isNight ? 'bg-violet-500' : 
              vibeKey === 'morning' ? 'bg-amber-400' : 
              vibeKey === 'afternoon' ? 'bg-sky-400' : 'bg-indigo-400'}
          `}
        />

        <div className="relative z-10 p-4">
          <div className="flex items-center gap-3">
            
            {/* Avatar with animated ring */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative shrink-0"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-white/50 dark:ring-gray-700 shadow-md">
                  <img src={avatarUrl} alt={nameText} className="w-full h-full object-cover" />
                </div>
                
                {/* Streak badge */}
                <AnimatePresence>
                  {streakDays > 0 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-lg px-1.5 py-0.5 shadow-lg border border-orange-100 dark:border-orange-900/50"
                    >
                      <div className="flex items-center gap-0.5">
                        <Flame size={10} className="text-orange-500" fill="currentColor" />
                        <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">{streakDays}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-1.5 mb-1"
              >
                <span className={`${vibe.accentColor}`}>{vibe.icon}</span>
                <span className={`text-xs font-semibold uppercase tracking-wide ${isNight ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {vibe.label}
                </span>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className={`text-xl font-bold leading-tight ${vibe.textColor} truncate`}
              >
                Hi, {nameText}
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`text-xs mt-0.5 ${vibe.subTextColor}`}
              >
                {vibe.sub}
              </motion.p>
            </div>

            {/* CTA Arrow */}
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.9 }}
              className={`shrink-0 p-2 rounded-xl ${isNight ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20'} transition-all`}
            >
              <ArrowRight size={16} className={vibe.accentColor} />
            </motion.button>

          </div>
        </div>

        {/* Subtle bottom gradient line */}
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-${vibeKey === 'night' ? 'violet' : vibeKey === 'morning' ? 'amber' : vibeKey === 'afternoon' ? 'sky' : 'indigo'}-500 to-transparent opacity-50`} />
      </motion.div>
    </div>
  );
}