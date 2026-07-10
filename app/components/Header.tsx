"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Search,
  Compass,
  Package,
  MessageCircle,
  User,
  Monitor,
  BookOpen,
  Shirt,
  Utensils,
  PenTool,
  Wrench,
  MapPin,
  GraduationCap,
  ChevronDown,
  Bell,
  Plus,
  Star,
  Truck,
  Shield,
  Clock,
  DollarSign,
  Percent,
  Award,
  Rocket,
  Zap,
  Flame,
  ThumbsUp,
  Share2,
  Link2,
  Camera,
  Image,
  Video,
  Music,
  Gamepad,
  Bike,
  Dumbbell,
  Heart,
  ShoppingCart,
  Settings,
  LogOut,
  Globe,
  Phone,
  Mail,
  Calendar,
  Tag,
  Store,
} from "lucide-react";
import apiClient from "../../lib/apiClient";

const NAV_LINKS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Search", href: "/search", icon: Search },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Orders", href: "/orders", icon: Package },
  { label: "Cart", href: "/cart", icon: ShoppingCart },
  { label: "Messages", href: "/messages", icon: MessageCircle },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile", icon: User },
];

const CATEGORIES = [
  { label: "Electronics", href: "/search?category=electronics", icon: Monitor },
  { label: "Books & Notes", href: "/search?category=books", icon: BookOpen },
  { label: "Fashion", href: "/search?category=fashion", icon: Shirt },
  { label: "Food & Snacks", href: "/search?category=food", icon: Utensils },
  { label: "Stationery", href: "/search?category=stationery", icon: PenTool },
  { label: "Services", href: "/search?category=services", icon: Wrench },
  { label: "Accommodation", href: "/search?category=accommodation", icon: Home },
  { label: "Sports & Fitness", href: "/search?category=sports", icon: Dumbbell },
];

