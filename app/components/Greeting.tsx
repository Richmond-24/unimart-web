"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Sun, Cloud, Moon, Flame, Coins,
  ShoppingBag, MessageCircle, Gift, ChevronRight
} from "lucide-react";
import apiClient from "../../lib/apiClient";

// Fix: Use proper Framer Motion types with 'as any' workaround for ease
const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
      duration: 0.45,
      ease: "easeOut" as any,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as any },
  },
};

export default function Greeting() {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("Welcome");
  const [timeIcon, setTimeIcon] = useState<React.ReactNode>(null);
  const [streakDays, setStreakDays] = useState<number>(0);
  const [coins, setCoins] = useState<number | string>("—");
  const [messagesCount, setMessagesCount] = useState<number | string>("—");
  const [offersCount, setOffersCount] = useState<number | string>("—");
  const [cartCount, setCartCount] = useState<number | string>("—");
  const [xp, setXp] = useState<number>(0);
  const [xpToNext, setXpToNext] = useState<number>(500);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const xpPercent = xpToNext > 0 ? Math.min(100, Math.round((xp / xpToNext) * 100)) : 0;

  // Load and accumulate persistent XP on mount
  useEffect(() => {
    const stored = localStorage.getItem("unimart:xp");
    const lastDate = localStorage.getItem("unimart:xp-date");
    const today = new Date().toDateString();

    let currentXp = 0;
    if (stored) {
      currentXp = parseInt(stored, 10) || 0;
    }

    if (lastDate !== today) {
      currentXp += 50; // daily login bonus
      localStorage.setItem("unimart:xp-date", today);
    }

    localStorage.setItem("unimart:xp", String(currentXp));
    setXp(currentXp);
    setXpToNext(500);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("unimart:user");
      if (raw) {
        const u = JSON.parse(raw);
        const name = u?.firstName || (u?.name ? String(u.name).split(" ")[0] : null);
        if (name) setFirstName(name);
      }
    } catch (e) {
      // ignore
    }

    const h = new Date().getHours();
    if (h < 12) {
      setGreeting("Good morning");
      setTimeIcon(<Sun size={14} />);
    } else if (h < 17) {
      setGreeting("Good afternoon");
      setTimeIcon(<Cloud size={14} />);
    } else if (h < 21) {
      setGreeting("Good evening");
      setTimeIcon(<Moon size={14} />);
    } else {
      setGreeting("Good night");
      setTimeIcon(<Moon size={14} />);
    }
  }, []);

  // Load live user data
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 2;

    async function loadUser() {
      try {
        setLoading(true);
        setError(null);
        
        // Check if token exists
        const token = localStorage.getItem('unimart:token');
        if (!token) {
          if (mounted) {
            setLoading(false);
            // Try to load from localStorage
            try {
              const raw = localStorage.getItem("unimart:user");
              if (raw) {
                const lu = JSON.parse(raw);
                const name = lu?.firstName || (lu?.name ? String(lu.name).split(" ")[0] : null);
                if (name) setFirstName(name as string);
                setStreakDays(Number(lu?.streakDays || 0));
                setCoins(lu?.coins ?? "—");
                setMessagesCount((Array.isArray(lu?.messages) ? lu.messages.length : (lu?.unreadMessages ?? 0)) || 0);
                setOffersCount(lu?.offersCount ?? 0);
                setCartCount((Array.isArray(lu?.cart) ? lu.cart.length : (lu?.cartCount ?? 0)) || 0);
                const storedXp = parseInt(localStorage.getItem("unimart:xp") || "0", 10);
                setXp(storedXp || Number(lu?.xp || 0));
                setXpToNext(500);
              }
            } catch (e) {
              // ignore
            }
          }
          return;
        }

        // ✅ FIXED: Use apiClient as a function, not .get()
        try {
          const res = await apiClient('/auth/me', {
            method: 'GET',
            suppressErrorLog: true // Suppress logging for this call
          });
          
          if (!mounted) return;
          
          const u = res?.user || res?.data || res;
          if (u) {
            try { localStorage.setItem("unimart:user", JSON.stringify(u)); } catch (e) {}
            const name = u?.firstName || (u?.name ? String(u.name).split(" ")[0] : null);
            if (name) setFirstName(name as string);

            setStreakDays(Number(u?.streakDays || u?.currentStreak || u?.currentStreakDays || 0));
            setCoins(u?.coins ?? u?.balance ?? "—");
            setMessagesCount((Array.isArray(u?.messages) ? u.messages.length : (u?.unreadMessages ?? 0)) || 0);
            setOffersCount(u?.offersCount ?? u?.flashSalesPurchases ?? 0);
            setCartCount((Array.isArray(u?.cart) ? u.cart.length : (u?.cartCount ?? 0)) || 0);

            const storedXp = parseInt(localStorage.getItem("unimart:xp") || "0", 10);
            const serverXp = Number(u?.xp || 0);
            setXp(storedXp > 0 ? storedXp : serverXp);
            setXpToNext(500);
          }
        } catch (err: any) {
          // Handle specific error cases silently
          if (err.status === 401) {
            // Unauthorized - token invalid
            localStorage.removeItem('unimart:token');
            if (mounted) {
              // Try to load from localStorage
              try {
                const raw = localStorage.getItem("unimart:user");
                if (raw) {
                  const lu = JSON.parse(raw);
                  const name = lu?.firstName || (lu?.name ? String(lu.name).split(" ")[0] : null);
                  if (name) setFirstName(name as string);
                  setStreakDays(Number(lu?.streakDays || 0));
                  setCoins(lu?.coins ?? "—");
                  setMessagesCount((Array.isArray(lu?.messages) ? lu.messages.length : (lu?.unreadMessages ?? 0)) || 0);
                  setOffersCount(lu?.offersCount ?? 0);
                  setCartCount((Array.isArray(lu?.cart) ? lu.cart.length : (lu?.cartCount ?? 0)) || 0);
                  const storedXp = parseInt(localStorage.getItem("unimart:xp") || "0", 10);
                  setXp(storedXp || Number(lu?.xp || 0));
                  setXpToNext(500);
                }
              } catch (e) {
                // ignore
              }
            }
          } else if (err.status === 0) {
            // Network error - retry
            if (retryCount < maxRetries && mounted) {
              retryCount++;
              setTimeout(loadUser, 2000 * retryCount);
              return;
            }
            // Silent fail - don't show error
          } else {
            // Other errors - silent fail, use localStorage
            if (mounted) {
              try {
                const raw = localStorage.getItem("unimart:user");
                if (raw) {
                  const lu = JSON.parse(raw);
                  const name = lu?.firstName || (lu?.name ? String(lu.name).split(" ")[0] : null);
                  if (name) setFirstName(name as string);
                  setStreakDays(Number(lu?.streakDays || 0));
                  setCoins(lu?.coins ?? "—");
                  setMessagesCount((Array.isArray(lu?.messages) ? lu.messages.length : (lu?.unreadMessages ?? 0)) || 0);
                  setOffersCount(lu?.offersCount ?? 0);
                  setCartCount((Array.isArray(lu?.cart) ? lu.cart.length : (lu?.cartCount ?? 0)) || 0);
                  const storedXp = parseInt(localStorage.getItem("unimart:xp") || "0", 10);
                  setXp(storedXp || Number(lu?.xp || 0));
                  setXpToNext(500);
                }
              } catch (e) {
                // ignore
              }
            }
          }
        }
      } catch (err) {
        // Silent fail - don't show error
        if (mounted) {
          // Try localStorage as fallback
          try {
            const raw = localStorage.getItem("unimart:user");
            if (raw) {
              const lu = JSON.parse(raw);
              const name = lu?.firstName || (lu?.name ? String(lu.name).split(" ")[0] : null);
              if (name) setFirstName(name as string);
              setStreakDays(Number(lu?.streakDays || 0));
              setCoins(lu?.coins ?? "—");
              setMessagesCount((Array.isArray(lu?.messages) ? lu.messages.length : (lu?.unreadMessages ?? 0)) || 0);
              setOffersCount(lu?.offersCount ?? 0);
              setCartCount((Array.isArray(lu?.cart) ? lu.cart.length : (lu?.cartCount ?? 0)) || 0);
              const storedXp = parseInt(localStorage.getItem("unimart:xp") || "0", 10);
              setXp(storedXp || Number(lu?.xp || 0));
              setXpToNext(500);
            }
          } catch (e) {
            // ignore
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
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

  const slangResponses = [
    "absolute legend!", "let's go!", "elite energy!", "main character!",
    "built different!", "top tier!", "that's the move!", "no cap!", "straight fire!"
  ];

  const [slang, setSlang] = useState("");
  const [showSlang, setShowSlang] = useState(false);

  const handleAvatarClick = () => {
    const randomSlang = slangResponses[Math.floor(Math.random() * slangResponses.length)];
    setSlang(randomSlang);
    setShowSlang(true);
    setTimeout(() => setShowSlang(false), 1800);
  };

  // Retry loading user data
  const handleRetry = () => {
    window.dispatchEvent(new Event('unimart:authChanged'));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-5 py-6 sm:px-7 sm:py-8 min-h-[152px] flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="bg-white rounded-3xl border border-red-200 shadow-sm px-5 py-6 sm:px-7 sm:py-8 min-h-[152px] flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-600">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
              <span className="text-lg">⚠️</span>
            </div>
            <span className="text-sm">{error}</span>
          </div>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <motion.div
        initial={{ opacity: 0, y: -14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 px-5 py-6 sm:px-7 sm:py-8 min-h-[152px] sm:min-h-[176px] flex flex-col justify-center"
      >
        {/* Decorative ambient glow */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gradient-to-br from-emerald-200/40 to-teal-200/30 blur-3xl"
          animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-14 left-10 w-40 h-40 rounded-full bg-amber-100/40 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative flex items-center gap-4"
        >
          {/* Avatar */}
          <motion.button
            variants={itemVariants}
            onClick={handleAvatarClick}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="relative flex-shrink-0"
          >
            <motion.div
              animate={{ boxShadow: ["0 0 0 0 rgba(16,185,129,0.35)", "0 0 0 8px rgba(16,185,129,0)"] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-lg font-bold shadow-sm ring-2 ring-white font-display"
            >
              {firstName ? firstName.charAt(0).toUpperCase() : "U"}
            </motion.div>
            {streakDays > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 400, damping: 12 }}
                className="absolute -bottom-0.5 -right-0.5 bg-orange-500 rounded-full w-4.5 h-4.5 flex items-center justify-center ring-2 ring-white"
              >
                <Flame size={9} className="text-white" />
              </motion.div>
            )}

            <AnimatePresence>
              {showSlang && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.9 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap shadow-lg z-10"
                >
                  {slang}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Greeting + name */}
          <div className="min-w-0 flex-1">
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-1 text-gray-400 text-[10px] font-semibold uppercase tracking-[0.15em]"
            >
              {timeIcon}
              <span>{greeting}</span>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="font-display text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-3xl sm:text-4xl font-extrabold truncate leading-tight tracking-tight mt-0.5"
            >
              {firstName ? `Hey ${firstName}` : "Welcome to Uni-Mart"}
            </motion.div>
          </div>

          {/* Compact stat pills — desktop/tablet */}
          <motion.div variants={itemVariants} className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
            <StatPill icon={<Coins size={12} />} value={typeof coins === "number" ? coins.toLocaleString() : coins} tone="amber" />
            <StatPill icon={<ShoppingBag size={12} />} value={cartCount} tone="teal" />
            <StatPill icon={<MessageCircle size={12} />} value={messagesCount} tone="blue" />
            <StatPill icon={<Gift size={12} />} value={offersCount} tone="rose" />
          </motion.div>

          {/* Coins only on mobile to save space */}
          <motion.div
            variants={itemVariants}
            className="flex sm:hidden items-center gap-1 flex-shrink-0 bg-amber-50 text-amber-700 rounded-full px-2.5 py-1.5 text-xs font-bold"
          >
            <Coins size={12} />
            <span>{typeof coins === "number" ? coins.toLocaleString() : coins}</span>
          </motion.div>

          <ChevronRight size={16} className="text-gray-300 flex-shrink-0 hidden sm:block" />
        </motion.div>

        {/* Slim XP bar */}
        <div className="relative mt-4 flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 0.9, delay: 0.35, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-white/30"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              />
            </motion.div>
          </div>
          <span className="text-[10px] text-gray-400 font-mono font-semibold flex-shrink-0 flex items-center gap-0.5">
            <Zap size={9} />
            {xp}/{xpToNext}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

function StatPill({
  icon,
  value,
  tone,
}: {
  icon: React.ReactNode;
  value: number | string;
  tone: "amber" | "teal" | "blue" | "rose";
}) {
  const tones: Record<string, string> = {
    amber: "bg-amber-50 text-amber-700",
    teal: "bg-teal-50 text-teal-700",
    blue: "bg-blue-50 text-blue-700",
    rose: "bg-rose-50 text-rose-700",
  };
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-bold ${tones[tone]}`}
    >
      {icon}
      <span>{value}</span>
    </motion.div>
  );
}