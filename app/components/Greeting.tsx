
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Sun, Cloud, Moon, Flame, Coins,
  ShoppingBag, MessageCircle, Gift, ChevronRight
} from "lucide-react";
import apiFetch from "../../lib/apiClient";

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
    async function loadUser() {
      try {
        const res = await apiFetch("/auth/me");
        const u = res?.user || res?.data || null;
        if (!mounted) return;
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
        } else {
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
          } catch (e) {}
        }
      } catch (e) {
        // ignore failures; keep defaults
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 sm:px-5 sm:py-4"
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <motion.button
            onClick={handleAvatarClick}
            whileTap={{ scale: 0.92 }}
            className="relative flex-shrink-0"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-base font-bold shadow-sm ring-2 ring-white">
              {firstName ? firstName.charAt(0).toUpperCase() : "U"}
            </div>
            {streakDays > 0 && (
              <div className="absolute -bottom-0.5 -right-0.5 bg-orange-500 rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                <Flame size={9} className="text-white" />
              </div>
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
            <div className="flex items-center gap-1 text-gray-400 text-[10px] font-semibold uppercase tracking-wider">
              {timeIcon}
              <span>{greeting}</span>
            </div>
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-emerald-600 text-2xl sm:text-3xl font-extrabold truncate leading-tight tracking-tight"
            >
              {firstName ? firstName : "Welcome to Unimart"}
            </motion.div>
          </div>

          {/* Compact stat pills — desktop/tablet */}
          <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
            <StatPill icon={<Coins size={12} />} value={typeof coins === "number" ? coins.toLocaleString() : coins} tone="amber" />
            <StatPill icon={<ShoppingBag size={12} />} value={cartCount} tone="teal" />
            <StatPill icon={<MessageCircle size={12} />} value={messagesCount} tone="blue" />
            <StatPill icon={<Gift size={12} />} value={offersCount} tone="rose" />
          </div>

          {/* Coins only on mobile to save space */}
          <div className="flex sm:hidden items-center gap-1 flex-shrink-0 bg-amber-50 text-amber-700 rounded-full px-2 py-1 text-xs font-bold">
            <Coins size={12} />
            <span>{typeof coins === "number" ? coins.toLocaleString() : coins}</span>
          </div>

          <ChevronRight size={16} className="text-gray-300 flex-shrink-0 hidden sm:block" />
        </div>

        {/* Slim XP bar */}
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
            />
          </div>
          <span className="text-[10px] text-gray-400 font-mono flex-shrink-0 flex items-center gap-0.5">
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
    <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${tones[tone]}`}>
      {icon}
      <span>{value}</span>
    </div>
  );
}