// University abbreviation mapping
const UNIVERSITY_ABBREVIATIONS: Record<string, string> = {
  "UG": "UG",
  "KNUST": "KNUST",
  "UCC": "UCC",
  "UDS": "UDS",
  "UEW": "UEW",
  "UPSA": "UPSA",
  "UENR": "UENR",
  "Not a student": "General",
};

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const suggRef = useRef<HTMLDivElement | null>(null);
  let suggDebounce = useRef<number | null>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [university, setUniversity] = useState("General");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [messageCount, setMessageCount] = useState<number>(0);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [userUniversity, setUserUniversity] = useState<string>("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  // Hamburger menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const hideHeader =
    (typeof pathname === "string" && pathname.startsWith("/seller")) ||
    (typeof pathname === "string" && /^\/listings\/[^/]+\/chat$/.test(pathname)) ||
    (typeof pathname === "string" && /^\/listings\/[^/]+$/.test(pathname));

  // Close dropdown/menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (suggRef.current && !suggRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setActiveSuggestion(-1);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Load user's university from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("unimart:user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u && u.university) {
          setUserUniversity(u.university);
          const abbr = UNIVERSITY_ABBREVIATIONS[u.university] || u.university;
          setUniversity(abbr);
          return;
        }
      }
    } catch (e) {}
    // Default to General if no university found
    setUniversity("General");
  }, []);

  async function detectLocation(onFirstLoad = false) {
    try {
      if (!navigator.geolocation) { await fallbackToIP(onFirstLoad); return; }
      try {
        // @ts-ignore
        const perm = navigator.permissions ? await navigator.permissions.query({ name: "geolocation" }) : null;
        if (perm && perm.state === "denied") { await fallbackToIP(onFirstLoad); return; }
      } catch (e) {}
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          if (onFirstLoad) localStorage.setItem("unimart:locationDetected", "1");
        },
        async () => { await fallbackToIP(onFirstLoad); },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    } catch (e) {}
  }

  async function fallbackToIP(onFirstLoad: boolean) {
    try {
      if (onFirstLoad) localStorage.setItem("unimart:locationDetected", "1");
    } catch {}
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    return () => { if (suggDebounce.current) window.clearTimeout(suggDebounce.current); };
  }, []);

  // FIXED: Use apiClient as a function instead of .get()
  const fetchSuggestions = (q: string) => {
    if (suggDebounce.current) window.clearTimeout(suggDebounce.current);
    if (!q || q.trim().length < 1) { setSuggestions([]); setShowSuggestions(false); return; }
    suggDebounce.current = window.setTimeout(async () => {
      try {
        const res = await apiClient(`/search/suggestions?q=${encodeURIComponent(q)}`, { 
          method: 'GET' 
        });
        if (res?.success && Array.isArray(res.data)) { 
          setSuggestions(res.data.slice(0, 8)); 
          setShowSuggestions(true); 
          setActiveSuggestion(-1); 
        }
      } catch (e) { 
        setSuggestions([]); 
        setShowSuggestions(false); 
      }
    }, 250) as unknown as number;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = headerRef.current || document.querySelector('header[role="banner"]');
    if (!el) return;
    function updateHeight() {
      try { const h = Math.ceil((el as HTMLElement).offsetHeight || 0); document.documentElement.style.setProperty("--header-height", `${h}px`); } catch (e) {}
    }
    updateHeight();
    const ro = new ResizeObserver(() => updateHeight());
    ro.observe(el);
    const mo = new MutationObserver(() => updateHeight());
    mo.observe(el, { attributes: true, childList: true, subtree: true });
    window.addEventListener("resize", updateHeight);
    window.addEventListener("orientationchange", updateHeight);
    return () => {
      try { ro.disconnect(); } catch (e) {}
      try { mo.disconnect(); } catch (e) {}
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("orientationchange", updateHeight);
    };
  }, []);

  // Load message count - using direct fetch to avoid apiClient error logging
  useEffect(() => {
    let mounted = true;

    const loadMessageCount = async () => {
      try {
        setIsLoadingMessages(true);
        
        // Check if user is logged in
        const token = localStorage.getItem('unimart:token');
        if (!token) {
          if (mounted) {
            setMessageCount(0);
            setIsLoadingMessages(false);
          }
          return;
        }

        // Get the API base URL from environment or use default
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://unimart-backend-6pld.onrender.com';
        
        // Direct fetch - this won't trigger the apiClient error logging
        try {
          const response = await fetch(`${apiBase}/api/conversations`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!mounted) return;
          
          if (response.ok) {
            const data = await response.json();
            let total = 0;
            const convs = Array.isArray(data?.conversations ? data.conversations : data) ? (data?.conversations || data) : [];
            total = convs.reduce((sum: number, conv: any) => sum + Number(conv.unreadForUser || 0), 0);
            setMessageCount(total);
          } else {
            // Silently fail - don't log
            setMessageCount(0);
          }
        } catch (err) {
          // Silent fail - don't log
          if (mounted) {
            setMessageCount(0);
          }
        }
      } catch (e) {
        // Silent catch - don't log anything
        if (mounted) {
          setMessageCount(0);
        }
      } finally {
        if (mounted) {
          setIsLoadingMessages(false);
        }
      }
    };

    loadMessageCount();

    // Listen for auth changes
    const onMessageUpdate = (e: any) => {
      if (mounted) {
        setMessageCount(Number(e?.detail?.count || 0));
        setIsLoadingMessages(false);
      }
    };
    
    const onAuthChange = () => {
      loadMessageCount();
    };

    window.addEventListener("unimart:messageCount", onMessageUpdate as EventListener);
    window.addEventListener("unimart:authChanged", onAuthChange);
    window.addEventListener("storage", (e) => {
      if (e.key === 'unimart:token') {
        loadMessageCount();
      }
    });

    return () => { 
      mounted = false; 
      window.removeEventListener("unimart:messageCount", onMessageUpdate as EventListener);
      window.removeEventListener("unimart:authChanged", onAuthChange);
    };
  }, []);

  // Load notification count with error handling
  useEffect(() => {
    let mounted = true;

    const onNotification = (e: any) => { 
      if (mounted) {
        setNotificationCount(Number(e?.detail?.count || 0)); 
      }
    };

    window.addEventListener("unimart:notificationCount", onNotification as EventListener);
    
    return () => {
      mounted = false;
      window.removeEventListener("unimart:notificationCount", onNotification as EventListener);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadNotificationCount() {
      try {
        let userId = null;
        try { 
          const raw = localStorage.getItem("unimart:user"); 
          if (raw) {
            const parsed = JSON.parse(raw);
            userId = parsed?._id || parsed?.id || null;
          }
        } catch (e) {}
        
        if (!userId) {
          if (mounted) setNotificationCount(0);
          return;
        }

        const token = localStorage.getItem('unimart:token');
        if (!token) {
          if (mounted) setNotificationCount(0);
          return;
        }

        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://unimart-backend-6pld.onrender.com';

        try {
          const response = await fetch(
            `${apiBase}/api/notifications?userId=${encodeURIComponent(userId)}&unreadOnly=true`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (!mounted) return;
          
          if (response.ok) {
            const res = await response.json();
            if (res && typeof res.unreadCount === "number") {
              setNotificationCount(res.unreadCount || 0);
            } else {
              setNotificationCount(0);
            }
          } else {
            setNotificationCount(0);
          }
        } catch (err) {
          // Silently ignore
          if (mounted) {
            setNotificationCount(0);
          }
        }
      } catch (e) {
        if (mounted) setNotificationCount(0);
      }
    }
    
    loadNotificationCount();
    
    return () => { mounted = false; };
  }, []);

  const universityOptions = [
    { label: "General", value: "General", active: true },
    { label: "UENR", value: "UENR", active: false },
    { label: "STU", value: "STU", active: false },
    { label: "UDS", value: "UDS", active: false },
  ];

  if (hideHeader) return null;

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .menu-animate {
          animation: slideDown 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .overlay-animate {
          animation: fadeIn 0.2s ease forwards;
        }
        .hamburger-line {
          display: block;
          width: 20px;
          height: 2px;
          background: white;
          border-radius: 2px;
          transition: transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease;
          transform-origin: center;
        }
        .hamburger-open .line-top    { transform: translateY(6px) rotate(45deg); }
        .hamburger-open .line-mid    { opacity: 0; transform: scaleX(0); }
        .hamburger-open .line-bot    { transform: translateY(-6px) rotate(-45deg); }
        .icon-hover {
          transition: all 0.2s ease;
        }
        .icon-hover:hover {
          transform: scale(1.05);
          opacity: 0.9;
        }
      `}</style>

      <header
        ref={headerRef}
        data-unimart-header
        role="banner"
        className="fixed top-0 inset-x-0 z-50 bg-[#0D9488] shadow-sm"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ROW 1: Hamburger + Logo + Actions */}
          <div className="flex items-center justify-between py-3 border-b border-white/10 gap-3">

            {/* LEFT: Hamburger + Logo + Name */}
            <div className="flex items-center gap-3">
              {/* Hamburger */}
              <div className="relative hidden md:block" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((s) => !s)}
                  aria-expanded={menuOpen}
                  aria-label={menuOpen ? "Close menu" : "Open menu"}
                  className={`flex flex-col justify-center items-center gap-[5px] p-2 rounded-lg hover:bg-white/15 transition-colors duration-200 ${menuOpen ? "hamburger-open bg-white/15" : ""}`}
                  style={{ width: 40, height: 40 }}
                >
                  <span className="hamburger-line line-top" />
                  <span className="hamburger-line line-mid" />
                  <span className="hamburger-line line-bot" />
                </button>

                {/* Dropdown panel */}
                {menuOpen && (
                  <div
                    className="menu-animate absolute left-0 top-[calc(100%+8px)] z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                    style={{ width: 300, minWidth: 280 }}
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#0D9488] to-[#0f766e] px-5 py-4">
                      <p className="text-white font-bold text-base tracking-tight">Uni-Mart</p>
                    </div>

                    {/* Quick links */}
                    <div className="px-3 pt-3 pb-1">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">Navigate</p>
                      <div className="grid grid-cols-2 gap-1">
                        {NAV_LINKS.map((link) => {
                          const Icon = link.icon;
                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setMenuOpen(false)}
                              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 hover:bg-teal-50 hover:text-teal-700 ${
                                pathname === link.href ? "bg-teal-50 text-teal-700" : "text-gray-700"
                              }`}
                            >
                              <div className="relative">
                                <Icon className="w-4 h-4 text-teal-600" strokeWidth={2} />
                                {link.href === '/messages' && !isLoadingMessages && messageCount > 0 && (
                                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
                                    {messageCount > 9 ? '9+' : messageCount}
                                  </span>
                                )}
                                {link.href === '/messages' && isLoadingMessages && (
                                  <span className="absolute -top-2 -right-2 bg-gray-400 text-white text-[10px] font-bold rounded-full w-[16px] h-[16px] flex items-center justify-center animate-pulse">
                                    ...
                                  </span>
                                )}
                                {link.href === '/notifications' && notificationCount > 0 && (
                                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
                                    {notificationCount > 99 ? '99+' : notificationCount}
                                  </span>
                                )}
                              </div>
                              <span>{link.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mx-4 my-2 border-t border-gray-100" />

                    {/* Categories */}
                    <div className="px-3 pb-3">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">Categories</p>
                      <div className="flex flex-col gap-0.5">
                        {CATEGORIES.map((cat) => {
                          const Icon = cat.icon;
                          return (
                            <Link
                              key={cat.href}
                              href={cat.href}
                              onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-all duration-150"
                            >
                              <Icon className="w-4 h-4 text-teal-600" strokeWidth={2} />
                              <span>{cat.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex items-center justify-between">
                      <span className="text-xs text-gray-400">Powered by Uni-Mart</span>
                      <Link href="/seller" onClick={() => setMenuOpen(false)} className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors">
                        Sell with us →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Logo */}
              <Link href="/" className="shrink-0">
                <img src="/logo.png" alt="Uni-Mart Logo" className="w-10 h-10 object-contain rounded-lg" />
              </Link>
              <div className="flex flex-col">
                <span className="font-bold text-white text-lg leading-tight">Uni-Mart</span>
              </div>
            </div>

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button onClick={() => router.push("/notifications")} className="relative p-2 rounded-full hover:bg-white/10 transition">
                <Bell className="w-5 h-5 text-white" strokeWidth={2} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </button>

              {/* University selector */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="relative shrink-0 p-2 rounded-full hover:bg-white/10 transition flex items-center gap-1"
                >
                  <GraduationCap className="w-5 h-5 text-white" strokeWidth={2} />
                  <ChevronDown className={`w-3 h-3 text-white/80 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} strokeWidth={2} />
                </button>
                {dropdownOpen && (
                  <div className="menu-animate absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-1 z-20 border border-gray-100">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100">Select marketplace</div>
                    {universityOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { if (opt.active) { setUniversity(opt.value); setDropdownOpen(false); } }}
                        className={`w-full text-left px-4 py-2 text-sm transition flex items-center justify-between ${
                          !opt.active ? "opacity-50 cursor-not-allowed text-gray-400" : "hover:bg-gray-50"
                        } ${university === opt.value && opt.active ? "text-teal-600 font-medium bg-teal-50" : ""}`}
                        disabled={!opt.active}
                      >
                        <span>{opt.label}</span>
                        {opt.active && university === opt.value && (
                          <span className="w-2 h-2 bg-green-500 rounded-full ml-2" />
                        )}
                        {!opt.active && <span className="text-[10px] text-gray-400 ml-auto">Soon</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ROW 2: Search + Location */}
          <div className="py-3 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = searchQuery.trim();
                router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
              }}
              className="flex-1"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" strokeWidth={2} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onInput={(e) => fetchSuggestions((e.target as HTMLInputElement).value)}
                  onFocus={() => {
                    if (typeof window !== 'undefined' && window.innerWidth < 640) {
                      setMobileSearchOpen(true);
                    } else if (suggestions.length) setShowSuggestions(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") { e.preventDefault(); setActiveSuggestion((s) => Math.min(s + 1, suggestions.length - 1)); }
                    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveSuggestion((s) => Math.max(s - 1, 0)); }
                    else if (e.key === "Enter") {
                      if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
                        const q = suggestions[activeSuggestion];
                        setSearchQuery(q); setShowSuggestions(false); router.push(`/search?q=${encodeURIComponent(q)}`); e.preventDefault();
                      }
                    } else if (e.key === "Escape") { setShowSuggestions(false); setActiveSuggestion(-1); }
                  }}
                  className="w-full bg-white border border-gray-200 rounded-full py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-slate-500 placeholder:opacity-100 focus:border-teal-300 focus:ring-1 focus:ring-teal-300 transition"
                  placeholder="Search for products, brands, and more..."
                />
              </div>
            </form>

            {/* Mobile full-screen search overlay (Temu-like) */}
            {mobileSearchOpen && (
              <div className="fixed inset-0 z-50 bg-white p-4 md:hidden">
                <div className="flex items-center gap-2">
                  <button onClick={() => setMobileSearchOpen(false)} className="p-2 mr-1">
                    ←
                  </button>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" strokeWidth={2} />
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onInput={(e) => fetchSuggestions((e.target as HTMLInputElement).value)}
                      className="w-full bg-gray-100 border border-gray-200 rounded-full py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-slate-500 placeholder:opacity-100"
                      placeholder="Search for products, brands, and more..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const q = searchQuery.trim();
                          setMobileSearchOpen(false);
                          router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  {suggestions.length > 0 ? (
                    <div className="space-y-2">
                      {suggestions.map((s, idx) => (
                        <button key={s} onClick={() => { setSearchQuery(s); setMobileSearchOpen(false); router.push(`/search?q=${encodeURIComponent(s)}`); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50">
                          {s}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">Try searching for items, brands, or categories</div>
                  )}
                </div>
              </div>
            )}

            {showSuggestions && suggestions.length > 0 && (
              <div ref={suggRef} className="absolute left-0 right-0 mt-1 z-40 max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
                <div className="menu-animate bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                  {suggestions.map((s, idx) => (
                    <button
                      key={s}
                      onClick={() => { setSearchQuery(s); setShowSuggestions(false); router.push(`/search?q=${encodeURIComponent(s)}`); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${idx === activeSuggestion ? "bg-gray-50" : ""}`}
                    >
                      <Search className="w-4 h-4 text-gray-400" strokeWidth={2} />
                      <span className="truncate">{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm shrink-0">
              <GraduationCap className="text-white/90 w-3.5 h-3.5" strokeWidth={2} />
              <span className="text-white/80 hidden sm:inline">Campus</span>
              <strong className="text-white truncate max-w-[150px]">{university}</strong>
            </div>
          </div>
        </div>

        {/* Overlay backdrop for menu */}
        {menuOpen && (
          <div
            className="overlay-animate fixed inset-0 z-40 hidden md:block"
            style={{ background: "rgba(0,0,0,0.18)", top: "var(--header-height, 112px)" }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </header>
    </>
  );
}