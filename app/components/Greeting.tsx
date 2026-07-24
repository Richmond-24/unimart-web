"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sun, Cloud, Moon, Flame, Coins,
  ShoppingBag, MessageCircle, Gift,
  Trophy, AlertTriangle
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

export default function Greeting() {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [userGender, setUserGender] = useState<string | undefined>(undefined);
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
        if (u?.gender) setUserGender(u.gender);
      }
    } catch (e) {}
    const h = new Date().getHours();
    if (h < 12) { setGreeting("Good morning"); setTimeIcon(<Sun size={12} className="text-teal-600" />); }
    else if (h < 17) { setGreeting("Good afternoon"); setTimeIcon(<Cloud size={12} className="text-teal-600" />); }
    else if (h < 21) { setGreeting("Good evening"); setTimeIcon(<Moon size={12} className="text-teal-600" />); }
    else { setGreeting("Good night"); setTimeIcon(<Moon size={12} className="text-teal-600" />); }
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
        <div className="h-[80px] w-full bg-white rounded-2xl animate-pulse border border-gray-100"></div>
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
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(20, 184, 166, 0.1)" }}
        className="relative bg-white rounded-2xl p-4 shadow-sm border border-teal-100/50 overflow-hidden group"
      >
        {/* Background Decorative Blob with Animation */}
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-400/10 to-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" 
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Left Side: Profile & Greeting */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar with Ring Animation */}
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="relative shrink-0"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 p-0.5 shadow-md shadow-teal-500/20">
                <div className="w-full h-full rounded-[10px] bg-white overflow-hidden relative">
                  <img 
                    src={avatarUrl} 
                    alt={nameText} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {streakDays > 0 && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute -top-1 -right-1 bg-white border border-orange-100 shadow-sm rounded-full px-1.5 py-0.5 flex items-center gap-0.5"
                >
                  <Flame size={10} className="text-orange-500 fill-orange-500" />
                  <span className="text-[9px] font-black text-orange-600">{streakDays}</span>
                </motion.div>
              )}
            </motion.div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-1.5 mb-0.5"
              >
                {timeIcon}
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wide">{greeting}</span>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg font-black text-gray-900 tracking-tight truncate"
              >
                {nameText}
              </motion.h1>
            </div>
          </div>

          {/* Right Side: Compact Stats Row */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <MiniStat icon={<Coins size={14} />} value={coins} color="text-amber-500" bg="bg-amber-50" delay={0.4} />
            <MiniStat icon={<ShoppingBag size={14} />} value={cartCount} color="text-teal-600" bg="bg-teal-50" delay={0.5} />
            <MiniStat icon={<MessageCircle size={14} />} value={messagesCount} color="text-blue-500" bg="bg-blue-50" delay={0.6} />
            <MiniStat icon={<Gift size={14} />} value={offersCount} color="text-pink-500" bg="bg-pink-50" delay={0.7} />
          </div>
        </div>

        {/* Bottom Section: XP Progress */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-3 pt-3 border-t border-gray-50 relative z-10"
        >
          <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center gap-1.5">
              <Trophy size={10} className="text-teal-600" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">Campus Legend</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-teal-600">
              {xp} / {xpToNext} XP
            </span>
          </div>
          
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1.5, ease: "circOut", delay: 1 }}
              className="h-full bg-gradient-to-r from-teal-400 to-blue-500 relative"
            >
              <motion.div 
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-white/30 skew-x-12"
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -2, scale: 1.05 }}
      className={`${bg} rounded-lg px-2.5 py-1.5 flex flex-col items-center justify-center min-w-[50px] cursor-pointer`}
    >
      <div className={color}>{icon}</div>
      <span className="text-[11px] font-black text-gray-900 leading-none mt-0.5">{value}</span>
    </motion.div>
  );
}
