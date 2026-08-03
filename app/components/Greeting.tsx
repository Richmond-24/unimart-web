"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sun, Cloud, Moon, Flame, Coins,
  ShoppingBag, MessageCircle, Gift,
  AlertTriangle
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

// Helper to get avatar based on gender or name initial
const getAvatarUrl = (gender?: string, name?: string) => {
  if (gender === 'male') return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop";
  if (gender === 'female') return "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop";

  // Fallback to initial-based avatars with consistent colors
  const initial = name ? name.charAt(0).toUpperCase() : 'U';
  const colors = ['6C5CE7', 'FF6B9D', '00D9A3', 'FFB88C', '3B82F6'];
  const colorIndex = initial.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  return `https://ui-avatars.com/api/?name=${initial}&background=${bgColor}&color=fff&size=128&font-size=0.4`;
};

function getDisplayName(user: any): string | null {
  const candidates = [
    user?.displayName,
    user?.fullName,
    user?.name,
    user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null,
    user?.firstName,
    user?.lastName,
    user?.username,
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

// Time-of-day config: icon, label, a gen-z one-liner, and a signature gradient per vibe
const TIME_VIBES: Record<string, { label: string; sub: string; icon: React.ReactNode; gradient: string }> = {
  morning: {
    label: "Good morning",
    sub: "shop smarter, spend less",
    icon: <Sun size={13} />,
    gradient: "from-amber-400 via-orange-400 to-pink-500",
  },
  afternoon: {
    label: "Good afternoon",
    sub: "shop smarter, spend less",
    icon: <Cloud size={13} />,
    gradient: "from-teal-400 via-cyan-400 to-blue-500",
  },
  evening: {
    label: "Good evening",
    sub: "shop smarter, spend less",
    icon: <Moon size={13} />,
    gradient: "from-fuchsia-500 via-purple-500 to-indigo-500",
  },
  night: {
    label: "Good night",
    sub: "shop smarter, spend less",
    icon: <Moon size={13} />,
    gradient: "from-indigo-500 via-violet-600 to-purple-700",
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
  const [firstName, setFirstName] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;

    try {
      const raw = localStorage.getItem("unimart:user");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return getDisplayName(parsed);
    } catch {
      return null;
    }
  });
  const [userGender, setUserGender] = useState<string | undefined>(undefined);
  const [vibeKey, setVibeKey] = useState<string>("morning");
  const [streakDays, setStreakDays] = useState<number>(0);
  const [coins, setCoins] = useState<number | string>("—");
  const [messagesCount, setMessagesCount] = useState<number | string>("—");
  const [offersCount, setOffersCount] = useState<number | string>("—");
  const [cartCount, setCartCount] = useState<number | string>("—");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const vibe = TIME_VIBES[vibeKey];

  useEffect(() => {
    const initialName = getDisplayName(authUser);
    if (initialName) {
      setFirstName(initialName);
    }

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

  // Data Loading logic
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 2;

    async function loadUser() {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('unimart:token');

        if (!token) {
          if (mounted) {
            setLoading(false);
            try {
              const raw = localStorage.getItem("unimart:user");
              if (raw) {
                const lu = JSON.parse(raw);
                const name = getDisplayName(lu);
                if (name) setFirstName(name as string);
                if (lu?.gender) setUserGender(lu.gender);
                setStreakDays(Number(lu?.streakDays || 0));
                setCoins(lu?.coins ?? "—");
                setMessagesCount((Array.isArray(lu?.messages) ? lu.messages.length : (lu?.unreadMessages ?? 0)) || 0);
                setOffersCount(lu?.offersCount ?? 0);
                setCartCount((Array.isArray(lu?.cart) ? lu.cart.length : (lu?.cartCount ?? 0)) || 0);
              }
            } catch (e) {}
          }
          return;
        }

        try {
          const res = await apiFetch('/auth/me', {
            method: 'GET',
            suppressErrorLog: true
          });

          if (!mounted) return;

          const u = res?.user || res?.data || res;

          if (u) {
            try { localStorage.setItem("unimart:user", JSON.stringify(u)); } catch (e) {}
            const name = getDisplayName(u);
            if (name) setFirstName(name as string);
            if (u?.gender) setUserGender(u.gender);
            setStreakDays(Number(u?.streakDays || u?.currentStreak || 0));
            setCoins(u?.coins ?? u?.balance ?? "—");
            setMessagesCount((Array.isArray(u?.messages) ? u.messages.length : (u?.unreadMessages ?? 0)) || 0);
            setOffersCount(u?.offersCount ?? 0);
            setCartCount((Array.isArray(u?.cart) ? u.cart.length : (u?.cartCount ?? 0)) || 0);
          }
        } catch (err: any) {
          console.error('API Error in Greeting:', err);

          if (err.status === 401) {
            localStorage.removeItem('unimart:token');
          } else if (err.status === 0 || err.message?.includes('NetworkError') || err.isNetworkError) {
            if (retryCount < maxRetries && mounted) {
              retryCount++;
              setTimeout(loadUser, 2000 * retryCount);
              return;
            }
            if (mounted) {
              setError('Unable to connect to server.');
            }
          }

          if (mounted) {
            try {
              const raw = localStorage.getItem("unimart:user");
              if (raw) {
                const lu = JSON.parse(raw);
                const name = getDisplayName(lu);
                if (name) setFirstName(name as string);
                if (lu?.gender) setUserGender(lu.gender);
                setStreakDays(Number(lu?.streakDays || 0));
                setCoins(lu?.coins ?? "—");
                setMessagesCount((Array.isArray(lu?.messages) ? lu.messages.length : (lu?.unreadMessages ?? 0)) || 0);
                setOffersCount(lu?.offersCount ?? 0);
                setCartCount((Array.isArray(lu?.cart) ? lu.cart.length : (lu?.cartCount ?? 0)) || 0);
              }
            } catch (e) {}
          }
        }
      } catch (err) {
        console.error('Unexpected error in loadUser:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadUser();

    function onStorage(e: StorageEvent) {
      if (e.key === "unimart:user") loadUser();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("unimart:authChanged", loadUser as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("unimart:authChanged", loadUser as EventListener);
    };
  }, []);

  const handleRetry = () => {
    window.dispatchEvent(new Event('unimart:authChanged'));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="h-[92px] w-full bg-white rounded-3xl animate-pulse border border-gray-100 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-[shimmer_1.4s_infinite]" />
        </div>
        <style jsx>{`
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-xs font-bold text-red-700">Connection Error</span>
          </div>
          <button onClick={handleRetry} className="text-xs font-bold text-red-600 hover:bg-red-100 px-3 py-1 rounded-full transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const nameText = firstName || "Welcome";
  const avatarUrl = getAvatarUrl(userGender, nameText);

  return (
    <div className="max-w-7xl mx-auto px-4 py-2 relative overflow-hidden font-sans">
      {/* Main Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 110, damping: 14 }}
        whileHover={{ y: -3, boxShadow: "0 16px 32px -8px rgba(108, 92, 231, 0.18)" }}
        className="relative bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-gray-100 overflow-hidden group"
      >
        {/* Animated mesh-gradient blobs — the Gen-Z signature backdrop */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${vibe.gradient} opacity-20 rounded-full blur-3xl pointer-events-none`}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 10, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-14 -left-10 w-36 h-36 bg-gradient-to-tr from-teal-400/20 to-fuchsia-400/20 rounded-full blur-3xl pointer-events-none"
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          {/* Left Side: Profile & Greeting */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar with animated gradient ring + streak sticker */}
            <motion.div
              whileHover={{ scale: 1.06, rotate: 4 }}
              whileTap={{ scale: 0.96 }}
              className="relative shrink-0"
            >
              <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${vibe.gradient} p-[2.5px] shadow-md`}>
                <div className="w-full h-full rounded-full bg-white overflow-hidden relative">
                  <img
                    src={avatarUrl}
                    alt={nameText}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {streakDays > 0 && (
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 12 }}
                  className="absolute -top-1.5 -right-1.5 bg-white border border-orange-100 shadow-sm rounded-full px-1.5 py-0.5 flex items-center gap-0.5"
                >
                  <motion.span
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  >
                    <Flame size={10} className="text-orange-500 fill-orange-500" />
                  </motion.span>
                  <span className="text-[9px] font-black text-orange-600">{streakDays}</span>
                </motion.div>
              )}
            </motion.div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="flex items-center gap-1.5 mb-0.5"
              >
                <span className={`flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-br ${vibe.gradient} text-white`}>
                  {vibe.icon}
                </span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{vibe.label}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="flex items-center gap-1.5 text-2xl font-black tracking-tight leading-none truncate"
              >
                <span className="text-gray-900">
                  {nameText}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-[11px] font-medium text-gray-400 truncate"
              >
                {vibe.sub}
              </motion.p>
            </div>
          </div>

          {/* Right Side: Compact Stats Row */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <MiniStat icon={<Coins size={14} />} value={coins} color="text-amber-500" bg="bg-amber-50" delay={0.4} />
            <MiniStat icon={<ShoppingBag size={14} />} value={cartCount} color="text-teal-600" bg="bg-teal-50" delay={0.48} />
            <MiniStat icon={<MessageCircle size={14} />} value={messagesCount} color="text-blue-500" bg="bg-blue-50" delay={0.56} />
            <MiniStat icon={<Gift size={14} />} value={offersCount} color="text-pink-500" bg="bg-pink-50" delay={0.64} />
          </div>
        </div>

      </motion.div>
    </div>
  );
}

function MiniStat({ icon, value, color, bg, delay }: {
  icon: React.ReactNode,
  value: string | number,
  color: string,
  bg: string,
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 16 }}
      whileHover={{ y: -3, scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className={`${bg} rounded-2xl px-2.5 py-1.5 flex flex-col items-center justify-center min-w-[52px] cursor-pointer shrink-0`}
    >
      <div className={color}>{icon}</div>
      <span className="text-[11px] font-black text-gray-900 leading-none mt-0.5">{value}</span>
    </motion.div>
  );
}