
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, Circle, Sun, Cloud, Moon, Star, 
  Flame, Award, Coins, ShoppingBag, MessageCircle, 
  Gift, TrendingUp, User, Sparkles, Activity,
  BatteryCharging, Target, Crown
} from "lucide-react";
import apiFetch from "../../lib/apiClient";

export default function Greeting() {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("Welcome");
  const [moodIcon, setMoodIcon] = useState<React.ReactNode>(null);
  const [bgGradient, setBgGradient] = useState("from-teal-900 to-blue-900");
  const [streakDays, setStreakDays] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [coins, setCoins] = useState<number | string>("—");
  const [messagesCount, setMessagesCount] = useState<number | string>("—");
  const [offersCount, setOffersCount] = useState<number | string>("—");
  const [cartCount, setCartCount] = useState<number | string>("—");
  const [xp, setXp] = useState<number>(0);
  const [xpToNext, setXpToNext] = useState<number>(1000);
  const xpPercent = xpToNext > 0 ? Math.min(100, Math.round((xp / xpToNext) * 100)) : 0;

  const moodIcons = [
    <Sparkles key="sparkles" size={16} />,
    <Zap key="zap" size={16} />,
    <Target key="target" size={16} />,
    <Star key="star" size={16} />,
    <Activity key="activity" size={16} />,
    <BatteryCharging key="battery" size={16} />,
    <Crown key="crown" size={16} />,
    <TrendingUp key="trending" size={16} />
  ];

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
    let newGreeting = "";
    let newBg = "";
    let newMoodIcon = null;

    if (h < 12) {
      newGreeting = "Good morning";
      newBg = "from-teal-800 to-blue-800";
      newMoodIcon = <Sun size={18} />;
    } else if (h < 17) {
      newGreeting = "Good afternoon";
      newBg = "from-teal-700 to-blue-700";
      newMoodIcon = <Cloud size={18} />;
    } else if (h < 21) {
      newGreeting = "Good evening";
      newBg = "from-teal-900 to-slate-900";
      newMoodIcon = <Moon size={18} />;
    } else {
      newGreeting = "Good night";
      newBg = "from-teal-950 to-blue-950";
      newMoodIcon = <Moon size={18} />;
    }

    setGreeting(newGreeting);
    setBgGradient(newBg);
    setMoodIcon(newMoodIcon);

    // Rotate mood icons every 5 seconds
    let iconIndex = 0;
    const interval = setInterval(() => {
      iconIndex = (iconIndex + 1) % moodIcons.length;
      setMoodIcon(moodIcons[iconIndex]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Load live user data for dynamic stats (streak, messages, offers, orders)
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
          setLevel(Number(u?.level || Math.max(1, Math.floor((u?.xp || 0) / 100) + 1)));
          setCoins(u?.coins ?? u?.balance ?? "—");
          setMessagesCount((Array.isArray(u?.messages) ? u.messages.length : (u?.unreadMessages ?? 0)) || 0);
          setOffersCount(u?.offersCount ?? u?.flashSalesPurchases ?? 0);
          setCartCount((Array.isArray(u?.cart) ? u.cart.length : (u?.cartCount ?? 0)) || 0);
          setXp(Number(u?.xp || 0));
          setXpToNext(Number(u?.xpToNext || 1000));
        } else {
          // fallback to localStorage if available
          try {
            const raw = localStorage.getItem("unimart:user");
            if (raw) {
              const lu = JSON.parse(raw);
              const name = lu?.firstName || (lu?.name ? String(lu.name).split(" ")[0] : null);
              if (name) setFirstName(name as string);
              setStreakDays(Number(lu?.streakDays || 0));
              setLevel(Number(lu?.level || 1));
              setCoins(lu?.coins ?? "—");
              setMessagesCount((Array.isArray(lu?.messages) ? lu.messages.length : (lu?.unreadMessages ?? 0)) || 0);
              setOffersCount(lu?.offersCount ?? 0);
              setCartCount((Array.isArray(lu?.cart) ? lu.cart.length : (lu?.cartCount ?? 0)) || 0);
              setXp(Number(lu?.xp || 0));
              setXpToNext(Number(lu?.xpToNext || 1000));
            }
          } catch (e) {}
        }
      } catch (e) {
        // ignore failures; keep defaults
      }
    }

    loadUser();

    function onStorage(e: StorageEvent) {
      if (e.key === 'unimart:user') loadUser();
    }

    window.addEventListener('storage', onStorage);
    window.addEventListener('unimart:authChanged', loadUser as EventListener);
    return () => {
      mounted = false;
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('unimart:authChanged', loadUser as EventListener);
    };
  }, []);

  const slangResponses = [
    "absolute legend!",
    "let's go!",
    "elite energy!",
    "main character!",
    "built different!",
    "top tier!",
    "that's the move!",
    "no cap!",
    "straight fire!"
  ];

  const [slang, setSlang] = useState("");
  const [showSlang, setShowSlang] = useState(false);

  const handleAvatarClick = () => {
    const randomSlang = slangResponses[Math.floor(Math.random() * slangResponses.length)];
    setSlang(randomSlang);
    setShowSlang(true);
    setTimeout(() => setShowSlang(false), 2000);
  };

  // Particles are generated only on the client after mount to avoid
  // server/client markup differences (Math.random during render causes
  // hydration mismatches).
  const [particles, setParticles] = useState<Array<{
    left: string; top: string; initX: string; initY: string; animX: string; animY: string; duration: number;
  }>>([]);

  useEffect(() => {
    const p = Array.from({ length: 20 }).map(() => {
      const left = `${Math.floor(Math.random() * 10000) / 100}%`;
      const top = `${Math.floor(Math.random() * 10000) / 100}%`;
      const animX = `${Math.floor(Math.random() * 10000) / 100}%`;
      const animY = `${Math.floor(Math.random() * 10000) / 100}%`;
      const duration = Math.random() * 10 + 10;
      return { left, top, initX: left, initY: top, animX, animY, duration };
    });
    setParticles(p);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="relative group"
      >
        {/* Glow effect behind card */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute -inset-1 bg-gradient-to-r ${bgGradient} rounded-2xl blur-xl opacity-30 group-hover:opacity-40 transition-opacity`}
        />

        {/* Main Card */}
        <motion.div
          whileHover={{ y: -5 }}
          className={`relative bg-gradient-to-br ${bgGradient} rounded-2xl p-6 overflow-hidden shadow-2xl border border-teal-500/20`}
        >
          {/* Animated background particles (client-only stable values) */}
          <div className="absolute inset-0 opacity-5">
            {particles.map((p, i) => (
              <motion.div
                key={i}
                initial={{ x: p.initX, y: p.initY }}
                animate={{ x: [p.initX, p.animX], y: [p.initY, p.animY] }}
                transition={{ duration: p.duration, repeat: Infinity, repeatType: "reverse" }}
                className="absolute w-1 h-1 bg-teal-400 rounded-full"
                style={{ left: p.left, top: p.top }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 relative z-10 flex-wrap">
            {/* Left section - Avatar & Greeting */}
            <div className="flex items-center gap-4 flex-1">
              {/* Animated Avatar */}
              <motion.button
                onClick={handleAvatarClick}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="relative group/avatar"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-teal-400/50"
                />
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -inset-1 bg-teal-500/20 rounded-full blur-sm"
                />
                <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 backdrop-blur-md flex items-center justify-center text-xl font-black border-2 border-teal-300/40 shadow-lg text-white">
                  {firstName ? firstName.charAt(0).toUpperCase() : "U"}
                </div>
                
                {/* Floating mood icon */}
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-2 -right-2 bg-teal-500 rounded-full p-1.5 shadow-lg backdrop-blur-sm text-white"
                >
                  {moodIcon || <Zap size={12} />}
                </motion.div>
              </motion.button>

              {/* Greeting Text */}
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-teal-300 text-xs uppercase tracking-wider font-mono mb-1 flex items-center gap-2"
                >
                  <Zap size={10} />
                  <span>LIVE</span>
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                  />
                </motion.div>

                <div className="space-y-1">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-teal-200 text-sm font-medium"
                  >
                    {greeting}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-white text-2xl md:text-3xl font-black tracking-tight"
                  >
                    {firstName ? (
                      <>
                        {firstName}
                        <motion.span
                          animate={{ rotate: [0, 15, -15, 0] }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                          className="inline-block ml-2"
                        >
                          <User size={24} className="inline" />
                        </motion.span>
                      </>
                    ) : (
                      "Welcome to Unimart!"
                    )}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Right section - Stats */}
            <div className="flex items-center gap-3">
              {/* Streak counter */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                whileHover={{ scale: 1.05 }}
                className="bg-teal-500/20 backdrop-blur-md rounded-full px-3 py-1.5 text-xs font-bold text-teal-200 flex items-center gap-1 border border-teal-400/30"
              >
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Flame size={12} />
                </motion.span>
                <span>{streakDays} day{streakDays === 1 ? '' : 's'} streak</span>
              </motion.div>

              {/* Level badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                whileHover={{ scale: 1.05 }}
                className="bg-teal-500/20 backdrop-blur-md rounded-full px-3 py-1.5 text-xs font-bold text-teal-200 flex items-center gap-1 border border-teal-400/30"
              >
                <Star size={12} />
                <span>Lvl {level}</span>
              </motion.div>

              {/* Coin counter */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                whileHover={{ scale: 1.05 }}
                className="bg-teal-500/20 backdrop-blur-md rounded-full px-3 py-1.5 text-xs font-bold text-teal-200 flex items-center gap-1 border border-teal-400/30"
              >
                <motion.span
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Coins size={12} />
                </motion.span>
                <span>{typeof coins === 'number' ? coins.toLocaleString() : coins}</span>
              </motion.div>
            </div>
          </div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-5 relative"
          >
            <div className="flex justify-between text-teal-300 text-xs mb-1.5 font-mono">
              <span>XP to next level</span>
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex items-center gap-1"
              >
                <Zap size={10} />
                {xp}/{xpToNext}
              </motion.span>
            </div>
            <div className="h-2 bg-teal-500/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1, delay: 0.7, type: "spring" }}
                className="h-full bg-gradient-to-r from-teal-400 to-teal-300 rounded-full relative"
              >
                <motion.div
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Slang popup */}
          <AnimatePresence>
            {showSlang && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.8 }}
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-teal-900 backdrop-blur-md rounded-full px-4 py-2 text-teal-200 text-sm font-bold whitespace-nowrap shadow-xl border border-teal-500/30"
              >
                {slang}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-teal-900 rotate-45 border-r border-b border-teal-500/30"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bento grid stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="hidden sm:grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-teal-500/20"
          >
            {[
              { icon: <ShoppingBag size={16} />, label: "cart", value: typeof cartCount === 'number' ? `${cartCount} item${cartCount === 1 ? '' : 's'}` : cartCount },
              { icon: <MessageCircle size={16} />, label: "messages", value: typeof messagesCount === 'number' ? `${messagesCount} unread` : messagesCount },
              { icon: <Gift size={16} />, label: "offers", value: typeof offersCount === 'number' ? `${offersCount} new` : offersCount }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02, backgroundColor: "rgba(20, 184, 166, 0.15)" }}
                style={{ backgroundColor: "rgba(20, 184, 166, 0.10)" }}
                className="bg-teal-500/10 backdrop-blur-sm rounded-xl p-2 text-center cursor-pointer transition-all border border-teal-500/20"
              >
                <div className="text-teal-300 flex justify-center mb-1">{item.icon}</div>
                <div className="text-teal-400/70 text-xs font-mono">{item.label}</div>
                <div className="text-white text-sm font-bold">{item.value}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}