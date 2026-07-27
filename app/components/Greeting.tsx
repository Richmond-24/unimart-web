"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, Cloud, Moon, Flame, Coins,
  ShoppingBag, MessageCircle, Gift,
  Trophy, AlertTriangle, Sparkles, Zap
} from "lucide-react";
import { apiFetch } from "@/lib/apiClient";

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

// Friendly emojis that cycle in the greeting wave
const FRIENDLY_EMOJIS = ["👋", "😊", "🤗"];

// Time-of-day config: icon, label, a gen-z one-liner, and a signature gradient per vibe
const TIME_VIBES: Record<string, { label: string; sub: string; icon: React.ReactNode; gradient: string }> = {
  morning: {
    label: "Good morning",
    sub: "rise & grind ✨",
    icon: <Sun size={13} />,
    gradient: "from-amber-400 via-orange-400 to-pink-500",
  },
  afternoon: {
    label: "Good afternoon",
    sub: "keep that energy 🔥",
    icon: <Cloud size={13} />,
    gradient: "from-teal-400 via-cyan-400 to-blue-500",
  },
  evening: {
    label: "Good evening",
    sub: "main character hour 🌇",
    icon: <Moon size={13} />,
    gradient: "from-fuchsia-500 via-purple-500 to-indigo-500",
  },
  night: {
    label: "Good night",
    sub: "night owl energy 🦉",
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
  const [firstName, setFirstName] = useState<string | null>(null);
  const [userGender, setUserGender] = useState<string | undefined>(undefined);
  const [vibeKey, setVibeKey] = useState<string>("morning");
  const [streakDays, setStreakDays] = useState<number>(0);
  const [coins, setCoins] = useState<number | string>("—");
  const [messagesCount, setMessagesCount] = useState<number | string>("—");
  const [offersCount, setOffersCount] = useState<number | string>("—");
  const [cartCount, setCartCount] = useState<number | string>("—");
  const [xp, setXp] = useState<number>(0);
  const [xpToNext, setXpToNext] = useState<number>(500);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [justLeveled, setJustLeveled] = useState(false);
  const [emojiIndex, setEmojiIndex] = useState(0);
  const xpPercent = xpToNext > 0 ? Math.min(100, Math.round((xp / xpToNext) * 100)) : 0;
  const vibe = TIME_VIBES[vibeKey];

  // Cycle through friendly emojis every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setEmojiIndex((prev) => (prev + 1) % FRIENDLY_EMOJIS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // XP Persistence logic
  useEffect(() => {
    const stored = localStorage.getItem("unimart:xp");
    const lastDate = localStorage.getItem("unimart:xp-date");
    const today = new Date().toDateString();
    let currentXp = 0;
    if (stored) currentXp = parseInt(stored, 10) || 0;
    if (lastDate !== today) {
      currentXp += 50;
      localStorage.setItem("unimart:xp-date", today);
      setJustLeveled(true);
      setTimeout(() => setJustLeveled(false), 2600);
    }
    localStorage.setItem("unimart:xp", String(currentXp));
    setXp(currentXp);
    setXpToNext(500);
  }, []);

  // Time-of-day logic
  useEffect(() => {
    try {
      const raw = localStorage.getItem("unimart:user");
      if (raw) {
        const u = JSON.parse(raw);
        const name = u?.firstName || (u?.name ? String(u.name).split(" ")[0] : null);
        if (name) setFirstName(name);
        if (u?.gender) setUserGender(u.gender);
      }
    } catch (e) {}
    setVibeKey(getVibeKey(new Date().getHours()));
  }, []);

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
                const name = lu?.firstName || (lu?.name ? String(lu.name).split(" ")[0] : null);
                if (name) setFirstName(name as string);
                if (lu?.gender) setUserGender(lu.gender);
                setStreakDays(Number(lu?.streakDays || 0));
                setCoins(lu?.coins ?? "—");
                setMessagesCount((Array.isArray(lu?.messages) ? lu.messages.length : (lu?.unreadMessages ?? 0)) || 0);
                setOffersCount(lu?.offersCount ?? 0);
                setCartCount((Array.isArray(lu?.cart) ? lu.cart.length : (lu?.cartCount ?? 0)) || 0);
                const storedXp = parseInt(localStorage.getItem("unimart:xp") || "0", 10);
                setXp(storedXp || Number(lu?.xp || 0));
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
            const name = u?.firstName || (u?.name ? String(u.name).split(" ")[0] : null);
            if (name) setFirstName(name as string);
            if (u?.gender) setUserGender(u.gender);
            setStreakDays(Number(u?.streakDays || u?.currentStreak || 0));
            setCoins(u?.coins ?? u?.balance ?? "—");
            setMessagesCount((Array.isArray(u?.messages) ? u.messages.length : (u?.unreadMessages ?? 0)) || 0);
            setOffersCount(u?.offersCount ?? 0);
            setCartCount((Array.isArray(u?.cart) ? u.cart.length : (u?.cartCount ?? 0)) || 0);
            const storedXp = parseInt(localStorage.getItem("unimart:xp") || "0", 10);
            const serverXp = Number(u?.xp || 0);
            setXp(storedXp > 0 ? storedXp : serverXp);
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
                const name = lu?.firstName || (lu?.name ? String(lu.name).split(" ")[0] : null);
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

  const nameText = firstName || "User";
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

        {/* Level-up sparkle burst — fires once when the daily XP bump lands */}
        <AnimatePresence>
          {justLeveled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -8 }}
              className="absolute top-3 right-3 z-20 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 px-2.5 py-1 shadow-lg shadow-pink-500/20"
            >
              <Sparkles size={11} className="text-white" />
              <span className="text-[10px] font-black text-white tracking-tight">+50 XP today!</span>
            </motion.div>
          )}
        </AnimatePresence>

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
                <AnimatePresence mode="wait">
                  <motion.span
                    key={emojiIndex}
                    initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                    animate={{ opacity: 1, scale: 1, rotate: [0, 18, -8, 18, 0] }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
                    transition={{
                      opacity: { duration: 0.25 },
                      scale: { duration: 0.25 },
                      rotate: { duration: 1.2, ease: "easeInOut" },
                    }}
                    className="inline-block origin-[70%_70%]"
                  >
                    {FRIENDLY_EMOJIS[emojiIndex]}
                  </motion.span>
                </AnimatePresence>
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

        {/* Bottom Section: XP Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="mt-3 pt-3 border-t border-gray-50 relative z-10"
        >
          <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center gap-1.5">
              <Trophy size={11} className="text-amber-500" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Campus Legend</span>
              {xpPercent >= 100 && (
                <motion.span
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="flex items-center gap-0.5 text-[9px] font-black text-white bg-orange-500 px-1.5 py-0.5 rounded-full"
                >
                  <Zap size={8} /> MAXED
                </motion.span>
              )}
            </div>
            <span className="text-[10px] font-mono font-bold text-gray-400">
              {xp} / {xpToNext} XP
            </span>
          </div>

          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1.4, ease: "circOut", delay: 0.9 }}
              className={`h-full bg-gradient-to-r ${vibe.gradient} relative rounded-full`}
            >
              <motion.div
                animate={{ x: ["-100%", "150%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-1/3 bg-white/40 skew-x-12"
              />
            </motion.div>
          </div>
        </motion.div>

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