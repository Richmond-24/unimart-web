"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sun, Cloud, Moon, Flame, Coins,
  ShoppingBag, MessageCircle, Gift,
  Trophy, AlertTriangle, RefreshCw
} from "lucide-react";
import { apiFetch } from "@/lib/apiClient";

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
      }
    } catch (e) {}
    const h = new Date().getHours();
    if (h < 12) { setGreeting("Good morning"); setTimeIcon(<Sun size={12} />); }
    else if (h < 17) { setGreeting("Good afternoon"); setTimeIcon(<Cloud size={12} />); }
    else if (h < 21) { setGreeting("Good evening"); setTimeIcon(<Moon size={12} />); }
    else { setGreeting("Good night"); setTimeIcon(<Moon size={12} />); }
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
          // ✅ FIXED: Changed from /api/auth/me to /auth/me
          const res = await apiFetch('/auth/me', { 
            method: 'GET', 
            suppressErrorLog: true 
          });
          
          if (!mounted) return;
          
          // Handle different response structures
          const u = res?.user || res?.data || res;
          
          if (u) {
            try { localStorage.setItem("unimart:user", JSON.stringify(u)); } catch (e) {}
            const name = u?.firstName || (u?.name ? String(u.name).split(" ")[0] : null);
            if (name) setFirstName(name as string);
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
              setError('Unable to connect to server. Using cached data.');
            }
          }
          
          // Fallback to cached data
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
        <div className="h-[100px] w-full bg-slate-100 animate-pulse rounded-[28px] border border-black/5 shadow-sm"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="bg-red-50 border border-red-100 rounded-[28px] p-6 text-center space-y-3">
          <AlertTriangle size={24} className="mx-auto text-red-500" />
          <h3 className="font-bold text-red-900">Connection Interrupted</h3>
          <p className="text-xs text-red-700">{error}</p>
          <button onClick={handleRetry} className="bg-red-500 text-white px-5 py-2 rounded-full text-xs font-bold transition-transform active:scale-95 shadow-lg">
            Reactivate
          </button>
        </div>
      </div>
    );
  }

  const nameText = firstName || "User";

  return (
    <div className="max-w-7xl mx-auto px-4 py-2 relative overflow-hidden font-sans selection:bg-teal-500 selection:text-white">
      {/* Teal/Blue Ambient Mesh Background */}
      <div className="absolute inset-0 pointer-events-none rounded-[36px] overflow-hidden -z-10 bg-slate-50">
        <motion.div 
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 40, 0], scale: [1, 1.1, 0.9, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/4 w-full h-full bg-teal-400/20 blur-[100px] rounded-full"
        />
        <motion.div 
          animate={{ x: [0, -40, 30, 0], y: [0, 40, -20, 0], scale: [1, 0.8, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-blue-500/20 blur-[120px] rounded-full"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10, filter: "blur(8px)" }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative backdrop-blur-xl bg-white/60 border border-white/40 rounded-[28px] p-4 sm:p-6 shadow-[0_8px_32px_rgba(13,148,136,0.08)] overflow-hidden"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-row items-center gap-4">
            {/* Teal/Blue Circular Avatar */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-tr from-teal-400 to-blue-500 shadow-[0_4px_16px_rgba(20,184,166,0.35)]">
                <div className="w-full h-full rounded-full bg-white p-[3px]">
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-xl font-bold text-white font-display">
                    {nameText.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
              {streakDays > 0 && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-white p-1 rounded-full border border-teal-500/10 shadow-md">
                  <Flame size={10} className="text-orange-500 fill-orange-500/10" />
                </div>
              )}
            </div>

            {/* Typography Greeting */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 opacity-50 mb-0.5">
                {timeIcon}
                <span className="text-[9px] font-bold uppercase tracking-widest text-teal-700">{greeting}</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-black tracking-tight truncate font-display">
                Hello, {nameText}
              </h1>
            </div>

            {/* Desktop Stats (Static Row) */}
            <div className="hidden md:flex gap-2">
              <StatPill icon={<Coins size={14} />} value={coins} label="Coins" />
              <StatPill icon={<ShoppingBag size={14} />} value={cartCount} label="Cart" />
            </div>
          </div>

          {/* Horizontal Stat Rail (Always scrolling for mobile density) */}
          <div className="flex md:hidden overflow-x-auto no-scrollbar gap-2 -mx-1 px-1 snap-x pb-0.5">
            <StatPill icon={<Coins size={12} />} value={coins} label="Coins" className="snap-start" />
            <StatPill icon={<ShoppingBag size={12} />} value={cartCount} label="Cart" className="snap-start" />
            <StatPill icon={<MessageCircle size={12} />} value={messagesCount} label="Chats" className="snap-start" />
            <StatPill icon={<Gift size={12} />} value={offersCount} label="Gifts" className="snap-start" />
          </div>

          {/* Precision XP Progression */}
          <div className="flex flex-col gap-2 pt-1 border-t border-teal-900/5">
            <div className="flex justify-between items-center px-0.5">
              <div className="flex items-center gap-1.5">
                <Trophy size={12} className="text-amber-500" />
                <span className="text-[9px] font-bold text-black/50 uppercase tracking-tighter">Campus Legend</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-black/30 tracking-tight">
                <span className="text-black/80">{xp}</span> / {xpToNext} XP
              </span>
            </div>
            
            <div className="h-1.5 w-full bg-teal-900/5 rounded-full overflow-hidden relative border border-teal-900/[0.02]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1.2, ease: "circOut" }}
                className="h-full bg-gradient-to-r from-teal-400 to-blue-500 relative shadow-[0_0_8px_rgba(20,184,166,0.4)]"
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function StatPill({ icon, value, label, className = "" }: { 
  icon: React.ReactNode, 
  value: string | number, 
  label: string,
  className?: string
}) {
  return (
    <motion.div
      whileHover={{ y: -1, backgroundColor: "rgba(255, 255, 255, 0.85)" }}
      whileTap={{ scale: 0.98 }}
      className={`shrink-0 flex items-center gap-2.5 bg-white/40 backdrop-blur-sm border border-teal-500/10 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm ${className}`}
    >
      <div className="text-teal-600/70">{icon}</div>
      <div className="flex flex-col leading-none">
        <span className="text-[11px] font-extrabold text-black tracking-tighter">{value}</span>
        <span className="text-[7px] font-bold text-black/30 uppercase tracking-tighter">{label}</span>
      </div>
    </motion.div>
  );
}